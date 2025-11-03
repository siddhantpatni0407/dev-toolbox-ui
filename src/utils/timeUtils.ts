// Time Conversion Utilities

import {
  TimeUnit,
  TimeConversion,
  ConversionResult,
  ConversionOptions,
  ConversionHistory,
  TIME_UNITS,
  DEFAULT_CONVERSION_OPTIONS,
  isTimeUnit,
  isValidTimeValue,
  TimeCategory
} from '../models/time';

/**
 * Convert time from one unit to another
 */
export const convertTime = (
  value: number,
  fromUnit: TimeUnit,
  toUnit: TimeUnit,
  options: ConversionOptions = DEFAULT_CONVERSION_OPTIONS
): ConversionResult => {
  if (!isValidTimeValue(value)) {
    throw new Error('Invalid time value provided');
  }

  if (!isTimeUnit(fromUnit) || !isTimeUnit(toUnit)) {
    throw new Error('Invalid time units provided');
  }

  // Convert to seconds first, then to target unit
  const valueInSeconds = value * fromUnit.inSeconds;
  const convertedValue = valueInSeconds / toUnit.inSeconds;

  // Apply rounding based on options
  let finalValue: number;
  switch (options.roundingMode) {
    case 'floor':
      finalValue = Math.floor(convertedValue * Math.pow(10, options.precision)) / Math.pow(10, options.precision);
      break;
    case 'ceil':
      finalValue = Math.ceil(convertedValue * Math.pow(10, options.precision)) / Math.pow(10, options.precision);
      break;
    default:
      finalValue = Math.round(convertedValue * Math.pow(10, options.precision)) / Math.pow(10, options.precision);
  }

  // Format the value
  const formattedValue = formatTimeValue(finalValue, options);

  return {
    value: finalValue,
    unit: toUnit,
    formattedValue
  };
};

/**
 * Format time value based on options
 */
export const formatTimeValue = (
  value: number,
  options: ConversionOptions = DEFAULT_CONVERSION_OPTIONS
): string => {
  if (!isValidTimeValue(value)) {
    return 'Invalid';
  }

  // Use scientific notation for very large or very small numbers
  if (options.scientificNotation || 
      Math.abs(value) >= 1e6 || 
      (Math.abs(value) < 0.001 && value !== 0)) {
    return value.toExponential(options.precision);
  }

  // Format with specified precision
  const formatted = value.toFixed(options.precision);
  
  // Remove trailing zeros after decimal point
  return formatted.replace(/\.?0+$/, '');
};

/**
 * Get time unit by ID
 */
export const getTimeUnitById = (id: string): TimeUnit | null => {
  return TIME_UNITS.find(unit => unit.id === id) || null;
};

/**
 * Get time units by category
 */
export const getTimeUnitsByCategory = (category: TimeCategory): TimeUnit[] => {
  return TIME_UNITS.filter(unit => unit.category === category);
};

/**
 * Search time units by name or abbreviation
 */
export const searchTimeUnits = (searchTerm: string): TimeUnit[] => {
  if (!searchTerm.trim()) {
    return TIME_UNITS;
  }

  const term = searchTerm.toLowerCase();
  return TIME_UNITS.filter(unit => 
    unit.name.toLowerCase().includes(term) ||
    unit.abbreviation.toLowerCase().includes(term) ||
    unit.id.toLowerCase().includes(term)
  );
};

/**
 * Filter time units based on categories and search term
 */
export const filterTimeUnits = (
  categories: TimeCategory[],
  searchTerm: string = ''
): TimeUnit[] => {
  let filteredUnits = TIME_UNITS.filter(unit => 
    categories.length === 0 || categories.includes(unit.category)
  );

  if (searchTerm.trim()) {
    filteredUnits = searchTimeUnits(searchTerm).filter(unit =>
      categories.length === 0 || categories.includes(unit.category)
    );
  }

  return filteredUnits;
};

/**
 * Get conversion formula
 */
export const getConversionFormula = (
  fromUnit: TimeUnit,
  toUnit: TimeUnit
): string => {
  if (fromUnit.id === toUnit.id) {
    return `${fromUnit.name} = ${toUnit.name}`;
  }

  const ratio = fromUnit.inSeconds / toUnit.inSeconds;
  
  if (ratio >= 1) {
    const formattedRatio = formatTimeValue(ratio, { ...DEFAULT_CONVERSION_OPTIONS, precision: 6 });
    return `1 ${fromUnit.name} = ${formattedRatio} ${toUnit.name}`;
  } else {
    const inverseRatio = formatTimeValue(1 / ratio, { ...DEFAULT_CONVERSION_OPTIONS, precision: 6 });
    return `${inverseRatio} ${fromUnit.name} = 1 ${toUnit.name}`;
  }
};

/**
 * Validate conversion input
 */
export const validateConversionInput = (
  value: string,
  fromUnit: TimeUnit | null,
  toUnit: TimeUnit | null
): { isValid: boolean; error?: string } => {
  // Check if value is provided
  if (!value || !value.trim()) {
    return { isValid: false, error: 'Please enter a value to convert' };
  }

  // Check if value is a valid number
  const numValue = parseFloat(value.trim());
  if (isNaN(numValue)) {
    return { isValid: false, error: 'Please enter a valid number' };
  }

  // Check if value is non-negative
  if (numValue < 0) {
    return { isValid: false, error: 'Time values cannot be negative' };
  }

  // Check if units are selected
  if (!fromUnit) {
    return { isValid: false, error: 'Please select a source unit' };
  }

  if (!toUnit) {
    return { isValid: false, error: 'Please select a target unit' };
  }

  // Check for extremely large values that might cause overflow
  if (numValue > Number.MAX_SAFE_INTEGER) {
    return { isValid: false, error: 'Value is too large to process' };
  }

  // Check for zero values (valid but worth noting)
  if (numValue === 0) {
    return { isValid: true }; // Zero is a valid time value
  }

  return { isValid: true };
};

