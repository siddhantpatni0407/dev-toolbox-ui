// Timezone utility functions for location comparison and world clocks

import { 
  TimezoneInfo, 
  LocationTime, 
  TimeDifference, 
  TimezoneSearchResult, 
  POPULAR_TIMEZONES, 
  BUSINESS_HOURS,
  TIME_FORMAT_OPTIONS,
  TIMEZONE_ABBREVIATIONS,
  TIMEZONE_PRESETS,
  MAJOR_TIMEZONES
} from '../models/timezone';

/**
 * Get current time in a specific timezone
 */
export const getTimeInTimezone = (timezone: string): Date => {
  try {
    return new Date(new Date().toLocaleString("en-US", { timeZone: timezone }));
  } catch (error) {
    console.warn(`Invalid timezone: ${timezone}, falling back to UTC`);
    return new Date();
  }
};

/**
 * Get timezone information for a given timezone
 */
export const getTimezoneInfo = (timezone: string): TimezoneInfo => {
  const now = new Date();
  const utcTime = new Date(now.getTime() + (now.getTimezoneOffset() * 60000));
  const timezoneTime = new Date(utcTime.toLocaleString("en-US", { timeZone: timezone }));
  
  const offsetMs = timezoneTime.getTime() - utcTime.getTime();
  const offsetHours = offsetMs / (1000 * 60 * 60);
  
  // Get timezone abbreviation (fallback method)
  const formatter = new Intl.DateTimeFormat('en', {
    timeZone: timezone,
    timeZoneName: 'short'
  });
  
  const parts = formatter.formatToParts(now);
  const abbreviation = parts.find(part => part.type === 'timeZoneName')?.value || timezone.split('/').pop() || '';
  
  // Check if DST is active (simplified check)
  const januaryOffset = getTimezoneOffset(timezone, new Date(now.getFullYear(), 0, 1));
  const julyOffset = getTimezoneOffset(timezone, new Date(now.getFullYear(), 6, 1));
  const isDST = offsetHours !== Math.min(januaryOffset, julyOffset);
  
  return {
    timezone,
    abbreviation,
    gmtOffset: offsetHours,
    isDST,
    utcOffset: formatUTCOffset(offsetHours)
  };
};

/**
 * Get timezone offset for a specific date and timezone
 */
const getTimezoneOffset = (timezone: string, date: Date): number => {
  const utcTime = new Date(date.getTime() + (date.getTimezoneOffset() * 60000));
  const timezoneTime = new Date(utcTime.toLocaleString("en-US", { timeZone: timezone }));
  return (timezoneTime.getTime() - utcTime.getTime()) / (1000 * 60 * 60);
};

/**
 * Format UTC offset string
 */
