/**
 * Human Design Calculations with Swiss Ephemeris (CommonJS version)
 * Accurate Human Design chart calculation module
 */

const Swisseph = require("swisseph");
const { getLocationInfo, getUTCOffset, convertToUTC } = require("./timezone-utils.cjs");

// Debug (mag je later weghalen)
console.log("SWISSEPH KEYS:", Object.keys(Swisseph || {}));
console.log("julday:", typeof Swisseph?.julday);
console.log("swe_julday:", typeof Swisseph?.swe_julday);
console.log("calc_ut:", typeof Swisseph?.calc_ut);
console.log("swe_calc_ut:", typeof Swisseph?.swe_calc_ut);

// Helpers: pak de juiste Swiss Ephemeris functies
function sweJulday(year, month, day, hourDecimal, gregFlag = 1) {
  if (typeof Swisseph?.swe_julday === "function") {
    return Swisseph.swe_julday(year, month, day, hourDecimal, gregFlag);
  }
  if (typeof Swisseph?.julday === "function") {
    return Swisseph.julday(year, month, day, hourDecimal, gregFlag);
  }
  throw new Error("Swiss Ephemeris: julday function not available (expected swe_julday).");
}

/**
 * Swiss Ephemeris bindings verschillen per build:
 * - soms returnen ze direct een object
 * - soms returnen ze een array
 * - soms werken ze met callback
 *
 * Deze wrapper maakt het stabiel.
 */
function sweCalcUt(jd, planetIndex, flags = 0) {
  const fn =
    (typeof Swisseph?.swe_calc_ut === "function" && Swisseph.swe_calc_ut) ||
    (typeof Swisseph?.calc_ut === "function" && Swisseph.calc_ut);

  if (!fn) {
    throw new Error("Swiss Ephemeris: calc_ut function not available (expected swe_calc_ut).");
  }

  // Callback variant
  if (fn.length >= 4) {
    // (jd, planet, flags, callback)
    return new Promise((resolve, reject) => {
      fn(jd, planetIndex, flags, (res) => {
        if (!res) return reject(new Error("Swiss Ephemeris: empty response from swe_calc_ut"));
        if (res.error) return reject(new Error(res.error));
        resolve(res);
      });
    });
  }

  // Sync variant
  const res = fn(jd, planetIndex, flags);
  return Promise.resolve(res);
}

