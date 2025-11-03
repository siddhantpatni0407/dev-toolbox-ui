// Application-wide enums

export enum ToolType {
  JWT_DECODER = 'jwt-decoder',
  PASSWORD_GENERATOR = 'password-generator',
  LOCATION_TRACER = 'location-tracer',
  LOCATION_COMPARATOR = 'location-comparator',
  BASE64_ENCODER = 'base64-encoder',
  URL_ENCODER = 'url-encoder',
  JSON_FORMATTER = 'json-formatter',
  HASH_GENERATOR = 'hash-generator',
  MARKDOWN_VIEWER = 'markdown-viewer',
  HTML_VIEWER = 'html-viewer',
  CODE_FORMATTER = 'code-formatter',
  TEXT_COMPARATOR = 'text-comparator',
  TIME_CONVERTER = 'time-converter',
  TIMEZONE_CONVERTER = 'timezone-converter',
  WORLD_CLOCK = 'world-clock'
}

export enum ToolCategory {
  SECURITY = 'security',
  GENERATOR = 'generator',
  UTILITY = 'utility',
  ENCODER = 'encoder',
  VALIDATOR = 'validator',
  FORMATTER = 'formatter',
  VIEWER = 'viewer',
  COMPARATOR = 'comparator',
  CONVERTER = 'converter'
}

export enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
  AUTO = 'auto'
}

export enum NotificationType {
  SUCCESS = 'success',
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info'
}

export enum ButtonVariant {
  PRIMARY = 'primary',
  SECONDARY = 'secondary',
  SUCCESS = 'success',
  WARNING = 'warning',
  DANGER = 'danger',
  INFO = 'info',
  OUTLINE = 'outline',
  TEXT = 'text'
}

export enum InputSize {
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large'
}