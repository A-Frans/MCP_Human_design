/**
 * Timezone database focused on NL / BE / EU use case
 * Safer than the previous version:
 * - no silent fallback to Moscow
 * - better city normalization
 * - better DST rules for Europe
 */

const TIMEZONE_DB = {
  "Europe/Amsterdam": {
    offset: 1,
    lat: 52.3676,
    lon: 4.9041,
    cities: [
      "amsterdam",
      "nederland",
      "netherlands",
      "holland",
      "the netherlands",
      "almelo",
      "lelystad",
      "harderwijk",
      "utrecht",
      "rotterdam",
      "den haag",
      "the hague",
      "eindhoven",
      "groningen",
      "zwolle",
      "apeldoorn",
      "amersfoort",
      "arnhem",
      "nijmegen",
      "enschede",
      "haarlem",
      "zaanstad",
      "breda",
      "tilburg",
      "maastricht",
      "leeuwarden",
      "middelburg",
      "delft",
      "hilversum",
      "hoorn",
      "purmerend",
      "deventer",
      "venlo",
      "heerlen",
      "assen",
      "almere"
    ]
  },

  "Europe/Brussels": {
    offset: 1,
    lat: 50.8503,
    lon: 4.3517,
    cities: [
      "brussels",
      "brussel",
      "belgium",
      "belgie",
      "belgië",
      "antwerp",
      "antwerpen",
      "ghent",
      "gent",
      "bruges",
      "brugge",
      "leuven",
      "liège",
      "liege",
      "namur",
      "charleroi",
      "mechelen",
      "hasselt",
      "aalst",
      "kortrijk"
    ]
  },

  "Europe/Berlin": {
    offset: 1,
    lat: 52.52,
    lon: 13.405,
    cities: [
      "berlin",
      "germany",
      "deutschland",
      "duitsland",
      "hamburg",
      "munich",
      "münchen",
      "cologne",
      "köln",
      "frankfurt",
      "stuttgart",
      "dusseldorf",
      "düsseldorf"
    ]
  },

  "Europe/Paris": {
    offset: 1,
    lat: 48.8566,
    lon: 2.3522,
    cities: [
      "paris",
      "france",
      "frankrijk",
      "lyon",
      "marseille",
      "toulouse",
      "nice",
      "lille"
    ]
  },

  "Europe/London": {
    offset: 0,
    lat: 51.5074,
    lon: -0.1278,
    cities: [
      "london",
      "united kingdom",
      "uk",
      "england",
      "great britain",
      "britain",
      "manchester",
      "birmingham",
      "liverpool",
      "bristol",
      "leeds",
      "glasgow",
      "edinburgh"
    ]
  },

  "Europe/Madrid": {
    offset: 1,
    lat: 40.4168,
    lon: -3.7038,
    cities: [
      "madrid",
      "spain",
      "spanje",
      "barcelona",
      "valencia",
      "sevilla",
      "malaga",
      "alicante"
    ]
  },

  "Europe/Rome": {
    offset: 1,
    lat: 41.9028,
    lon: 12.4964,
    cities: [
      "rome",
      "roma",
      "italy",
      "italie",
      "milan",
      "milano",
      "naples",
      "napoli",
      "turin",
      "torino"
    ]
  },

  "Europe/Warsaw": {
    offset: 1,
    lat: 52.2297,
    lon: 21.0122,
    cities: [
      "warsaw",
      "warszawa",
      "poland",
      "polen",
      "krakow",
      "kraków",
      "gdansk",
      "wroclaw",
      "wrocław",
      "poznan",
      "poznań"
    ]
  },

  "America/New_York": {
    offset: -5,
    lat: 40.7128,
    lon: -74.006,
    cities: [
      "new york",
      "usa",
      "united states",
      "new jersey",
      "philadelphia",
      "boston",
      "washington"
    ]
  },

  "America/Los_Angeles": {
    offset: -8,
    lat: 34.0522,
    lon: -118.2437,
    cities: [
      "los angeles",
      "california",
      "san francisco",
      "san diego",
      "las vegas"
    ]
  },

  "Asia/Tokyo": {
    offset: 9,
    lat: 35.6762,
    lon: 139.6503,
    cities: ["tokyo", "japan", "osaka", "kyoto"]
  },

  "Australia/Sydney": {
    offset: 10,
    lat: -33.8688,
    lon: 151.2093,
    cities: ["sydney", "australia", "melbourne", "brisbane"]
  }
};

/**
 * Normalize user input:
 * - lowercase
 * - trim
 * - remove accents
 * - replace punctuation with spaces
 * - collapse spaces
 */
