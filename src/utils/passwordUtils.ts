/**
 * Password generation and strength analysis utilities
 */

import { 
  PasswordOptions, 
  GeneratedPassword, 
  PasswordStrength, 
  PasswordStrengthLabel 
} from '../models/password';
import { CHARACTER_SETS, PASSWORD_DEFAULTS } from '../constants';

/**
 * Generate a secure random password based on options
 */
export const generatePassword = (options: PasswordOptions): GeneratedPassword => {
  let charset = '';
  
  // Build character set based on options
  if (options.includeUppercase) charset += CHARACTER_SETS.UPPERCASE;
  if (options.includeLowercase) charset += CHARACTER_SETS.LOWERCASE;
  if (options.includeNumbers) charset += CHARACTER_SETS.NUMBERS;
  if (options.includeSymbols) charset += CHARACTER_SETS.SYMBOLS;
  
  // Add custom characters if provided
  if (options.customCharacters) {
    charset += options.customCharacters;
  }
  
  // Remove similar and ambiguous characters if requested
  if (options.excludeSimilar) {
    charset = charset.replace(new RegExp(`[${CHARACTER_SETS.SIMILAR}]`, 'g'), '');
  }
  
  if (options.excludeAmbiguous) {
    charset = charset.replace(new RegExp(`[${escapeRegex(CHARACTER_SETS.AMBIGUOUS)}]`, 'g'), '');
  }
  
  if (charset.length === 0) {
    throw new Error('No characters available for password generation');
  }
  
  let password = '';
  const array = new Uint32Array(options.length);
  crypto.getRandomValues(array);
  
  // Generate password ensuring minimum requirements
  const requiredChars: string[] = [];
  
  if (options.includeUppercase && options.minimumUppercase) {
    const upperChars = CHARACTER_SETS.UPPERCASE.split('');
    for (let i = 0; i < options.minimumUppercase; i++) {
      requiredChars.push(upperChars[Math.floor(Math.random() * upperChars.length)]);
    }
  }
  
  if (options.includeLowercase && options.minimumLowercase) {
    const lowerChars = CHARACTER_SETS.LOWERCASE.split('');
    for (let i = 0; i < options.minimumLowercase; i++) {
      requiredChars.push(lowerChars[Math.floor(Math.random() * lowerChars.length)]);
    }
  }
  
  if (options.includeNumbers && options.minimumNumbers) {
    const numberChars = CHARACTER_SETS.NUMBERS.split('');
    for (let i = 0; i < options.minimumNumbers; i++) {
      requiredChars.push(numberChars[Math.floor(Math.random() * numberChars.length)]);
    }
  }
  
  if (options.includeSymbols && options.minimumSymbols) {
    const symbolChars = CHARACTER_SETS.SYMBOLS.split('');
    for (let i = 0; i < options.minimumSymbols; i++) {
      requiredChars.push(symbolChars[Math.floor(Math.random() * symbolChars.length)]);
    }
  }
  
  // Fill remaining characters randomly
  const remainingLength = options.length - requiredChars.length;
  for (let i = 0; i < remainingLength; i++) {
    password += charset.charAt(array[i] % charset.length);
  }
  
  // Add required characters and shuffle
  const allChars = [...password.split(''), ...requiredChars];
  password = shuffleArray(allChars).join('').slice(0, options.length);
  
  const strength = analyzePasswordStrength(password);
  const entropy = calculateEntropy(password, charset.length);
  const timeToCrack = estimateTimeToCrack(entropy);
  const patterns = detectPatterns(password);
  
  return {
    password,
    strength,
    entropy,
    timeToCrack,
    patterns
  };
};

/**
 * Analyze password strength using multiple criteria
 */
