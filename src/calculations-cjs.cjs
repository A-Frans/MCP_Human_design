/**
 * Human Design Calculations with Swiss Ephemeris (CommonJS)
 * Fixed:
 * - uses swe_julday + swe_calc_ut (correct API names)
 * - maps gates using the Rave Mandala gate sequence (not linear 1..64)
 */

const Swe = require("swisseph");
const { getLocationInfo, getUTCOffset, convertToUTC } = require("./timezone-utils.cjs");

/**
 * Rave Mandala gate order (clockwise through the wheel)
 * Commonly used sequence for mapping 64 gates around 360 degrees.
 */
const RAVE_GATE_SEQUENCE = [
  41, 19, 13, 49, 30, 55, 37, 63,
  22, 36, 25, 17, 21, 51, 42, 3,
  27, 24, 2, 23, 8, 20, 16, 35,
  45, 12, 15, 52, 39, 53, 62, 56,
  31, 33, 7, 4, 29, 59, 40, 64,
  47, 6, 46, 18, 48, 57, 32, 50,
  28, 44, 1, 43, 14, 34, 9, 5,
  26, 11, 10, 58, 38, 54, 61, 60,
];

// Gate size and line size in degrees
const GATE_SIZE = 360 / 64;      // 5.625
const LINE_SIZE = GATE_SIZE / 6; // 0.9375

/**
 * Approx alignment:
 * Rave New Year: Sun enters Gate 41 line 1 around 0° Aquarius.
 * Aquarius starts at 300° ecliptic longitude.
 */
const GATE41_START_LONGITUDE = 300;

/**
 * Optional: planet indexes. Swiss Ephemeris has constants too,
 * but these numeric ids match the common mapping used in many wrappers.
 */
function getPlanetIndex(planetName) {
  const planetMap = {
    Sun: 0,
    Moon: 1,
    Mercury: 3,
    Venus: 4,
    Mars: 2,
    Jupiter: 5,
    Saturn: 6,
    Rahu: 11, // mean node
    Ketu: 12, // true node in some mappings; keep as-is if repo uses it
  };
  return planetMap[planetName] ?? 0;
}

/**
 * Normalize longitude to 0..360
 */
function norm360(x) {
  const r = x % 360;
  return r < 0 ? r + 360 : r;
}

/**
 * Convert tropical longitude to Human Design gate + line
 * using the Rave Mandala sequence.
 */
function longitudeToGateLine(longitude) {
  const lon = norm360(longitude);

  // shift so that 0° in this scale corresponds to Gate 41 start
  const rel = norm360(lon - GATE41_START_LONGITUDE);

  const gateIndex = Math.floor(rel / GATE_SIZE); // 0..63
  const gate = RAVE_GATE_SEQUENCE[gateIndex];

  const withinGate = rel - gateIndex * GATE_SIZE; // 0..5.625
  const line = Math.min(6, Math.max(1, Math.floor(withinGate / LINE_SIZE) + 1));

  return { gate, line };
}

/**
 * Swiss Ephemeris helpers: this package exposes swe_julday and swe_calc_ut
 */
function sweJulday(year, month, day, hourDecimal) {
  // SE_GREG_CAL is usually 1
  if (typeof Swe.swe_julday !== "function") {
    throw new Error("Swiss Ephemeris missing swe_julday");
  }
  return Swe.swe_julday(year, month, day, hourDecimal, 1);
}

function sweCalcUt(jd, planetIndex) {
  if (typeof Swe.swe_calc_ut !== "function") {
    throw new Error("Swiss Ephemeris missing swe_calc_ut");
  }

  /**
   * Different builds return slightly different shapes.
   * Most common:
   *   Swe.swe_calc_ut(jd, planet, flags)
   * and result contains .longitude or result[0]
   *
   * We keep it defensive.
   */
  const flags = Swe.SEFLG_SWIEPH | Swe.SEFLG_SPEED; // safe defaults if present

  const res = Swe.swe_calc_ut(jd, planetIndex, flags);

  // Try common return shapes
  if (!res) throw new Error("swe_calc_ut returned empty result");

  // Sometimes: { longitude: number, latitude: number, distance: number, ... }
  if (typeof res.longitude === "number") return { longitude: res.longitude };

  // Sometimes: { xx: [lon, lat, dist, speedLon, ...], ... }
  if (Array.isArray(res.xx) && typeof res.xx[0] === "number") return { longitude: res.xx[0] };

  // Sometimes: returns array [lon, lat, dist, ...]
  if (Array.isArray(res) && typeof res[0] === "number") return { longitude: res[0] };

  throw new Error("Unknown swe_calc_ut return shape");
}

