import { Platform } from 'react-native';
import * as Location from 'expo-location';
import { api } from './api';

export const NEARBY_RADIUS_KM = 10;

export type Coords = {
  latitude: number;
  longitude: number;
};

export const locationService = {
  checkService: (pincode: string) =>
    api.post('/api/v1/location/check-service', { pincode }),

  notifyMe: (pincode: string, phone?: string) =>
    api.post('/api/v1/location/notify-me', { pincode, phone }),

  /** Push live GPS to backend (user + scrapper) */
  updateLocation: (latitude: number, longitude: number) =>
    api.put('/api/v1/location/update', { latitude, longitude }),

  getMyLocation: () => api.get('/api/v1/location/me'),
};

/** Request foreground location permission. Returns true if granted. */
export async function requestLocationPermission(): Promise<boolean> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  } catch {
    return false;
  }
}

/** Current device coords, or null if denied / unavailable. */
export async function getCurrentCoords(): Promise<Coords | null> {
  try {
    const { status } = await Location.getForegroundPermissionsAsync();
    let granted = status === 'granted';
    if (!granted) {
      const req = await Location.requestForegroundPermissionsAsync();
      granted = req.status === 'granted';
    }
    if (!granted) return null;

    const pos = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    return {
      latitude: pos.coords.latitude,
      longitude: pos.coords.longitude,
    };
  } catch {
    return null;
  }
}

/**
 * Get device GPS and POST to backend.
 * Call on app focus / login for users and scrapers.
 */
export async function syncLocationToServer(): Promise<Coords | null> {
  const coords = await getCurrentCoords();
  if (!coords) return null;
  try {
    await locationService.updateLocation(coords.latitude, coords.longitude);
  } catch {
    // ignore network errors
  }
  return coords;
}

/** Reverse-geocode helper used by add-address (web uses Nominatim). */
export async function reverseGeocode(coords: Coords): Promise<{
  locality: string;
  city: string;
  pincode: string;
}> {
  if (Platform.OS === 'web') {
    const resp = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${coords.latitude}&lon=${coords.longitude}`,
    );
    const data = await resp.json();
    const address = data.address || {};
    const road = address.road || address.pedestrian || address.cycleway || '';
    const suburb = address.suburb || address.village || address.hamlet || '';
    return {
      locality: [road, suburb].filter(Boolean).join(', '),
      city:
        address.city || address.town || address.village || address.county || '',
      pincode: address.postcode || '',
    };
  }

  const [address] = await Location.reverseGeocodeAsync(coords);
  return {
    locality: address?.street || address?.subregion || address?.district || '',
    city: address?.city || address?.region || '',
    pincode: address?.postalCode || '',
  };
}
