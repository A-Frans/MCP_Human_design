/**
 * Human Design calculations (CommonJS)
 * Swiss Ephemeris + Rave Mandala mapping
 */

const swe = require("swisseph");
const {
  getLocationInfo,
  getUTCOffset,
  convertToUTC,
} = require("./timezone-utils.cjs");

/* ---------------------------
   Constants
--------------------------- */

const GATE_SIZE = 360 / 64;      // 5.625
const LINE_SIZE = GATE_SIZE / 6; // 0.9375

// Standard start used in most HD implementations:
// Gate 41.1 starts at 0° Aquarius = 300° tropical longitude
const RAVE_START_LONGITUDE = 300;

// Standard Rave Mandala sequence
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

const CENTER_ORDER = [
  "Head",
  "Ajna",
  "Throat",
  "G",
  "Ego",
  "SolarPlexus",
  "Sacral",
  "Spleen",
  "Root",
];

// Full channel map
const CHANNELS = [
  ["64", "47", "Head", "Ajna"],
  ["61", "24", "Head", "Ajna"],
  ["63", "4", "Head", "Ajna"],

  ["17", "62", "Ajna", "Throat"],
  ["43", "23", "Ajna", "Throat"],
  ["11", "56", "Ajna", "Throat"],

  ["31", "7", "Throat", "G"],
  ["33", "13", "Throat", "G"],
  ["8", "1", "Throat", "G"],
  ["20", "10", "Throat", "G"],

  ["45", "21", "Throat", "Ego"],
  ["12", "22", "Throat", "SolarPlexus"],
  ["35", "36", "Throat", "SolarPlexus"],
  ["16", "48", "Throat", "Spleen"],
  ["20", "57", "Throat", "Spleen"],
  ["20", "34", "Throat", "Sacral"],

  ["25", "51", "G", "Ego"],
  ["10", "57", "G", "Spleen"],
  ["15", "5", "G", "Sacral"],
  ["2", "14", "G", "Sacral"],
  ["46", "29", "G", "Sacral"],
  ["10", "34", "G", "Sacral"],

  ["37", "40", "SolarPlexus", "Ego"],
  ["6", "59", "SolarPlexus", "Sacral"],
  ["39", "55", "Root", "SolarPlexus"],
  ["41", "30", "Root", "SolarPlexus"],
  ["19", "49", "Root", "SolarPlexus"],

  ["27", "50", "Sacral", "Spleen"],
  ["34", "57", "Sacral", "Spleen"],

  ["38", "28", "Root", "Spleen"],
  ["58", "18", "Root", "Spleen"],
  ["54", "32", "Root", "Spleen"],
  ["44", "26", "Spleen", "Ego"],

  ["53", "42", "Root", "Sacral"],
  ["52", "9", "Root", "Sacral"],
  ["60", "3", "Root", "Sacral"],
];

const PLANETS = [
  { label: "Sun", id: swe.SE_SUN },
  { label: "Moon", id: swe.SE_MOON },
  { label: "Mercury", id: swe.SE_MERCURY },
  { label: "Venus", id: swe.SE_VENUS },
  { label: "Mars", id: swe.SE_MARS },
  { label: "Jupiter", id: swe.SE_JUPITER },
  { label: "Saturn", id: swe.SE_SATURN },
  { label: "North Node", id: swe.SE_TRUE_NODE || swe.SE_MEAN_NODE },
];

// Useful flags
const IFLAGS =
  (typeof swe.SEFLG_SWIEPH === "number" ? swe.SEFLG_SWIEPH : 2) |
  (typeof swe.SEFLG_SPEED === "number" ? swe.SEFLG_SPEED : 256);

/* ---------------------------
   Helpers
--------------------------- */

function norm360(value) {
  let v = value % 360;
  if (v < 0) v += 360;
  return v;
}

function signedAngleDiff(a, b) {
  const d = norm360(a - b);
  return d > 180 ? d - 360 : d;
}

function channelKey(a, b) {
  const x = Number(a);
  const y = Number(b);
  return x < y ? `${x}-${y}` : `${y}-${x}`;
}

