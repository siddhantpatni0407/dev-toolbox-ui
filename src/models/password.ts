// Password Generator related interfaces and types

export interface PasswordOptions {
  length: number;
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
  excludeSimilar: boolean;
  excludeAmbiguous: boolean;
  customCharacters?: string;
  minimumUppercase?: number;
  minimumLowercase?: number;
  minimumNumbers?: number;
  minimumSymbols?: number;
}

export interface GeneratedPassword {
  password: string;
  strength: PasswordStrength;
  entropy: number;
  timeToCrack: string;
  patterns: string[];
}

export interface PasswordStrength {
  score: number; // 0-4
  label: PasswordStrengthLabel;
  feedback: string[];
  color: string;
}

export interface CharacterSet {
  name: string;
  characters: string;
  enabled: boolean;
}

export type PasswordStrengthLabel = 'Very Weak' | 'Weak' | 'Fair' | 'Good' | 'Strong';

export interface PasswordHistory {
  id: string;
  password: string;
  options: PasswordOptions;
  strength: PasswordStrength;
  generatedAt: Date;
}