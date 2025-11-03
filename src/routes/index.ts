// Application routes configuration
export const APP_ROUTES = {
  // Main pages
  HOME: '/',
  ABOUT: '/about',
  CONTACT: '/contact',

  // Security tools
  JWT_DECODER: '/tools/security/jwt-decoder',

  // Generator tools
  PASSWORD_GENERATOR: '/tools/generator/password-generator',

  // Location tools
  LOCATION_TRACER: '/tools/location/tracer',
  LOCATION_COMPARATOR: '/tools/location/comparator',

  // Encoder tools
  BASE64_ENCODER: '/tools/encoder/base64-encoder',

  // Viewer tools
  MARKDOWN_VIEWER: '/tools/viewer/markdown-viewer',
  HTML_VIEWER: '/tools/viewer/html-viewer',

  // Formatter tools
  CODE_FORMATTER: '/tools/formatter/code-formatter',

  // Comparator tools
  TEXT_COMPARATOR: '/tools/comparator/text-comparator',

  // Converter tools
  TIME_CONVERTER: '/tools/converter/time-converter',
  TIMEZONE_CONVERTER: '/tools/converter/timezone-converter',
  
  // Utility tools
  WORLD_CLOCK: '/tools/utility/world-clock',
} as const;

// Route type for type safety
export type AppRoute = typeof APP_ROUTES[keyof typeof APP_ROUTES];

// Route groups for better organization
export const ROUTE_GROUPS = {
  PAGES: {
    HOME: APP_ROUTES.HOME,
    ABOUT: APP_ROUTES.ABOUT,
    CONTACT: APP_ROUTES.CONTACT,
  },
  TOOLS: {
    SECURITY: {
      JWT_DECODER: APP_ROUTES.JWT_DECODER,
    },
    GENERATOR: {
      PASSWORD_GENERATOR: APP_ROUTES.PASSWORD_GENERATOR,
    },
    LOCATION: {
      TRACER: APP_ROUTES.LOCATION_TRACER,
      COMPARATOR: APP_ROUTES.LOCATION_COMPARATOR,
    },
    ENCODER: {
      BASE64_ENCODER: APP_ROUTES.BASE64_ENCODER,
    },
    VIEWER: {
      MARKDOWN_VIEWER: APP_ROUTES.MARKDOWN_VIEWER,
      HTML_VIEWER: APP_ROUTES.HTML_VIEWER,
    },
    FORMATTER: {
      CODE_FORMATTER: APP_ROUTES.CODE_FORMATTER,
    },
    COMPARATOR: {
      TEXT_COMPARATOR: APP_ROUTES.TEXT_COMPARATOR,
    },
    CONVERTER: {
      TIME_CONVERTER: APP_ROUTES.TIME_CONVERTER,
      TIMEZONE_CONVERTER: APP_ROUTES.TIMEZONE_CONVERTER,
    },
    UTILITY: {
      WORLD_CLOCK: APP_ROUTES.WORLD_CLOCK,
    },
  },
} as const;

// Backward compatibility - maintain old ROUTES export
export const ROUTES = {
  HOME: APP_ROUTES.HOME,
  JWT_DECODER: APP_ROUTES.JWT_DECODER,
  PASSWORD_GENERATOR: APP_ROUTES.PASSWORD_GENERATOR,
  LOCATION_TRACER: APP_ROUTES.LOCATION_TRACER,
  LOCATION_COMPARATOR: APP_ROUTES.LOCATION_COMPARATOR,
  BASE64_ENCODER: APP_ROUTES.BASE64_ENCODER,
  MARKDOWN_VIEWER: APP_ROUTES.MARKDOWN_VIEWER,
  HTML_VIEWER: APP_ROUTES.HTML_VIEWER,
  CODE_FORMATTER: APP_ROUTES.CODE_FORMATTER,
  TEXT_COMPARATOR: APP_ROUTES.TEXT_COMPARATOR,
  TIME_CONVERTER: APP_ROUTES.TIME_CONVERTER,
  TIMEZONE_CONVERTER: APP_ROUTES.TIMEZONE_CONVERTER,
  WORLD_CLOCK: APP_ROUTES.WORLD_CLOCK,
  ABOUT: APP_ROUTES.ABOUT,
  CONTACT: APP_ROUTES.CONTACT,
} as const;