/**
 * Human Design calculations (CommonJS) using Swiss Ephemeris
 * - Uses correct Swiss Ephemeris function names: swe_julday, swe_calc_ut
 * - Uses correct Rave Mandala gate order (not linear 1..64)
 * - Calculates Personality (birth moment) and Design (Sun ~88 degrees earlier)
 */

const swe = require("swisseph");
const { getLocationInfo, convertToUTC } = require("./timezone-utils.cjs");

// --------------------
// Swiss Ephemeris helpers
// --------------------
const IFALGS = (swe.SEFLG_SWIEPH || 2) | (swe.SEFLG_SPEED || 256); // enough for longitude + speed

function toNumber(n) {
  const x = Number(n);
  if (Number.isNaN(x)) throw new Error(`Invalid number: ${n}`);
  return x;
}

function norm360(deg) {
  let d = deg % 360;
  if (d < 0) d += 360;
  return d;
}

// shortest signed diff (a - b) in degrees, range [-180..180]
function angleDiff(a, b) {
  const d = norm360(a - b);
  return d > 180 ? d - 360 : d;
}

// Swiss Ephemeris calc wrapper (supports callback-based API)
function sweCalcUt(jd, planet) {
  return new Promise((resolve, reject) => {
    // Different builds of node-swisseph expose different signatures.
    // The most common: swe_calc_ut(jd, planet, flags, cb)
    // cb(err, result)
    try {
      swe.swe_calc_ut(jd, planet, IFALGS, (res) => {
        // Some versions pass a single object with { error, data }, others just { longitude }
        // We normalize to longitude in degrees.
        if (!res) return reject(new Error("Empty response from swe_calc_ut"));

        if (res.error) return reject(new Error(res.error));

        // Many node-swisseph builds return:
        // { flag, longitude, latitude, distance, speed_longitude, ... }
        if (typeof res.longitude === "number") return resolve(res);

        // Some return { data: [lon, lat, dist, lonSpeed, ...], error: null }
        if (Array.isArray(res.data) && typeof res.data[0] === "number") {
          return resolve({
            longitude: res.data[0],
            latitude: res.data[1],
            distance: res.data[2],
            speed_longitude: res.data[3],
          });
        }

        return reject(new Error(`Unexpected swe_calc_ut response: ${JSON.stringify(res).slice(0, 300)}`));
      });
    } catch (e) {
      reject(e);
    }
  });
}

function sweJulday(year, month, day, hourDecimal) {
  if (typeof swe.swe_julday === "function") {
    // calendar flag: SE_GREG_CAL is 1 in Swiss Ephemeris
    return swe.swe_julday(year, month, day, hourDecimal, swe.SE_GREG_CAL || 1);
  }
  throw new Error("swe_julday not available in swisseph module");
}

// --------------------
// Human Design gate mapping (Rave Mandala)
// --------------------
// Gate sequence starting at 0° Aquarius (which is 300° ecliptic longitude)
// Each gate spans 5.625° (= 360/64). Each line spans 0.9375° (= 5.625/6).
//
// Standard Rave Mandala order (0° Aquarius starts Gate 41.1)
const RAVE_GATE_SEQUENCE = [
  41, 19, 13, 49, 30, 55, 37, 63,
  22, 36, 25, 17, 21, 51, 42, 3,
  27, 24, 2, 23, 8, 20, 16, 35,
  45, 12, 15, 52, 39, 53, 62, 56,
  31, 33, 7, 4, 29, 59, 40, 64,
  47, 6, 46, 18, 48, 57, 32, 50,
  28, 44, 1, 43, 14, 34, 9, 5,
  26, 11, 10, 58, 38, 54, 61, 60
];

// 0° Aquarius is 300° in tropical ecliptic longitude
const RAVE_START_LONGITUDE = 300;
const GATE_SIZE = 360 / 64;        // 5.625
const LINE_SIZE = GATE_SIZE / 6;   // 0.9375