function longitudeToGateLine(longitude) {
  const lon = norm360(longitude);
  const relative = norm360(lon - RAVE_START_LONGITUDE);

  const gateIndex = Math.floor(relative / GATE_SIZE);
  const withinGate = relative - gateIndex * GATE_SIZE;
  const line = Math.min(6, Math.max(1, Math.floor(withinGate / LINE_SIZE) + 1));

  const gate = RAVE_GATE_SEQUENCE[Math.max(0, Math.min(63, gateIndex))];

  return { gate, line };
}

/* ---------------------------
   Swiss Ephemeris wrappers
--------------------------- */

function sweJulday(year, month, day, hourDecimal) {
  if (typeof swe.swe_julday !== "function") {
    throw new Error("Swiss Ephemeris: swe_julday not available");
  }
  return swe.swe_julday(year, month, day, hourDecimal, swe.SE_GREG_CAL || 1);
}

function sweCalcUt(jd, planetId) {
  return new Promise((resolve, reject) => {
    if (typeof swe.swe_calc_ut !== "function") {
      return reject(new Error("Swiss Ephemeris: swe_calc_ut not available"));
    }

    try {
      swe.swe_calc_ut(jd, planetId, IFLAGS, (res) => {
        if (!res) return reject(new Error("Empty response from swe_calc_ut"));
        if (res.error) return reject(new Error(res.error));

        if (typeof res.longitude === "number") {
          return resolve(norm360(res.longitude));
        }

        if (Array.isArray(res.data) && typeof res.data[0] === "number") {
          return resolve(norm360(res.data[0]));
        }

        if (Array.isArray(res.xx) && typeof res.xx[0] === "number") {
          return resolve(norm360(res.xx[0]));
        }

        return reject(
          new Error(`Unexpected swe_calc_ut response: ${JSON.stringify(res).slice(0, 300)}`)
        );
      });
    } catch (err) {
      reject(err);
    }
  });
}

/* ---------------------------
   Planet positions
--------------------------- */

async function calculatePlanetPositions(jd, source) {
  const positions = [];
  let northNodeLon = null;

  for (const planet of PLANETS) {
    const lon = await sweCalcUt(jd, planet.id);
    const { gate, line } = longitudeToGateLine(lon);

    positions.push({
      planet: planet.label,
      source,
      longitude: lon,
      gate,
      line,
    });

    if (planet.label === "North Node") {
      northNodeLon = lon;
    }
  }

  if (northNodeLon !== null) {
    const southLon = norm360(northNodeLon + 180);
    const southMap = longitudeToGateLine(southLon);

    positions.push({
      planet: "South Node",
      source,
      longitude: southLon,
      gate: southMap.gate,
      line: southMap.line,
    });
  }

  return positions;
}

function earthFromSunLongitude(sunLon) {
  return norm360(sunLon + 180);
}

/* ---------------------------
   Design date search
--------------------------- */

async function findDesignJd(personalityJd, personalitySunLon) {
  const targetSun = norm360(personalitySunLon - 88);

  let guess = personalityJd - 88;

  for (let i = 0; i < 15; i++) {
    const sunLon = await sweCalcUt(guess, swe.SE_SUN);
    const diff = signedAngleDiff(sunLon, targetSun);

    if (Math.abs(diff) < 0.0005) break;

    // Sun moves approx 0.9856 deg/day
    guess -= diff / 0.9856;
  }

  return guess;
}

/* ---------------------------
   Gates, channels, centers
--------------------------- */

function collectActiveGates(personalityPositions, designPositions, personalityEarth, designEarth) {
  const all = [
    ...personalityPositions,
    ...designPositions,
    personalityEarth,
    designEarth,
  ];

  const active = new Map();

  for (const item of all) {
    if (!active.has(item.gate)) active.set(item.gate, []);
    active.get(item.gate).push({
      planet: item.planet,
      line: item.line,
      source: item.source,
    });
  }

  return active;
}

