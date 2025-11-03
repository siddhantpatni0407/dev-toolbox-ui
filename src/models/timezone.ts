// Timezone and location comparator models

export interface TimezoneInfo {
  timezone: string;
  abbreviation: string;
  gmtOffset: number;
  isDST: boolean;
  utcOffset: string;
}

export interface LocationTime {
  id: string;
  name: string;
  country: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  timezone: TimezoneInfo;
  currentTime: Date;
  formattedTime: string;
  formattedDate: string;
  isBusinessHours: boolean;
}

export interface TimeComparison {
  baseLocation: LocationTime;
  compareLocations: LocationTime[];
  timeDifferences: TimeDifference[];
}

export interface TimeDifference {
  locationId: string;
  locationName: string;
  hoursDifference: number;
  minutesDifference: number;
  daysDifference: number;
  formattedDifference: string;
}

export interface WorldClock {
  locations: LocationTime[];
  updateInterval: number;
  isRunning: boolean;
}

export interface TimezoneSearchResult {
  timezone: string;
  city: string;
  country: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  gmtOffset: number;
}

export interface ClockDisplayOptions {
  format24Hour: boolean;
  showSeconds: boolean;
  showDate: boolean;
  showTimezone: boolean;
  showBusinessHours: boolean;
}

// Popular timezone data with comprehensive coverage
export const POPULAR_TIMEZONES: TimezoneSearchResult[] = [
  // North America - Pacific
  { timezone: 'America/Los_Angeles', city: 'Los Angeles', country: 'USA', coordinates: { latitude: 34.0522, longitude: -118.2437 }, gmtOffset: -8 },
  { timezone: 'America/Los_Angeles', city: 'San Francisco', country: 'USA', coordinates: { latitude: 37.7749, longitude: -122.4194 }, gmtOffset: -8 },
  { timezone: 'America/Vancouver', city: 'Vancouver', country: 'Canada', coordinates: { latitude: 49.2827, longitude: -123.1207 }, gmtOffset: -8 },
  { timezone: 'America/Los_Angeles', city: 'Seattle', country: 'USA', coordinates: { latitude: 47.6062, longitude: -122.3321 }, gmtOffset: -8 },
  
  // North America - Mountain
  { timezone: 'America/Denver', city: 'Denver', country: 'USA', coordinates: { latitude: 39.7392, longitude: -104.9903 }, gmtOffset: -7 },
  { timezone: 'America/Phoenix', city: 'Phoenix', country: 'USA', coordinates: { latitude: 33.4484, longitude: -112.0740 }, gmtOffset: -7 },
  { timezone: 'America/Denver', city: 'Calgary', country: 'Canada', coordinates: { latitude: 51.0447, longitude: -114.0719 }, gmtOffset: -7 },
  
  // North America - Central
  { timezone: 'America/Chicago', city: 'Chicago', country: 'USA', coordinates: { latitude: 41.8781, longitude: -87.6298 }, gmtOffset: -6 },
  { timezone: 'America/Chicago', city: 'Dallas', country: 'USA', coordinates: { latitude: 32.7767, longitude: -96.7970 }, gmtOffset: -6 },
  { timezone: 'America/Mexico_City', city: 'Mexico City', country: 'Mexico', coordinates: { latitude: 19.4326, longitude: -99.1332 }, gmtOffset: -6 },
  { timezone: 'America/Winnipeg', city: 'Winnipeg', country: 'Canada', coordinates: { latitude: 49.8951, longitude: -97.1384 }, gmtOffset: -6 },
  
  // North America - Eastern
  { timezone: 'America/New_York', city: 'New York', country: 'USA', coordinates: { latitude: 40.7128, longitude: -74.0060 }, gmtOffset: -5 },
  { timezone: 'America/Toronto', city: 'Toronto', country: 'Canada', coordinates: { latitude: 43.6532, longitude: -79.3832 }, gmtOffset: -5 },
  { timezone: 'America/New_York', city: 'Miami', country: 'USA', coordinates: { latitude: 25.7617, longitude: -80.1918 }, gmtOffset: -5 },
  { timezone: 'America/Detroit', city: 'Detroit', country: 'USA', coordinates: { latitude: 42.3314, longitude: -83.0458 }, gmtOffset: -5 },
  
  // Europe - Western
  { timezone: 'Europe/London', city: 'London', country: 'UK', coordinates: { latitude: 51.5074, longitude: -0.1278 }, gmtOffset: 0 },
  { timezone: 'Europe/Dublin', city: 'Dublin', country: 'Ireland', coordinates: { latitude: 53.3498, longitude: -6.2603 }, gmtOffset: 0 },
  { timezone: 'Europe/Lisbon', city: 'Lisbon', country: 'Portugal', coordinates: { latitude: 38.7223, longitude: -9.1393 }, gmtOffset: 0 },
  { timezone: 'Atlantic/Reykjavik', city: 'Reykjavik', country: 'Iceland', coordinates: { latitude: 64.1466, longitude: -21.9426 }, gmtOffset: 0 },
  
  // Europe - Central
  { timezone: 'Europe/Berlin', city: 'Berlin', country: 'Germany', coordinates: { latitude: 52.5200, longitude: 13.4050 }, gmtOffset: 1 },
  { timezone: 'Europe/Paris', city: 'Paris', country: 'France', coordinates: { latitude: 48.8566, longitude: 2.3522 }, gmtOffset: 1 },
  { timezone: 'Europe/Rome', city: 'Rome', country: 'Italy', coordinates: { latitude: 41.9028, longitude: 12.4964 }, gmtOffset: 1 },
  { timezone: 'Europe/Madrid', city: 'Madrid', country: 'Spain', coordinates: { latitude: 40.4168, longitude: -3.7038 }, gmtOffset: 1 },
  { timezone: 'Europe/Amsterdam', city: 'Amsterdam', country: 'Netherlands', coordinates: { latitude: 52.3676, longitude: 4.9041 }, gmtOffset: 1 },
  { timezone: 'Europe/Brussels', city: 'Brussels', country: 'Belgium', coordinates: { latitude: 50.8503, longitude: 4.3517 }, gmtOffset: 1 },
  { timezone: 'Europe/Vienna', city: 'Vienna', country: 'Austria', coordinates: { latitude: 48.2082, longitude: 16.3738 }, gmtOffset: 1 },
  { timezone: 'Europe/Zurich', city: 'Zurich', country: 'Switzerland', coordinates: { latitude: 47.3769, longitude: 8.5417 }, gmtOffset: 1 },
  { timezone: 'Europe/Stockholm', city: 'Stockholm', country: 'Sweden', coordinates: { latitude: 59.3293, longitude: 18.0686 }, gmtOffset: 1 },
  { timezone: 'Europe/Oslo', city: 'Oslo', country: 'Norway', coordinates: { latitude: 59.9139, longitude: 10.7522 }, gmtOffset: 1 },
  { timezone: 'Europe/Copenhagen', city: 'Copenhagen', country: 'Denmark', coordinates: { latitude: 55.6761, longitude: 12.5683 }, gmtOffset: 1 },
  { timezone: 'Europe/Prague', city: 'Prague', country: 'Czech Republic', coordinates: { latitude: 50.0755, longitude: 14.4378 }, gmtOffset: 1 },
  { timezone: 'Europe/Warsaw', city: 'Warsaw', country: 'Poland', coordinates: { latitude: 52.2297, longitude: 21.0122 }, gmtOffset: 1 },
  
  // Europe - Eastern
  { timezone: 'Europe/Helsinki', city: 'Helsinki', country: 'Finland', coordinates: { latitude: 60.1699, longitude: 24.9384 }, gmtOffset: 2 },
  { timezone: 'Europe/Athens', city: 'Athens', country: 'Greece', coordinates: { latitude: 37.9755, longitude: 23.7348 }, gmtOffset: 2 },
  { timezone: 'Europe/Istanbul', city: 'Istanbul', country: 'Turkey', coordinates: { latitude: 41.0082, longitude: 28.9784 }, gmtOffset: 3 },
  { timezone: 'Europe/Moscow', city: 'Moscow', country: 'Russia', coordinates: { latitude: 55.7558, longitude: 37.6176 }, gmtOffset: 3 },
  { timezone: 'Europe/Kiev', city: 'Kiev', country: 'Ukraine', coordinates: { latitude: 50.4501, longitude: 30.5234 }, gmtOffset: 2 },
  
  // Asia - Western
  { timezone: 'Asia/Dubai', city: 'Dubai', country: 'UAE', coordinates: { latitude: 25.2048, longitude: 55.2708 }, gmtOffset: 4 },
  { timezone: 'Asia/Riyadh', city: 'Riyadh', country: 'Saudi Arabia', coordinates: { latitude: 24.7136, longitude: 46.6753 }, gmtOffset: 3 },
  { timezone: 'Asia/Tehran', city: 'Tehran', country: 'Iran', coordinates: { latitude: 35.6892, longitude: 51.3890 }, gmtOffset: 3.5 },
  
  // Asia - Central/South
  { timezone: 'Asia/Kolkata', city: 'Mumbai', country: 'India', coordinates: { latitude: 19.0760, longitude: 72.8777 }, gmtOffset: 5.5 },
  { timezone: 'Asia/Kolkata', city: 'New Delhi', country: 'India', coordinates: { latitude: 28.6139, longitude: 77.2090 }, gmtOffset: 5.5 },
  { timezone: 'Asia/Kolkata', city: 'Bangalore', country: 'India', coordinates: { latitude: 12.9716, longitude: 77.5946 }, gmtOffset: 5.5 },
  { timezone: 'Asia/Karachi', city: 'Karachi', country: 'Pakistan', coordinates: { latitude: 24.8607, longitude: 67.0011 }, gmtOffset: 5 },
  { timezone: 'Asia/Dhaka', city: 'Dhaka', country: 'Bangladesh', coordinates: { latitude: 23.8103, longitude: 90.4125 }, gmtOffset: 6 },
  { timezone: 'Asia/Colombo', city: 'Colombo', country: 'Sri Lanka', coordinates: { latitude: 6.9271, longitude: 79.8612 }, gmtOffset: 5.5 },
  
  // Asia - Southeast
  { timezone: 'Asia/Bangkok', city: 'Bangkok', country: 'Thailand', coordinates: { latitude: 13.7563, longitude: 100.5018 }, gmtOffset: 7 },
  { timezone: 'Asia/Singapore', city: 'Singapore', country: 'Singapore', coordinates: { latitude: 1.3521, longitude: 103.8198 }, gmtOffset: 8 },
  { timezone: 'Asia/Jakarta', city: 'Jakarta', country: 'Indonesia', coordinates: { latitude: -6.2088, longitude: 106.8456 }, gmtOffset: 7 },
  { timezone: 'Asia/Kuala_Lumpur', city: 'Kuala Lumpur', country: 'Malaysia', coordinates: { latitude: 3.1390, longitude: 101.6869 }, gmtOffset: 8 },
  { timezone: 'Asia/Manila', city: 'Manila', country: 'Philippines', coordinates: { latitude: 14.5995, longitude: 120.9842 }, gmtOffset: 8 },
  { timezone: 'Asia/Ho_Chi_Minh', city: 'Ho Chi Minh City', country: 'Vietnam', coordinates: { latitude: 10.8231, longitude: 106.6297 }, gmtOffset: 7 },
  
  // Asia - East
  { timezone: 'Asia/Shanghai', city: 'Shanghai', country: 'China', coordinates: { latitude: 31.2304, longitude: 121.4737 }, gmtOffset: 8 },
  { timezone: 'Asia/Beijing', city: 'Beijing', country: 'China', coordinates: { latitude: 39.9042, longitude: 116.4074 }, gmtOffset: 8 },
  { timezone: 'Asia/Hong_Kong', city: 'Hong Kong', country: 'Hong Kong', coordinates: { latitude: 22.3193, longitude: 114.1694 }, gmtOffset: 8 },
  { timezone: 'Asia/Taipei', city: 'Taipei', country: 'Taiwan', coordinates: { latitude: 25.0330, longitude: 121.5654 }, gmtOffset: 8 },
  { timezone: 'Asia/Tokyo', city: 'Tokyo', country: 'Japan', coordinates: { latitude: 35.6762, longitude: 139.6503 }, gmtOffset: 9 },
  { timezone: 'Asia/Seoul', city: 'Seoul', country: 'South Korea', coordinates: { latitude: 37.5665, longitude: 126.9780 }, gmtOffset: 9 },
  { timezone: 'Asia/Pyongyang', city: 'Pyongyang', country: 'North Korea', coordinates: { latitude: 39.0392, longitude: 125.7625 }, gmtOffset: 9 },
  
  // Australia & Oceania
  { timezone: 'Australia/Sydney', city: 'Sydney', country: 'Australia', coordinates: { latitude: -33.8688, longitude: 151.2093 }, gmtOffset: 10 },
  { timezone: 'Australia/Melbourne', city: 'Melbourne', country: 'Australia', coordinates: { latitude: -37.8136, longitude: 144.9631 }, gmtOffset: 10 },
  { timezone: 'Australia/Brisbane', city: 'Brisbane', country: 'Australia', coordinates: { latitude: -27.4698, longitude: 153.0251 }, gmtOffset: 10 },
  { timezone: 'Australia/Perth', city: 'Perth', country: 'Australia', coordinates: { latitude: -31.9505, longitude: 115.8605 }, gmtOffset: 8 },
  { timezone: 'Australia/Adelaide', city: 'Adelaide', country: 'Australia', coordinates: { latitude: -34.9285, longitude: 138.6007 }, gmtOffset: 9.5 },
  { timezone: 'Pacific/Auckland', city: 'Auckland', country: 'New Zealand', coordinates: { latitude: -36.8485, longitude: 174.7633 }, gmtOffset: 12 },
  { timezone: 'Pacific/Wellington', city: 'Wellington', country: 'New Zealand', coordinates: { latitude: -41.2865, longitude: 174.7762 }, gmtOffset: 12 },
  { timezone: 'Pacific/Fiji', city: 'Suva', country: 'Fiji', coordinates: { latitude: -18.1248, longitude: 178.4501 }, gmtOffset: 12 },
  
  // South America
  { timezone: 'America/Sao_Paulo', city: 'São Paulo', country: 'Brazil', coordinates: { latitude: -23.5505, longitude: -46.6333 }, gmtOffset: -3 },
  { timezone: 'America/Rio_de_Janeiro', city: 'Rio de Janeiro', country: 'Brazil', coordinates: { latitude: -22.9068, longitude: -43.1729 }, gmtOffset: -3 },
  { timezone: 'America/Buenos_Aires', city: 'Buenos Aires', country: 'Argentina', coordinates: { latitude: -34.6118, longitude: -58.3960 }, gmtOffset: -3 },
  { timezone: 'America/Santiago', city: 'Santiago', country: 'Chile', coordinates: { latitude: -33.4489, longitude: -70.6693 }, gmtOffset: -3 },
  { timezone: 'America/Lima', city: 'Lima', country: 'Peru', coordinates: { latitude: -12.0464, longitude: -77.0428 }, gmtOffset: -5 },
  { timezone: 'America/Bogota', city: 'Bogotá', country: 'Colombia', coordinates: { latitude: 4.7110, longitude: -74.0721 }, gmtOffset: -5 },
  { timezone: 'America/Caracas', city: 'Caracas', country: 'Venezuela', coordinates: { latitude: 10.4806, longitude: -66.9036 }, gmtOffset: -4 },
  
  // Africa
  { timezone: 'Africa/Cairo', city: 'Cairo', country: 'Egypt', coordinates: { latitude: 30.0444, longitude: 31.2357 }, gmtOffset: 2 },
  { timezone: 'Africa/Lagos', city: 'Lagos', country: 'Nigeria', coordinates: { latitude: 6.5244, longitude: 3.3792 }, gmtOffset: 1 },
  { timezone: 'Africa/Johannesburg', city: 'Johannesburg', country: 'South Africa', coordinates: { latitude: -26.2041, longitude: 28.0473 }, gmtOffset: 2 },
  { timezone: 'Africa/Nairobi', city: 'Nairobi', country: 'Kenya', coordinates: { latitude: -1.2921, longitude: 36.8219 }, gmtOffset: 3 },
  { timezone: 'Africa/Casablanca', city: 'Casablanca', country: 'Morocco', coordinates: { latitude: 33.5731, longitude: -7.5898 }, gmtOffset: 1 },
  { timezone: 'Africa/Algiers', city: 'Algiers', country: 'Algeria', coordinates: { latitude: 36.7538, longitude: 3.0588 }, gmtOffset: 1 },
  
  // Middle East
  { timezone: 'Asia/Jerusalem', city: 'Jerusalem', country: 'Israel', coordinates: { latitude: 31.7683, longitude: 35.2137 }, gmtOffset: 2 },
  { timezone: 'Asia/Beirut', city: 'Beirut', country: 'Lebanon', coordinates: { latitude: 33.8938, longitude: 35.5018 }, gmtOffset: 2 },
  { timezone: 'Asia/Damascus', city: 'Damascus', country: 'Syria', coordinates: { latitude: 33.5138, longitude: 36.2765 }, gmtOffset: 2 },
  { timezone: 'Asia/Baghdad', city: 'Baghdad', country: 'Iraq', coordinates: { latitude: 33.3152, longitude: 44.3661 }, gmtOffset: 3 },
  
  // Central Asia
  { timezone: 'Asia/Almaty', city: 'Almaty', country: 'Kazakhstan', coordinates: { latitude: 43.2220, longitude: 76.8512 }, gmtOffset: 6 },
  { timezone: 'Asia/Tashkent', city: 'Tashkent', country: 'Uzbekistan', coordinates: { latitude: 41.2995, longitude: 69.2401 }, gmtOffset: 5 },
  { timezone: 'Asia/Kabul', city: 'Kabul', country: 'Afghanistan', coordinates: { latitude: 34.5553, longitude: 69.2075 }, gmtOffset: 4.5 },
];

