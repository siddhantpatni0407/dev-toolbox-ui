import React from 'react';
import { 
  checkTokenExpiry, 
  validateAlgorithm, 
  getHumanReadableTime 
} from '../../../utils/jwtUtils';
import { 
  JWTHeader, 
  JWTPayload, 
  JWTValidationResult 
} from '../../../models/jwt';
import { BaseComponent } from '../../../models/common';
import './JwtValidation.css';

interface JwtValidationProps extends BaseComponent {
  header?: JWTHeader;
  payload?: JWTPayload;
  signature?: string;
  validationResult?: JWTValidationResult | null;
}

interface ValidationItemProps {
  icon: string;
  title: string;
  value: string;
  status: 'success' | 'error' | 'warning' | 'info';
  details?: string;
}

/**
 * Enhanced JWT validation component with comprehensive analysis
 */
const JwtValidation: React.FC<JwtValidationProps> = ({ 
  header, 
  payload, 
  signature, 
  validationResult,
  className = '',
  id 
}) => {
  const ValidationItem: React.FC<ValidationItemProps> = ({ 
    icon, 
    title, 
    value, 
    status, 
    details 
  }) => (
    <div className={`validation-item ${status}`}>
      <div className="validation-icon">{icon}</div>
      <div className="validation-content">
        <div className="validation-title">{title}</div>
        <div className="validation-value">{value}</div>
        {details && <div className="validation-details">{details}</div>}
      </div>
    </div>
  );

  // Show error state
  if (validationResult?.error) {
    return (
      <div className={`jwt-validation error ${className}`} id={id}>
        <div className="validation-header">
          <h3>❌ Validation Error</h3>
        </div>
        <div className="error-message">
          {validationResult.error}
        </div>
      </div>
    );
  }

  // Show empty state
  if (!header || !payload) {
    return (
      <div className={`jwt-validation ${className}`} id={id}>
        <div className="validation-header">
          <h3>🔍 JWT Token Analysis</h3>
        </div>
        <div className="validation-placeholder">
          <div className="placeholder-icon">📝</div>
          <div className="placeholder-text">
            <h4>Ready to Analyze</h4>
            <p>Enter a JWT token above to see comprehensive validation and security analysis</p>
          </div>
        </div>
      </div>
    );
  }

  const expiryInfo = checkTokenExpiry(payload);
  const algorithmInfo = validateAlgorithm(header);
  const now = Math.floor(Date.now() / 1000);

  // Calculate security score
  const calculateSecurityScore = (): { score: number; level: string; color: string } => {
    let score = 0;
    
    // Algorithm security
    if (algorithmInfo.isSupported && algorithmInfo.algorithm !== 'none') score += 20;
    
    // Has signature
    if (signature && signature.length > 0) score += 20;
    
    // Has expiration
    if (expiryInfo.hasExp) score += 15;
    
    // Not expired
    if (!expiryInfo.isExpired) score += 15;
    
    // Has issuer
    if (payload.iss) score += 10;
    
    // Has subject
    if (payload.sub) score += 10;
    
    // Has audience
    if (payload.aud) score += 10;
    
    let level: string;
    let color: string;
    
    if (score >= 80) {
      level = 'Excellent';
      color = 'var(--color-success)';
    } else if (score >= 60) {
      level = 'Good';
      color = 'var(--color-warning)';
    } else if (score >= 40) {
      level = 'Fair';
      color = '#f97316';
    } else {
      level = 'Poor';
      color = 'var(--color-error)';
    }
    
    return { score, level, color };
  };

  const securityScore = calculateSecurityScore();

  return (
    <div className={`jwt-validation ${className}`} id={id}>
      <div className="validation-header">
        <div className="header-content">
          <h3>🔍 JWT Security Analysis</h3>
          <div className="security-score">
            <div 
              className="score-circle"
              style={{ 
                background: `conic-gradient(${securityScore.color} ${securityScore.score * 3.6}deg, var(--color-surface) 0deg)` 
              }}
            >
              <div className="score-inner">
                <span className="score-number">{securityScore.score}</span>
                <span className="score-total">/100</span>
              </div>
            </div>
            <div className="score-info">
              <div className="score-level" style={{ color: securityScore.color }}>
                {securityScore.level}
              </div>
              <div className="score-label">Security Score</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="validation-sections">
        <div className="validation-section">
          <h4>🔐 Algorithm & Structure</h4>
          <ValidationItem
            icon="🏗️"
            title="Algorithm"
            value={algorithmInfo.algorithm}
            status={algorithmInfo.isSupported && algorithmInfo.algorithm !== 'none' ? 'success' : 'warning'}
            details={
              algorithmInfo.algorithm === 'none' 
                ? 'Unsigned token - not recommended for production'
                : algorithmInfo.isSupported 
                ? 'Supported and secure algorithm' 
                : 'Algorithm may not be widely supported'
            }
          />
          <ValidationItem
            icon="📋"
            title="Token Type"
            value={algorithmInfo.type}
            status="info"
            details="Token format specification"
          />
          <ValidationItem
            icon={signature ? "✅" : "⚠️"}
            title="Signature"
            value={signature ? "Present" : "Missing"}
            status={signature ? "success" : "warning"}
            details={
              signature 
                ? `Signature length: ${signature.length} characters`
                : "Token is not signed - vulnerable to tampering"
            }
          />
        </div>

        <div className="validation-section">
          <h4>⏰ Time Validation</h4>
          
          {expiryInfo.hasIat && (
            <ValidationItem
              icon="🕐"
              title="Issued At (iat)"
              value={expiryInfo.issuedDate!.toLocaleString()}
              status="info"
              details={`Token was issued ${getHumanReadableTime(payload.iat! - now)}`}
            />
          )}

          {expiryInfo.hasNbf && (
            <ValidationItem
              icon={expiryInfo.isActive ? "✅" : "⏳"}
              title="Not Before (nbf)"
              value={expiryInfo.notBeforeDate!.toLocaleString()}
              status={expiryInfo.isActive ? "success" : "warning"}
              details={
                expiryInfo.isActive 
                  ? "Token is currently active" 
                  : `Token becomes active ${getHumanReadableTime(payload.nbf! - now)}`
              }
            />
          )}

          {expiryInfo.hasExp ? (
            <ValidationItem
              icon={expiryInfo.isExpired ? "❌" : "✅"}
              title="Expiration (exp)"
              value={expiryInfo.expiryDate!.toLocaleString()}
              status={expiryInfo.isExpired ? "error" : "success"}
              details={
                expiryInfo.isExpired 
                  ? `Token expired ${getHumanReadableTime(expiryInfo.timeUntilExpiry!)}`
                  : `Token expires ${getHumanReadableTime(expiryInfo.timeUntilExpiry!)}`
              }
            />
          ) : (
            <ValidationItem
              icon="⚠️"
              title="Expiration"
              value="No expiration set"
              status="warning"
              details="Token does not expire - security risk for long-term storage"
            />
          )}
        </div>

        <div className="validation-section">
          <h4>👤 Claims Information</h4>
          
          <ValidationItem
            icon="🏢"
            title="Issuer (iss)"
            value={payload.iss || 'Not specified'}
            status={payload.iss ? 'success' : 'warning'}
            details={payload.iss ? 'Token issuer is specified' : 'Missing issuer claim - affects trust verification'}
          />

          <ValidationItem
            icon="👤"
            title="Subject (sub)"
            value={payload.sub || 'Not specified'}
            status={payload.sub ? 'success' : 'info'}
            details={payload.sub ? 'Subject (user) identifier present' : 'No subject claim specified'}
          />

          {payload.aud && (
            <ValidationItem
              icon="🎯"
              title="Audience (aud)"
              value={Array.isArray(payload.aud) ? payload.aud.join(', ') : payload.aud}
              status="success"
              details="Intended audience is specified"
            />
          )}

          {payload.jti && (
            <ValidationItem
              icon="🆔"
              title="JWT ID (jti)"
              value={payload.jti}
              status="info"
              details="Unique token identifier present"
            />
          )}

          <ValidationItem
            icon="📊"
            title="Total Claims"
            value={`${Object.keys(payload).length} claims`}
            status="info"
            details={`Standard: ${['iss', 'sub', 'aud', 'exp', 'nbf', 'iat', 'jti'].filter(claim => payload[claim as keyof JWTPayload]).length}, Custom: ${Object.keys(payload).length - ['iss', 'sub', 'aud', 'exp', 'nbf', 'iat', 'jti'].filter(claim => payload[claim as keyof JWTPayload]).length}`}
          />
        </div>

        {validationResult?.warnings && validationResult.warnings.length > 0 && (
          <div className="validation-section warnings-section">
            <h4>⚠️ Security Warnings</h4>
            {validationResult.warnings.map((warning, index) => (
              <div key={index} className="warning-item">
                <span className="warning-icon">⚠️</span>
                <span className="warning-text">{warning}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="validation-summary">
        <div className={`summary-badge ${expiryInfo.isExpired ? 'invalid' : 'valid'}`}>
          {expiryInfo.isExpired ? '❌ Token Expired' : '✅ Token Valid'}
        </div>
        <div className="summary-details">
          Security Level: <strong style={{ color: securityScore.color }}>{securityScore.level}</strong>
        </div>
      </div>
    </div>
  );
};

export default JwtValidation;