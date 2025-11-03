/**
 * World Clock Utilities
 * Contains functions for time calculations, timezone handling, and clock operations
 */

import {
  WorldClockTimezone,
  ClockTime,
  WorldClockData,
  WORLD_CLOCK_TIMEZONES,
  TimezoneSuggestion
} from '../models/worldClock';

/**
 * Get current time in a specific timezone
 */
export const getCurrentTimeInTimezone = (timezone: WorldClockTimezone): ClockTime => {
  const now = new Date();
  
  try {
    // Use Intl.DateTimeFormat for accurate timezone conversion
    const timeInZone = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone.ianaCode,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).formatToParts(now);

    const hours = parseInt(timeInZone.find(part => part.type === 'hour')?.value || '0');
    const minutes = parseInt(timeInZone.find(part => part.type === 'minute')?.value || '0');
    const seconds = parseInt(timeInZone.find(part => part.type === 'second')?.value || '0');

    return {
      hours,
      minutes,
      seconds,
      is24Hour: true
    };
  } catch (error) {
    console.error(`Error getting time for timezone ${timezone.ianaCode}:`, error);
    return {
      hours: 0,
      minutes: 0,
      seconds: 0,
      is24Hour: true
    };
  }
};

/**
 * Convert 24-hour time to 12-hour format
 */
export const convertTo12Hour = (time: ClockTime): ClockTime => {
  if (!time.is24Hour) return time;

  const hours = time.hours;
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;

  return {
    ...time,
    hours: displayHours,
    ampm,
    is24Hour: false
  };
};

/**
 * Format time as string
 */
export const formatTime = (time: ClockTime, showSeconds = true): string => {
  const hours = time.hours.toString().padStart(2, '0');
  const minutes = time.minutes.toString().padStart(2, '0');
  const seconds = time.seconds.toString().padStart(2, '0');
  
  const timeString = showSeconds ? `${hours}:${minutes}:${seconds}` : `${hours}:${minutes}`;
  
  return time.ampm ? `${timeString} ${time.ampm}` : timeString;
};

/**
 * Get date string in timezone
 */
export const getDateInTimezone = (timezone: WorldClockTimezone): string => {
  const now = new Date();
  
  try {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: timezone.ianaCode,
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(now);
  } catch (error) {
    console.error(`Error getting date for timezone ${timezone.ianaCode}:`, error);
    return new Date().toLocaleDateString();
  }
};

/**
 * Get full world clock data for a timezone
 */
export const getWorldClockData = (timezone: WorldClockTimezone, format24Hour = false): WorldClockData => {
  const currentTime = getCurrentTimeInTimezone(timezone);
  const displayTime = format24Hour ? currentTime : convertTo12Hour(currentTime);
  const dateString = getDateInTimezone(timezone);
  const timestamp = Date.now();
  
  // Check if this is the user's current timezone
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const isCurrentTimezone = timezone.ianaCode === userTimezone;

  return {
    timezone,
    currentTime: displayTime,
    dateString,
    timestamp,
    isCurrentTimezone
  };
};

/**
 * Search timezones by query
 */
