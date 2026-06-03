import Constants from 'expo-constants';
import { Platform } from 'react-native';

const apiKey =
  Constants.expoConfig?.extra?.googlePlacesApiKey ||
  process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY ||
  "";

const getAddressComponent = (
  components: Array<{ long_name: string; types: string[] }>,
  type: string,
) => {
  const match = components.find((component) =>
    component.types.includes(type),
  );
  return match?.long_name || "";
};

export const isGooglePlacesEnabled = (): boolean => !!apiKey;

export const placeAutocomplete = async (query: string) => {
  if (!apiKey) {
    throw new Error("Google Places API key is not configured.");
  }

  const url = new URL(
    "https://maps.googleapis.com/maps/api/place/autocomplete/json",
  );
  url.searchParams.set("input", query);
  url.searchParams.set("key", apiKey);
  url.searchParams.set("types", "address");
  url.searchParams.set("components", "country:in");

  const response = await fetch(url.toString());
  const data = await response.json();

  if (data.status !== "OK") {
    throw new Error(data.error_message || data.status || "Autocomplete failed");
  }

  return data.predictions;
};

export const getPlaceDetails = async (placeId: string) => {
  if (!apiKey) {
    throw new Error("Google Places API key is not configured.");
  }

  const url = new URL(
    "https://maps.googleapis.com/maps/api/place/details/json",
  );
  url.searchParams.set("place_id", placeId);
  url.searchParams.set("key", apiKey);
  url.searchParams.set(
    "fields",
    "address_component,formatted_address,geometry",
  );

  const response = await fetch(url.toString());
  const data = await response.json();

  if (data.status !== "OK") {
    throw new Error(data.error_message || data.status || "Place details failed");
  }

  const components = data.result.address_components || [];
  const streetNumber = getAddressComponent(components, "street_number");
  const route = getAddressComponent(components, "route");
  const locality =
    getAddressComponent(components, "sublocality_level_1") ||
    getAddressComponent(components, "sublocality") ||
    getAddressComponent(components, "neighborhood") ||
    getAddressComponent(components, "route") ||
    "";
  const city =
    getAddressComponent(components, "locality") ||
    getAddressComponent(components, "administrative_area_level_2") ||
    getAddressComponent(components, "administrative_area_level_1") ||
    "";
  const postalCode = getAddressComponent(components, "postal_code") || "";

  return {
    formattedAddress: data.result.formatted_address || "",
    locality: locality || `${streetNumber} ${route}`.trim(),
    city,
    pincode: postalCode,
  };
};