function calculatePlanetPosition(jd, planetName) {
  const planetIndex = getPlanetIndex(planetName);
  const pos = sweCalcUt(jd, planetIndex);
  const longitude = norm360(pos.longitude);

  const { gate, line } = longitudeToGateLine(longitude);

  return {
    name: planetName,
    longitude,
    gate,
    line,
  };
}

/**
 * Type / authority etc.
 * Let this be your existing logic, but fix the small bug: you used g.gate
 * while your gates array uses { number: ... } in some places.
 */
function determineType(gates) {
  const gateNumbers = gates.map(g => g.number);

  const CENTER_GATES = {
    Sacral: [2, 14, 26, 30, 31, 38, 42, 45, 59],
    Throat: [2, 3, 5, 7, 10, 11, 12, 16, 17, 20, 21, 22, 23, 24, 28, 31, 33, 35, 45, 56, 62],
    SolarPlexus: [10, 20, 29, 34, 40, 46, 50, 57],
  };

  const hasSacral = CENTER_GATES.Sacral.some(g => gateNumbers.includes(g));
  const hasThroat = CENTER_GATES.Throat.some(g => gateNumbers.includes(g));
  const hasSolarPlexus = CENTER_GATES.SolarPlexus.some(g => gateNumbers.includes(g));

  if (hasSacral && hasThroat) {
    return { name: "Manifesting Generator", description: "Манифестирующий Генератор" };
  }
  if (hasSacral) {
    return { name: "Generator", description: "Генератор" };
  }
  if (!hasThroat) {
    return { name: "Reflector", description: "Рефлектор" };
  }
  if (hasSolarPlexus) {
    return { name: "Projector", description: "Проектор" };
  }
  return { name: "Manifestor", description: "Манифестор" };
}

function determineStrategy(typeName) {
  const strategies = {
    Manifestor: "Информировать",
    Generator: "Отвечать",
    "Manifesting Generator": "Отвечать и информировать",
    Projector: "Ждать приглашения",
    Reflector: "Ждать полного лунного цикла",
  };
  return strategies[typeName] || "Отвечать";
}

function determineAuthority(planetPositions) {
  const gateNumbers = planetPositions.map(p => p.gate);

  const solarPlexusGates = [22, 36, 37, 49, 55, 30, 6, 59, 39, 41];
  const sacralGates = [5, 14, 29, 34, 27, 59, 9, 3, 42];
  const splenicGates = [18, 28, 32, 44, 48, 50, 57, 58];

  if (solarPlexusGates.some(g => gateNumbers.includes(g))) {
    return { name: "Emotional", description: "Эмоциональная авторитет" };
  }
  if (sacralGates.some(g => gateNumbers.includes(g))) {
    return { name: "Sacral", description: "Сакральная авторитет" };
  }
  if (splenicGates.some(g => gateNumbers.includes(g))) {
    return { name: "Splenic", description: "Селезеночная авторитет" };
  }
  return { name: "No Inner Authority", description: "Без внутренней власти" };
}

function determineProfile(planetPositions) {
  const sun = planetPositions.find(p => p.name === "Sun");
  if (!sun) return null;

  const sunLine = sun.line;
  const earthLine = 7 - sunLine; // simplified
  return { number: `${sunLine}/${earthLine}`, description: `Профиль ${sunLine}/${earthLine}` };
}

async function calculateHumanDesign({ birthDate, birthTime, birthLocation }) {
  // 1) timezone conversion (your existing utils)
  const locationInfo = getLocationInfo(birthLocation);
  const utcOffset = getUTCOffset(birthLocation, birthDate);
  const utcData = convertToUTC(birthDate, birthTime, birthLocation);

  // 2) Julian day in UTC using swe_julday
  const hourDecimal = utcData.utcHour + utcData.utcMinute / 60;
  const jd = sweJulday(utcData.utcYear, utcData.utcMonth, utcData.utcDay, hourDecimal);

  // 3) planets
  const planets = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Rahu", "Ketu"];
  const planetPositions = planets.map(p => calculatePlanetPosition(jd, p)).filter(Boolean);

  // 4) gates list
  const gates = planetPositions.map(p => ({
    number: p.gate,
    line: p.line,
    planet: p.name,
  }));

  const type = determineType(gates);
  const strategy = determineStrategy(type.name);
  const authority = determineAuthority(planetPositions);
  const profile = determineProfile(planetPositions);

  return {
    birthDate,
    birthTime,
    birthLocation,
    latitude: locationInfo?.lat,
    longitude: locationInfo?.lon,
    timezone: locationInfo?.tz,
    utcOffset,
    type,
    strategy,
    authority,
    profile,
    gates,
    planetPositions,
    calculationSource: "Swiss Ephemeris",
    version: "fixed-gates-and-swe-functions",
  };
}

module.exports = { calculateHumanDesign };
