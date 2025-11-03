export interface Base64Result {
  success: boolean;
  result: string;
  error?: string;
}

export interface Base64Operation {
  type: 'encode' | 'decode';
  input: string;
  output: string;
  timestamp: Date;
}

export interface Base64ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface Base64Options {
  urlSafe?: boolean;
  padding?: boolean;
  lineBreaks?: boolean;
  maxLineLength?: number;
}

export interface Base64FileResult {
  fileName: string;
  fileSize: number;
  mimeType: string;
  base64Data: string;
}

// Supported file types for Base64 encoding
export const SUPPORTED_FILE_TYPES = {
  'image/jpeg': { extension: 'jpg', description: 'JPEG Image' },
  'image/png': { extension: 'png', description: 'PNG Image' },
  'image/gif': { extension: 'gif', description: 'GIF Image' },
  'image/svg+xml': { extension: 'svg', description: 'SVG Image' },
  'text/plain': { extension: 'txt', description: 'Text File' },
  'application/json': { extension: 'json', description: 'JSON File' },
  'application/pdf': { extension: 'pdf', description: 'PDF Document' },
  'application/xml': { extension: 'xml', description: 'XML File' },
  'text/html': { extension: 'html', description: 'HTML File' },
  'text/css': { extension: 'css', description: 'CSS File' },
  'text/javascript': { extension: 'js', description: 'JavaScript File' },
} as const;

export type SupportedMimeType = keyof typeof SUPPORTED_FILE_TYPES;

// Common Base64 patterns for validation
export const BASE64_PATTERNS = {
  standard: /^[A-Za-z0-9+/]*={0,2}$/,
  urlSafe: /^[A-Za-z0-9_-]*={0,2}$/,
  dataUri: /^data:([a-zA-Z0-9][a-zA-Z0-9!#$&\-^_]*\/[a-zA-Z0-9][a-zA-Z0-9!#$&\-^_]*)?;base64,(.+)$/,
} as const;

// Example Base64 strings for testing
export const BASE64_EXAMPLES = {
  text: {
    plain: 'Hello, World!',
    encoded: 'SGVsbG8sIFdvcmxkIQ==',
  },
  json: {
    plain: '{"name": "John", "age": 30}',
    encoded: 'eyJuYW1lIjogIkpvaG4iLCAiYWdlIjogMzB9',
  },
  html: {
    plain: '<html><body><h1>Hello</h1></body></html>',
    encoded: 'PGh0bWw+PGJvZHk+PGgxPkhlbGxvPC9oMT48L2JvZHk+PC9odG1sPg==',
  },
  url: {
    plain: 'https://example.com/path?param=value',
    encoded: 'aHR0cHM6Ly9leGFtcGxlLmNvbS9wYXRoP3BhcmFtPXZhbHVl',
  },
} as const;