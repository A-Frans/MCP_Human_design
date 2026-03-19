const tzlookup = require("tz-lookup");
const { DateTime } = require("luxon");
const NodeGeocoder = require("node-geocoder");

const geocoder = NodeGeocoder({
  provider: "openstreetmap",
});

async function getLocationInfo(cityName) {
  const results = await geocoder.geocode(cityName);

  if (!results || results.length === 0) {
    throw new Error(`Plaats niet gevonden: ${cityName}`);
  }

  const best = results[0];
  const latitude = best.latitude;
  const longitude = best.longitude;
  const timezone = tzlookup(latitude, longitude);

  return {
    city: best.city || cityName,
    tz: timezone,
    lat: latitude,
    lon: longitude,
  };
}

async function getUTCOffset(cityName, birthDate, birthTime = "12:00") {
  const locationInfo = await getLocationInfo(cityName);

  const dt = DateTime.fromISO(`${birthDate}T${birthTime}`, {
    zone: locationInfo.tz,
  });

  if (!dt.isValid) {
    throw new Error(`Ongeldige datum/tijd: ${birthDate} ${birthTime}`);
  }

  return dt.offset / 60;
}

async function localTimeToUTC(localTime, utcOffset) {
  const [hour, minute] = localTime.split(":").map(Number);
  let utcHour = hour - utcOffset;

  if (utcHour < 0) utcHour += 24;
  if (utcHour >= 24) utcHour -= 24;

  return {
    hour: utcHour,
    minute,
    offset: utcOffset,
  };
}

async function convertToUTC(birthDate, birthTime, cityName) {
  const locationInfo = await getLocationInfo(cityName);

  const localDateTime = DateTime.fromISO(`${birthDate}T${birthTime}`, {
    zone: locationInfo.tz,
  });

  if (!localDateTime.isValid) {
    throw new Error(`Ongeldige datum/tijd: ${birthDate} ${birthTime}`);
  }

  const utc = localDateTime.toUTC();

  return {
    utcYear: utc.year,
    utcMonth: utc.month,
    utcDay: utc.day,
    utcHour: utc.hour,
    utcMinute: utc.minute,
    offset: localDateTime.offset / 60,
    originalLocalTime: birthTime,
    timezone: locationInfo.tz,
    latitude: locationInfo.lat,
    longitude: locationInfo.lon,
  };
}

module.exports = {
  getLocationInfo,
  getUTCOffset,
  localTimeToUTC,
  convertToUTC,
};