export const BUSINESS_HOURS = {
  start: 9, // 9 AM
  end: 17,  // 5 PM
};

export const TIME_FORMAT_OPTIONS = {
  '12_HOUR': { hour12: true, hour: '2-digit', minute: '2-digit' },
  '24_HOUR': { hour12: false, hour: '2-digit', minute: '2-digit' },
  '12_HOUR_SECONDS': { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' },
  '24_HOUR_SECONDS': { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' },
} as const;

// Timezone abbreviation mappings
export const TIMEZONE_ABBREVIATIONS: Record<string, string[]> = {
  // North America
  'PST': ['America/Los_Angeles', 'America/Vancouver'],
  'PDT': ['America/Los_Angeles', 'America/Vancouver'],
  'MST': ['America/Denver', 'America/Phoenix'],
  'MDT': ['America/Denver'],
  'CST_NA': ['America/Chicago', 'America/Mexico_City'],
  'CDT': ['America/Chicago'],
  'EST': ['America/New_York', 'America/Toronto', 'America/Detroit'],
  'EDT': ['America/New_York', 'America/Toronto', 'America/Detroit'],
  
  // Europe
  'GMT': ['Europe/London'],
  'BST_UK': ['Europe/London'],
  'CET': ['Europe/Berlin', 'Europe/Paris', 'Europe/Rome', 'Europe/Madrid', 'Europe/Amsterdam'],
  'CEST': ['Europe/Berlin', 'Europe/Paris', 'Europe/Rome', 'Europe/Madrid', 'Europe/Amsterdam'],
  'EET': ['Europe/Athens', 'Europe/Helsinki', 'Europe/Kiev'],
  'EEST': ['Europe/Athens', 'Europe/Helsinki', 'Europe/Kiev'],
  'MSK': ['Europe/Moscow'],
  
  // Asia
  'IST': ['Asia/Kolkata'],
  'JST': ['Asia/Tokyo'],
  'KST': ['Asia/Seoul'],
  'CST_ASIA': ['Asia/Shanghai', 'Asia/Beijing', 'Asia/Hong_Kong', 'Asia/Taipei'],
  'SGT': ['Asia/Singapore'],
  'ICT': ['Asia/Bangkok', 'Asia/Ho_Chi_Minh'],
  'GST': ['Asia/Dubai'],
  'PKT': ['Asia/Karachi'],
  'BST_BD': ['Asia/Dhaka'],
  'IRST': ['Asia/Tehran'],
  
  // Australia & Oceania
  'AEST': ['Australia/Sydney', 'Australia/Melbourne', 'Australia/Brisbane'],
  'AEDT': ['Australia/Sydney', 'Australia/Melbourne'],
  'ACST': ['Australia/Adelaide'],
  'ACDT': ['Australia/Adelaide'],
  'AWST': ['Australia/Perth'],
  'NZST': ['Pacific/Auckland', 'Pacific/Wellington'],
  'NZDT': ['Pacific/Auckland', 'Pacific/Wellington'],
  
  // Africa & Middle East
  'CAT': ['Africa/Johannesburg'],
  'EAT': ['Africa/Nairobi'],
  'WAT': ['Africa/Lagos'],
  'SAST': ['Africa/Johannesburg'],
};

// Preset timezone groups for quick comparison
export const TIMEZONE_PRESETS = {
  'Global Business': [
    { timezone: 'America/New_York', name: 'New York (EST/EDT)' },
    { timezone: 'Europe/London', name: 'London (GMT/BST)' },
    { timezone: 'Europe/Berlin', name: 'Berlin (CET/CEST)' },
    { timezone: 'Asia/Tokyo', name: 'Tokyo (JST)' },
    { timezone: 'Asia/Shanghai', name: 'Shanghai (CST)' },
    { timezone: 'Asia/Kolkata', name: 'Mumbai (IST)' },
  ],
  'US Timezones': [
    { timezone: 'America/Los_Angeles', name: 'Pacific (PST/PDT)' },
    { timezone: 'America/Denver', name: 'Mountain (MST/MDT)' },
    { timezone: 'America/Chicago', name: 'Central (CST/CDT)' },
    { timezone: 'America/New_York', name: 'Eastern (EST/EDT)' },
  ],
  'European Markets': [
    { timezone: 'Europe/London', name: 'London (GMT/BST)' },
    { timezone: 'Europe/Berlin', name: 'Berlin (CET/CEST)' },
    { timezone: 'Europe/Paris', name: 'Paris (CET/CEST)' },
    { timezone: 'Europe/Rome', name: 'Rome (CET/CEST)' },
    { timezone: 'Europe/Moscow', name: 'Moscow (MSK)' },
  ],
  'Asian Markets': [
    { timezone: 'Asia/Tokyo', name: 'Tokyo (JST)' },
    { timezone: 'Asia/Shanghai', name: 'Shanghai (CST)' },
    { timezone: 'Asia/Hong_Kong', name: 'Hong Kong (HKT)' },
    { timezone: 'Asia/Singapore', name: 'Singapore (SGT)' },
    { timezone: 'Asia/Kolkata', name: 'Mumbai (IST)' },
    { timezone: 'Asia/Dubai', name: 'Dubai (GST)' },
  ],
  'Australia & NZ': [
    { timezone: 'Australia/Sydney', name: 'Sydney (AEST/AEDT)' },
    { timezone: 'Australia/Melbourne', name: 'Melbourne (AEST/AEDT)' },
    { timezone: 'Australia/Perth', name: 'Perth (AWST)' },
    { timezone: 'Pacific/Auckland', name: 'Auckland (NZST/NZDT)' },
  ],
  'Popular Comparisons': [
    { timezone: 'Asia/Kolkata', name: 'India (IST)' },
    { timezone: 'Europe/Berlin', name: 'Central Europe (CET)' },
    { timezone: 'America/New_York', name: 'US East (EST)' },
    { timezone: 'America/Los_Angeles', name: 'US West (PST)' },
    { timezone: 'Asia/Tokyo', name: 'Japan (JST)' },
    { timezone: 'Europe/London', name: 'UK (GMT)' },
  ]
};

// Major timezone information with standard and daylight abbreviations
export const MAJOR_TIMEZONES = [
  { name: 'Pacific Standard Time', abbreviation: 'PST', offset: -8, dstAbbr: 'PDT', dstOffset: -7 },
  { name: 'Mountain Standard Time', abbreviation: 'MST', offset: -7, dstAbbr: 'MDT', dstOffset: -6 },
  { name: 'Central Standard Time', abbreviation: 'CST', offset: -6, dstAbbr: 'CDT', dstOffset: -5 },
  { name: 'Eastern Standard Time', abbreviation: 'EST', offset: -5, dstAbbr: 'EDT', dstOffset: -4 },
  { name: 'Greenwich Mean Time', abbreviation: 'GMT', offset: 0, dstAbbr: 'BST', dstOffset: 1 },
  { name: 'Central European Time', abbreviation: 'CET', offset: 1, dstAbbr: 'CEST', dstOffset: 2 },
  { name: 'Eastern European Time', abbreviation: 'EET', offset: 2, dstAbbr: 'EEST', dstOffset: 3 },
  { name: 'India Standard Time', abbreviation: 'IST', offset: 5.5, dstAbbr: '', dstOffset: 5.5 },
  { name: 'China Standard Time', abbreviation: 'CST', offset: 8, dstAbbr: '', dstOffset: 8 },
  { name: 'Japan Standard Time', abbreviation: 'JST', offset: 9, dstAbbr: '', dstOffset: 9 },
  { name: 'Australian Eastern Standard Time', abbreviation: 'AEST', offset: 10, dstAbbr: 'AEDT', dstOffset: 11 },
];