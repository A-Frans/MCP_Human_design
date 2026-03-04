/**
 * Human Design Calculations with Swiss Ephemeris (CommonJS version)
 * Accurate planet positions via swisseph
 */

const swissephModule = require('swisseph');
const Swisseph = swissephModule.default || swissephModule;

/**
 * NOTE
 * The functions in node "swisseph" are typically:
 * - swe_julday (callback)
 * - swe_calc_ut (callback)
 * Not "julday" or "calc_ut"
 */

const GATES = {
  1: { name: 'The Creative', ru_name: 'Творческий', hexagram: 1 },
  2: { name: 'The Receptive', ru_name: 'Воспринимающий', hexagram: 2 },
  3: { name: 'Ordering', ru_name: 'Порядок', hexagram: 3 },
  4: { name: 'Formulization', ru_name: 'Формулирование', hexagram: 4 },
  5: { name: 'Needing', ru_name: 'Потребность', hexagram: 5 },
  6: { name: 'Friction', ru_name: 'Трение', hexagram: 6 },
  7: { name: 'The Role of Self', ru_name: 'Роль Я', hexagram: 7 },
  8: { name: 'Holding Together', ru_name: 'Удержание вместе', hexagram: 8 },
  9: { name: 'The Focus', ru_name: 'Фокус', hexagram: 9 },
  10: { name: 'The Treading', ru_name: 'Шаги', hexagram: 10 },
  11: { name: 'Ideas', ru_name: 'Идеи', hexagram: 11 },
  12: { name: 'Caution', ru_name: 'Осторожность', hexagram: 12 },
  13: { name: 'The Listener', ru_name: 'Слушатель', hexagram: 13 },
  14: { name: 'Power Skills', ru_name: 'Силовые навыки', hexagram: 14 },
  15: { name: 'Modesty', ru_name: 'Скромность', hexagram: 15 },
  16: { name: 'Skills', ru_name: 'Навыки', hexagram: 16 },
  17: { name: 'Following', ru_name: 'Следование', hexagram: 17 },
  18: { name: 'Work', ru_name: 'Работа', hexagram: 18 },
  19: { name: 'Approach', ru_name: 'Подход', hexagram: 19 },
  20: { name: 'Now', ru_name: 'Сейчас', hexagram: 20 },
  21: { name: 'The Editor', ru_name: 'Редактор', hexagram: 21 },
  22: { name: 'Openness', ru_name: 'Открытость', hexagram: 22 },
  23: { name: 'Splitting Apart', ru_name: 'Распад', hexagram: 23 },
  24: { name: 'Rationalizing', ru_name: 'Рационализация', hexagram: 24 },
  25: { name: 'Spirit of the Self', ru_name: 'Дух Я', hexagram: 25 },
  26: { name: 'The Transmitter', ru_name: 'Передатчик', ru_hexagram: 26, hexagram: 26 },
  27: { name: 'Caring', ru_name: 'Забота', hexagram: 27 },
  28: { name: 'The Game Player', ru_name: 'Игрок', hexagram: 28 },
  29: { name: 'Saying Yes', ru_name: 'Говорить да', hexagram: 29 },
  30: { name: 'Recognition of Feelings', ru_name: 'Узнавание чувств', hexagram: 30 },
  31: { name: 'Influence', ru_name: 'Влияние', hexagram: 31 },
  32: { name: 'The Duration', ru_name: 'Продолжительность', hexagram: 32 },
  33: { name: 'Retreat', ru_name: 'Отступление', hexagram: 33 },
  34: { name: 'Great Power', ru_name: 'Большая сила', hexagram: 34 },
  35: { name: 'Progress', ru_name: 'Прогресс', hexagram: 35 },
  36: { name: 'Crisis', ru_name: 'Кризис', hexagram: 36 },
  37: { name: 'Friendship', ru_name: 'Дружба', hexagram: 37 },
  38: { name: 'The Fighter', ru_name: 'Боец', hexagram: 38 },
  39: { name: 'Provocation', ru_name: 'Провокация', hexagram: 39 },
  40: { name: 'Deliverance', ru_name: 'Освобождение', hexagram: 40 },
  41: { name: 'Contraction', ru_name: 'Сокращение', hexagram: 41 },
  42: { name: 'Growth', ru_name: 'Рост', hexagram: 42 },
  43: { name: 'Insight', ru_name: 'Инсайт', hexagram: 43 },
  44: { name: 'Coming to Meet', ru_name: 'Встреча', hexagram: 44 },
  45: { name: 'The Gatherer', ru_name: 'Собирающий', hexagram: 45 },
  46: { name: 'Determination', ru_name: 'Определенность', hexagram: 46 },
  47: { name: 'Realization', ru_name: 'Реализация', hexagram: 47 },
  48: { name: 'The Well', ru_name: 'Колодец', hexagram: 48 },
  49: { name: 'Revolution', ru_name: 'Революция', hexagram: 49 },
  50: { name: 'Values', ru_name: 'Ценности', hexagram: 50 },
  51: { name: 'The Arousing', ru_name: 'Побуждение', hexagram: 51 },
  52: { name: 'Keeping Still', ru_name: 'Сохранение покоя', hexagram: 52 },
  53: { name: 'Development', ru_name: 'Развитие', hexagram: 53 },
  54: { name: 'The Marrying Maiden', ru_name: 'Невеста', hexagram: 54 },
  55: { name: 'Abundance', ru_name: 'Изобилие', hexagram: 55 },
  56: { name: 'The Wanderer', ru_name: 'Странник', hexagram: 56 },
  57: { name: 'The Gentle', ru_name: 'Нежный', hexagram: 57 },
  58: { name: 'The Joyous', ru_name: 'Радостный', hexagram: 58 },
  59: { name: 'Dispersion', ru_name: 'Дисперсия', hexagram: 59 },
  60: { name: 'Limitation', ru_name: 'Ограничение', hexagram: 60 },
  61: { name: 'Inner Truth', ru_name: 'Внутренняя правда', hexagram: 61 },
  62: { name: 'Detail', ru_name: 'Деталь', hexagram: 62 },
  63: { name: 'After Completion', ru_name: 'После завершения', hexagram: 63 },
  64: { name: 'Before Completion', ru_name: 'До завершения', hexagram: 64 },
};

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
    Rahu: 11, // Node
    Ketu: 12, // Node
  };
  return planetMap[planetName] ?? 0;
}

