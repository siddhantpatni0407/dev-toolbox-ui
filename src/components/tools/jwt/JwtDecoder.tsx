import React, { useState, useCallback, useEffect, useDeferredValue, useTransition, useMemo } from 'react';
import { parseJWT, validateJWT, getClaimsSummary } from '../../../utils/jwtUtils';
import { DecodedJWT, JWTValidationResult } from '../../../models/jwt';
import { ButtonVariant } from '../../../enums';
import Button from '../../common/Button';
import JsonDisplay from './JsonDisplay';
import JwtValidation from './JwtValidation';
import { DEBOUNCE_DELAY } from '../../../constants';
import { useCopyToClipboard } from '../../../hooks/useCopyToClipboard';
import './JwtDecoder.css';

/**
 * Enhanced JWT Decoder component with React 18 features and TypeScript support
 */
const JwtDecoder: React.FC = () => {
  const [token, setToken] = useState<string>('');
  const [decodedJWT, setDecodedJWT] = useState<DecodedJWT | null>(null);
  const [validationResult, setValidationResult] = useState<JWTValidationResult | null>(null);
  const [isValidToken, setIsValidToken] = useState<boolean>(false);
  
  // React 18: Use useTransition for non-urgent updates
  const [isPending, startTransition] = useTransition();
  
  // React 18: Defer expensive computations
  const deferredToken = useDeferredValue(token);
  
  // Custom hook for clipboard functionality
  const { copy } = useCopyToClipboard();

  // Parse token when deferred token changes
  const parseToken = useCallback(async (tokenValue: string): Promise<void> => {
    if (!tokenValue.trim()) {
      setDecodedJWT(null);
      setValidationResult(null);
      setIsValidToken(false);
      return;
    }

    try {
      const parsed = parseJWT(tokenValue.trim());
      const validation = validateJWT(tokenValue.trim());
      
      setDecodedJWT(parsed);
      setValidationResult(validation);
      setIsValidToken(validation.isValid && !validation.error);
    } catch (err) {
      setDecodedJWT(null);
      setValidationResult({
        isValid: false,
        error: err instanceof Error ? err.message : 'Unknown error occurred'
      });
      setIsValidToken(false);
    }
  }, []);

  // Parse token when deferred token changes with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      startTransition(() => {
        parseToken(deferredToken);
      });
    }, DEBOUNCE_DELAY);

    return () => clearTimeout(timeoutId);
  }, [deferredToken, parseToken, startTransition]);

  const handleTokenChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    setToken(e.target.value);
  };

  const clearToken = (): void => {
    setToken('');
  };

  const copyToClipboard = useCallback(async (text: string, type: string): Promise<void> => {
    const success = await copy(text);
    if (success) {
      console.log(`${type} copied to clipboard`);
    } else {
      console.error('Failed to copy to clipboard');
    }
  }, [copy]);



  // Memoize expensive computations
  const claimsSummary = useMemo(() => 
    decodedJWT ? getClaimsSummary(decodedJWT.payload) : null,
    [decodedJWT]
  );

  // Memoize token formatting
  const formattedToken = useMemo(() => {
    if (!token) return '';
    const parts = token.split('.');
    if (parts.length !== 3) return token;
    
    return parts.map((part, index) => {
      const colors = ['#fb015b', '#d63aff', '#00b9f1'];
      return (
        <span key={index} style={{ color: colors[index] }}>
          {part}
          {index < 2 && <span style={{ color: '#000' }}>.</span>}
        </span>
      );
    });
  }, [token]);

  return (
    <main className="jwt-decoder" role="main" aria-labelledby="jwt-decoder-title">
      <header className="jwt-header">
        <h1 id="jwt-decoder-title">JWT Token Decoder & Validator</h1>
        <p className="jwt-description">
          Decode, validate, and analyze JSON Web Tokens with comprehensive security checks
        </p>
      </header>

      <div className="jwt-content">
        <section className="jwt-input-section" aria-labelledby="input-section-title">
          <div className="input-header">
            <h2 id="input-section-title">Encoded JWT Token</h2>
            <div className="token-status">
              {isPending && (
                <span className="status-badge loading">🔄 Processing...</span>
              )}
              {!isPending && isValidToken && (
                <span className="status-badge valid">✅ Valid JWT</span>
              )}
              {!isPending && validationResult?.error && (
                <span className="status-badge invalid">❌ Invalid JWT</span>
              )}
            </div>
          </div>
          
          <div className="token-input-container">
            <label htmlFor="jwt-token-input" className="visually-hidden">
              JWT Token Input
            </label>
            <textarea
              id="jwt-token-input"
              className={`token-input ${validationResult?.error ? 'error' : ''} ${isValidToken ? 'valid' : ''}`}
              placeholder="Paste your JWT token here to decode and analyze..."
              value={token}
              onChange={handleTokenChange}
              rows={6}
              disabled={isPending}
              aria-label="JWT token input field"
              aria-describedby="token-status token-help"
              aria-invalid={validationResult?.error ? 'true' : 'false'}
            />
            <div className="input-actions">
              {token && (
                <Button
                  variant={ButtonVariant.TEXT}
                  onClick={() => copyToClipboard(token, 'Token')}
                  title="Copy token to clipboard"
                  icon="📋"
                >
                  Copy
                </Button>
              )}
              <Button
                variant={ButtonVariant.TEXT}
                onClick={clearToken}
                title="Clear token"
                icon="🗑️"
                disabled={!token || isPending}
              >
                Clear
              </Button>
            </div>
          </div>

          {token && (
            <div className="token-preview">
              <div className="token-preview-header">
                <span>Token Structure Preview:</span>
              </div>
              <div className="token-preview-content">
                {formattedToken}
              </div>
              {claimsSummary && (
                <div className="claims-summary">
                  <span>📊 {claimsSummary.totalClaims} total claims</span>
                  <span>📋 {claimsSummary.standardClaims} standard</span>
                  <span>⚙️ {claimsSummary.customClaims} custom</span>
                </div>
              )}
            </div>
          )}
        </section>

        <section className="jwt-output-section" aria-labelledby="output-section-title">
          <div className="output-header">
            <h2 id="output-section-title">Decoded JWT Components</h2>
            {decodedJWT && (
              <div className="output-actions">
                <Button
                  variant={ButtonVariant.TEXT}
                  onClick={() => copyToClipboard(JSON.stringify(decodedJWT.header, null, 2), 'Header')}
                  title="Copy header to clipboard"
                  icon="📋"
                >
                  Header
                </Button>
                <Button
                  variant={ButtonVariant.TEXT}
                  onClick={() => copyToClipboard(JSON.stringify(decodedJWT.payload, null, 2), 'Payload')}
                  title="Copy payload to clipboard"
                  icon="📋"
                >
                  Payload
                </Button>
              </div>
            )}
          </div>

          {validationResult?.error && (
            <div className="error-display">
              <div className="error-icon">⚠️</div>
              <div className="error-content">
                <div className="error-title">Invalid JWT Token</div>
                <div className="error-message">{validationResult.error}</div>
                <div className="error-help">
                  <p><strong>Common issues:</strong></p>
                  <ul>
                    <li>Token must have exactly 3 parts separated by dots</li>
                    <li>Each part must be valid base64 encoded</li>
                    <li>Header and payload must contain valid JSON</li>
                    <li>Check for any extra spaces or characters</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {validationResult?.warnings && validationResult.warnings.length > 0 && (
            <div className="warnings-display">
              <div className="warning-icon">⚠️</div>
              <div className="warning-content">
                <div className="warning-title">Token Warnings</div>
                <ul className="warning-list">
                  {validationResult.warnings.map((warning, index) => (
                    <li key={index} className="warning-item">{warning}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {decodedJWT && (
            <div className="decoded-sections">
              <JsonDisplay 
                data={decodedJWT.header} 
                title="HEADER: ALGORITHM & TOKEN TYPE"
                className="header"
              />
              
              <JsonDisplay 
                data={decodedJWT.payload} 
                title="PAYLOAD: CLAIMS DATA"
                className="payload"
              />
              
              <div className="signature-section">
                <JsonDisplay 
                  data={{ signature: decodedJWT.signature || 'No signature' }} 
                  title="SIGNATURE (Base64 Encoded)"
                  className="signature"
                />
                <div className="signature-note">
                  <p>🔐 <strong>Signature Verification:</strong></p>
                  <p>This tool only decodes the token structure. To verify the signature, you need the secret key (HMAC) or public key (RSA/ECDSA) depending on the algorithm. Always verify signatures on your server!</p>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Validation Panel */}
      <div className="jwt-validation-section">
        <JwtValidation 
          header={decodedJWT?.header}
          payload={decodedJWT?.payload}
          signature={decodedJWT?.signature}
          validationResult={validationResult}
        />
      </div>

      {/* Information Panel */}
      <div className="jwt-info-section">
        <div className="info-header">
          <h2>JWT Token Information</h2>
        </div>
        <div className="info-content">
          <div className="info-grid">
            <div className="info-card">
              <div className="info-icon">🏗️</div>
              <h3>Token Structure</h3>
              <p>JWT tokens consist of three Base64-URL encoded parts separated by dots: <code>header.payload.signature</code></p>
            </div>
            <div className="info-card">
              <div className="info-icon">🔑</div>
              <h3>Standard Claims</h3>
              <p>Common claims include <code>iss</code> (issuer), <code>sub</code> (subject), <code>aud</code> (audience), <code>exp</code> (expiration), and <code>iat</code> (issued at).</p>
            </div>
            <div className="info-card">
              <div className="info-icon">🔒</div>
              <h3>Security Notice</h3>
              <p>This tool processes tokens entirely in your browser. Never share sensitive tokens. Always validate signatures server-side in production.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default JwtDecoder;