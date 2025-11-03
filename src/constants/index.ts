// Application constants

import { Tool } from '../models/common';
import { ToolType, ToolCategory } from '../enums';
import { APP_ROUTES } from '../routes';

export const APP_NAME = 'DevToolBox';
export const APP_VERSION = '1.0.0';
export const APP_DESCRIPTION = 'A comprehensive toolkit for developers';

// Re-export routes from the centralized routes file
export const ROUTES = APP_ROUTES;

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
  },
  {
    id: ToolType.LOCATION_TRACER,
    name: 'Location Tracer',
    description: 'Find location details from coordinates',
    icon: '🌍',
    path: ROUTES.LOCATION_TRACER,
    category: ToolCategory.UTILITY
  },
  {
    id: ToolType.LOCATION_COMPARATOR,
    name: 'Location & Timezone Comparator',
    description: 'Compare times across multiple locations with world clocks',
    icon: '🕐',
    path: ROUTES.LOCATION_COMPARATOR,
    category: ToolCategory.UTILITY
  },
  {
    id: ToolType.BASE64_ENCODER,
    name: 'Base64 Encoder/Decoder',
    description: 'Encode and decode text, URLs, or files to/from Base64 format',
    icon: '🔢',
    path: ROUTES.BASE64_ENCODER,
    category: ToolCategory.ENCODER
  },
  {
    id: ToolType.MARKDOWN_VIEWER,
    name: 'Markdown Viewer',
    description: 'Preview and edit Markdown with live rendering and theme support',
    icon: '📝',
    path: ROUTES.MARKDOWN_VIEWER,
    category: ToolCategory.VIEWER
  },
  {
    id: ToolType.HTML_VIEWER,
    name: 'HTML Viewer',
    description: 'Preview HTML with validation, sanitization, and live rendering',
    icon: '🌐',
    path: ROUTES.HTML_VIEWER,
    category: ToolCategory.VIEWER
  },
  {
    id: ToolType.CODE_FORMATTER,
    name: 'Code Formatter',
    description: 'Format and beautify code in 20+ programming languages with syntax highlighting',
    icon: '🎨',
    path: ROUTES.CODE_FORMATTER,
    category: ToolCategory.FORMATTER
  },
  {
    id: ToolType.TEXT_COMPARATOR,
    name: 'Text Comparator',
    description: 'Compare two texts side by side with detailed diff highlighting and statistics',
    icon: '📊',
    path: ROUTES.TEXT_COMPARATOR,
    category: ToolCategory.COMPARATOR
  },
  {
    id: ToolType.TIME_CONVERTER,
    name: 'Time Converter',
    description: 'Convert between different time units with precision and bulk conversion support',
    icon: '⏰',
    path: ROUTES.TIME_CONVERTER,
    category: ToolCategory.CONVERTER
  },
  {
    id: ToolType.TIMEZONE_CONVERTER,
    name: 'Timezone Converter',
    description: 'Convert time between different timezones (CET to IST, IST to CST, etc.)',
    icon: '🌍',
    path: ROUTES.TIMEZONE_CONVERTER,
    category: ToolCategory.CONVERTER
  },
  {
    id: ToolType.WORLD_CLOCK,
    name: 'World Clock',
    description: 'View current time across different timezones with analog clock display',
    icon: '🕰️',
    path: ROUTES.WORLD_CLOCK,
    category: ToolCategory.UTILITY
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