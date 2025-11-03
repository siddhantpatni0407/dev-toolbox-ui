// Timezone Conversion Models

export interface TimezoneData {
  id: string;
  name: string;
  abbreviation: string;
  offset: string; // e.g., "+05:30", "-08:00"
  offsetMinutes: number; // Total offset in minutes from UTC
  country: string;
  region: string;
  cities?: string[]; // Major cities in this timezone
  isDST?: boolean;
  dstOffset?: string; // DST offset if applicable
  ianaCode?: string; // IANA timezone identifier
  flag?: string; // Country flag emoji
}

export interface TimezoneConversion {
  id: string;
  sourceTimezone: TimezoneData;
  targetTimezone: TimezoneData;
  sourceTime: Date;
  targetTime: Date;
  sourceTimeString: string;
  targetTimeString: string;
  timeDifference: {
    hours: number;
    minutes: number;
    formattedDifference: string;
  };
  timestamp: Date;
}

export interface TimezoneConversionOptions {
  format24Hour: boolean;
  showSeconds: boolean;
  showDate: boolean;
  autoConvert: boolean;
  includeOffset: boolean;
}

export interface TimezoneConversionState {
  sourceTimezone: TimezoneData | null;
  targetTimezone: TimezoneData | null;
  sourceTime: string;
  conversions: TimezoneConversion[];
  history: TimezoneConversion[];
  options: TimezoneConversionOptions;
  isLoading: boolean;
  error: string | null;
}

export interface TimezoneGroup {
  region: string;
  timezones: TimezoneData[];
}

// Popular timezone selections
export const POPULAR_TIMEZONE_SELECTIONS: TimezoneData[] = [
  {
    id: 'utc',
    name: 'Coordinated Universal Time',
    abbreviation: 'UTC',
    offset: '+00:00',
    offsetMinutes: 0,
    country: 'Global',
    region: 'UTC'
  },
  {
    id: 'est',
    name: 'Eastern Standard Time',
    abbreviation: 'EST',
    offset: '-05:00',
    offsetMinutes: -300,
    country: 'United States',
    region: 'North America'
  },
  {
    id: 'pst',
    name: 'Pacific Standard Time',
    abbreviation: 'PST',
    offset: '-08:00',
    offsetMinutes: -480,
    country: 'United States',
    region: 'North America'
  },
  {
    id: 'cst',
    name: 'Central Standard Time',
    abbreviation: 'CST',
    offset: '-06:00',
    offsetMinutes: -360,
    country: 'United States',
    region: 'North America'
  },
  {
    id: 'gmt',
    name: 'Greenwich Mean Time',
    abbreviation: 'GMT',
    offset: '+00:00',
    offsetMinutes: 0,
    country: 'United Kingdom',
    region: 'Europe'
  },
  {
    id: 'cet',
    name: 'Central European Time',
    abbreviation: 'CET',
    offset: '+01:00',
    offsetMinutes: 60,
    country: 'Europe',
    region: 'Europe'
  },
  {
    id: 'ist',
    name: 'India Standard Time',
    abbreviation: 'IST',
    offset: '+05:30',
    offsetMinutes: 330,
    country: 'India',
    region: 'Asia'
  },
  {
    id: 'jst',
    name: 'Japan Standard Time',
    abbreviation: 'JST',
    offset: '+09:00',
    offsetMinutes: 540,
    country: 'Japan',
    region: 'Asia'
  },
  {
    id: 'aest',
    name: 'Australian Eastern Standard Time',
    abbreviation: 'AEST',
    offset: '+10:00',
    offsetMinutes: 600,
    country: 'Australia',
    region: 'Australia'
  },
  {
    id: 'nzst',
    name: 'New Zealand Standard Time',
    abbreviation: 'NZST',
    offset: '+12:00',
    offsetMinutes: 720,
    country: 'New Zealand',
    region: 'Pacific'
  }
];

