/**
 * Enhanced JWT utility functions with TypeScript support
 */

import { 
  JWTHeader, 
  JWTPayload, 
  DecodedJWT, 
  TokenExpiryInfo, 
  AlgorithmInfo,
  JWTValidationResult,
  JWTAlgorithm 
} from '../models/jwt';

/**
 * Base64 URL decode function
 */
export const base64UrlDecode = (str: string): string => {
  try {
    // Add padding if needed
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    
    // Decode base64
    const decoded = atob(base64);
    
    // Convert to UTF-8
    return decodeURIComponent(escape(decoded));
  } catch (error) {
    throw new Error('Invalid base64 encoding');
  }
};

/**
 * Validate JWT token format
 */
export const isValidJWTFormat = (token: string): boolean => {
  if (!token || typeof token !== 'string') {
    return false;
  }
  
  const parts = token.split('.');
  return parts.length === 3;
};

/**
 * Parse JWT token into its components
 */
export const parseJWT = (token: string): DecodedJWT => {
  if (!isValidJWTFormat(token)) {
    throw new Error('Invalid JWT format. Token must have exactly 3 parts separated by dots.');
  }
  
  const [headerB64, payloadB64, signature] = token.split('.');
  
  try {
    const header: JWTHeader = JSON.parse(base64UrlDecode(headerB64));
    const payload: JWTPayload = JSON.parse(base64UrlDecode(payloadB64));
    
    return {
      header,
      payload,
      signature,
      raw: {
        header: headerB64,
        payload: payloadB64,
        signature
      }
    };
  } catch (error) {
    throw new Error('Invalid JWT: Unable to decode header or payload');
  }
};

/**
 * Check if JWT token is expired and get expiry information
 */
export const checkTokenExpiry = (payload: JWTPayload): TokenExpiryInfo => {
  const now = Math.floor(Date.now() / 1000);
  
  const result: TokenExpiryInfo = {
    hasExp: !!payload.exp,
    hasIat: !!payload.iat,
    hasNbf: !!payload.nbf,
    isExpired: false,
    isActive: true,
    expiryDate: null,
    issuedDate: null,
    notBeforeDate: null,
    timeUntilExpiry: null
  };
  
  if (payload.exp) {
    result.expiryDate = new Date(payload.exp * 1000);
    result.isExpired = payload.exp < now;
    result.timeUntilExpiry = payload.exp - now;
  }
  
  if (payload.iat) {
    result.issuedDate = new Date(payload.iat * 1000);
  }
  
  if (payload.nbf) {
    result.notBeforeDate = new Date(payload.nbf * 1000);
    result.isActive = payload.nbf <= now;
  }
  
  return result;
};

/**
 * Get human-readable time difference
 */
export const getHumanReadableTime = (seconds: number): string => {
  const absSeconds = Math.abs(seconds);
  const isPast = seconds < 0;
  
  let value: number;
  let unit: string;
  
  if (absSeconds < 60) {
    value = absSeconds;
    unit = 'second';
  } else if (absSeconds < 3600) {
    value = Math.floor(absSeconds / 60);
    unit = 'minute';
  } else if (absSeconds < 86400) {
    value = Math.floor(absSeconds / 3600);
    unit = 'hour';
  } else {
    value = Math.floor(absSeconds / 86400);
    unit = 'day';
  }
  
  const plural = value !== 1 ? 's' : '';
  const timeString = `${value} ${unit}${plural}`;
  
  return isPast ? `${timeString} ago` : `in ${timeString}`;
};

/**
 * Validate JWT algorithm
 */
export const validateAlgorithm = (header: JWTHeader): AlgorithmInfo => {
  const supportedAlgorithms: JWTAlgorithm[] = [
    'HS256', 'HS384', 'HS512', 
    'RS256', 'RS384', 'RS512', 
    'ES256', 'ES384', 'ES512', 
    'PS256', 'PS384', 'PS512'
  ];
  
  const algorithm = header.alg || 'none';
  
  return {
    algorithm,
    isSupported: supportedAlgorithms.includes(algorithm as JWTAlgorithm),
    type: header.typ || 'JWT'
  };
};

/**
 * Validate JWT token comprehensively
 */
export const validateJWT = (token: string): JWTValidationResult => {
  const warnings: string[] = [];
  
  try {
    if (!isValidJWTFormat(token)) {
      return {
        isValid: false,
        error: 'Invalid JWT format. Token must have exactly 3 parts separated by dots.'
      };
    }
    
    const decoded = parseJWT(token);
    const algorithmInfo = validateAlgorithm(decoded.header);
    const expiryInfo = checkTokenExpiry(decoded.payload);
    
    // Check for common issues
    if (!algorithmInfo.isSupported) {
      warnings.push(`Algorithm '${algorithmInfo.algorithm}' may not be supported`);
    }
    
    if (expiryInfo.isExpired) {
      warnings.push('Token has expired');
    }
    
    if (!expiryInfo.isActive && decoded.payload.nbf) {
      warnings.push('Token is not yet active (nbf claim)');
    }
    
    if (!decoded.payload.iss) {
      warnings.push('Missing issuer (iss) claim');
    }
    
    if (!decoded.payload.sub) {
      warnings.push('Missing subject (sub) claim');
    }
    
    if (!decoded.signature) {
      warnings.push('Token is missing signature');
    }
    
    return {
      isValid: true,
      warnings: warnings.length > 0 ? warnings : undefined
    };
    
  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error.message : 'Unknown validation error'
    };
  }
};

/**
 * Extract claims summary from JWT payload
 */
export const getClaimsSummary = (payload: JWTPayload): Record<string, any> => {
  const standardClaims = ['iss', 'sub', 'aud', 'exp', 'nbf', 'iat', 'jti'];
  const customClaims: Record<string, any> = {};
  
  Object.keys(payload).forEach(key => {
    if (!standardClaims.includes(key)) {
      customClaims[key] = payload[key];
    }
  });
  
  return {
    standardClaims: Object.keys(payload).filter(key => standardClaims.includes(key)).length,
    customClaims: Object.keys(customClaims).length,
    totalClaims: Object.keys(payload).length,
    customClaimsList: customClaims
  };
};