function getDefinition(activeGates) {
  const definedChannels = [];
  const definedCenters = new Set();

  for (const [g1, g2, c1, c2] of CHANNELS) {
    const a = Number(g1);
    const b = Number(g2);

    if (activeGates.has(a) && activeGates.has(b)) {
      definedChannels.push({
        gates: channelKey(a, b),
        centers: [c1, c2],
      });
      definedCenters.add(c1);
      definedCenters.add(c2);
    }
  }

  return { definedChannels, definedCenters };
}

function buildCenterGraph(definedChannels) {
  const graph = new Map();

  for (const center of CENTER_ORDER) {
    graph.set(center, new Set());
  }

  for (const ch of definedChannels) {
    const [a, b] = ch.centers;
    graph.get(a).add(b);
    graph.get(b).add(a);
  }

  return graph;
}

function isConnected(graph, start, targets) {
  if (!graph.has(start)) return false;

  const queue = [start];
  const seen = new Set([start]);

  while (queue.length) {
    const current = queue.shift();
    if (targets.has(current)) return true;

    for (const next of graph.get(current) || []) {
      if (!seen.has(next)) {
        seen.add(next);
        queue.push(next);
      }
    }
  }

  return false;
}

function determineType(definedCenters, definedChannels) {
  if (definedCenters.size === 0) {
    return {
      name: "Reflector",
      strategy: "Wacht een maancyclus",
      notSelfTheme: "Teleurstelling",
    };
  }

  const hasSacral = definedCenters.has("Sacral");
  const graph = buildCenterGraph(definedChannels);

  const throatConnectedToMotor = isConnected(
    graph,
    "Throat",
    new Set(["Ego", "SolarPlexus", "Sacral", "Root"])
  );

  if (hasSacral && throatConnectedToMotor) {
    return {
      name: "Manifesting Generator",
      strategy: "Reageren",
      notSelfTheme: "Frustratie",
    };
  }

  if (hasSacral) {
    return {
      name: "Generator",
      strategy: "Reageren",
      notSelfTheme: "Frustratie",
    };
  }

  if (!hasSacral && throatConnectedToMotor) {
    return {
      name: "Manifestor",
      strategy: "Informeren",
      notSelfTheme: "Woede",
    };
  }

  return {
    name: "Projector",
    strategy: "Wacht op de uitnodiging",
    notSelfTheme: "Verbittering",
  };
}

function determineAuthority(typeName, definedCenters) {
  if (typeName === "Reflector") {
    return "Lunar";
  }
  if (definedCenters.has("SolarPlexus")) {
    return "Emotional - Solar Plexus";
  }
  if (definedCenters.has("Sacral")) {
    return "Sacral";
  }
  if (definedCenters.has("Spleen")) {
    return "Splenic";
  }
  if (definedCenters.has("Ego")) {
    return "Ego";
  }
  if (definedCenters.has("G")) {
    return "Self-Projected";
  }
  return "No Inner Authority";
}

function determineDefinitionName(definedCenters, definedChannels) {
  if (definedCenters.size === 0) return "No Definition";

  const graph = buildCenterGraph(definedChannels);
  const unvisited = new Set([...definedCenters]);
  let components = 0;

  while (unvisited.size) {
    const start = [...unvisited][0];
    components += 1;

    const queue = [start];
    unvisited.delete(start);

    while (queue.length) {
      const current = queue.shift();
      for (const next of graph.get(current) || []) {
        if (unvisited.has(next)) {
          unvisited.delete(next);
          queue.push(next);
        }
      }
    }
  }

  if (components === 1) return "Single Definition";
  if (components === 2) return "Split Definition";
  if (components === 3) return "Triple Split Definition";
  return "Quadruple Split Definition";
}

function determineProfile(personalitySun, designSun) {
  return `${personalitySun.line}/${designSun.line}`;
}

function determineIncarnationCross(personalitySun, personalityEarth, designSun, designEarth) {
  return `(${personalitySun.gate}/${personalityEarth.gate} | ${designSun.gate}/${designEarth.gate})`;
}

