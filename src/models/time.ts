// Time Conversion Models and Types

export interface TimeUnit {
  id: string;
  name: string;
  abbreviation: string;
  inSeconds: number; // Base conversion factor to seconds
  category: TimeCategory;
}

export enum TimeCategory {
  BASIC = 'basic',
  PRECISE = 'precise',
  LARGE = 'large'
}

export interface ConversionResult {
  value: number;
  unit: TimeUnit;
  formattedValue: string;
}

export interface TimeConversion {
  from: {
    value: number;
    unit: TimeUnit;
  };
  to: {
    value: number;
    unit: TimeUnit;
  };
  precision: number;
}

export interface ConversionHistory {
  id: string;
  timestamp: Date;
  conversion: TimeConversion;
  isFavorite: boolean;
}

export interface ConversionOptions {
  precision: number;
  showFormula: boolean;
  roundingMode: 'round' | 'floor' | 'ceil';
  scientificNotation: boolean;
  autoConvert: boolean;
}

export interface ConversionFilter {
  categories: TimeCategory[];
  searchTerm: string;
  favoriteOnly: boolean;
}

export const TIME_UNITS: TimeUnit[] = [
  // Basic time units
  {
    id: 'nanosecond',
    name: 'Nanosecond',
    abbreviation: 'ns',
    inSeconds: 1e-9,
    category: TimeCategory.PRECISE
  },
  {
    id: 'microsecond',
    name: 'Microsecond',
    abbreviation: 'μs',
    inSeconds: 1e-6,
    category: TimeCategory.PRECISE
  },
  {
    id: 'millisecond',
    name: 'Millisecond',
    abbreviation: 'ms',
    inSeconds: 0.001,
    category: TimeCategory.PRECISE
  },
  {
    id: 'second',
    name: 'Second',
    abbreviation: 's',
    inSeconds: 1,
    category: TimeCategory.BASIC
  },
  {
    id: 'minute',
    name: 'Minute',
    abbreviation: 'min',
    inSeconds: 60,
    category: TimeCategory.BASIC
  },
  {
    id: 'hour',
    name: 'Hour',
    abbreviation: 'hr',
    inSeconds: 3600,
    category: TimeCategory.BASIC
  },
  {
    id: 'day',
    name: 'Day',
    abbreviation: 'd',
    inSeconds: 86400,
    category: TimeCategory.BASIC
  },
  {
    id: 'week',
    name: 'Week',
    abbreviation: 'wk',
    inSeconds: 604800,
    category: TimeCategory.LARGE
  },
  {
    id: 'month',
    name: 'Month',
    abbreviation: 'mo',
    inSeconds: 2629746, // Average month (365.25 days / 12)
    category: TimeCategory.LARGE
  },
  {
    id: 'year',
    name: 'Year',
    abbreviation: 'yr',
    inSeconds: 31556952, // Average year (365.25 days)
    category: TimeCategory.LARGE
  },
  {
    id: 'decade',
    name: 'Decade',
    abbreviation: 'dec',
    inSeconds: 315569520, // 10 years
    category: TimeCategory.LARGE
  },
  {
    id: 'century',
    name: 'Century',
    abbreviation: 'c',
    inSeconds: 3155695200, // 100 years
    category: TimeCategory.LARGE
  }
];

export const DEFAULT_CONVERSION_OPTIONS: ConversionOptions = {
  precision: 6,
  showFormula: true,
  roundingMode: 'round',
  scientificNotation: false,
  autoConvert: false
};

export const DEFAULT_CONVERSION_FILTER: ConversionFilter = {
  categories: [TimeCategory.BASIC, TimeCategory.PRECISE, TimeCategory.LARGE],
  searchTerm: '',
  favoriteOnly: false
};

export const TIME_CONVERSION_EXAMPLES = {
  basic: {
    value: 1,
    fromUnit: 'hour',
    toUnit: 'minute',
    result: 60
  },
  precise: {
    value: 1000,
    fromUnit: 'millisecond',
    toUnit: 'second',
    result: 1
  },
  large: {
    value: 1,
    fromUnit: 'year',
    toUnit: 'day',
    result: 365.25
  },
  complex: {
    value: 90,
    fromUnit: 'minute',
    toUnit: 'hour',
    result: 1.5
  }
};

export const COMMON_CONVERSIONS = [
  { from: 'hour', to: 'minute', label: 'Hours to Minutes' },
  { from: 'minute', to: 'second', label: 'Minutes to Seconds' },
  { from: 'second', to: 'hour', label: 'Seconds to Hours' },
  { from: 'day', to: 'hour', label: 'Days to Hours' },
  { from: 'week', to: 'day', label: 'Weeks to Days' },
  { from: 'month', to: 'day', label: 'Months to Days' },
  { from: 'year', to: 'month', label: 'Years to Months' },
  { from: 'millisecond', to: 'second', label: 'Milliseconds to Seconds' },
  { from: 'microsecond', to: 'millisecond', label: 'Microseconds to Milliseconds' },
  { from: 'nanosecond', to: 'microsecond', label: 'Nanoseconds to Microseconds' }
];

// Type guards
export const isTimeUnit = (unit: any): unit is TimeUnit => {
  return unit && 
    typeof unit.id === 'string' &&
    typeof unit.name === 'string' &&
    typeof unit.abbreviation === 'string' &&
    typeof unit.inSeconds === 'number' &&
    Object.values(TimeCategory).includes(unit.category);
};

export const isValidTimeValue = (value: any): value is number => {
  return typeof value === 'number' && 
    !isNaN(value) && 
    isFinite(value) && 
    value >= 0;
};