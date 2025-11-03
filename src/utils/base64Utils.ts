import { 
  Base64Result, 
  Base64ValidationResult, 
  Base64Options, 
  Base64FileResult,
  BASE64_PATTERNS,
  SUPPORTED_FILE_TYPES,
  SupportedMimeType
} from '../models/base64';

/**
 * Encode string to Base64
 */
export const encodeToBase64 = (input: string, options: Base64Options = {}): Base64Result => {
  try {
    if (!input) {
      return {
        success: false,
        result: '',
        error: 'Input cannot be empty'
      };
    }

    // Use btoa for basic encoding (browser native)
    let encoded = btoa(unescape(encodeURIComponent(input)));

    // Apply options
    if (options.urlSafe) {
      encoded = encoded.replace(/\+/g, '-').replace(/\//g, '_');
    }

    if (options.padding === false) {
      encoded = encoded.replace(/=/g, '');
    }

    if (options.lineBreaks && options.maxLineLength) {
      encoded = encoded.match(new RegExp(`.{1,${options.maxLineLength}}`, 'g'))?.join('\n') || encoded;
    }

    return {
      success: true,
      result: encoded
    };
  } catch (error) {
    return {
      success: false,
      result: '',
      error: `Encoding failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
};

/**
 * Decode Base64 to string
 */
export const decodeFromBase64 = (input: string, options: Base64Options = {}): Base64Result => {
  try {
    if (!input) {
      return {
        success: false,
        result: '',
        error: 'Input cannot be empty'
      };
    }

    let normalized = input.trim();

    // Remove line breaks if present
    normalized = normalized.replace(/\s/g, '');

    // Handle URL-safe Base64
    if (options.urlSafe || normalized.includes('-') || normalized.includes('_')) {
      normalized = normalized.replace(/-/g, '+').replace(/_/g, '/');
    }

    // Add padding if missing
    while (normalized.length % 4) {
      normalized += '=';
    }

    // Validate format
    const validationResult = validateBase64(normalized);
    if (!validationResult.isValid) {
      return {
        success: false,
        result: '',
        error: validationResult.error
      };
    }

    // Use atob for basic decoding (browser native)
    const decoded = decodeURIComponent(escape(atob(normalized)));

    return {
      success: true,
      result: decoded
    };
  } catch (error) {
    return {
      success: false,
      result: '',
      error: `Decoding failed: ${error instanceof Error ? error.message : 'Invalid Base64 format'}`
    };
  }
};

/**
 * Validate Base64 string format
 */
export const validateBase64 = (input: string): Base64ValidationResult => {
  if (!input || typeof input !== 'string') {
    return {
      isValid: false,
      error: 'Input must be a non-empty string'
    };
  }

  const trimmed = input.trim().replace(/\s/g, '');

  // Check if it's a data URI
  if (trimmed.startsWith('data:')) {
    const dataUriMatch = trimmed.match(BASE64_PATTERNS.dataUri);
    if (!dataUriMatch) {
      return {
        isValid: false,
        error: 'Invalid data URI format'
      };
    }
    return { isValid: true };
  }

  // Check length (must be multiple of 4 when properly padded)
  if (trimmed.length % 4 !== 0 && !trimmed.includes('-') && !trimmed.includes('_')) {
    return {
      isValid: false,
      error: 'Invalid Base64 length (must be multiple of 4)'
    };
  }

  // Check for URL-safe Base64
  if (trimmed.includes('-') || trimmed.includes('_')) {
    if (!BASE64_PATTERNS.urlSafe.test(trimmed)) {
      return {
        isValid: false,
        error: 'Invalid URL-safe Base64 characters'
      };
    }
  } else {
    // Check for standard Base64
    if (!BASE64_PATTERNS.standard.test(trimmed)) {
      return {
        isValid: false,
        error: 'Invalid Base64 characters'
      };
    }
  }

  return { isValid: true };
};

/**
 * Detect if string is Base64 encoded
 */
export const isBase64 = (input: string): boolean => {
  return validateBase64(input).isValid;
};

/**
 * Convert file to Base64
 */
export const fileToBase64 = (file: File): Promise<Base64FileResult> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      try {
        const result = reader.result as string;
        const base64Data = result.split(',')[1]; // Remove data URI prefix
        
        resolve({
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
          base64Data
        });
      } catch (error) {
        reject(new Error(`Failed to convert file: ${error instanceof Error ? error.message : 'Unknown error'}`));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsDataURL(file);
  });
};

/**
 * Convert Base64 to downloadable file
 */
export const base64ToFile = (base64Data: string, fileName: string, mimeType: string): Blob => {
  // Remove data URI prefix if present
  const cleanBase64 = base64Data.replace(/^data:[^;]+;base64,/, '');
  
  // Convert to binary
  const binaryString = atob(cleanBase64);
  const bytes = new Uint8Array(binaryString.length);
  
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  
  return new Blob([bytes], { type: mimeType });
};

/**
 * Download Base64 as file
 */
export const downloadBase64AsFile = (base64Data: string, fileName: string, mimeType: string): void => {
  try {
    const blob = base64ToFile(base64Data, fileName, mimeType);
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up
    URL.revokeObjectURL(url);
  } catch (error) {
    throw new Error(`Download failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Get file info from Base64 data URI
 */
export const parseDataUri = (dataUri: string): { mimeType: string; base64Data: string } | null => {
  const match = dataUri.match(BASE64_PATTERNS.dataUri);
  if (!match) return null;
  
  return {
    mimeType: match[1] || 'text/plain',
    base64Data: match[2]
  };
};

/**
 * Create data URI from Base64
 */
export const createDataUri = (base64Data: string, mimeType: string): string => {
  return `data:${mimeType};base64,${base64Data}`;
};

/**
 * Get file size from Base64 string
 */
export const getBase64Size = (base64Data: string): number => {
  // Remove padding and calculate size
  const cleanBase64 = base64Data.replace(/=/g, '');
  return Math.floor((cleanBase64.length * 3) / 4);
};

/**
 * Format file size for display
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Get MIME type description
 */
export const getMimeTypeDescription = (mimeType: string): string => {
  return SUPPORTED_FILE_TYPES[mimeType as SupportedMimeType]?.description || 'Unknown file type';
};

/**
 * Check if MIME type is supported
 */
export const isSupportedMimeType = (mimeType: string): boolean => {
  return mimeType in SUPPORTED_FILE_TYPES;
};