export const analyzePasswordStrength = (password: string): PasswordStrength => {
  let score = 0;
  const feedback: string[] = [];
  
  // Length scoring
  if (password.length >= 12) score += 25;
  else if (password.length >= 8) score += 15;
  else if (password.length >= 6) score += 5;
  else feedback.push('Password should be at least 8 characters long');
  
  // Character variety scoring
  if (/[a-z]/.test(password)) score += 10;
  else feedback.push('Add lowercase letters');
  
  if (/[A-Z]/.test(password)) score += 10;
  else feedback.push('Add uppercase letters');
  
  if (/[0-9]/.test(password)) score += 10;
  else feedback.push('Add numbers');
  
  if (/[^a-zA-Z0-9]/.test(password)) score += 15;
  else feedback.push('Add special characters');
  
  // Complexity bonus
  const uniqueChars = new Set(password.split('')).size;
  if (uniqueChars > password.length * 0.7) score += 10;
  
  // Pattern penalties
  if (/(.)\1{2,}/.test(password)) {
    score -= 10;
    feedback.push('Avoid repeated characters');
  }
  
  if (/123|abc|qwe/i.test(password)) {
    score -= 15;
    feedback.push('Avoid common sequences');
  }
  
  // Common password check
  if (isCommonPassword(password)) {
    score -= 20;
    feedback.push('Avoid common passwords');
  }
  
  score = Math.max(0, Math.min(100, score));
  
  let label: PasswordStrengthLabel;
  let color: string;
  
  if (score >= 80) {
    label = 'Strong';
    color = '#10b981';
  } else if (score >= 60) {
    label = 'Good';
    color = '#f59e0b';
  } else if (score >= 40) {
    label = 'Fair';
    color = '#f97316';
  } else if (score >= 20) {
    label = 'Weak';
    color = '#ef4444';
  } else {
    label = 'Very Weak';
    color = '#991b1b';
  }
  
  return {
    score: Math.floor(score / 25), // Convert to 0-4 scale
    label,
    feedback: feedback.slice(0, 3), // Limit feedback
    color
  };
};

/**
 * Calculate password entropy in bits
 */
export const calculateEntropy = (password: string, charsetSize: number): number => {
  return password.length * Math.log2(charsetSize);
};

/**
 * Estimate time to crack password using brute force
 */
export const estimateTimeToCrack = (entropy: number): string => {
  // Assume 1 billion guesses per second
  const guessesPerSecond = 1e9;
  const secondsToCrack = Math.pow(2, entropy - 1) / guessesPerSecond;
  
  if (secondsToCrack < 1) return 'Instantly';
  if (secondsToCrack < 60) return `${Math.ceil(secondsToCrack)} seconds`;
  if (secondsToCrack < 3600) return `${Math.ceil(secondsToCrack / 60)} minutes`;
  if (secondsToCrack < 86400) return `${Math.ceil(secondsToCrack / 3600)} hours`;
  if (secondsToCrack < 2592000) return `${Math.ceil(secondsToCrack / 86400)} days`;
  if (secondsToCrack < 31536000) return `${Math.ceil(secondsToCrack / 2592000)} months`;
  if (secondsToCrack < 31536000000) return `${Math.ceil(secondsToCrack / 31536000)} years`;
  
  return 'Centuries';
};

/**
 * Detect common patterns in passwords
 */
export const detectPatterns = (password: string): string[] => {
  const patterns: string[] = [];
  
  // Sequential characters
  if (/012|123|234|345|456|567|678|789|890/i.test(password)) {
    patterns.push('Sequential numbers');
  }
  
  if (/abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz/i.test(password)) {
    patterns.push('Sequential letters');
  }
  
  // Keyboard patterns
  if (/qwe|asd|zxc|qaz|wsx|edc/i.test(password)) {
    patterns.push('Keyboard patterns');
  }
  
  // Repeated characters
  if (/(.)\1{2,}/.test(password)) {
    patterns.push('Repeated characters');
  }
  
  // Date patterns
  if (/19\d{2}|20\d{2}/.test(password)) {
    patterns.push('Potential date');
  }
  
  return patterns;
};

/**
 * Check if password is commonly used
 */
export const isCommonPassword = (password: string): boolean => {
  const commonPasswords = [
    'password', '123456', '123456789', 'qwerty', 'abc123',
    'password123', 'admin', 'letmein', 'welcome', 'monkey',
    'dragon', 'pass', 'mustang', 'master', 'shadow',
    '12345', '1234567890', 'football', 'baseball', 'superman'
  ];
  
  return commonPasswords.includes(password.toLowerCase());
};

/**
 * Generate default password options
 */
export const getDefaultPasswordOptions = (): PasswordOptions => ({
  length: PASSWORD_DEFAULTS.LENGTH,
  includeUppercase: PASSWORD_DEFAULTS.INCLUDE_UPPERCASE,
  includeLowercase: PASSWORD_DEFAULTS.INCLUDE_LOWERCASE,
  includeNumbers: PASSWORD_DEFAULTS.INCLUDE_NUMBERS,
  includeSymbols: PASSWORD_DEFAULTS.INCLUDE_SYMBOLS,
  excludeSimilar: PASSWORD_DEFAULTS.EXCLUDE_SIMILAR,
  excludeAmbiguous: PASSWORD_DEFAULTS.EXCLUDE_AMBIGUOUS
});

/**
 * Utility functions
 */
const shuffleArray = <T>(array: T[]): T[] => {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

const escapeRegex = (string: string): string => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};