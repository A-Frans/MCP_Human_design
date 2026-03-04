/**
 * Human Design Calculations (CommonJS) using Swiss Ephemeris via node "swisseph"
 * Fixes: no Swisseph.julday / Swisseph.calc_ut calls.
 * Uses: Swisseph.swe_julday + Swisseph.swe_calc_ut (callbacks) with Promise wrappers.
 */

const swissephModule = require('swisseph');
const Swisseph = swissephModule.default || swissephModule;

/* -----------------------------
   Constants and basic mappings
----------------------------- */

const GATES = {
  1: { name: 'The Creative' },
  2: { name: 'The Receptive' },
  3: { name: 'Ordering' },
  4: { name: 'Formulization' },
  5: { name: 'Needing' },
  6: { name: 'Friction' },
  7: { name: 'The Role of Self' },
  8: { name: 'Holding Together' },
  9: { name: 'The Focus' },
  10: { name: 'The Treading' },
  11: { name: 'Ideas' },
  12: { name: 'Caution' },
  13: { name: 'The Listener' },
  14: { name: 'Power Skills' },
  15: { name: 'Modesty' },
  16: { name: 'Skills' },
  17: { name: 'Following' },
  18: { name: 'Work' },
  19: { name: 'Approach' },
  20: { name: 'Now' },
  21: { name: 'The Editor' },
  22: { name: 'Openness' },
  23: { name: 'Splitting Apart' },
  24: { name: 'Rationalizing' },
  25: { name: 'Spirit of the Self' },
  26: { name: 'The Transmitter' },
  27: { name: 'Caring' },
  28: { name: 'The Game Player' },
  29: { name: 'Saying Yes' },
  30: { name: 'Recognition of Feelings' },
  31: { name: 'Influence' },
  32: { name: 'The Duration' },
  33: { name: 'Retreat' },
  34: { name: 'Great Power' },
  35: { name: 'Progress' },
  36: { name: 'Crisis' },
  37: { name: 'Friendship' },
  38: { name: 'The Fighter' },
  39: { name: 'Provocation' },
  40: { name: 'Deliverance' },
  41: { name: 'Contraction' },
  42: { name: 'Growth' },
  43: { name: 'Insight' },
  44: { name: 'Coming to Meet' },
  45: { name: 'The Gatherer' },
  46: { name: 'Determination' },
  47: { name: 'Realization' },
  48: { name: 'The Well' },
  49: { name: 'Revolution' },
  50: { name: 'Values' },
  51: { name: 'The Arousing' },
  52: { name: 'Keeping Still' },
  53: { name: 'Development' },
  54: { name: 'The Marrying Maiden' },
  55: { name: 'Abundance' },
  56: { name: 'The Wanderer' },
  57: { name: 'The Gentle' },
  58: { name: 'The Joyous' },
  59: { name: 'Dispersion' },
  60: { name: 'Limitation' },
  61: { name: 'Inner Truth' },
  62: { name: 'Detail' },
  63: { name: 'After Completion' },
  64: { name: 'Before Completion' },
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
    Rahu: 11,
    Ketu: 12,
  };
  return planetMap[planetName] ?? 0;
}

/* -----------------------------
   Swiss Ephemeris wrappers
----------------------------- */

function sweJulday(year, month, day, hourDecimal) {
  return new Promise((resolve, reject) => {
    const cal = Swisseph.SE_GREG_CAL ?? 1;
    try {
      Swisseph.swe_julday(year, month, day, hourDecimal, cal, (jd) => {
        if (typeof jd !== 'number') return reject(new Error('swe_julday returned invalid JD'));
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
        if (!res) return reject(new Error('swe_calc_ut returned empty result'));
        if (res.error) return reject(new Error(res.error));
        resolve(res);
      });
    } catch (e) {
      reject(e);
    }
  });
}

function extractLongitude(res) {
  if (!res) return null;
  if (typeof res.longitude === 'number') return res.longitude;
  if (Array.isArray(res.longitude) && typeof res.longitude[0] === 'number') return res.longitude[0];
  if (Array.isArray(res.xx) && typeof res.xx[0] === 'number') return res.xx[0];
  if (Array.isArray(res) && typeof res[0] === 'number') return res[0];
  return null;
}