// 64 Gates
const GATES = {
  1: { name: "The Creative", ru_name: "Творческий", hexagram: 1 },
  2: { name: "The Receptive", ru_name: "Воспринимающий", hexagram: 2 },
  3: { name: "Ordering", ru_name: "Порядок", hexagram: 3 },
  4: { name: "Formulization", ru_name: "Формулирование", hexagram: 4 },
  5: { name: "Needing", ru_name: "Потребность", hexagram: 5 },
  6: { name: "Friction", ru_name: "Трение", hexagram: 6 },
  7: { name: "The Role of Self", ru_name: "Роль Я", hexagram: 7 },
  8: { name: "Holding Together", ru_name: "Удержание вместе", hexagram: 8 },
  9: { name: "The Focus", ru_name: "Фокус", hexagram: 9 },
  10: { name: "The Treading", ru_name: "Шаги", hexagram: 10 },
  11: { name: "Ideas", ru_name: "Идеи", hexagram: 11 },
  12: { name: "Caution", ru_name: "Осторожность", hexagram: 12 },
  13: { name: "The Listener", ru_name: "Слушатель", hexagram: 13 },
  14: { name: "Power Skills", ru_name: "Силовые навыки", hexagram: 14 },
  15: { name: "Modesty", ru_name: "Скромность", hexagram: 15 },
  16: { name: "Skills", ru_name: "Навыки", hexagram: 16 },
  17: { name: "Following", ru_name: "Следование", hexagram: 17 },
  18: { name: "Work", ru_name: "Работа", hexagram: 18 },
  19: { name: "Approach", ru_name: "Подход", hexagram: 19 },
  20: { name: "Now", ru_name: "Сейчас", hexagram: 20 },
  21: { name: "The Editor", ru_name: "Редактор", hexagram: 21 },
  22: { name: "Openness", ru_name: "Открытость", hexagram: 22 },
  23: { name: "Splitting Apart", ru_name: "Распад", hexagram: 23 },
  24: { name: "Rationalizing", ru_name: "Рационализация", hexagram: 24 },
  25: { name: "Spirit of the Self", ru_name: "Дух Я", hexagram: 25 },
  26: { name: "The Transmitter", ru_name: "Передатчик", hexagram: 26 },
  27: { name: "Caring", ru_name: "Забота", hexagram: 27 },
  28: { name: "The Game Player", ru_name: "Игрок", hexagram: 28 },
  29: { name: "Saying Yes", ru_name: "Говорить да", hexagram: 29 },
  30: { name: "Recognition of Feelings", ru_name: "Узнавание чувств", hexagram: 30 },
  31: { name: "Influence", ru_name: "Влияние", hexagram: 31 },
  32: { name: "The Duration", ru_name: "Продолжительность", hexagram: 32 },
  33: { name: "Retreat", ru_name: "Отступление", hexagram: 33 },
  34: { name: "Great Power", ru_name: "Большая сила", hexagram: 34 },
  35: { name: "Progress", ru_name: "Прогресс", hexagram: 35 },
  36: { name: "Crisis", ru_name: "Кризис", hexagram: 36 },
  37: { name: "Friendship", ru_name: "Дружба", hexagram: 37 },
  38: { name: "The Fighter", ru_name: "Боец", hexagram: 38 },
  39: { name: "Provocation", ru_name: "Провокация", hexagram: 39 },
  40: { name: "Deliverance", ru_name: "Освобождение", hexagram: 40 },
  41: { name: "Contraction", ru_name: "Сокращение", hexagram: 41 },
  42: { name: "Growth", ru_name: "Рост", hexagram: 42 },
  43: { name: "Insight", ru_name: "Инсайт", hexagram: 43 },
  44: { name: "Coming to Meet", ru_name: "Встреча", hexagram: 44 },
  45: { name: "The Gatherer", ru_name: "Собирающий", hexagram: 45 },
  46: { name: "Determination", ru_name: "Определенность", hexagram: 46 },
  47: { name: "Realization", ru_name: "Реализация", hexagram: 47 },
  48: { name: "The Well", ru_name: "Колодец", hexagram: 48 },
  49: { name: "Revolution", ru_name: "Революция", hexagram: 49 },
  50: { name: "Values", ru_name: "Ценности", hexagram: 50 },
  51: { name: "The Arousing", ru_name: "Побуждение", hexagram: 51 },
  52: { name: "Keeping Still", ru_name: "Сохранение покоя", hexagram: 52 },
  53: { name: "Development", ru_name: "Развитие", hexagram: 53 },
  54: { name: "The Marrying Maiden", ru_name: "Невеста", hexagram: 54 },
  55: { name: "Abundance", ru_name: "Изобилие", hexagram: 55 },
  56: { name: "The Wanderer", ru_name: "Странник", hexagram: 56 },
  57: { name: "The Gentle", ru_name: "Нежный", hexagram: 57 },
  58: { name: "The Joyous", ru_name: "Радостный", hexagram: 58 },
  59: { name: "Dispersion", ru_name: "Дисперсия", hexagram: 59 },
  60: { name: "Limitation", ru_name: "Ограничение", hexagram: 60 },
  61: { name: "Inner Truth", ru_name: "Внутренняя правда", hexagram: 61 },
  62: { name: "Detail", ru_name: "Деталь", hexagram: 62 },
  63: { name: "After Completion", ru_name: "После завершения", hexagram: 63 },
  64: { name: "Before Completion", ru_name: "До завершения", hexagram: 64 },
};