/**
 * Promisified swisseph wrappers
 */
function sweJulday(year, month, day, hourDecimal) {
  return new Promise((resolve, reject) => {
    const cal = Swisseph.SE_GREG_CAL ?? 1;
    try {
      Swisseph.swe_julday(year, month, day, hourDecimal, cal, (jd) => {
        if (typeof jd !== 'number') return reject(new Error('swe_julday invalid result'));
        resolve(jd);
      });
    } catch (e) {
      reject(e);
    }
  });
}

function sweCalcUt(jd, planetIndex) {
  return new Promise((resolve, reject) => {
    const flags = Swisseph.SEFLG_SPEED ?? 256;
    try {
      Swisseph.swe_calc_ut(jd, planetIndex, flags, (res) => {
        if (!res) return reject(new Error('swe_calc_ut empty result'));
        if (res.error) return reject(new Error(res.error));
        resolve(res);
      });
    } catch (e) {
      reject(e);
    }
  });
}

/**
 * Extract longitude robustly from swisseph response
 */
function extractLongitude(res) {
  if (!res) return null;

  // Common patterns:
  // - res.longitude (number)
  // - res.longitude[0]
  // - res.xx[0]
  // - res[0]
  if (typeof res.longitude === 'number') return res.longitude;
  if (Array.isArray(res.longitude) && typeof res.longitude[0] === 'number') return res.longitude[0];
  if (Array.isArray(res.xx) && typeof res.xx[0] === 'number') return res.xx[0];
  if (Array.isArray(res) && typeof res[0] === 'number') return res[0];

  return null;
}

async function calculatePlanetPosition(jd, planetName) {
  try {
    const planetIndex = getPlanetIndex(planetName);

    const res = await sweCalcUt(jd, planetIndex);
    const longitude = extractLongitude(res);

    if (typeof longitude !== 'number') {
      throw new Error(`Longitude missing for ${planetName}`);
    }

    const sign = Math.floor(longitude / 30) + 1;

    // Gate calc: 360 / 64 = 5.625 degrees
    let gate = Math.floor(longitude / 5.625) + 1;
    if (gate < 1) gate = 1;
    if (gate > 64) gate = 64;

    // Line: 6 per gate, each 0.9375 degrees
    const degreeInGate = longitude % 5.625;
    let line = Math.floor(degreeInGate / 0.9375) + 1;
    if (line < 1) line = 1;
    if (line > 6) line = 6;

    return {
      name: planetName,
      longitude,
      sign,
      gate,
      line,
      gateInfo: GATES[gate] || { name: 'Unknown', ru_name: 'Неизвестно' },
    };
  } catch (error) {
    console.error(`Error calculating ${planetName}:`, error);
    return null;
  }
}

function determineType(gates) {
  const gateNumbers = gates.map(g => g.number);

  const hasSacral = CENTER_GATES.Sacral.some(g => gateNumbers.includes(g));
  const hasThroat = CENTER_GATES.Throat.some(g => gateNumbers.includes(g));
  const hasSolarPlexus = CENTER_GATES.SolarPlexus.some(g => gateNumbers.includes(g));

  if (hasSacral && hasThroat) {
    return {
      name: 'Manifesting Generator',
      ru_name: 'Манифестирующий Генератор',
      description: 'Манифестирующие Генераторы сочетают устойчивую жизненную силу Генератора и способность инициировать.',
    };
  }
  if (hasSacral) {
    return {
      name: 'Generator',
      ru_name: 'Генератор',
      description: 'Генераторы - жизненная сила. Стратегия - отвечать через сакральный отклик.',
    };
  }
  if (!hasThroat) {
    return {
      name: 'Reflector',
      ru_name: 'Рефлектор',
      description: 'Рефлекторы отражают окружение. Стратегия - ждать лунный цикл.',
    };
  }
  if (hasSolarPlexus) {
    return {
      name: 'Projector',
      ru_name: 'Проектор',
      description: 'Проекторы направляют энергию других. Стратегия - ждать приглашения.',
    };
  }
  return {
    name: 'Manifestor',
    ru_name: 'Манифестор',
    description: 'Манифесторы инициируют. Стратегия - информировать.',
  };
}