function longitudeToGateLine(eclLon) {
  const lon = norm360(eclLon);
  const normalized = norm360(lon - RAVE_START_LONGITUDE); // 0..360 relative to 0° Aquarius
  const gateIndex = Math.floor(normalized / GATE_SIZE);   // 0..63
  const withinGate = normalized - gateIndex * GATE_SIZE;  // 0..5.625
  const line = Math.floor(withinGate / LINE_SIZE) + 1;    // 1..6

  const gate = RAVE_GATE_SEQUENCE[Math.max(0, Math.min(63, gateIndex))];
  return { gate, line, gateIndex, withinGate };
}

// --------------------
// Planet constants
// --------------------
const PLANETS = [
  { name: "Sun", key: "Sun", sweId: swe.SE_SUN },
  { name: "Moon", key: "Moon", sweId: swe.SE_MOON },
  { name: "Mercury", key: "Mercury", sweId: swe.SE_MERCURY },
  { name: "Venus", key: "Venus", sweId: swe.SE_VENUS },
  { name: "Mars", key: "Mars", sweId: swe.SE_MARS },
  { name: "Jupiter", key: "Jupiter", sweId: swe.SE_JUPITER },
  { name: "Saturn", key: "Saturn", sweId: swe.SE_SATURN },
  // Nodes: use mean node for most HD calculators
  { name: "North Node", key: "Rahu", sweId: swe.SE_MEAN_NODE || swe.SE_TRUE_NODE },
  { name: "South Node", key: "Ketu", sweId: swe.SE_MEAN_NODE || swe.SE_TRUE_NODE, isSouthNode: true },
];

// --------------------
// Channels (enough for centers/type/authority)
// --------------------
const CHANNELS = [
  // Root <-> Solar Plexus / Sacral / Spleen
  ["39", "55", "Root", "SolarPlexus"],
  ["41", "30", "Root", "SolarPlexus"],
  ["19", "49", "Root", "SolarPlexus"],
  ["53", "42", "Root", "Sacral"],
  ["60", "3", "Root", "Sacral"],
  ["52", "9", "Root", "Sacral"],
  ["58", "18", "Root", "Spleen"],
  ["54", "32", "Root", "Spleen"],
  ["38", "28", "Root", "Spleen"],

  // Sacral <-> G / Throat / Spleen / Solar Plexus / Ego
  ["34", "20", "Sacral", "Throat"],
  ["34", "10", "Sacral", "G"],
  ["34", "57", "Sacral", "Spleen"],
  ["27", "50", "Sacral", "Spleen"],
  ["29", "46", "Sacral", "G"],
  ["14", "2", "Sacral", "G"],
  ["59", "6", "Sacral", "SolarPlexus"],
  ["5", "15", "Sacral", "G"],

  // Ego <-> Throat / G / Solar Plexus / Spleen
  ["21", "45", "Ego", "Throat"],
  ["26", "44", "Ego", "Spleen"],
  ["51", "25", "Ego", "G"],
  ["40", "37", "Ego", "SolarPlexus"],

  // Solar Plexus <-> Throat / G
  ["35", "36", "Throat", "SolarPlexus"],
  ["12", "22", "Throat", "SolarPlexus"],
  ["1", "8", "G", "Throat"],

  // G <-> Throat / Ajna / Spleen
  ["7", "31", "G", "Throat"],
  ["13", "33", "G", "Throat"],
  ["10", "20", "G", "Throat"],
  ["10", "57", "G", "Spleen"],

  // Ajna <-> Throat / Head
  ["43", "23", "Ajna", "Throat"],
  ["17", "62", "Ajna", "Throat"],
  ["11", "56", "Ajna", "Throat"],
  ["47", "64", "Ajna", "Head"],
  ["24", "61", "Ajna", "Head"],
  ["4", "63", "Ajna", "Head"],

  // Spleen <-> Throat
  ["48", "16", "Spleen", "Throat"],
  ["57", "20", "Spleen", "Throat"],
];

const CENTER_ORDER = ["Head", "Ajna", "Throat", "G", "Ego", "SolarPlexus", "Sacral", "Spleen", "Root"];

function channelKey(a, b) {
  const x = Number(a);
  const y = Number(b);
  return x < y ? `${x}-${y}` : `${y}-${x}`;
}

