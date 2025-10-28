// JWT Token related interfaces and types

export interface JWTHeader {
  alg: string;
  typ: string;
  kid?: string;
  [key: string]: any;
}

export interface JWTPayload {
  iss?: string; // Issuer
  sub?: string; // Subject
  aud?: string | string[]; // Audience
  exp?: number; // Expiration time
  nbf?: number; // Not before
  iat?: number; // Issued at
  jti?: string; // JWT ID
  [key: string]: any;
}

export interface DecodedJWT {
  header: JWTHeader;
  payload: JWTPayload;
  signature: string;
  raw: {
    header: string;
    payload: string;
    signature: string;
  };
}

export interface JWTValidationResult {
  isValid: boolean;
  error?: string;
  warnings?: string[];
}

export interface TokenExpiryInfo {
  hasExp: boolean;
  hasIat: boolean;
  hasNbf: boolean;
  isExpired: boolean;
  isActive: boolean;
  expiryDate: Date | null;
  issuedDate: Date | null;
  notBeforeDate: Date | null;
  timeUntilExpiry: number | null;
}

export interface AlgorithmInfo {
  algorithm: string;
  isSupported: boolean;
  type: string;
}

export type JWTAlgorithm = 
  | 'HS256' | 'HS384' | 'HS512'
  | 'RS256' | 'RS384' | 'RS512'
  | 'ES256' | 'ES384' | 'ES512'
  | 'PS256' | 'PS384' | 'PS512';