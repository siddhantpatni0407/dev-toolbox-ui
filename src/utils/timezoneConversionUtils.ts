// Timezone Conversion Utilities

import {
  TimezoneData,
  TimezoneConversion,
  TimezoneConversionOptions,
  COMPREHENSIVE_TIMEZONES,
  POPULAR_TIMEZONE_SELECTIONS,
  DEFAULT_TIMEZONE_CONVERSION_OPTIONS
} from '../models/timezoneConversion';

/**
 * Find timezone by ID
 */
export const findTimezoneById = (id: string): TimezoneData | null => {
  return COMPREHENSIVE_TIMEZONES.find(tz => tz.id === id) || null;
};

/**
 * Find timezone by abbreviation
 */
export const findTimezoneByAbbreviation = (abbreviation: string): TimezoneData[] => {
  return COMPREHENSIVE_TIMEZONES.filter(tz => 
    tz.abbreviation.toLowerCase() === abbreviation.toLowerCase()
  );
};

/**
 * Search timezones by name, abbreviation, or country
 */
export const searchTimezones = (query: string): TimezoneData[] => {
  if (!query.trim()) return POPULAR_TIMEZONE_SELECTIONS;

  const normalizedQuery = query.toLowerCase().trim();
  const words = normalizedQuery.split(/\s+/);

  return COMPREHENSIVE_TIMEZONES
    .map(timezone => {
      let score = 0;
      const searchableText = [
        timezone.abbreviation,
        timezone.name,
        timezone.country,
        timezone.region,
        timezone.ianaCode,
        ...(timezone.cities || [])
      ].join(' ').toLowerCase();

      // Exact matches get highest priority
      if (timezone.abbreviation.toLowerCase() === normalizedQuery) {
        score += 100;
      } else if (timezone.abbreviation.toLowerCase().includes(normalizedQuery)) {
        score += 80;
      }

      if (timezone.name.toLowerCase().includes(normalizedQuery)) {
        score += 60;
      }

      if (timezone.country.toLowerCase().includes(normalizedQuery)) {
        score += 40;
      }

      // Check cities
      if (timezone.cities) {
        for (const city of timezone.cities) {
          if (city.toLowerCase().includes(normalizedQuery)) {
            score += 30;
            break;
          }
        }
      }

      // Multi-word search support
      if (words.length > 1) {
        const wordMatches = words.filter(word => 
          searchableText.includes(word)
        ).length;
        score += (wordMatches / words.length) * 20;
      }

      // Fuzzy matching for typos
      if (score === 0) {
        const fuzzyScore = calculateFuzzyScore(normalizedQuery, searchableText);
        if (fuzzyScore > 0.6) {
          score += fuzzyScore * 10;
        }
      }

      return { timezone, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 50) // Limit results
    .map(({ timezone }) => timezone);
};

// Simple fuzzy matching algorithm
const calculateFuzzyScore = (query: string, text: string): number => {
  if (query.length === 0) return 0;
  if (text.includes(query)) return 1;

  let matches = 0;
  let position = 0;

  for (const char of query) {
    const foundIndex = text.indexOf(char, position);
    if (foundIndex !== -1) {
      matches++;
      position = foundIndex + 1;
    }
  }

  return matches / query.length;
};

/**
 * Get timezones grouped by region
 */
export const getTimezonesByRegion = () => {
  const regions = new Map<string, TimezoneData[]>();
  
  COMPREHENSIVE_TIMEZONES.forEach(tz => {
    if (!regions.has(tz.region)) {
      regions.set(tz.region, []);
    }
    regions.get(tz.region)!.push(tz);
  });
  
  return Array.from(regions.entries()).map(([region, timezones]) => ({
    region,
    timezones: timezones.sort((a, b) => a.offsetMinutes - b.offsetMinutes)
  }));
};

/**
 * Convert time between timezones
 */
export const convertTimezone = (
  sourceTimezone: TimezoneData,
  targetTimezone: TimezoneData,
  timeString: string,
  date?: Date
): TimezoneConversion => {
  const baseDate = date || new Date();
  
  // Parse the time string (assumes format like "14:30" or "2:30 PM")
  const parsedTime = parseTimeString(timeString);
  if (!parsedTime) {
    throw new Error('Invalid time format');
  }
  
  // Create source time
  const sourceDate = new Date(baseDate);
  sourceDate.setHours(parsedTime.hours, parsedTime.minutes, parsedTime.seconds || 0, 0);
  
  // Calculate the time difference
  const timeDiffMinutes = targetTimezone.offsetMinutes - sourceTimezone.offsetMinutes;
  
  // Create target time
  const targetDate = new Date(sourceDate.getTime() + (timeDiffMinutes * 60 * 1000));
  
  // Calculate difference for display
  const hoursDiff = Math.floor(Math.abs(timeDiffMinutes) / 60);
  const minutesDiff = Math.abs(timeDiffMinutes) % 60;
  const sign = timeDiffMinutes >= 0 ? '+' : '-';
  
  const formattedDifference = `${sign}${hoursDiff}h ${minutesDiff > 0 ? minutesDiff + 'm' : ''}`.trim();
  
  return {
    id: generateConversionId(),
    sourceTimezone,
    targetTimezone,
    sourceTime: sourceDate,
    targetTime: targetDate,
    sourceTimeString: formatTime(sourceDate, DEFAULT_TIMEZONE_CONVERSION_OPTIONS),
    targetTimeString: formatTime(targetDate, DEFAULT_TIMEZONE_CONVERSION_OPTIONS),
    timeDifference: {
      hours: hoursDiff,
      minutes: minutesDiff,
      formattedDifference
    },
    timestamp: new Date()
  };
};

/**
 * Parse time string into hours, minutes, seconds
 */
export const parseTimeString = (timeString: string): { hours: number; minutes: number; seconds?: number } | null => {
  // Handle different time formats
  const timeRegex = /^(\d{1,2}):(\d{2})(?::(\d{2}))?(?:\s*(AM|PM))?$/i;
  const match = timeString.trim().match(timeRegex);
  
  if (!match) return null;
  
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const seconds = match[3] ? parseInt(match[3], 10) : 0;
  const period = match[4]?.toUpperCase();
  
  // Validate ranges
  if (minutes >= 60 || seconds >= 60) return null;
  
  // Handle AM/PM
  if (period) {
    if (hours < 1 || hours > 12) return null;
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
  } else {
    if (hours >= 24) return null;
  }
  
  return { hours, minutes, seconds };
};

/**
 * Format time according to options
 */
export const formatTime = (date: Date, options: TimezoneConversionOptions): string => {
  const formatOptions: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: !options.format24Hour
  };
  
  if (options.showSeconds) {
    formatOptions.second = '2-digit';
  }
  
  let formatted = date.toLocaleTimeString('en-US', formatOptions);
  
  if (options.showDate) {
    const dateFormatted = date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
    formatted = `${dateFormatted}, ${formatted}`;
  }
  
  return formatted;
};

/**
 * Format time with timezone offset
 */
export const formatTimeWithOffset = (
  date: Date, 
  timezone: TimezoneData, 
  options: TimezoneConversionOptions
): string => {
  let formatted = formatTime(date, options);
  
  if (options.includeOffset) {
    formatted += ` (${timezone.abbreviation} ${timezone.offset})`;
  }
  
  return formatted;
};

/**
 * Get current time in a specific timezone
 */
export const getCurrentTimeInTimezone = (timezone: TimezoneData): Date => {
  const now = new Date();
  const utc = new Date(now.getTime() + (now.getTimezoneOffset() * 60 * 1000));
  return new Date(utc.getTime() + (timezone.offsetMinutes * 60 * 1000));
};

/**
 * Validate time string format
 */
export const validateTimeString = (timeString: string): { isValid: boolean; error?: string } => {
  if (!timeString.trim()) {
    return { isValid: false, error: 'Time is required' };
  }
  
  const parsed = parseTimeString(timeString);
  if (!parsed) {
    return { 
      isValid: false, 
      error: 'Invalid time format. Use HH:MM or HH:MM AM/PM' 
    };
  }
  
  return { isValid: true };
};

/**
 * Generate unique conversion ID
 */
export const generateConversionId = (): string => {
  return `conversion_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Calculate business hours overlap between two timezones
 */
export const calculateBusinessHoursOverlap = (
  timezone1: TimezoneData,
  timezone2: TimezoneData,
  businessStart: number = 9, // 9 AM
  businessEnd: number = 17   // 5 PM
): { overlap: boolean; overlapHours?: { start: number; end: number } } => {
  const timeDiffHours = (timezone2.offsetMinutes - timezone1.offsetMinutes) / 60;
  
  // Convert business hours to timezone2's time
  const tz2BusinessStart = (businessStart + timeDiffHours + 24) % 24;
  const tz2BusinessEnd = (businessEnd + timeDiffHours + 24) % 24;
  
  // Check for overlap
  const overlapStart = Math.max(businessStart, tz2BusinessStart);
  const overlapEnd = Math.min(businessEnd, tz2BusinessEnd);
  
  if (overlapStart < overlapEnd) {
    return {
      overlap: true,
      overlapHours: { start: overlapStart, end: overlapEnd }
    };
  }
  
  return { overlap: false };
};

/**
 * Get suggested meeting times between timezones
 */
export const getSuggestedMeetingTimes = (
  timezone1: TimezoneData,
  timezone2: TimezoneData
): { time1: string; time2: string; description: string }[] => {
  const suggestions = [];
  const businessHours = [9, 10, 11, 14, 15, 16]; // Common meeting hours
  
  for (const hour of businessHours) {
    const timeDiffHours = (timezone2.offsetMinutes - timezone1.offsetMinutes) / 60;
    const correspondingHour = (hour + timeDiffHours + 24) % 24;
    
    // Check if both times are reasonable (8 AM - 6 PM)
    if (correspondingHour >= 8 && correspondingHour <= 18) {
      suggestions.push({
        time1: `${hour}:00`,
        time2: `${Math.floor(correspondingHour)}:${(correspondingHour % 1) * 60 || '00'}`,
        description: `${hour}:00 ${timezone1.abbreviation} = ${Math.floor(correspondingHour)}:${(correspondingHour % 1) * 60 || '00'} ${timezone2.abbreviation}`
      });
    }
  }
  
  return suggestions;
};

/**
 * Export conversion history
 */
export const exportConversions = (conversions: TimezoneConversion[], format: 'json' | 'csv' = 'json'): string => {
  if (format === 'csv') {
    const headers = ['Source Timezone', 'Target Timezone', 'Source Time', 'Target Time', 'Time Difference', 'Date'];
    const rows = conversions.map(conv => [
      `${conv.sourceTimezone.name} (${conv.sourceTimezone.abbreviation})`,
      `${conv.targetTimezone.name} (${conv.targetTimezone.abbreviation})`,
      conv.sourceTimeString,
      conv.targetTimeString,
      conv.timeDifference.formattedDifference,
      conv.timestamp.toISOString()
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }
  
  return JSON.stringify(conversions, null, 2);
};

/**
 * Copy to clipboard utility
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
};

/**
 * Save conversion history to localStorage
 */
export const saveConversionHistory = (conversions: TimezoneConversion[]): void => {
  try {
    localStorage.setItem('timezone_conversion_history', JSON.stringify(conversions.slice(-50))); // Keep last 50
  } catch (error) {
    console.error('Failed to save conversion history:', error);
  }
};

/**
 * Load conversion history from localStorage
 */
export const loadConversionHistory = (): TimezoneConversion[] => {
  try {
    const saved = localStorage.getItem('timezone_conversion_history');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Reconstruct Date objects
      return parsed.map((conv: any) => ({
        ...conv,
        sourceTime: new Date(conv.sourceTime),
        targetTime: new Date(conv.targetTime),
        timestamp: new Date(conv.timestamp)
      }));
    }
  } catch (error) {
    console.error('Failed to load conversion history:', error);
  }
  return [];
};

/**
 * Get popular timezone pairs
 */
export const getPopularTimezonePairs = (): { source: TimezoneData; target: TimezoneData; description: string }[] => {
  return [
    {
      source: findTimezoneById('ist')!,
      target: findTimezoneById('est')!,
      description: 'India to US East Coast'
    },
    {
      source: findTimezoneById('pst')!,
      target: findTimezoneById('cet')!,
      description: 'US West Coast to Central Europe'
    },
    {
      source: findTimezoneById('est')!,
      target: findTimezoneById('jst')!,
      description: 'US East Coast to Japan'
    },
    {
      source: findTimezoneById('utc')!,
      target: findTimezoneById('ist')!,
      description: 'UTC to India'
    },
    {
      source: findTimezoneById('cet')!,
      target: findTimezoneById('aest')!,
      description: 'Central Europe to Australia'
    }
  ];
};