// Application constants

import { Tool } from '../models/common';
import { ToolType, ToolCategory } from '../enums';

export const APP_NAME = 'DevToolBox';
export const APP_VERSION = '1.0.0';
export const APP_DESCRIPTION = 'A comprehensive toolkit for developers';

export const ROUTES = {
  HOME: '/',
  JWT_DECODER: '/jwt-decoder',
  PASSWORD_GENERATOR: '/password-generator',
  ABOUT: '/about',
  CONTACT: '/contact',
} as const;

export const TOOLS: Tool[] = [
  {
    id: ToolType.JWT_DECODER,
    name: 'JWT Token Decoder',
    description: 'Decode and validate JSON Web Tokens',
    icon: '🔐',
    path: ROUTES.JWT_DECODER,
    category: ToolCategory.SECURITY
  },
  {
    id: ToolType.PASSWORD_GENERATOR,
    name: 'Password Generator',
    description: 'Generate secure random passwords',
    icon: '🔑',
    path: ROUTES.PASSWORD_GENERATOR,
    category: ToolCategory.GENERATOR
  }
];

export const JWT_ALGORITHMS = [
  'HS256', 'HS384', 'HS512',
  'RS256', 'RS384', 'RS512',
  'ES256', 'ES384', 'ES512',
  'PS256', 'PS384', 'PS512'
] as const;

export const PASSWORD_DEFAULTS = {
  LENGTH: 16,
  MIN_LENGTH: 4,
  MAX_LENGTH: 128,
  INCLUDE_UPPERCASE: true,
  INCLUDE_LOWERCASE: true,
  INCLUDE_NUMBERS: true,
  INCLUDE_SYMBOLS: true,
  EXCLUDE_SIMILAR: false,
  EXCLUDE_AMBIGUOUS: false
} as const;

export const CHARACTER_SETS = {
  UPPERCASE: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  LOWERCASE: 'abcdefghijklmnopqrstuvwxyz',
  NUMBERS: '0123456789',
  SYMBOLS: '!@#$%^&*()_+-=[]{}|;:,.<>?',
  SIMILAR: 'il1Lo0O',
  AMBIGUOUS: '{}[]()/\\\'"`~,;<>.?'
} as const;

export const DEBOUNCE_DELAY = 300;
export const TOAST_DURATION = 3000;

export const BREAKPOINTS = {
  MOBILE: 480,
  TABLET: 768,
  DESKTOP: 1024,
  LARGE: 1200
} as const;