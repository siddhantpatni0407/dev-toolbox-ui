// Location utility functions for reverse geocoding

import { 
  Coordinates, 
  LocationInfo, 
  LocationResponse, 
  LocationValidation, 
  NominatimResponse,
  COORDINATE_BOUNDS,
  LOCATION_ERROR_CODES 
} from '../models/location';

/**
 * Validates latitude and longitude coordinates
 */
export const validateCoordinates = (latitude: number, longitude: number): LocationValidation => {
  const errors: string[] = [];

  if (isNaN(latitude) || isNaN(longitude)) {
    errors.push('Coordinates must be valid numbers');
  }

  if (latitude < COORDINATE_BOUNDS.LATITUDE.MIN || latitude > COORDINATE_BOUNDS.LATITUDE.MAX) {
    errors.push(`Latitude must be between ${COORDINATE_BOUNDS.LATITUDE.MIN} and ${COORDINATE_BOUNDS.LATITUDE.MAX}`);
  }

  if (longitude < COORDINATE_BOUNDS.LONGITUDE.MIN || longitude > COORDINATE_BOUNDS.LONGITUDE.MAX) {
    errors.push(`Longitude must be between ${COORDINATE_BOUNDS.LONGITUDE.MIN} and ${COORDINATE_BOUNDS.LONGITUDE.MAX}`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Parses coordinate input string and returns numeric values
 */
export const parseCoordinates = (latStr: string, lngStr: string): { lat: number; lng: number } | null => {
  try {
    const lat = parseFloat(latStr.trim());
    const lng = parseFloat(lngStr.trim());
    
    if (isNaN(lat) || isNaN(lng)) {
      return null;
    }
    
    return { lat, lng };
  } catch {
    return null;
  }
};

/**
 * Formats coordinates for display
 */
export const formatCoordinates = (coordinates: Coordinates): string => {
  const { latitude, longitude } = coordinates;
  const latDir = latitude >= 0 ? 'N' : 'S';
  const lngDir = longitude >= 0 ? 'E' : 'W';
  
  return `${Math.abs(latitude).toFixed(6)}°${latDir}, ${Math.abs(longitude).toFixed(6)}°${lngDir}`;
};

/**
 * Extracts address components from Nominatim response
 */
const parseNominatimResponse = (response: NominatimResponse): LocationInfo => {
  const { address, display_name, lat, lon } = response;
  
  return {
    coordinates: {
      latitude: parseFloat(lat),
      longitude: parseFloat(lon)
    },
    address: address.road || '',
    city: address.city || address.town || address.village || '',
    state: address.state || address.region || '',
    country: address.country || '',
    postalCode: address.postcode || '',
    formattedAddress: display_name,
    accuracy: 1 // Nominatim doesn't provide accuracy scores
  };
};

/**
 * Reverse geocoding using OpenStreetMap Nominatim API (free)
 */
export const reverseGeocode = async (coordinates: Coordinates): Promise<LocationResponse> => {
  try {
    // Validate coordinates first
    const validation = validateCoordinates(coordinates.latitude, coordinates.longitude);
    if (!validation.isValid) {
      return {
        success: false,
        error: {
          code: LOCATION_ERROR_CODES.INVALID_COORDINATES,
          message: 'Invalid coordinates',
          details: validation.errors.join(', ')
        }
      };
    }

    const { latitude, longitude } = coordinates;
    
    // Using OpenStreetMap Nominatim API (free, no API key required)
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'DevToolBox-UI/1.0.0' // Required by Nominatim
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data: NominatimResponse = await response.json();
    
    if (!data || !data.display_name) {
      return {
        success: false,
        error: {
          code: LOCATION_ERROR_CODES.NOT_FOUND,
          message: 'No location found for the provided coordinates'
        }
      };
    }

    const locationInfo = parseNominatimResponse(data);
    
    return {
      success: true,
      data: locationInfo
    };

  } catch (error: any) {
    console.error('Reverse geocoding error:', error);
    
    // Handle different types of errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return {
        success: false,
        error: {
          code: LOCATION_ERROR_CODES.NETWORK_ERROR,
          message: 'Network error occurred. Please check your internet connection.',
          details: error.message
        }
      };
    }

    return {
      success: false,
      error: {
        code: LOCATION_ERROR_CODES.API_ERROR,
        message: 'Failed to fetch location information',
        details: error.message
      }
    };
  }
};

/**
 * Get current user location using browser geolocation API
 */
export const getCurrentLocation = (): Promise<Coordinates> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },
      (error) => {
        let message = 'Failed to get current location';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = 'Location access denied by user';
            break;
          case error.POSITION_UNAVAILABLE:
            message = 'Location information unavailable';
            break;
          case error.TIMEOUT:
            message = 'Location request timed out';
            break;
        }
        reject(new Error(message));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  });
};

/**
 * Calculate distance between two coordinates using Haversine formula
 */
export const calculateDistance = (coord1: Coordinates, coord2: Coordinates): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (coord2.latitude - coord1.latitude) * Math.PI / 180;
  const dLon = (coord2.longitude - coord1.longitude) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(coord1.latitude * Math.PI / 180) * Math.cos(coord2.latitude * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
};

/**
 * Generate a Google Maps URL for the coordinates
 */
export const generateMapsUrl = (coordinates: Coordinates): string => {
  const { latitude, longitude } = coordinates;
  return `https://www.google.com/maps?q=${latitude},${longitude}`;
};

/**
 * Generate sample coordinates for testing
 */
export const getSampleCoordinates = (): Array<{ name: string; coordinates: Coordinates }> => {
  return [
    {
      name: 'New York City, USA',
      coordinates: { latitude: 40.7128, longitude: -74.0060 }
    },
    {
      name: 'London, UK',
      coordinates: { latitude: 51.5074, longitude: -0.1278 }
    },
    {
      name: 'Tokyo, Japan',
      coordinates: { latitude: 35.6762, longitude: 139.6503 }
    },
    {
      name: 'Sydney, Australia',
      coordinates: { latitude: -33.8688, longitude: 151.2093 }
    },
    {
      name: 'Mumbai, India',
      coordinates: { latitude: 19.0760, longitude: 72.8777 }
    }
  ];
};