export const COMPREHENSIVE_TIMEZONES: TimezoneData[] = [
  // UTC and GMT
  {
    id: 'utc',
    name: 'Coordinated Universal Time',
    abbreviation: 'UTC',
    offset: '+00:00',
    offsetMinutes: 0,
    country: 'Global',
    region: 'UTC',
    cities: ['Greenwich'],
    ianaCode: 'UTC',
    flag: '🌍'
  },
  {
    id: 'gmt',
    name: 'Greenwich Mean Time',
    abbreviation: 'GMT',
    offset: '+00:00',
    offsetMinutes: 0,
    country: 'United Kingdom',
    region: 'Europe',
    cities: ['London', 'Dublin', 'Edinburgh'],
    ianaCode: 'Europe/London',
    flag: '🇬🇧'
  },

  // North America - United States
  {
    id: 'est',
    name: 'Eastern Standard Time',
    abbreviation: 'EST',
    offset: '-05:00',
    offsetMinutes: -300,
    country: 'United States',
    region: 'North America',
    cities: ['New York', 'Washington DC', 'Miami', 'Boston', 'Atlanta'],
    ianaCode: 'America/New_York',
    flag: '🇺🇸',
    isDST: false,
    dstOffset: '-04:00'
  },
  {
    id: 'edt',
    name: 'Eastern Daylight Time',
    abbreviation: 'EDT',
    offset: '-04:00',
    offsetMinutes: -240,
    country: 'United States',
    region: 'North America',
    cities: ['New York', 'Washington DC', 'Miami', 'Boston', 'Atlanta'],
    ianaCode: 'America/New_York',
    flag: '🇺🇸',
    isDST: true
  },
  {
    id: 'cst',
    name: 'Central Standard Time',
    abbreviation: 'CST',
    offset: '-06:00',
    offsetMinutes: -360,
    country: 'United States',
    region: 'North America',
    cities: ['Chicago', 'Dallas', 'Houston', 'New Orleans', 'Memphis'],
    ianaCode: 'America/Chicago',
    flag: '🇺🇸',
    isDST: false,
    dstOffset: '-05:00'
  },
  {
    id: 'cdt',
    name: 'Central Daylight Time',
    abbreviation: 'CDT',
    offset: '-05:00',
    offsetMinutes: -300,
    country: 'United States',
    region: 'North America',
    cities: ['Chicago', 'Dallas', 'Houston', 'New Orleans', 'Memphis'],
    ianaCode: 'America/Chicago',
    flag: '🇺🇸',
    isDST: true
  },
  {
    id: 'mst',
    name: 'Mountain Standard Time',
    abbreviation: 'MST',
    offset: '-07:00',
    offsetMinutes: -420,
    country: 'United States',
    region: 'North America',
    cities: ['Denver', 'Phoenix', 'Salt Lake City', 'Albuquerque'],
    ianaCode: 'America/Denver',
    flag: '🇺🇸',
    isDST: false,
    dstOffset: '-06:00'
  },
  {
    id: 'mdt',
    name: 'Mountain Daylight Time',
    abbreviation: 'MDT',
    offset: '-06:00',
    offsetMinutes: -360,
    country: 'United States',
    region: 'North America',
    cities: ['Denver', 'Salt Lake City', 'Albuquerque'],
    ianaCode: 'America/Denver',
    flag: '🇺🇸',
    isDST: true
  },
  {
    id: 'pst',
    name: 'Pacific Standard Time',
    abbreviation: 'PST',
    offset: '-08:00',
    offsetMinutes: -480,
    country: 'United States',
    region: 'North America',
    cities: ['Los Angeles', 'San Francisco', 'Seattle', 'Portland', 'Las Vegas'],
    ianaCode: 'America/Los_Angeles',
    flag: '🇺🇸',
    isDST: false,
    dstOffset: '-07:00'
  },
  {
    id: 'pdt',
    name: 'Pacific Daylight Time',
    abbreviation: 'PDT',
    offset: '-07:00',
    offsetMinutes: -420,
    country: 'United States',
    region: 'North America',
    cities: ['Los Angeles', 'San Francisco', 'Seattle', 'Portland', 'Las Vegas'],
    ianaCode: 'America/Los_Angeles',
    flag: '🇺🇸',
    isDST: true
  },
  {
    id: 'akst',
    name: 'Alaska Standard Time',
    abbreviation: 'AKST',
    offset: '-09:00',
    offsetMinutes: -540,
    country: 'United States',
    region: 'North America',
    cities: ['Anchorage', 'Fairbanks', 'Juneau'],
    ianaCode: 'America/Anchorage',
    flag: '🇺🇸',
    isDST: false,
    dstOffset: '-08:00'
  },
  {
    id: 'hst',
    name: 'Hawaii Standard Time',
    abbreviation: 'HST',
    offset: '-10:00',
    offsetMinutes: -600,
    country: 'United States',
    region: 'North America',
    cities: ['Honolulu', 'Hilo'],
    ianaCode: 'Pacific/Honolulu',
    flag: '🇺🇸'
  },

  // North America - Canada
  {
    id: 'ast',
    name: 'Atlantic Standard Time',
    abbreviation: 'AST',
    offset: '-04:00',
    offsetMinutes: -240,
    country: 'Canada',
    region: 'North America',
    cities: ['Halifax', 'Sydney', 'Moncton'],
    ianaCode: 'America/Halifax',
    flag: '🇨🇦',
    isDST: false,
    dstOffset: '-03:00'
  },
  {
    id: 'nst',
    name: 'Newfoundland Standard Time',
    abbreviation: 'NST',
    offset: '-03:30',
    offsetMinutes: -210,
    country: 'Canada',
    region: 'North America',
    cities: ['St. Johns'],
    ianaCode: 'America/St_Johns',
    flag: '🇨🇦',
    isDST: false,
    dstOffset: '-02:30'
  },

  // North America - Mexico
  {
    id: 'cst_mexico',
    name: 'Central Standard Time (Mexico)',
    abbreviation: 'CST',
    offset: '-06:00',
    offsetMinutes: -360,
    country: 'Mexico',
    region: 'North America',
    cities: ['Mexico City', 'Guadalajara', 'Monterrey'],
    ianaCode: 'America/Mexico_City',
    flag: '🇲🇽'
  },

  // Europe
  {
    id: 'wet',
    name: 'Western European Time',
    abbreviation: 'WET',
    offset: '+00:00',
    offsetMinutes: 0,
    country: 'Portugal',
    region: 'Europe',
    cities: ['Lisbon', 'Porto'],
    ianaCode: 'Europe/Lisbon',
    flag: '🇵🇹',
    isDST: false,
    dstOffset: '+01:00'
  },
  {
    id: 'cet',
    name: 'Central European Time',
    abbreviation: 'CET',
    offset: '+01:00',
    offsetMinutes: 60,
    country: 'Germany',
    region: 'Europe',
    cities: ['Berlin', 'Paris', 'Rome', 'Madrid', 'Amsterdam', 'Brussels', 'Vienna', 'Prague'],
    ianaCode: 'Europe/Berlin',
    flag: '🇩🇪',
    isDST: false,
    dstOffset: '+02:00'
  },
  {
    id: 'cest',
    name: 'Central European Summer Time',
    abbreviation: 'CEST',
    offset: '+02:00',
    offsetMinutes: 120,
    country: 'Germany',
    region: 'Europe',
    cities: ['Berlin', 'Paris', 'Rome', 'Madrid', 'Amsterdam', 'Brussels', 'Vienna', 'Prague'],
    ianaCode: 'Europe/Berlin',
    flag: '🇩🇪',
    isDST: true
  },
  {
    id: 'eet',
    name: 'Eastern European Time',
    abbreviation: 'EET',
    offset: '+02:00',
    offsetMinutes: 120,
    country: 'Finland',
    region: 'Europe',
    cities: ['Helsinki', 'Athens', 'Bucharest', 'Sofia', 'Riga'],
    ianaCode: 'Europe/Helsinki',
    flag: '🇫🇮',
    isDST: false,
    dstOffset: '+03:00'
  },
  {
    id: 'eest',
    name: 'Eastern European Summer Time',
    abbreviation: 'EEST',
    offset: '+03:00',
    offsetMinutes: 180,
    country: 'Finland',
    region: 'Europe',
    cities: ['Helsinki', 'Athens', 'Bucharest', 'Sofia', 'Riga'],
    ianaCode: 'Europe/Helsinki',
    flag: '🇫🇮',
    isDST: true
  },
  {
    id: 'msk',
    name: 'Moscow Standard Time',
    abbreviation: 'MSK',
    offset: '+03:00',
    offsetMinutes: 180,
    country: 'Russia',
    region: 'Europe',
    cities: ['Moscow', 'Saint Petersburg', 'Volgograd'],
    ianaCode: 'Europe/Moscow',
    flag: '🇷🇺'
  },

  // Asia
  {
    id: 'ist',
    name: 'India Standard Time',
    abbreviation: 'IST',
    offset: '+05:30',
    offsetMinutes: 330,
    country: 'India',
    region: 'Asia',
    cities: ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad'],
    ianaCode: 'Asia/Kolkata',
    flag: '🇮🇳'
  },
  {
    id: 'pkt',
    name: 'Pakistan Standard Time',
    abbreviation: 'PKT',
    offset: '+05:00',
    offsetMinutes: 300,
    country: 'Pakistan',
    region: 'Asia',
    cities: ['Karachi', 'Lahore', 'Islamabad'],
    ianaCode: 'Asia/Karachi',
    flag: '🇵🇰'
  },
  {
    id: 'bdt',
    name: 'Bangladesh Standard Time',
    abbreviation: 'BDT',
    offset: '+06:00',
    offsetMinutes: 360,
    country: 'Bangladesh',
    region: 'Asia',
    cities: ['Dhaka', 'Chittagong'],
    ianaCode: 'Asia/Dhaka',
    flag: '🇧🇩'
  },
  {
    id: 'cst_china',
    name: 'China Standard Time',
    abbreviation: 'CST',
    offset: '+08:00',
    offsetMinutes: 480,
    country: 'China',
    region: 'Asia',
    cities: ['Beijing', 'Shanghai', 'Guangzhou', 'Shenzhen', 'Chongqing'],
    ianaCode: 'Asia/Shanghai',
    flag: '🇨🇳'
  },
  {
    id: 'jst',
    name: 'Japan Standard Time',
    abbreviation: 'JST',
    offset: '+09:00',
    offsetMinutes: 540,
    country: 'Japan',
    region: 'Asia',
    cities: ['Tokyo', 'Osaka', 'Kyoto', 'Yokohama', 'Nagoya'],
    ianaCode: 'Asia/Tokyo',
    flag: '🇯🇵'
  },
  {
    id: 'kst',
    name: 'Korea Standard Time',
    abbreviation: 'KST',
    offset: '+09:00',
    offsetMinutes: 540,
    country: 'South Korea',
    region: 'Asia',
    cities: ['Seoul', 'Busan', 'Incheon'],
    ianaCode: 'Asia/Seoul',
    flag: '🇰🇷'
  },
  {
    id: 'ict',
    name: 'Indochina Time',
    abbreviation: 'ICT',
    offset: '+07:00',
    offsetMinutes: 420,
    country: 'Thailand',
    region: 'Asia',
    cities: ['Bangkok', 'Ho Chi Minh City', 'Hanoi', 'Phnom Penh'],
    ianaCode: 'Asia/Bangkok',
    flag: '🇹🇭'
  },
  {
    id: 'sgt',
    name: 'Singapore Standard Time',
    abbreviation: 'SGT',
    offset: '+08:00',
    offsetMinutes: 480,
    country: 'Singapore',
    region: 'Asia',
    cities: ['Singapore'],
    ianaCode: 'Asia/Singapore',
    flag: '🇸🇬'
  },
  {
    id: 'myt',
    name: 'Malaysia Time',
    abbreviation: 'MYT',
    offset: '+08:00',
    offsetMinutes: 480,
    country: 'Malaysia',
    region: 'Asia',
    cities: ['Kuala Lumpur', 'George Town'],
    ianaCode: 'Asia/Kuala_Lumpur',
    flag: '🇲🇾'
  },
  {
    id: 'wib',
    name: 'Western Indonesian Time',
    abbreviation: 'WIB',
    offset: '+07:00',
    offsetMinutes: 420,
    country: 'Indonesia',
    region: 'Asia',
    cities: ['Jakarta', 'Bandung', 'Surabaya'],
    ianaCode: 'Asia/Jakarta',
    flag: '🇮🇩'
  },
  {
    id: 'pht',
    name: 'Philippine Time',
    abbreviation: 'PHT',
    offset: '+08:00',
    offsetMinutes: 480,
    country: 'Philippines',
    region: 'Asia',
    cities: ['Manila', 'Cebu', 'Davao'],
    ianaCode: 'Asia/Manila',
    flag: '🇵🇭'
  },

  // Middle East
  {
    id: 'gst',
    name: 'Gulf Standard Time',
    abbreviation: 'GST',
    offset: '+04:00',
    offsetMinutes: 240,
    country: 'UAE',
    region: 'Middle East',
    cities: ['Dubai', 'Abu Dhabi', 'Riyadh', 'Kuwait City', 'Doha'],
    ianaCode: 'Asia/Dubai',
    flag: '🇦🇪'
  },
  {
    id: 'irst',
    name: 'Iran Standard Time',
    abbreviation: 'IRST',
    offset: '+03:30',
    offsetMinutes: 210,
    country: 'Iran',
    region: 'Middle East',
    cities: ['Tehran', 'Isfahan', 'Mashhad'],
    ianaCode: 'Asia/Tehran',
    flag: '🇮🇷',
    isDST: false,
    dstOffset: '+04:30'
  },
  {
    id: 'ist_israel',
    name: 'Israel Standard Time',
    abbreviation: 'IST',
    offset: '+02:00',
    offsetMinutes: 120,
    country: 'Israel',
    region: 'Middle East',
    cities: ['Jerusalem', 'Tel Aviv', 'Haifa'],
    ianaCode: 'Asia/Jerusalem',
    flag: '🇮🇱',
    isDST: false,
    dstOffset: '+03:00'
  },

  // Africa
  {
    id: 'cat',
    name: 'Central Africa Time',
    abbreviation: 'CAT',
    offset: '+02:00',
    offsetMinutes: 120,
    country: 'South Africa',
    region: 'Africa',
    cities: ['Cape Town', 'Johannesburg', 'Harare', 'Maputo'],
    ianaCode: 'Africa/Johannesburg',
    flag: '🇿🇦'
  },
  {
    id: 'eat',
    name: 'East Africa Time',
    abbreviation: 'EAT',
    offset: '+03:00',
    offsetMinutes: 180,
    country: 'Kenya',
    region: 'Africa',
    cities: ['Nairobi', 'Addis Ababa', 'Dar es Salaam', 'Kampala'],
    ianaCode: 'Africa/Nairobi',
    flag: '🇰🇪'
  },
  {
    id: 'wat',
    name: 'West Africa Time',
    abbreviation: 'WAT',
    offset: '+01:00',
    offsetMinutes: 60,
    country: 'Nigeria',
    region: 'Africa',
    cities: ['Lagos', 'Abuja', 'Accra', 'Dakar'],
    ianaCode: 'Africa/Lagos',
    flag: '🇳🇬'
  },
  {
    id: 'egt',
    name: 'Eastern Greenland Time',
    abbreviation: 'EGT',
    offset: '-01:00',
    offsetMinutes: -60,
    country: 'Greenland',
    region: 'North America',
    cities: ['Ittoqqortoormiit'],
    ianaCode: 'America/Scoresbysund',
    flag: '🇬🇱'
  },

  // Australia and Oceania
  {
    id: 'awst',
    name: 'Australian Western Standard Time',
    abbreviation: 'AWST',
    offset: '+08:00',
    offsetMinutes: 480,
    country: 'Australia',
    region: 'Australia',
    cities: ['Perth', 'Mandurah'],
    ianaCode: 'Australia/Perth',
    flag: '🇦🇺'
  },
  {
    id: 'acst',
    name: 'Australian Central Standard Time',
    abbreviation: 'ACST',
    offset: '+09:30',
    offsetMinutes: 570,
    country: 'Australia',
    region: 'Australia',
    cities: ['Adelaide', 'Darwin'],
    ianaCode: 'Australia/Adelaide',
    flag: '🇦🇺',
    isDST: false,
    dstOffset: '+10:30'
  },
  {
    id: 'acdt',
    name: 'Australian Central Daylight Time',
    abbreviation: 'ACDT',
    offset: '+10:30',
    offsetMinutes: 630,
    country: 'Australia',
    region: 'Australia',
    cities: ['Adelaide'],
    ianaCode: 'Australia/Adelaide',
    flag: '🇦🇺',
    isDST: true
  },
  {
    id: 'aest',
    name: 'Australian Eastern Standard Time',
    abbreviation: 'AEST',
    offset: '+10:00',
    offsetMinutes: 600,
    country: 'Australia',
    region: 'Australia',
    cities: ['Sydney', 'Melbourne', 'Brisbane', 'Canberra'],
    ianaCode: 'Australia/Sydney',
    flag: '🇦🇺',
    isDST: false,
    dstOffset: '+11:00'
  },
  {
    id: 'aedt',
    name: 'Australian Eastern Daylight Time',
    abbreviation: 'AEDT',
    offset: '+11:00',
    offsetMinutes: 660,
    country: 'Australia',
    region: 'Australia',
    cities: ['Sydney', 'Melbourne', 'Canberra'],
    ianaCode: 'Australia/Sydney',
    flag: '🇦🇺',
    isDST: true
  },
  {
    id: 'nzst',
    name: 'New Zealand Standard Time',
    abbreviation: 'NZST',
    offset: '+12:00',
    offsetMinutes: 720,
    country: 'New Zealand',
    region: 'Pacific',
    cities: ['Auckland', 'Wellington', 'Christchurch'],
    ianaCode: 'Pacific/Auckland',
    flag: '🇳🇿',
    isDST: false,
    dstOffset: '+13:00'
  },
  {
    id: 'nzdt',
    name: 'New Zealand Daylight Time',
    abbreviation: 'NZDT',
    offset: '+13:00',
    offsetMinutes: 780,
    country: 'New Zealand',
    region: 'Pacific',
    cities: ['Auckland', 'Wellington', 'Christchurch'],
    ianaCode: 'Pacific/Auckland',
    flag: '🇳🇿',
    isDST: true
  },
  {
    id: 'fjt',
    name: 'Fiji Time',
    abbreviation: 'FJT',
    offset: '+12:00',
    offsetMinutes: 720,
    country: 'Fiji',
    region: 'Pacific',
    cities: ['Suva', 'Nadi'],
    ianaCode: 'Pacific/Fiji',
    flag: '🇫🇯'
  },

  // South America
  {
    id: 'art',
    name: 'Argentina Time',
    abbreviation: 'ART',
    offset: '-03:00',
    offsetMinutes: -180,
    country: 'Argentina',
    region: 'South America',
    cities: ['Buenos Aires', 'Córdoba', 'Rosario'],
    ianaCode: 'America/Argentina/Buenos_Aires',
    flag: '🇦🇷'
  },
  {
    id: 'brt',
    name: 'Brasília Time',
    abbreviation: 'BRT',
    offset: '-03:00',
    offsetMinutes: -180,
    country: 'Brazil',
    region: 'South America',
    cities: ['São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador'],
    ianaCode: 'America/Sao_Paulo',
    flag: '🇧🇷'
  },
  {
    id: 'clt',
    name: 'Chile Standard Time',
    abbreviation: 'CLT',
    offset: '-04:00',
    offsetMinutes: -240,
    country: 'Chile',
    region: 'South America',
    cities: ['Santiago', 'Valparaíso'],
    ianaCode: 'America/Santiago',
    flag: '🇨🇱',
    isDST: false,
    dstOffset: '-03:00'
  },
  {
    id: 'pyt',
    name: 'Paraguay Time',
    abbreviation: 'PYT',
    offset: '-03:00',
    offsetMinutes: -180,
    country: 'Paraguay',
    region: 'South America',
    cities: ['Asunción'],
    ianaCode: 'America/Asuncion',
    flag: '🇵🇾'
  },
  {
    id: 'uyt',
    name: 'Uruguay Time',
    abbreviation: 'UYT',
    offset: '-03:00',
    offsetMinutes: -180,
    country: 'Uruguay',
    region: 'South America',
    cities: ['Montevideo'],
    ianaCode: 'America/Montevideo',
    flag: '🇺🇾'
  },
  {
    id: 'vet',
    name: 'Venezuelan Standard Time',
    abbreviation: 'VET',
    offset: '-04:00',
    offsetMinutes: -240,
    country: 'Venezuela',
    region: 'South America',
    cities: ['Caracas', 'Maracaibo'],
    ianaCode: 'America/Caracas',
    flag: '🇻🇪'
  },
  {
    id: 'cot',
    name: 'Colombia Time',
    abbreviation: 'COT',
    offset: '-05:00',
    offsetMinutes: -300,
    country: 'Colombia',
    region: 'South America',
    cities: ['Bogotá', 'Medellín', 'Cali'],
    ianaCode: 'America/Bogota',
    flag: '🇨🇴'
  },
  {
    id: 'pet',
    name: 'Peru Time',
    abbreviation: 'PET',
    offset: '-05:00',
    offsetMinutes: -300,
    country: 'Peru',
    region: 'South America',
    cities: ['Lima', 'Arequipa'],
    ianaCode: 'America/Lima',
    flag: '🇵🇪'
  },
  {
    id: 'ect',
    name: 'Ecuador Time',
    abbreviation: 'ECT',
    offset: '-05:00',
    offsetMinutes: -300,
    country: 'Ecuador',
    region: 'South America',
    cities: ['Quito', 'Guayaquil'],
    ianaCode: 'America/Guayaquil',
    flag: '🇪🇨'
  },

  // Additional Asian Timezones
  {
    id: 'aft',
    name: 'Afghanistan Time',
    abbreviation: 'AFT',
    offset: '+04:30',
    offsetMinutes: 270,
    country: 'Afghanistan',
    region: 'Asia',
    cities: ['Kabul'],
    ianaCode: 'Asia/Kabul',
    flag: '🇦🇫'
  },
  {
    id: 'npt',
    name: 'Nepal Time',
    abbreviation: 'NPT',
    offset: '+05:45',
    offsetMinutes: 345,
    country: 'Nepal',
    region: 'Asia',
    cities: ['Kathmandu'],
    ianaCode: 'Asia/Kathmandu',
    flag: '🇳🇵'
  },
  {
    id: 'btt',
    name: 'Bhutan Time',
    abbreviation: 'BTT',
    offset: '+06:00',
    offsetMinutes: 360,
    country: 'Bhutan',
    region: 'Asia',
    cities: ['Thimphu'],
    ianaCode: 'Asia/Thimphu',
    flag: '🇧🇹'
  },
  {
    id: 'mmt',
    name: 'Myanmar Time',
    abbreviation: 'MMT',
    offset: '+06:30',
    offsetMinutes: 390,
    country: 'Myanmar',
    region: 'Asia',
    cities: ['Yangon', 'Mandalay'],
    ianaCode: 'Asia/Yangon',
    flag: '🇲🇲'
  },

  // Pacific Islands
  {
    id: 'hkt',
    name: 'Hong Kong Time',
    abbreviation: 'HKT',
    offset: '+08:00',
    offsetMinutes: 480,
    country: 'Hong Kong',
    region: 'Asia',
    cities: ['Hong Kong'],
    ianaCode: 'Asia/Hong_Kong',
    flag: '🇭🇰'
  },
  {
    id: 'tpe',
    name: 'Taipei Time',
    abbreviation: 'CST',
    offset: '+08:00',
    offsetMinutes: 480,
    country: 'Taiwan',
    region: 'Asia',
    cities: ['Taipei', 'Kaohsiung'],
    ianaCode: 'Asia/Taipei',
    flag: '🇹🇼'
  },
  {
    id: 'ulat',
    name: 'Ulaanbaatar Time',
    abbreviation: 'ULAT',
    offset: '+08:00',
    offsetMinutes: 480,
    country: 'Mongolia',
    region: 'Asia',
    cities: ['Ulaanbaatar'],
    ianaCode: 'Asia/Ulaanbaatar',
    flag: '🇲🇳'
  },

  // Additional Pacific
  {
    id: 'sbt',
    name: 'Solomon Islands Time',
    abbreviation: 'SBT',
    offset: '+11:00',
    offsetMinutes: 660,
    country: 'Solomon Islands',
    region: 'Pacific',
    cities: ['Honiara'],
    ianaCode: 'Pacific/Guadalcanal',
    flag: '🇸🇧'
  },
  {
    id: 'vut',
    name: 'Vanuatu Time',
    abbreviation: 'VUT',
    offset: '+11:00',
    offsetMinutes: 660,
    country: 'Vanuatu',
    region: 'Pacific',
    cities: ['Port Vila'],
    ianaCode: 'Pacific/Efate',
    flag: '🇻🇺'
  },
  {
    id: 'pgt',
    name: 'Papua New Guinea Time',
    abbreviation: 'PGT',
    offset: '+10:00',
    offsetMinutes: 600,
    country: 'Papua New Guinea',
    region: 'Pacific',
    cities: ['Port Moresby'],
    ianaCode: 'Pacific/Port_Moresby',
    flag: '🇵🇬'
  },

  // Additional European
  {
    id: 'ict_iceland',
    name: 'Iceland Time',
    abbreviation: 'GMT',
    offset: '+00:00',
    offsetMinutes: 0,
    country: 'Iceland',
    region: 'Europe',
    cities: ['Reykjavik'],
    ianaCode: 'Atlantic/Reykjavik',
    flag: '🇮🇸'
  },
  {
    id: 'azot',
    name: 'Azores Time',
    abbreviation: 'AZOT',
    offset: '-01:00',
    offsetMinutes: -60,
    country: 'Portugal',
    region: 'Atlantic',
    cities: ['Ponta Delgada'],
    ianaCode: 'Atlantic/Azores',
    flag: '🇵🇹'
  }
];

export const DEFAULT_TIMEZONE_CONVERSION_OPTIONS: TimezoneConversionOptions = {
  format24Hour: false,
  showSeconds: true,
  showDate: true,
  autoConvert: true,
  includeOffset: true
};

export const TIMEZONE_CONVERSION_EXAMPLES = {
  business: {
    source: 'ist',
    target: 'est',
    time: '09:00',
    description: 'Business hours: IST to EST'
  },
  meeting: {
    source: 'pst',
    target: 'cet',
    time: '14:00',
    description: 'Meeting time: PST to CET'
  },
  travel: {
    source: 'est',
    target: 'jst',
    time: '18:30',
    description: 'Travel planning: EST to JST'
  }
};