/**
 * Perform bulk conversion to multiple units
 */
export const convertToMultipleUnits = (
  value: number,
  fromUnit: TimeUnit,
  targetUnits: TimeUnit[],
  options: ConversionOptions = DEFAULT_CONVERSION_OPTIONS
): ConversionResult[] => {
  return targetUnits.map(toUnit => 
    convertTime(value, fromUnit, toUnit, options)
  );
};

/**
 * Get commonly used conversions for a unit
 */
export const getCommonConversions = (unit: TimeUnit): TimeUnit[] => {
  const commonUnits: { [key: string]: string[] } = {
    'nanosecond': ['microsecond', 'millisecond', 'second'],
    'microsecond': ['nanosecond', 'millisecond', 'second'],
    'millisecond': ['microsecond', 'second', 'minute'],
    'second': ['millisecond', 'minute', 'hour'],
    'minute': ['second', 'hour', 'day'],
    'hour': ['minute', 'day', 'week'],
    'day': ['hour', 'week', 'month'],
    'week': ['day', 'month', 'year'],
    'month': ['week', 'day', 'year'],
    'year': ['month', 'day', 'decade'],
    'decade': ['year', 'century'],
    'century': ['decade', 'year']
  };

  const commonIds = commonUnits[unit.id] || [];
  return commonIds.map(id => getTimeUnitById(id)).filter(Boolean) as TimeUnit[];
};

/**
 * Generate conversion history entry
 */
export const createConversionHistory = (
  value: number,
  fromUnit: TimeUnit,
  toUnit: TimeUnit,
  result: ConversionResult,
  precision: number
): ConversionHistory => {
  return {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date(),
    conversion: {
      from: { value, unit: fromUnit },
      to: { value: result.value, unit: toUnit },
      precision
    },
    isFavorite: false
  };
};

/**
 * Export conversion result to various formats
 */
export const exportConversion = (
  conversion: TimeConversion,
  format: 'text' | 'json' | 'csv' = 'text'
): string => {
  const { from, to, precision } = conversion;
  
  switch (format) {
    case 'json':
      return JSON.stringify({
        input: {
          value: from.value,
          unit: from.unit.name,
          abbreviation: from.unit.abbreviation
        },
        output: {
          value: to.value,
          unit: to.unit.name,
          abbreviation: to.unit.abbreviation
        },
        precision,
        formula: getConversionFormula(from.unit, to.unit),
        timestamp: new Date().toISOString()
      }, null, 2);
      
    case 'csv':
      return [
        'Input Value,Input Unit,Output Value,Output Unit,Precision,Formula,Timestamp',
        `${from.value},${from.unit.name},${to.value},${to.unit.name},${precision},"${getConversionFormula(from.unit, to.unit)}",${new Date().toISOString()}`
      ].join('\n');
      
    default:
      return `Time Conversion Result
Input: ${from.value} ${from.unit.name} (${from.unit.abbreviation})
Output: ${to.value} ${to.unit.name} (${to.unit.abbreviation})
Formula: ${getConversionFormula(from.unit, to.unit)}
Precision: ${precision} decimal places
Generated: ${new Date().toLocaleString()}`;
  }
};

/**
 * Copy conversion result to clipboard
 */
export const copyConversionToClipboard = async (
  conversion: TimeConversion,
  format: 'text' | 'json' | 'value' = 'text'
): Promise<boolean> => {
  try {
    let textToCopy: string;
    
    switch (format) {
      case 'json':
        textToCopy = exportConversion(conversion, 'json');
        break;
      case 'value':
        textToCopy = conversion.to.value.toString();
        break;
      default:
        textToCopy = `${conversion.from.value} ${conversion.from.unit.abbreviation} = ${conversion.to.value} ${conversion.to.unit.abbreviation}`;
    }
    
    await navigator.clipboard.writeText(textToCopy);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
};

/**
 * Load conversion history from localStorage
 */
export const loadConversionHistory = (): ConversionHistory[] => {
  try {
    const stored = localStorage.getItem('timeConversionHistory');
    if (!stored) return [];
    
    const parsed = JSON.parse(stored);
    return parsed.map((item: any) => ({
      ...item,
      timestamp: new Date(item.timestamp)
    }));
  } catch (error) {
    console.error('Failed to load conversion history:', error);
    return [];
  }
};

/**
 * Save conversion history to localStorage
 */
export const saveConversionHistory = (history: ConversionHistory[]): boolean => {
  try {
    localStorage.setItem('timeConversionHistory', JSON.stringify(history));
    return true;
  } catch (error) {
    console.error('Failed to save conversion history:', error);
    return false;
  }
};

/**
 * Clear conversion history
 */
export const clearConversionHistory = (): boolean => {
  try {
    localStorage.removeItem('timeConversionHistory');
    return true;
  } catch (error) {
    console.error('Failed to clear conversion history:', error);
    return false;
  }
};