export const searchWorldClockTimezones = (query: string): WorldClockTimezone[] => {
  if (!query.trim()) return WORLD_CLOCK_TIMEZONES.slice(0, 10);

  const normalizedQuery = query.toLowerCase().trim();
  
  return WORLD_CLOCK_TIMEZONES
    .map(timezone => {
      let score = 0;
      const searchableText = [
        timezone.abbreviation,
        timezone.name,
        timezone.country,
        timezone.region,
        ...timezone.cities
      ].join(' ').toLowerCase();

      // Exact abbreviation match
      if (timezone.abbreviation.toLowerCase() === normalizedQuery) {
        score += 100;
      } else if (timezone.abbreviation.toLowerCase().includes(normalizedQuery)) {
        score += 80;
      }

      // Name match
      if (timezone.name.toLowerCase().includes(normalizedQuery)) {
        score += 60;
      }

      // Country match
      if (timezone.country.toLowerCase().includes(normalizedQuery)) {
        score += 40;
      }

      // City match
      const cityMatch = timezone.cities.some(city => 
        city.toLowerCase().includes(normalizedQuery)
      );
      if (cityMatch) {
        score += 50;
      }

      // Region match
      if (timezone.region.toLowerCase().includes(normalizedQuery)) {
        score += 30;
      }

      // Fallback: check if query appears anywhere in searchable text
      if (score === 0 && searchableText.includes(normalizedQuery)) {
        score += 20;
      }

      return { timezone, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 20)
    .map(({ timezone }) => timezone);
};

/**
 * Get timezone by ID
 */
export const getTimezoneById = (id: string): WorldClockTimezone | undefined => {
  return WORLD_CLOCK_TIMEZONES.find(tz => tz.id === id);
};

/**
 * Get popular timezones based on major cities
 */
export const getPopularTimezones = (): WorldClockTimezone[] => {
  const popularIds = [
    'UTC',
    'america-new-york',
    'europe-london',
    'asia-tokyo',
    'asia-shanghai',
    'asia-kolkata',
    'australia-sydney',
    'europe-paris',
    'america-los-angeles',
    'asia-dubai'
  ];

  return popularIds
    .map(id => getTimezoneById(id))
    .filter((tz): tz is WorldClockTimezone => tz !== undefined);
};

/**
 * Get suggested timezones based on user's location
 */
export const getTimezoneSuggestions = (): TimezoneSuggestion[] => {
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const suggestions: TimezoneSuggestion[] = [];

  // Add user's current timezone
  const currentTz = WORLD_CLOCK_TIMEZONES.find(tz => tz.ianaCode === userTimezone);
  if (currentTz) {
    suggestions.push({
      timezone: currentTz,
      reason: 'Your current timezone',
      priority: 100
    });
  }

  // Add UTC as it's universally important
  const utc = getTimezoneById('UTC');
  if (utc) {
    suggestions.push({
      timezone: utc,
      reason: 'Universal reference time',
      priority: 90
    });
  }

  // Add major business centers
  const businessCenters = [
    'america-new-york',
    'europe-london',
    'asia-tokyo',
    'asia-shanghai'
  ];

  businessCenters.forEach((id, index) => {
    const tz = getTimezoneById(id);
    if (tz && tz.id !== currentTz?.id) {
      suggestions.push({
        timezone: tz,
        reason: 'Major business center',
        priority: 80 - index * 5
      });
    }
  });

  return suggestions.sort((a, b) => b.priority - a.priority);
};

/**
 * Calculate time difference between two timezones
 */
export const calculateTimeDifference = (fromTz: WorldClockTimezone, toTz: WorldClockTimezone): string => {
  const now = new Date();
  
  try {
    const fromTime = new Date(now.toLocaleString('en-US', { timeZone: fromTz.ianaCode }));
    const toTime = new Date(now.toLocaleString('en-US', { timeZone: toTz.ianaCode }));
    
    const diffMs = toTime.getTime() - fromTime.getTime();
    const diffHours = Math.round(diffMs / (1000 * 60 * 60));
    
    if (diffHours === 0) return 'Same time';
    
    const sign = diffHours > 0 ? '+' : '';
    const absHours = Math.abs(diffHours);
    
    if (absHours === 1) {
      return `${sign}${diffHours} hour`;
    } else {
      return `${sign}${diffHours} hours`;
    }
  } catch (error) {
    console.error('Error calculating time difference:', error);
    return 'Unknown';
  }
};

/**
 * Check if timezone observes daylight saving time
 */
export const isDaylightSavingTime = (timezone: WorldClockTimezone): boolean => {
  if (!timezone.isDst) return false;
  
  try {
    const now = new Date();
    const jan = new Date(now.getFullYear(), 0, 1);
    const jul = new Date(now.getFullYear(), 6, 1);
    
    const janOffset = new Date(jan.toLocaleString('en-US', { timeZone: timezone.ianaCode })).getTimezoneOffset();
    const julOffset = new Date(jul.toLocaleString('en-US', { timeZone: timezone.ianaCode })).getTimezoneOffset();
    const nowOffset = new Date(now.toLocaleString('en-US', { timeZone: timezone.ianaCode })).getTimezoneOffset();
    
    return nowOffset !== Math.max(janOffset, julOffset);
  } catch (error) {
    console.error('Error checking DST:', error);
    return false;
  }
};

/**
 * Get analog clock angles for hands
 */
export const getClockAngles = (time: ClockTime) => {
  // Convert to 12-hour format for analog clock
  const hours = time.is24Hour && time.hours > 12 ? time.hours - 12 : time.hours;
  const minutes = time.minutes;
  const seconds = time.seconds;

  // Calculate angles (0 degrees is at 12 o'clock)
  const secondAngle = (seconds * 6) - 90; // 6 degrees per second
  const minuteAngle = (minutes * 6) + (seconds * 0.1) - 90; // 6 degrees per minute + smooth second movement
  const hourAngle = (hours * 30) + (minutes * 0.5) - 90; // 30 degrees per hour + smooth minute movement

  return {
    hour: hourAngle,
    minute: minuteAngle,
    second: secondAngle
  };
};

/**
 * Format timezone offset for display
 */
export const formatTimezoneOffset = (timezone: WorldClockTimezone, showDst = false): string => {
  if (showDst && timezone.isDst && isDaylightSavingTime(timezone)) {
    return timezone.dstOffset || timezone.offset;
  }
  return timezone.offset;
};

/**
 * Group timezones by region
 */
export const groupTimezonesByRegion = (): Record<string, WorldClockTimezone[]> => {
  return WORLD_CLOCK_TIMEZONES.reduce((acc, timezone) => {
    const region = timezone.region;
    if (!acc[region]) {
      acc[region] = [];
    }
    acc[region].push(timezone);
    return acc;
  }, {} as Record<string, WorldClockTimezone[]>);
};

/**
 * Get next hour times for multiple timezones (useful for scheduling)
 */
export const getNextHourTimes = (timezones: WorldClockTimezone[]): Record<string, string> => {
  const nextHour = new Date();
  nextHour.setHours(nextHour.getHours() + 1, 0, 0, 0);

  return timezones.reduce((acc, tz) => {
    try {
      const timeInZone = nextHour.toLocaleString('en-US', {
        timeZone: tz.ianaCode,
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
      acc[tz.id] = timeInZone;
    } catch (error) {
      acc[tz.id] = 'N/A';
    }
    return acc;
  }, {} as Record<string, string>);
};