// Centers and their gates (as in your original)
const CENTER_GATES = {
  Root: [19, 39, 52, 58],
  Sacral: [2, 14, 26, 30, 31, 38, 42, 45, 59],
  SolarPlexus: [10, 20, 29, 34, 40, 46, 50, 57],
  Heart: [10, 21, 26, 34, 40, 51],
  Throat: [2, 3, 5, 7, 10, 11, 12, 16, 17, 20, 21, 22, 23, 24, 28, 31, 33, 35, 45, 56, 62],
  Ajna: [9, 20, 23, 30, 34, 40, 43, 47, 60, 61, 63, 64],
  Head: [1, 7, 13, 26, 27, 44, 50, 64],
  Spleen: [28, 32, 44, 48, 50, 57, 58],
  GCenter: [1, 2, 7, 10, 13, 15, 25, 46],
};

function getPlanetIndex(planetName) {
  const planetMap = {
    Sun: 0,
    Moon: 1,
    Mercury: 3,
    Venus: 4,
    Mars: 2,
    Jupiter: 5,
    Saturn: 6,
    Rahu: 11,
    Ketu: 12,
  };
  return planetMap[planetName] ?? 0;
}

function extractLongitude(calcResult) {
  if (!calcResult) return null;

  // Case 1: { longitude: ... }
  if (typeof calcResult.longitude === "number") return calcResult.longitude;

  // Case 2: { xx: [lon, lat, dist, speedLon, ...] } or { data: [...] }
  const arr =
    (Array.isArray(calcResult.xx) && calcResult.xx) ||
    (Array.isArray(calcResult.data) && calcResult.data) ||
    (Array.isArray(calcResult) && calcResult) ||
    null;

  if (arr && typeof arr[0] === "number") return arr[0];

  return null;
}

/**
 * Calculate planet position
 */
async function calculatePlanetPosition(jd, planetName) {
  const planetIndex = getPlanetIndex(planetName);

  const calcResult = await sweCalcUt(jd, planetIndex, 0);
  const longitude = extractLongitude(calcResult);

  if (typeof longitude !== "number") {
    throw new Error(`Swiss Ephemeris returned no longitude for ${planetName}`);
  }

  const sign = Math.floor(longitude / 30) + 1;

  // 360/64 = 5.625 degrees per gate
  const gateNumber = Math.floor(longitude / 5.625) + 1;
  const gate = gateNumber > 64 ? 64 : gateNumber;

  // Line: 6 lines inside a gate (5.625/6 = 0.9375)
  const degreeInGate = longitude % 5.625;
  const line = Math.floor(degreeInGate / 0.9375) + 1;

  return {
    name: planetName,
    longitude,
    sign,
    gate,
    line,
    gateInfo: GATES[gate] || { name: "Unknown", ru_name: "Неизвестно" },
  };
}

function determineType(gates) {
  // gates can contain gate OR number, so normalize:
  const gateNumbers = gates.map((g) => g.gate ?? g.number).filter(Boolean);

  const hasSacral = CENTER_GATES.Sacral.some((g) => gateNumbers.includes(g));
  const hasThroat = CENTER_GATES.Throat.some((g) => gateNumbers.includes(g));
  const hasSolarPlexus = CENTER_GATES.SolarPlexus.some((g) => gateNumbers.includes(g));

  if (hasSacral && hasThroat) {
    return { name: "Manifesting Generator", ru_name: "Манифестирующий Генератор" };
  }
  if (hasSacral) {
    return { name: "Generator", ru_name: "Генератор" };
  }
  if (!hasThroat) {
    return { name: "Reflector", ru_name: "Рефлектор" };
  }
  if (hasSolarPlexus) {
    return { name: "Projector", ru_name: "Проектор" };
  }
  return { name: "Manifestor", ru_name: "Манифестор" };
}

function determineProfile(planetPositions) {
  const sun = planetPositions.find((p) => p.name === "Sun");
  if (!sun) return null;

  const sunLine = sun.line;
  const earthLine = 7 - sunLine;

  return {
    sun_line: sunLine,
    earth_line: earthLine,
    number: `${sunLine}/${earthLine}`,
    description: `Profile ${sunLine}/${earthLine}`,
  };
}

