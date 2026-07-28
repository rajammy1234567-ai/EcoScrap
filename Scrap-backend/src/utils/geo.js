/** Earth radius in km */
const EARTH_RADIUS_KM = 6371;

/** Default match radius for nearby scrapers / jobs */
const NEARBY_RADIUS_KM = 10;

/**
 * Haversine distance between two lat/lng points in kilometres.
 * Returns Infinity if any coordinate is missing/invalid.
 */
function haversineKm(lat1, lon1, lat2, lon2) {
  const a1 = Number(lat1);
  const o1 = Number(lon1);
  const a2 = Number(lat2);
  const o2 = Number(lon2);
  if (![a1, o1, a2, o2].every((n) => Number.isFinite(n))) {
    return Infinity;
  }

  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(a2 - a1);
  const dLon = toRad(o2 - o1);
  const sinLat = Math.sin(dLat / 2);
  const sinLon = Math.sin(dLon / 2);
  const h =
    sinLat * sinLat +
    Math.cos(toRad(a1)) * Math.cos(toRad(a2)) * sinLon * sinLon;
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function isValidCoords(lat, lng) {
  const a = Number(lat);
  const o = Number(lng);
  return (
    Number.isFinite(a) &&
    Number.isFinite(o) &&
    a >= -90 &&
    a <= 90 &&
    o >= -180 &&
    o <= 180
  );
}

/**
 * @returns {boolean} true if point is within radiusKm of center
 */
function isWithinKm(centerLat, centerLng, pointLat, pointLng, radiusKm = NEARBY_RADIUS_KM) {
  return haversineKm(centerLat, centerLng, pointLat, pointLng) <= radiusKm;
}

module.exports = {
  EARTH_RADIUS_KM,
  NEARBY_RADIUS_KM,
  haversineKm,
  isValidCoords,
  isWithinKm,
};