const formatUTCOffset = (offsetHours: number): string => {
  const sign = offsetHours >= 0 ? '+' : '-';
  const absOffset = Math.abs(offsetHours);
  const hours = Math.floor(absOffset);
  const minutes = Math.round((absOffset - hours) * 60);
  
  return `UTC${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

/**
 * Create a LocationTime object for a given timezone
 */
export const createLocationTime = (
  timezone: string, 
  name: string, 
  country: string, 
  coordinates: { latitude: number; longitude: number }
): LocationTime => {
  const currentTime = getTimeInTimezone(timezone);
  const timezoneInfo = getTimezoneInfo(timezone);
  
  const id = `${timezone.replace(/\//g, '_')}_${Date.now()}`;
  
  return {
    id,
    name,
    country,
    coordinates,
    timezone: timezoneInfo,
    currentTime,
    formattedTime: formatTime(currentTime, false, true),
    formattedDate: formatDate(currentTime),
    isBusinessHours: isWithinBusinessHours(currentTime)
  };
};

/**
 * Format time with various options
 */
export const formatTime = (
  date: Date, 
  format24Hour: boolean = false, 
  showSeconds: boolean = false
): string => {
  const options = format24Hour 
    ? (showSeconds ? TIME_FORMAT_OPTIONS['24_HOUR_SECONDS'] : TIME_FORMAT_OPTIONS['24_HOUR'])
    : (showSeconds ? TIME_FORMAT_OPTIONS['12_HOUR_SECONDS'] : TIME_FORMAT_OPTIONS['12_HOUR']);
  
  return date.toLocaleTimeString('en-US', options as Intl.DateTimeFormatOptions);
};

/**
 * Format date
 */
export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Check if time is within business hours
 */
export const isWithinBusinessHours = (date: Date): boolean => {
  const hour = date.getHours();
  return hour >= BUSINESS_HOURS.start && hour < BUSINESS_HOURS.end;
};

/**
 * Calculate time difference between two locations
 */
export const calculateTimeDifference = (
  baseLocation: LocationTime, 
  compareLocation: LocationTime
): TimeDifference => {
  const timeDiffMs = compareLocation.currentTime.getTime() - baseLocation.currentTime.getTime();
  const timeDiffMinutes = Math.round(timeDiffMs / (1000 * 60));
  
  const hoursDifference = Math.floor(Math.abs(timeDiffMinutes) / 60);
  const minutesDifference = Math.abs(timeDiffMinutes) % 60;
  
  // Calculate day difference
  const baseDate = new Date(baseLocation.currentTime);
  const compareDate = new Date(compareLocation.currentTime);
  baseDate.setHours(0, 0, 0, 0);
  compareDate.setHours(0, 0, 0, 0);
  const daysDifference = Math.round((compareDate.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24));
  
  let formattedDifference = '';
  if (timeDiffMinutes === 0) {
    formattedDifference = 'Same time';
  } else {
    const sign = timeDiffMinutes > 0 ? '+' : '-';
    if (daysDifference !== 0) {
      const dayText = Math.abs(daysDifference) === 1 ? 'day' : 'days';
      const daySign = daysDifference > 0 ? '+' : '-';
      formattedDifference = `${sign}${hoursDifference}h ${minutesDifference}m (${daySign}${Math.abs(daysDifference)} ${dayText})`;
    } else {
      formattedDifference = `${sign}${hoursDifference}h ${minutesDifference}m`;
    }
  }
  
  return {
    locationId: compareLocation.id,
    locationName: compareLocation.name,
    hoursDifference,
    minutesDifference,
    daysDifference,
    formattedDifference
  };
};

/**
 * Search for timezones by city, country name, or timezone abbreviation
 */
export const searchTimezones = (query: string): TimezoneSearchResult[] => {
  const searchTerm = query.toLowerCase().trim();
  
  if (!searchTerm) {
    return POPULAR_TIMEZONES.slice(0, 15); // Return first 15 popular timezones
  }

  let results: TimezoneSearchResult[] = [];

  // Search by timezone abbreviation first
  const upperQuery = searchTerm.toUpperCase();
  if (TIMEZONE_ABBREVIATIONS[upperQuery]) {
    const timezoneNames = TIMEZONE_ABBREVIATIONS[upperQuery];
    const abbreviationResults = POPULAR_TIMEZONES.filter(tz => 
      timezoneNames.includes(tz.timezone)
    );
    results = [...abbreviationResults];
  }

  // Also search by city, country, and timezone name
  const textResults = POPULAR_TIMEZONES.filter(timezone => 
    timezone.city.toLowerCase().includes(searchTerm) ||
    timezone.country.toLowerCase().includes(searchTerm) ||
    timezone.timezone.toLowerCase().includes(searchTerm)
  );

  // Combine results and remove duplicates
  const combined = [...results, ...textResults];
  const unique = combined.filter((tz, index, arr) => 
    index === arr.findIndex(t => t.timezone === tz.timezone)
  );

  return unique.slice(0, 20); // Limit to 20 results
};

/**
 * Get timezone from coordinates (simplified version)
 */
export const getTimezoneFromCoordinates = async (
  latitude: number, 
  longitude: number
): Promise<string> => {
  try {
    // This is a simplified method - in production, you'd use a proper timezone API
    // For now, we'll find the closest timezone from our popular list
    let closestTimezone = POPULAR_TIMEZONES[0];
    let minDistance = Number.MAX_VALUE;
    
    for (const timezone of POPULAR_TIMEZONES) {
      const distance = calculateDistance(
        latitude, longitude,
        timezone.coordinates.latitude, timezone.coordinates.longitude
      );
      
      if (distance < minDistance) {
        minDistance = distance;
        closestTimezone = timezone;
      }
    }
    
    return closestTimezone.timezone;
  } catch (error) {
    console.error('Error getting timezone from coordinates:', error);
    return 'UTC';
  }
};

/**
 * Calculate distance between two coordinates using Haversine formula
 */
const calculateDistance = (
  lat1: number, lon1: number, 
  lat2: number, lon2: number
): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

/**
 * Get popular timezone suggestions
 */
export const getPopularTimezones = (): TimezoneSearchResult[] => {
  return POPULAR_TIMEZONES;
};

/**
 * Update location time (for real-time clocks)
 */
export const updateLocationTime = (location: LocationTime): LocationTime => {
  const currentTime = getTimeInTimezone(location.timezone.timezone);
  
  return {
    ...location,
    currentTime,
    formattedTime: formatTime(currentTime, false, true),
    formattedDate: formatDate(currentTime),
    isBusinessHours: isWithinBusinessHours(currentTime)
  };
};

/**
 * Get time zone abbreviations for display
 */
export const getTimezoneAbbreviation = (timezone: string): string => {
  try {
    const formatter = new Intl.DateTimeFormat('en', {
      timeZone: timezone,
      timeZoneName: 'short'
    });
    
    const parts = formatter.formatToParts(new Date());
    return parts.find(part => part.type === 'timeZoneName')?.value || timezone.split('/').pop() || 'UTC';
  } catch (error) {
    return timezone.split('/').pop() || 'UTC';
  }
};

/**
 * Get timezone presets for quick selection
 */
export const getTimezonePresets = (): typeof TIMEZONE_PRESETS => {
  return TIMEZONE_PRESETS;
};

/**
 * Create locations from a preset group
 */
export const createLocationsFromPreset = (presetName: keyof typeof TIMEZONE_PRESETS): LocationTime[] => {
  const preset = TIMEZONE_PRESETS[presetName];
  if (!preset) return [];

  return preset.map(item => {
    const timezoneData = POPULAR_TIMEZONES.find(tz => tz.timezone === item.timezone);
    if (!timezoneData) return null;

    return createLocationTime(
      timezoneData.timezone,
      timezoneData.city,
      timezoneData.country,
      timezoneData.coordinates
    );
  }).filter(Boolean) as LocationTime[];
};

/**
 * Search timezone by abbreviation
 */
export const searchByAbbreviation = (abbreviation: string): TimezoneSearchResult[] => {
  const upperAbbr = abbreviation.toUpperCase();
  const timezoneNames = TIMEZONE_ABBREVIATIONS[upperAbbr];
  
  if (!timezoneNames) return [];

  return POPULAR_TIMEZONES.filter(tz => timezoneNames.includes(tz.timezone));
};

/**
 * Get comprehensive timezone comparison data
 */
export interface TimezoneComparisonData {
  timezone: string;
  abbreviation: string;
  currentTime: Date;
  offsetFromUTC: number;
  offsetString: string;
  isDST: boolean;
  city: string;
  country: string;
}

export const getTimezoneComparisonData = (timezones: string[]): TimezoneComparisonData[] => {
  return timezones.map(timezone => {
    const timezoneData = POPULAR_TIMEZONES.find(tz => tz.timezone === timezone);
    const currentTime = getTimeInTimezone(timezone);
    const timezoneInfo = getTimezoneInfo(timezone);

    return {
      timezone,
      abbreviation: timezoneInfo.abbreviation,
      currentTime,
      offsetFromUTC: timezoneInfo.gmtOffset,
      offsetString: timezoneInfo.utcOffset,
      isDST: timezoneInfo.isDST,
      city: timezoneData?.city || timezone.split('/').pop() || '',
      country: timezoneData?.country || ''
    };
  });
};

/**
 * Generate timezone comparison matrix
 */
export interface TimezoneMatrix {
  baseTimezone: string;
  comparisons: Array<{
    timezone: string;
    timeDifference: string;
    hoursDiff: number;
    daysDiff: number;
  }>;
}

export const generateTimezoneMatrix = (baseTimezone: string, compareTimezones: string[]): TimezoneMatrix => {
  const baseTime = getTimeInTimezone(baseTimezone);
  
  const comparisons = compareTimezones.map(timezone => {
    const compareTime = getTimeInTimezone(timezone);
    const timeDiffMs = compareTime.getTime() - baseTime.getTime();
    const hoursDiff = timeDiffMs / (1000 * 60 * 60);
    
    // Calculate day difference
    const baseDate = new Date(baseTime);
    const compareDate = new Date(compareTime);
    baseDate.setHours(0, 0, 0, 0);
    compareDate.setHours(0, 0, 0, 0);
    const daysDiff = Math.round((compareDate.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24));
    
    let timeDifference = '';
    if (hoursDiff === 0) {
      timeDifference = 'Same time';
    } else {
      const sign = hoursDiff > 0 ? '+' : '';
      const hours = Math.floor(Math.abs(hoursDiff));
      const minutes = Math.round((Math.abs(hoursDiff) - hours) * 60);
      
      if (daysDiff !== 0) {
        const dayText = Math.abs(daysDiff) === 1 ? 'day' : 'days';
        const daySign = daysDiff > 0 ? '+' : '';
        timeDifference = `${sign}${hours}h ${minutes}m (${daySign}${daysDiff} ${dayText})`;
      } else {
        timeDifference = `${sign}${hours}h ${minutes}m`;
      }
    }

    return {
      timezone,
      timeDifference,
      hoursDiff: Math.round(hoursDiff * 100) / 100,
      daysDiff
    };
  });

  return {
    baseTimezone,
    comparisons
  };
};

/**
 * Get all available timezone abbreviations
 */
export const getAllTimezoneAbbreviations = (): string[] => {
  return Object.keys(TIMEZONE_ABBREVIATIONS).sort();
};

/**
 * Get major timezones with their standard information
 */
export const getMajorTimezones = () => {
  return MAJOR_TIMEZONES;
};