function determineAuthority(planetPositions) {
  const gateNumbers = planetPositions.map((p) => p.gate).filter(Boolean);

  if (CENTER_GATES.SolarPlexus.some((g) => gateNumbers.includes(g))) {
    return { name: "Emotional", ru_name: "Эмоциональная" };
  }
  if (CENTER_GATES.Sacral.some((g) => gateNumbers.includes(g))) {
    return { name: "Sacral", ru_name: "Сакральная" };
  }
  if (CENTER_GATES.Spleen.some((g) => gateNumbers.includes(g))) {
    return { name: "Splenic", ru_name: "Селезеночная" };
  }
  if (CENTER_GATES.Heart.some((g) => gateNumbers.includes(g))) {
    return { name: "Ego Manifested", ru_name: "Проявленный Эго" };
  }
  if (CENTER_GATES.GCenter.some((g) => gateNumbers.includes(g))) {
    return { name: "G Center", ru_name: "G-центр" };
  }

  return { name: "No Inner Authority", ru_name: "Без внутренней власти" };
}

function getDefinedCenters(gates) {
  const gateNumbers = gates.map((g) => g.gate ?? g.number).filter(Boolean);

  const defined = [];
  for (const [centerName, centerGateList] of Object.entries(CENTER_GATES)) {
    if (centerGateList.some((g) => gateNumbers.includes(g))) {
      defined.push({ name: centerName, defined: true });
    }
  }
  return defined;
}

async function calculateHumanDesign({ birthDate, birthTime, birthLocation }) {
  try {
    const locationInfo = getLocationInfo(birthLocation);
    const utcOffset = getUTCOffset(birthLocation, birthDate);
    const utcData = convertToUTC(birthDate, birthTime, birthLocation);

    console.log(`Timezone: ${locationInfo.tz}, UTC offset: ${utcOffset}`);
    console.log(`Local: ${birthTime} -> UTC: ${utcData.utcHour}:${utcData.utcMinute}`);

    const jd = sweJulday(
      utcData.utcYear,
      utcData.utcMonth,
      utcData.utcDay,
      utcData.utcHour + utcData.utcMinute / 60,
      1
    );

    const planets = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Rahu", "Ketu"];

    const planetPositions = [];
    for (const planet of planets) {
      planetPositions.push(await calculatePlanetPosition(jd, planet));
    }

    const gates = planetPositions.map((p) => ({
      // keep BOTH keys so the rest of the code is consistent
      gate: p.gate,
      number: p.gate,
      name: p.gateInfo.name,
      ru_name: p.gateInfo.ru_name,
      line: p.line,
      planet: p.name,
      sign: p.sign,
      hexagram: p.gateInfo.hexagram,
    }));

    const type = determineType(gates);
    const profile = determineProfile(planetPositions);
    const authority = determineAuthority(planetPositions);

    const strategies = {
      Manifestor: "Информировать",
      Generator: "Отвечать",
      "Manifesting Generator": "Отвечать и информировать",
      Projector: "Ждать приглашения",
      Reflector: "Ждать полного лунного цикла",
    };
    const strategy = strategies[type.name] || "Отвечать";

    const definedCenters = getDefinedCenters(gates);

    return {
      birthDate,
      birthTime,
      birthLocation,
      latitude: locationInfo.lat,
      longitude: locationInfo.lon,
      timezone: locationInfo.tz,
      utcOffset,
      type,
      strategy,
      authority,
      profile,
      gates,
      definedCenters,
      planetPositions: planetPositions.map((p) => ({
        planet: p.name,
        longitude: p.longitude,
        sign: p.sign,
        gate: p.gate,
        line: p.line,
      })),
      calculationSource: "Swiss Ephemeris",
      version: "1.0.0-full",
    };
  } catch (error) {
    console.error("Error calculating Human Design:", error);
    throw new Error(`Failed to calculate Human Design: ${error.message}`);
  }
}

module.exports = {
  calculateHumanDesign,
  GATES,
  CENTER_GATES,
  getLocationInfo,
  getUTCOffset,
  convertToUTC,
};