// --------------------
// Core calculations
// --------------------
async function calculatePlanetPositions(jd) {
  const out = [];

  // First calculate Sun and Node once, then handle South Node as opposite
  const results = {};
  for (const p of PLANETS) {
    if (p.isSouthNode) continue;
    const res = await sweCalcUt(jd, p.sweId);
    const lon = norm360(res.longitude);
    results[p.key] = lon;
    out.push({ planet: p.name, longitude: lon, ...longitudeToGateLine(lon) });
  }

  // South node is opposite the north node
  if (results.Rahu != null) {
    const southLon = norm360(results.Rahu + 180);
    out.push({ planet: "South Node", longitude: southLon, ...longitudeToGateLine(southLon) });
  }

  return out;
}

function earthFromSunLongitude(sunLon) {
  return norm360(sunLon + 180);
}

// Find design moment where Sun is ~88 degrees earlier than birth Sun
async function findDesignJd(personalityJd, personalitySunLon) {
  const target = norm360(personalitySunLon - 88);

  // initial guess: 88 days earlier
  let jd = personalityJd - 88;

  // Iterate correction: sun moves ~0.9856 deg/day
  for (let i = 0; i < 12; i++) {
    const sunRes = await sweCalcUt(jd, swe.SE_SUN);
    const sunLon = norm360(sunRes.longitude);

    const d = angleDiff(sunLon, target); // how far current is from target
    if (Math.abs(d) < 0.0005) break; // good enough

    // Move JD back/forward to reduce delta
    jd -= d / 0.9856;
  }

  return jd;
}

function collectActiveGates(personalityPositions, designPositions) {
  // For definition/type, HD uses both Personality + Design
  const all = [...personalityPositions, ...designPositions];

  const active = new Map(); // gate -> set of lines/planets
  for (const p of all) {
    if (!active.has(p.gate)) active.set(p.gate, []);
    active.get(p.gate).push({ planet: p.planet, line: p.line });
  }
  return active;
}

function getDefinedChannelsAndCenters(activeGates) {
  const definedChannels = [];
  const definedCenters = new Set();

  for (const [g1, g2, c1, c2] of CHANNELS) {
    const a = Number(g1);
    const b = Number(g2);
    if (activeGates.has(a) && activeGates.has(b)) {
      definedChannels.push({ gates: channelKey(a, b), centers: [c1, c2] });
      definedCenters.add(c1);
      definedCenters.add(c2);
    }
  }

  return { definedChannels, definedCenters };
}

function determineType(definedCenters, definedChannels) {
  const hasSacral = definedCenters.has("Sacral");
  const hasThroat = definedCenters.has("Throat");

  // A "motor to throat" connection for Manifestor/MG:
  // Any defined channel that includes Throat AND includes a motor center (Ego, SolarPlexus, Root, Sacral)
  const motorCenters = new Set(["Ego", "SolarPlexus", "Root", "Sacral"]);
  const throatHasMotor = definedChannels.some((ch) => {
    const [c1, c2] = ch.centers;
    return (c1 === "Throat" && motorCenters.has(c2)) || (c2 === "Throat" && motorCenters.has(c1));
  });

  if (definedCenters.size === 0) {
    return { name: "Reflector", strategy: "Wait a lunar cycle", notSelf: "Disappointment" };
  }

  if (hasSacral) {
    if (throatHasMotor) return { name: "Manifesting Generator", strategy: "To Respond", notSelf: "Frustration" };
    return { name: "Generator", strategy: "To Respond", notSelf: "Frustration" };
  }

  // no sacral
  if (hasThroat && throatHasMotor) {
    return { name: "Manifestor", strategy: "To Inform", notSelf: "Anger" };
  }

  return { name: "Projector", strategy: "Wait for the invitation", notSelf: "Bitterness" };
}

