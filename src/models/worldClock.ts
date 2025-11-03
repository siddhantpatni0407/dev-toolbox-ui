/**
 * World Clock Models
 * Defines interfaces and types for world clock functionality
 */

export interface WorldClockTimezone {
  id: string;
  name: string;
  abbreviation: string;
  offset: string;
  country: string;
  flag: string;
  cities: string[];
  region: string;
  ianaCode: string;
  isDst?: boolean;
  dstOffset?: string;
}

export interface ClockTime {
  hours: number;
  minutes: number;
  seconds: number;
  ampm?: 'AM' | 'PM';
  is24Hour: boolean;
}

export interface AnalogClockConfig {
  size: number;
  showSecondHand: boolean;
  showNumbers: boolean;
  showTicks: boolean;
  theme: 'light' | 'dark' | 'auto';
  style: 'modern' | 'classic' | 'minimal';
}

export interface WorldClockData {
  timezone: WorldClockTimezone;
  currentTime: ClockTime;
  dateString: string;
  timestamp: number;
  isCurrentTimezone: boolean;
}

export interface WorldClockSettings {
  autoUpdate: boolean;
  updateInterval: number; // in milliseconds
  format24Hour: boolean;
  showSeconds: boolean;
  showDate: boolean;
  showTimezone: boolean;
  defaultTimezones: string[]; // timezone IDs to show by default
  analogClock: AnalogClockConfig;
}

export interface TimezoneSuggestion {
  timezone: WorldClockTimezone;
  reason: string;
  priority: number;
}

export const DEFAULT_WORLD_CLOCK_SETTINGS: WorldClockSettings = {
  autoUpdate: true,
  updateInterval: 1000,
  format24Hour: false,
  showSeconds: true,
  showDate: true,
  showTimezone: true,
  defaultTimezones: ['UTC', 'America/New_York', 'Europe/London', 'Asia/Tokyo'],
  analogClock: {
    size: 200,
    showSecondHand: true,
    showNumbers: true,
    showTicks: true,
    theme: 'auto',
    style: 'modern'
  }
};

