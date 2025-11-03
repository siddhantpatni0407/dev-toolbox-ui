// Location-related type definitions

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface LocationInfo {
  coordinates: Coordinates;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  formattedAddress: string;
  timezone?: string;
  accuracy?: number;
}

export interface LocationError {
  code: string;
  message: string;
  details?: string;
}

export interface LocationResponse {
  success: boolean;
  data?: LocationInfo;
  error?: LocationError;
}

export interface GeocodingAPIResponse {
  results: Array<{
    formatted_address: string;
    address_components: Array<{
      long_name: string;
      short_name: string;
      types: string[];
    }>;
    geometry: {
      location: {
        lat: number;
        lng: number;
      };
    };
    place_id: string;
    types: string[];
  }>;
  status: string;
}

// Alternative free API response format (OpenStreetMap Nominatim)
export interface NominatimResponse {
  display_name: string;
  address: {
    house_number?: string;
    road?: string;
    city?: string;
    state?: string;
    country?: string;
    postcode?: string;
    [key: string]: string | undefined;
  };
  lat: string;
  lon: string;
  place_id: number;
  licence: string;
  osm_type: string;
  osm_id: number;
}

export interface LocationValidation {
  isValid: boolean;
  errors: string[];
}

export const COORDINATE_BOUNDS = {
  LATITUDE: { MIN: -90, MAX: 90 },
  LONGITUDE: { MIN: -180, MAX: 180 }
} as const;

export const LOCATION_ERROR_CODES = {
  INVALID_COORDINATES: 'INVALID_COORDINATES',
  API_ERROR: 'API_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  RATE_LIMIT: 'RATE_LIMIT'
} as const;