/* ---------------------------
   Public API
--------------------------- */

async function calculateHumanDesign({
  birthDate,
  birthTime,
  birthLocation,
}) {
  try {
    const utcData = convertToUTC(birthDate, birthTime, birthLocation);
    const locationInfo = getLocationInfo(birthLocation);
    const utcOffset = getUTCOffset(birthLocation, birthDate);

    const personalityJd = sweJulday(
      Number(utcData.utcYear),
      Number(utcData.utcMonth),
      Number(utcData.utcDay),
      Number(utcData.utcHour) + Number(utcData.utcMinute) / 60
    );

    const personalityPositions = await calculatePlanetPositions(personalityJd, "personality");

    const personalitySun = personalityPositions.find((p) => p.planet === "Sun");
    if (!personalitySun) throw new Error("Personality Sun not found");

    const personalityEarthLon = earthFromSunLongitude(personalitySun.longitude);
    const personalityEarthMap = longitudeToGateLine(personalityEarthLon);
    const personalityEarth = {
      planet: "Earth",
      source: "personality",
      longitude: personalityEarthLon,
      gate: personalityEarthMap.gate,
      line: personalityEarthMap.line,
    };

    const designJd = await findDesignJd(personalityJd, personalitySun.longitude);
    const designPositions = await calculatePlanetPositions(designJd, "design");

    const designSun = designPositions.find((p) => p.planet === "Sun");
    if (!designSun) throw new Error("Design Sun not found");

    const designEarthLon = earthFromSunLongitude(designSun.longitude);
    const designEarthMap = longitudeToGateLine(designEarthLon);
    const designEarth = {
      planet: "Earth",
      source: "design",
      longitude: designEarthLon,
      gate: designEarthMap.gate,
      line: designEarthMap.line,
    };

    const activeGates = collectActiveGates(
      personalityPositions,
      designPositions,
      personalityEarth,
      designEarth
    );

    const { definedChannels, definedCenters } = getDefinition(activeGates);

    const typeInfo = determineType(definedCenters, definedChannels);
    const authority = determineAuthority(typeInfo.name, definedCenters);
    const definition = determineDefinitionName(definedCenters, definedChannels);
    const profile = determineProfile(personalitySun, designSun);
    const incarnationCross = determineIncarnationCross(
      personalitySun,
      personalityEarth,
      designSun,
      designEarth
    );

    const gates = [];
    for (const [gateNumber, activations] of activeGates.entries()) {
      for (const act of activations) {
        gates.push({
          gate: Number(gateNumber),
          number: Number(gateNumber),
          line: act.line,
          planet: act.planet,
          source: act.source,
        });
      }
    }

    return {
      birthDate,
      birthTime,
      birthLocation,
      latitude: locationInfo?.lat ?? null,
      longitude: locationInfo?.lon ?? null,
      timezone: locationInfo?.tz ?? null,
      utcOffset,

      type: {
        name: typeInfo.name,
        description: typeInfo.name,
      },
      strategy: typeInfo.strategy,
      authority: {
        name: authority,
        description: authority,
      },
      profile: {
        number: profile,
        description: profile,
      },
      incarnationCross: {
        cross: incarnationCross,
        value: incarnationCross,
      },
      definition: {
        name: definition,
        description: definition,
      },

      definedCenters: CENTER_ORDER
        .filter((center) => definedCenters.has(center))
        .map((name) => ({ name, defined: true })),

      definedChannels,
      gates,

      personality: {
        jd: personalityJd,
        sun: personalitySun,
        earth: personalityEarth,
        planets: personalityPositions,
      },

      design: {
        jd: designJd,
        sun: designSun,
        earth: designEarth,
        planets: designPositions,
      },

      calculationSource: "Swiss Ephemeris + Rave Mandala",
      version: "2.0.0",
    };
  } catch (error) {
    console.error("Error calculating Human Design:", error);
    throw new Error(`Failed to calculate Human Design: ${error.message}`);
  }
}

module.exports = {
  calculateHumanDesign,
  CHANNELS,
};