export const WORLD_CLOCK_TIMEZONES: WorldClockTimezone[] = [
  // UTC
  {
    id: 'UTC',
    name: 'Coordinated Universal Time',
    abbreviation: 'UTC',
    offset: '+00:00',
    country: 'Universal',
    flag: '🌍',
    cities: ['Greenwich', 'London', 'Dublin'],
    region: 'Universal',
    ianaCode: 'UTC'
  },
  
  // North America
  {
    id: 'america-new-york',
    name: 'Eastern Time',
    abbreviation: 'EST/EDT',
    offset: '-05:00',
    country: 'United States',
    flag: '🇺🇸',
    cities: ['New York', 'Washington DC', 'Boston', 'Atlanta'],
    region: 'North America',
    ianaCode: 'America/New_York',
    isDst: true,
    dstOffset: '-04:00'
  },
  {
    id: 'america-chicago',
    name: 'Central Time',
    abbreviation: 'CST/CDT',
    offset: '-06:00',
    country: 'United States',
    flag: '🇺🇸',
    cities: ['Chicago', 'Dallas', 'Houston', 'New Orleans'],
    region: 'North America',
    ianaCode: 'America/Chicago',
    isDst: true,
    dstOffset: '-05:00'
  },
  {
    id: 'america-denver',
    name: 'Mountain Time',
    abbreviation: 'MST/MDT',
    offset: '-07:00',
    country: 'United States',
    flag: '🇺🇸',
    cities: ['Denver', 'Phoenix', 'Salt Lake City', 'Albuquerque'],
    region: 'North America',
    ianaCode: 'America/Denver',
    isDst: true,
    dstOffset: '-06:00'
  },
  {
    id: 'america-los-angeles',
    name: 'Pacific Time',
    abbreviation: 'PST/PDT',
    offset: '-08:00',
    country: 'United States',
    flag: '🇺🇸',
    cities: ['Los Angeles', 'San Francisco', 'Seattle', 'Las Vegas'],
    region: 'North America',
    ianaCode: 'America/Los_Angeles',
    isDst: true,
    dstOffset: '-07:00'
  },
  {
    id: 'america-toronto',
    name: 'Eastern Time (Canada)',
    abbreviation: 'EST/EDT',
    offset: '-05:00',
    country: 'Canada',
    flag: '🇨🇦',
    cities: ['Toronto', 'Ottawa', 'Montreal', 'Quebec City'],
    region: 'North America',
    ianaCode: 'America/Toronto',
    isDst: true,
    dstOffset: '-04:00'
  },
  {
    id: 'america-vancouver',
    name: 'Pacific Time (Canada)',
    abbreviation: 'PST/PDT',
    offset: '-08:00',
    country: 'Canada',
    flag: '🇨🇦',
    cities: ['Vancouver', 'Victoria', 'Kelowna'],
    region: 'North America',
    ianaCode: 'America/Vancouver',
    isDst: true,
    dstOffset: '-07:00'
  },

  // Europe
  {
    id: 'europe-london',
    name: 'Greenwich Mean Time',
    abbreviation: 'GMT/BST',
    offset: '+00:00',
    country: 'United Kingdom',
    flag: '🇬🇧',
    cities: ['London', 'Edinburgh', 'Cardiff', 'Belfast'],
    region: 'Europe',
    ianaCode: 'Europe/London',
    isDst: true,
    dstOffset: '+01:00'
  },
  {
    id: 'europe-paris',
    name: 'Central European Time',
    abbreviation: 'CET/CEST',
    offset: '+01:00',
    country: 'France',
    flag: '🇫🇷',
    cities: ['Paris', 'Lyon', 'Marseille', 'Nice'],
    region: 'Europe',
    ianaCode: 'Europe/Paris',
    isDst: true,
    dstOffset: '+02:00'
  },
  {
    id: 'europe-berlin',
    name: 'Central European Time',
    abbreviation: 'CET/CEST',
    offset: '+01:00',
    country: 'Germany',
    flag: '🇩🇪',
    cities: ['Berlin', 'Munich', 'Hamburg', 'Frankfurt'],
    region: 'Europe',
    ianaCode: 'Europe/Berlin',
    isDst: true,
    dstOffset: '+02:00'
  },
  {
    id: 'europe-rome',
    name: 'Central European Time',
    abbreviation: 'CET/CEST',
    offset: '+01:00',
    country: 'Italy',
    flag: '🇮🇹',
    cities: ['Rome', 'Milan', 'Naples', 'Florence'],
    region: 'Europe',
    ianaCode: 'Europe/Rome',
    isDst: true,
    dstOffset: '+02:00'
  },
  {
    id: 'europe-moscow',
    name: 'Moscow Standard Time',
    abbreviation: 'MSK',
    offset: '+03:00',
    country: 'Russia',
    flag: '🇷🇺',
    cities: ['Moscow', 'St. Petersburg', 'Nizhny Novgorod'],
    region: 'Europe',
    ianaCode: 'Europe/Moscow'
  },

  // Asia
  {
    id: 'asia-tokyo',
    name: 'Japan Standard Time',
    abbreviation: 'JST',
    offset: '+09:00',
    country: 'Japan',
    flag: '🇯🇵',
    cities: ['Tokyo', 'Osaka', 'Yokohama', 'Kyoto'],
    region: 'Asia',
    ianaCode: 'Asia/Tokyo'
  },
  {
    id: 'asia-shanghai',
    name: 'China Standard Time',
    abbreviation: 'CST',
    offset: '+08:00',
    country: 'China',
    flag: '🇨🇳',
    cities: ['Shanghai', 'Beijing', 'Guangzhou', 'Shenzhen'],
    region: 'Asia',
    ianaCode: 'Asia/Shanghai'
  },
  {
    id: 'asia-kolkata',
    name: 'India Standard Time',
    abbreviation: 'IST',
    offset: '+05:30',
    country: 'India',
    flag: '🇮🇳',
    cities: ['Mumbai', 'Delhi', 'Bangalore', 'Chennai'],
    region: 'Asia',
    ianaCode: 'Asia/Kolkata'
  },
  {
    id: 'asia-dubai',
    name: 'Gulf Standard Time',
    abbreviation: 'GST',
    offset: '+04:00',
    country: 'UAE',
    flag: '🇦🇪',
    cities: ['Dubai', 'Abu Dhabi', 'Sharjah'],
    region: 'Asia',
    ianaCode: 'Asia/Dubai'
  },
  {
    id: 'asia-singapore',
    name: 'Singapore Standard Time',
    abbreviation: 'SGT',
    offset: '+08:00',
    country: 'Singapore',
    flag: '🇸🇬',
    cities: ['Singapore'],
    region: 'Asia',
    ianaCode: 'Asia/Singapore'
  },

  // Australia/Oceania
  {
    id: 'australia-sydney',
    name: 'Australian Eastern Time',
    abbreviation: 'AEST/AEDT',
    offset: '+10:00',
    country: 'Australia',
    flag: '🇦🇺',
    cities: ['Sydney', 'Melbourne', 'Brisbane', 'Canberra'],
    region: 'Australia/Oceania',
    ianaCode: 'Australia/Sydney',
    isDst: true,
    dstOffset: '+11:00'
  },
  {
    id: 'australia-perth',
    name: 'Australian Western Time',
    abbreviation: 'AWST',
    offset: '+08:00',
    country: 'Australia',
    flag: '🇦🇺',
    cities: ['Perth', 'Fremantle'],
    region: 'Australia/Oceania',
    ianaCode: 'Australia/Perth'
  },
  {
    id: 'pacific-auckland',
    name: 'New Zealand Time',
    abbreviation: 'NZST/NZDT',
    offset: '+12:00',
    country: 'New Zealand',
    flag: '🇳🇿',
    cities: ['Auckland', 'Wellington', 'Christchurch'],
    region: 'Australia/Oceania',
    ianaCode: 'Pacific/Auckland',
    isDst: true,
    dstOffset: '+13:00'
  },

  // South America
  {
    id: 'america-sao-paulo',
    name: 'Brasília Time',
    abbreviation: 'BRT',
    offset: '-03:00',
    country: 'Brazil',
    flag: '🇧🇷',
    cities: ['São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador'],
    region: 'South America',
    ianaCode: 'America/Sao_Paulo'
  },
  {
    id: 'america-argentina-buenos-aires',
    name: 'Argentina Time',
    abbreviation: 'ART',
    offset: '-03:00',
    country: 'Argentina',
    flag: '🇦🇷',
    cities: ['Buenos Aires', 'Córdoba', 'Rosario'],
    region: 'South America',
    ianaCode: 'America/Argentina/Buenos_Aires'
  },

  // Africa
  {
    id: 'africa-cairo',
    name: 'Eastern European Time',
    abbreviation: 'EET',
    offset: '+02:00',
    country: 'Egypt',
    flag: '🇪🇬',
    cities: ['Cairo', 'Alexandria', 'Giza'],
    region: 'Africa',
    ianaCode: 'Africa/Cairo'
  },
  {
    id: 'africa-johannesburg',
    name: 'South Africa Standard Time',
    abbreviation: 'SAST',
    offset: '+02:00',
    country: 'South Africa',
    flag: '🇿🇦',
    cities: ['Johannesburg', 'Cape Town', 'Durban'],
    region: 'Africa',
    ianaCode: 'Africa/Johannesburg'
  }
];