function normalizeString(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[()]/g, " ")
    .replace(/[,;/]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Split input into searchable tokens
 * Example:
 * "Harderwijk (Gelderland), Netherlands"
 * => ["harderwijk", "gelderland", "netherlands"]
 */
function extractTokens(value) {
  const normalized = normalizeString(value);
  if (!normalized) return [];
  return [...new Set(normalized.split(" ").filter(Boolean))];
}

/**
 * Try to find timezone by exact city/country match first,
 * then by token overlap.
 */
function findTimezoneByCity(cityName) {
  const normalized = normalizeString(cityName);
  const tokens = extractTokens(cityName);

  if (!normalized) {
    throw new Error("No city name provided");
  }

  let bestMatch = null;
  let bestScore = 0;

  for (const [timezone, data] of Object.entries(TIMEZONE_DB)) {
    const normalizedCities = data.cities.map(normalizeString);

    // 1. Exact full match
    if (normalizedCities.includes(normalized)) {
      return {
        timezone,
        offset: data.offset,
        latitude: data.lat,
        longitude: data.lon,
        city: normalized
      };
    }

    // 2. Exact token match
    for (const token of tokens) {
      if (normalizedCities.includes(token)) {
        return {
          timezone,
          offset: data.offset,
          latitude: data.lat,
          longitude: data.lon,
          city: token
        };
      }
    }

    // 3. Score partial overlap
    let score = 0;
    for (const known of normalizedCities) {
      if (normalized.includes(known)) score += known.length;
      for (const token of tokens) {
        if (known === token) score += 100;
        else if (known.includes(token) || token.includes(known)) score += 5;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestMatch = {
        timezone,
        offset: data.offset,
        latitude: data.lat,
        longitude: data.lon,
        city: normalized
      };
    }
  }

  // Require a meaningful match score
  if (bestMatch && bestScore >= 5) {
    return bestMatch;
  }

  throw new Error(`Timezone not found for city: ${cityName}`);
}

/**
 * Get last Sunday of a month
 * month = 1..12
 */
function getLastSunday(year, month) {
  const lastDay = new Date(Date.UTC(year, month, 0)); // last day of month
  const dayOfWeek = lastDay.getUTCDay(); // 0 = Sunday
  const date = lastDay.getUTCDate() - dayOfWeek;
  return date;
}

/**
 * DST for Europe:
 * starts last Sunday of March
 * ends last Sunday of October
 *
 * This is still simplified historically, but much better than
 * "month >= 3 && month <= 10".
 */
function isEuropeDST(birthDate) {
  const [year, month, day] = birthDate.split("-").map(Number);

  if (month < 3 || month > 10) return false;
  if (month > 3 && month < 10) return true;

  const marchLastSunday = getLastSunday(year, 3);
  const octoberLastSunday = getLastSunday(year, 10);

  if (month === 3) return day >= marchLastSunday;
  if (month === 10) return day < octoberLastSunday;

  return false;
}

/**
 * DST for UK follows same Europe rule
 */
function isUKDST(birthDate) {
  return isEuropeDST(birthDate);
}

/**
 * DST for US (modern simplified rule).
 * Still approximate for historical dates.
 */
function isUSDST(birthDate) {
  const [year, month, day] = birthDate.split("-").map(Number);

  // Simplified current-ish rule
  if (month < 3 || month > 11) return false;
  if (month > 3 && month < 11) return true;

  if (month === 3) return day >= 8;
  if (month === 11) return day < 8;

  return false;
}

/**
 * Determine whether DST applies
 */
function isDST(birthDate, timezone) {
  if (!birthDate || !timezone) return false;

  if (
    timezone === "Europe/Amsterdam" ||
    timezone === "Europe/Brussels" ||
    timezone === "Europe/Berlin" ||
    timezone === "Europe/Paris" ||
    timezone === "Europe/Madrid" ||
    timezone === "Europe/Rome" ||
    timezone === "Europe/Warsaw"
  ) {
    return isEuropeDST(birthDate);
  }

  if (timezone === "Europe/London") {
    return isUKDST(birthDate);
  }

  if (
    timezone === "America/New_York" ||
    timezone === "America/Los_Angeles"
  ) {
    return isUSDST(birthDate);
  }

  return false;
}

/**
 * Get UTC offset including DST
 */
function getUTCOffsetWithDST(birthDate, timezone) {
  const baseInfo = TIMEZONE_DB[timezone];
  if (!baseInfo) {
    throw new Error(`Unknown timezone: ${timezone}`);
  }

  const dstActive = isDST(birthDate, timezone);

  return {
    offset: baseInfo.offset + (dstActive ? 1 : 0),
    dst: dstActive,
    timezone
  };
}

/**
 * Convert local date/time to UTC
 */
function convertLocalToUTC(birthDate, birthTime, cityName) {
  const locationInfo = findTimezoneByCity(cityName);
  const offsetData = getUTCOffsetWithDST(birthDate, locationInfo.timezone);

  const [year, month, day] = birthDate.split("-").map(Number);
  const [hour, minute] = birthTime.split(":").map(Number);

  let utcYear = year;
  let utcMonth = month;
  let utcDay = day;
  let utcHour = hour - offsetData.offset;
  const utcMinute = minute;

  if (utcHour < 0) {
    utcHour += 24;
    utcDay -= 1;

    if (utcDay < 1) {
      utcMonth -= 1;
      if (utcMonth < 1) {
        utcMonth = 12;
        utcYear -= 1;
      }
      utcDay = new Date(Date.UTC(utcYear, utcMonth, 0)).getUTCDate();
    }
  } else if (utcHour >= 24) {
    utcHour -= 24;
    utcDay += 1;

    const daysInMonth = new Date(Date.UTC(utcYear, utcMonth, 0)).getUTCDate();
    if (utcDay > daysInMonth) {
      utcDay = 1;
      utcMonth += 1;
      if (utcMonth > 12) {
        utcMonth = 1;
        utcYear += 1;
      }
    }
  }

  return {
    utcYear,
    utcMonth,
    utcDay,
    utcHour,
    utcMinute,
    originalLocalTime: birthTime,
    localTimezone: locationInfo.timezone,
    localOffset: offsetData.offset,
    dst: offsetData.dst,
    latitude: locationInfo.latitude,
    longitude: locationInfo.longitude
  };
}

module.exports = {
  TIMEZONE_DB,
  normalizeString,
  extractTokens,
  findTimezoneByCity,
  isDST,
  getUTCOffsetWithDST,
  convertLocalToUTC
};
