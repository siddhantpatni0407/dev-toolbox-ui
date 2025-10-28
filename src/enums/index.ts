// Application-wide enums

export enum ToolType {
  JWT_DECODER = 'jwt-decoder',
  PASSWORD_GENERATOR = 'password-generator',
  BASE64_ENCODER = 'base64-encoder',
  URL_ENCODER = 'url-encoder',
  JSON_FORMATTER = 'json-formatter',
  HASH_GENERATOR = 'hash-generator'
}

export enum ToolCategory {
  SECURITY = 'security',
  GENERATOR = 'generator',
  ENCODER = 'encoder',
  VALIDATOR = 'validator',
  FORMATTER = 'formatter'
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