function determineProfile(planetPositions) {
  const sun = planetPositions.find(p => p.name === 'Sun');
  if (!sun) return null;

  const sunLine = sun.line;
  const earthLine = 7 - sunLine;

  return {
    sun_line: sunLine,
    earth_line: earthLine,
    number: `${sunLine}/${earthLine}`,
    description: `Профиль ${sunLine}/${earthLine}`,
  };
}

function determineAuthority(planetPositions) {
  const gateNumbers = planetPositions.map(p => p.gate);

  if (CENTER_GATES.SolarPlexus.some(g => gateNumbers.includes(g))) {
    return {
      name: 'Emotional',
      ru_name: 'Эмоциональная',
      description: 'Ждите эмоциональной ясности.',
    };
  }
  if (CENTER_GATES.Sacral.some(g => gateNumbers.includes(g))) {
    return {
      name: 'Sacral',
      ru_name: 'Сакральная',
      description: 'Ориентируйтесь на телесный отклик.',
    };
  }
  if (CENTER_GATES.Spleen.some(g => gateNumbers.includes(g))) {
    return {
      name: 'Splenic',
      ru_name: 'Селезеночная',
      description: 'Доверяйте первому инстинкту.',
    };
  }
  if (CENTER_GATES.Heart.some(g => gateNumbers.includes(g))) {
    return {
      name: 'Ego Manifested',
      ru_name: 'Проявленный Эго',
      description: 'Следуйте силе воли и обещаниям.',
    };
  }
  if (CENTER_GATES.GCenter.some(g => gateNumbers.includes(g))) {
    return {
      name: 'G Center',
      ru_name: 'G-центр',
      description: 'Следуйте направлению любви.',
    };
  }
  return {
    name: 'No Inner Authority',
    ru_name: 'Без внутренней власти',
    description: 'Опирайтесь на окружение и отражение.',
  };
}

function getDefinedCenters(gates) {
  const gateNumbers = gates.map(g => g.number);
  const defined = [];

  for (const [centerName, gatesArr] of Object.entries(CENTER_GATES)) {
    if (gatesArr.some(g => gateNumbers.includes(g))) {
      defined.push({ name: centerName, defined: true });
    }
  }

  return defined;
}

/**
 * IMPORTANT:
 * This file references timezone helpers.
 * If they exist in another file, require them here.
 * Example:
 * const { getLocationInfo, getUTCOffset, convertToUTC } = require('./timezone-utils.cjs');
 */
function getLocationInfo() {
  // Placeholder to avoid runtime crash if not wired.
  // Replace with real implementation from your project.
  return { lat: null, lon: null, tz: 'UTC' };
}
function getUTCOffset() {
  return 0;
}
function convertToUTC(birthDate, birthTime) {
  const [y, m, d] = birthDate.split('-').map(Number);
  const [hh, mm] = birthTime.split(':').map(Number);
  return { utcYear: y, utcMonth: m, utcDay: d, utcHour: hh, utcMinute: mm };
}

async function calculateHumanDesign({ birthDate, birthTime, birthLocation }) {
  try {
    const utcData = convertToUTC(birthDate, birthTime, birthLocation);

    const jd = await sweJulday(
      utcData.utcYear,
      utcData.utcMonth,
      utcData.utcDay,
      utcData.utcHour + utcData.utcMinute / 60
    );

    const planets = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Rahu', 'Ketu'];

    const planetPositions = (await Promise.all(planets.map(p => calculatePlanetPosition(jd, p)))).filter(Boolean);

    const gates = planetPositions.map(p => ({
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
      Manifestor: 'Информировать',
      Generator: 'Отвечать',
      'Manifesting Generator': 'Отвечать и информировать',
      Projector: 'Ждать приглашения',
      Reflector: 'Ждать полного лунного цикла',
    };
    const strategy = strategies[type.name] || 'Отвечать';

    const definedCenters = getDefinedCenters(gates);

    const locationInfo = getLocationInfo(birthLocation);
    const utcOffset = getUTCOffset(birthLocation, birthDate);

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
      planetPositions: planetPositions.map(p => ({
        planet: p.name,
        longitude: p.longitude,
        sign: p.sign,
        gate: p.gate,
        line: p.line,
      })),
      calculationSource: 'Swiss Ephemeris',
      version: '1.0.0-full',
    };
  } catch (error) {
    console.error('Error calculating Human Design:', error);
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