/* -----------------------------
   Human Design calculations
----------------------------- */

async function calculatePlanetPosition(jd, planetName) {
  try {
    const planetIndex = getPlanetIndex(planetName);
    const res = await sweCalcUt(jd, planetIndex);
    const longitude = extractLongitude(res);

    if (typeof longitude !== 'number') {
      throw new Error(`Longitude missing for ${planetName}`);
    }

    const sign = Math.floor(longitude / 30) + 1;

    // 360 / 64 = 5.625 degrees per gate
    let gate = Math.floor(longitude / 5.625) + 1;
    if (gate < 1) gate = 1;
    if (gate > 64) gate = 64;

    // each gate has 6 lines, 5.625 / 6 = 0.9375 degrees per line
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
      gateInfo: GATES[gate] || { name: 'Unknown' },
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
    return { name: 'Manifesting Generator' };
  }
  if (hasSacral) {
    return { name: 'Generator' };
  }
  if (!hasThroat) {
    return { name: 'Reflector' };
  }
  if (hasSolarPlexus) {
    return { name: 'Projector' };
  }
  return { name: 'Manifestor' };
}

function determineStrategy(typeName) {
  const strategies = {
    Manifestor: 'Informeren',
    Generator: 'Reageren',
    'Manifesting Generator': 'Reageren en informeren',
    Projector: 'Wachten op de uitnodiging',
    Reflector: 'Wachten op een maancyclus',
  };
  return strategies[typeName] || 'Reageren';
}

function determineAuthority(planetPositions) {
  const gateNumbers = planetPositions.map(p => p.gate);

  if (CENTER_GATES.SolarPlexus.some(g => gateNumbers.includes(g))) return { name: 'Emotioneel' };
  if (CENTER_GATES.Sacral.some(g => gateNumbers.includes(g))) return { name: 'Sacraal' };
  if (CENTER_GATES.Spleen.some(g => gateNumbers.includes(g))) return { name: 'Milt' };
  if (CENTER_GATES.Heart.some(g => gateNumbers.includes(g))) return { name: 'Ego' };
  if (CENTER_GATES.GCenter.some(g => gateNumbers.includes(g))) return { name: 'G-centrum' };

  // Simple fallback
  return { name: 'Geen innerlijke autoriteit' };
}

function determineProfile(planetPositions) {
  const sun = planetPositions.find(p => p.name === 'Sun');
  if (!sun) return null;

  const sunLine = sun.line;
  const earthLine = 7 - sunLine; // simplified opposite
  return { number: `${sunLine}/${earthLine}` };
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

/* -----------------------------
   Main exported function
----------------------------- */

async function calculateHumanDesign({ birthDate, birthTime, birthLocation }) {
  try {
    // Expect birthDate: YYYY-MM-DD, birthTime: HH:MM
    const [year, month, day] = birthDate.split('-').map(Number);
    const [hour, minute] = birthTime.split(':').map(Number);

    if (!year || !month || !day) throw new Error('birthDate must be YYYY-MM-DD');
    if (hour === undefined || minute === undefined) throw new Error('birthTime must be HH:MM');

    // IMPORTANT:
    // This implementation treats the provided time as UTC to avoid timezone dependencies.
    // It is stable and will not crash.
    const jd = await sweJulday(year, month, day, hour + minute / 60);

    const planets = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Rahu', 'Ketu'];

    const planetPositions = (await Promise.all(planets.map(p => calculatePlanetPosition(jd, p)))).filter(Boolean);

    const gates = planetPositions.map(p => ({
      number: p.gate,
      name: p.gateInfo.name,
      line: p.line,
      planet: p.name,
      sign: p.sign,
    }));

    const type = determineType(gates);
    const strategy = determineStrategy(type.name);
    const authority = determineAuthority(planetPositions);
    const profile = determineProfile(planetPositions);
    const definedCenters = getDefinedCenters(gates);

    return {
      birthDate,
      birthTime,
      birthLocation,
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
};