function determineAuthority(typeName, definedCenters) {
  if (typeName === "Reflector") return "Lunar";

  if (definedCenters.has("SolarPlexus")) return "Emotional - Solar Plexus";
  if (definedCenters.has("Sacral")) return "Sacral";
  if (definedCenters.has("Spleen")) return "Splenic";
  if (definedCenters.has("Ego")) return "Ego";
  if (definedCenters.has("G")) return "Self-Projected";

  // Many projectors: mental/environmental (no inner authority)
  return "No Inner Authority";
}

function determineProfile(personalitySun, designSun) {
  // Profile is Personality Sun line / Design Sun line
  return `${personalitySun.line}/${designSun.line}`;
}

function determineIncarnationCross(personalitySun, personalityEarth, designSun, designEarth) {
  // Jovian format: (P Sun / P Earth | D Sun / D Earth) using gate numbers
  return `(${personalitySun.gate}/${personalityEarth.gate} | ${designSun.gate}/${designEarth.gate})`;
}

// --------------------
// Public API
// --------------------
async function calculateHumanDesign({ birthDate, birthTime, birthLocation }) {
  // Convert local birth time -> UTC using your timezone utils
  const utc = convertToUTC(birthDate, birthTime, birthLocation);

  const jdPersonality = sweJulday(
    toNumber(utc.utcYear),
    toNumber(utc.utcMonth),
    toNumber(utc.utcDay),
    toNumber(utc.utcHour) + toNumber(utc.utcMinute) / 60
  );

  // Personality positions
  const personalityPositions = await calculatePlanetPositions(jdPersonality);

  const personalitySun = personalityPositions.find((p) => p.planet === "Sun");
  if (!personalitySun) throw new Error("Sun not calculated");

  const personalityEarthLon = earthFromSunLongitude(personalitySun.longitude);
  const personalityEarth = { planet: "Earth", longitude: personalityEarthLon, ...longitudeToGateLine(personalityEarthLon) };

  // Design JD search
  const jdDesign = await findDesignJd(jdPersonality, personalitySun.longitude);
  const designPositions = await calculatePlanetPositions(jdDesign);

  const designSun = designPositions.find((p) => p.planet === "Sun");
  if (!designSun) throw new Error("Design Sun not calculated");

  const designEarthLon = earthFromSunLongitude(designSun.longitude);
  const designEarth = { planet: "Earth", longitude: designEarthLon, ...longitudeToGateLine(designEarthLon) };

  // Active gates and definition
  const activeGates = collectActiveGates(personalityPositions, designPositions);
  const { definedChannels, definedCenters } = getDefinedChannelsAndCenters(activeGates);

  const typeObj = determineType(definedCenters, definedChannels);
  const authority = determineAuthority(typeObj.name, definedCenters);
  const profile = determineProfile(personalitySun, designSun);
  const incarnationCross = determineIncarnationCross(personalitySun, personalityEarth, designSun, designEarth);

  const locationInfo = getLocationInfo(birthLocation);

  return {
    birth: {
      birthDate,
      birthTime,
      birthLocation,
      timezone: locationInfo?.tz,
      latitude: locationInfo?.lat,
      longitude: locationInfo?.lon,
      utc: utc,
    },
    type: typeObj.name,
    strategy: typeObj.strategy,
    notSelfTheme: typeObj.notSelf,
    authority,
    profile,
    incarnationCross,
    definition: definedCenters.size === 0 ? "No Definition" : "Defined",
    definedCenters: CENTER_ORDER.filter((c) => definedCenters.has(c)),
    definedChannels,
    personality: {
      jd: jdPersonality,
      sun: { gate: personalitySun.gate, line: personalitySun.line, longitude: personalitySun.longitude },
      earth: { gate: personalityEarth.gate, line: personalityEarth.line, longitude: personalityEarth.longitude },
      planets: personalityPositions,
    },
    design: {
      jd: jdDesign,
      sun: { gate: designSun.gate, line: designSun.line, longitude: designSun.longitude },
      earth: { gate: designEarth.gate, line: designEarth.line, longitude: designEarth.longitude },
      planets: designPositions,
    },
    calculationSource: "Swiss Ephemeris (swe_* functions) + Rave Mandala mapping",
  };
}

module.exports = { calculateHumanDesign };
