import React, { useState, useCallback } from 'react';
import { 
  generatePassword, 
  getDefaultPasswordOptions, 
  analyzePasswordStrength 
} from '../../../utils/passwordUtils';
import { PasswordOptions, GeneratedPassword } from '../../../models/password';
import { ButtonVariant, InputSize } from '../../../enums';
import { PASSWORD_DEFAULTS } from '../../../constants';
import Button from '../../common/Button';
import ToolHeader from '../../common/ToolHeader';
import './PasswordGenerator.css';

/**
 * Password Generator component with comprehensive options
 */
const PasswordGenerator: React.FC = () => {
  const [options, setOptions] = useState<PasswordOptions>(getDefaultPasswordOptions());
  const [generatedPassword, setGeneratedPassword] = useState<GeneratedPassword | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [customInput, setCustomInput] = useState<string>('');

  const handleGenerate = useCallback(async (): Promise<void> => {
    if (isGenerating) return;
    
    setIsGenerating(true);
    
    try {
      // Add small delay for better UX
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const result = generatePassword(options);
      setGeneratedPassword(result);
    } catch (error) {
      console.error('Password generation failed:', error);
      // You could add error handling here
    } finally {
      setIsGenerating(false);
    }
  }, [options, isGenerating]);

  const handleOptionsChange = (newOptions: Partial<PasswordOptions>): void => {
    setOptions(prev => ({ ...prev, ...newOptions }));
  };

  const copyToClipboard = async (text: string): Promise<void> => {
    try {
      await navigator.clipboard.writeText(text);
      console.log('Password copied to clipboard');
    } catch (err) {
      console.error('Failed to copy password:', err);
    }
  };

  const analyzeCustomPassword = (): void => {
    if (!customInput.trim()) return;
    
    const strength = analyzePasswordStrength(customInput.trim());
    setGeneratedPassword({
      password: customInput.trim(),
      strength,
      entropy: 0, // Would need to calculate properly
      timeToCrack: 'Unknown',
      patterns: []
    });
  };

  return (
    <div className="password-generator">
      <ToolHeader
        title="Secure Password Generator"
        description="Generate strong, random passwords with customizable options"
      />

      <div className="password-content">
        <div className="generator-section">
          <div className="section-header">
            <h2>Password Options</h2>
          </div>

          <div className="options-grid">
            <div className="option-group">
              <label className="option-label">
                <span>Password Length</span>
                <input
                  type="range"
                  min={PASSWORD_DEFAULTS.MIN_LENGTH}
                  max={PASSWORD_DEFAULTS.MAX_LENGTH}
                  value={options.length}
                  onChange={(e) => handleOptionsChange({ length: parseInt(e.target.value) })}
                  className="length-slider"
                />
                <span className="length-value">{options.length}</span>
              </label>
            </div>

            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={options.includeUppercase}
                  onChange={(e) => handleOptionsChange({ includeUppercase: e.target.checked })}
                />
                <span>Uppercase Letters (A-Z)</span>
              </label>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={options.includeLowercase}
                  onChange={(e) => handleOptionsChange({ includeLowercase: e.target.checked })}
                />
                <span>Lowercase Letters (a-z)</span>
              </label>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={options.includeNumbers}
                  onChange={(e) => handleOptionsChange({ includeNumbers: e.target.checked })}
                />
                <span>Numbers (0-9)</span>
              </label>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={options.includeSymbols}
                  onChange={(e) => handleOptionsChange({ includeSymbols: e.target.checked })}
                />
                <span>Special Characters (!@#$%...)</span>
              </label>
            </div>

            <div className="advanced-options">
              <h3>Advanced Options</h3>
              
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={options.excludeSimilar}
                  onChange={(e) => handleOptionsChange({ excludeSimilar: e.target.checked })}
                />
                <span>Exclude Similar Characters (il1Lo0O)</span>
              </label>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={options.excludeAmbiguous}
                  onChange={(e) => handleOptionsChange({ excludeAmbiguous: e.target.checked })}
                />
                <span>Exclude Ambiguous Characters ({'{}[]()...'})</span>
              </label>
            </div>

            <div className="action-buttons">
              <Button
                variant={ButtonVariant.PRIMARY}
                size={InputSize.LARGE}
                onClick={handleGenerate}
                loading={isGenerating}
                disabled={!options.includeUppercase && !options.includeLowercase && !options.includeNumbers && !options.includeSymbols}
              >
                🎲 Generate Password
              </Button>
            </div>
          </div>
        </div>

        <div className="result-section">
          <div className="section-header">
            <h2>Generated Password</h2>
          </div>

          {generatedPassword ? (
            <div className="password-result">
              <div className="password-display">
                <div className="password-field">
                  <input
                    type="text"
                    value={generatedPassword.password}
                    readOnly
                    className="password-input"
                  />
                  <Button
                    variant={ButtonVariant.OUTLINE}
                    onClick={() => copyToClipboard(generatedPassword.password)}
                    icon="📋"
                  >
                    Copy
                  </Button>
                </div>
              </div>

              <div className="password-analysis">
                <div className="strength-indicator">
                  <div className="strength-label">
                    <span>Strength:</span>
                    <span 
                      className="strength-badge"
                      style={{ color: generatedPassword.strength.color }}
                    >
                      {generatedPassword.strength.label}
                    </span>
                  </div>
                  <div className="strength-bar">
                    <div 
                      className="strength-fill"
                      style={{ 
                        width: `${(generatedPassword.strength.score / 4) * 100}%`,
                        backgroundColor: generatedPassword.strength.color 
                      }}
                    />
                  </div>
                </div>

                <div className="password-stats">
                  <div className="stat-item">
                    <span className="stat-label">Length:</span>
                    <span className="stat-value">{generatedPassword.password.length} characters</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Entropy:</span>
                    <span className="stat-value">{Math.round(generatedPassword.entropy)} bits</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Time to crack:</span>
                    <span className="stat-value">{generatedPassword.timeToCrack}</span>
                  </div>
                </div>

                {generatedPassword.strength.feedback.length > 0 && (
                  <div className="strength-feedback">
                    <h4>Suggestions:</h4>
                    <ul>
                      {generatedPassword.strength.feedback.map((feedback, index) => (
                        <li key={index}>{feedback}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {generatedPassword.patterns.length > 0 && (
                  <div className="pattern-warnings">
                    <h4>⚠️ Detected Patterns:</h4>
                    <ul>
                      {generatedPassword.patterns.map((pattern, index) => (
                        <li key={index}>{pattern}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="password-placeholder">
              <div className="placeholder-icon">🔐</div>
              <div className="placeholder-text">
                <h3>Ready to Generate</h3>
                <p>Configure your options and click "Generate Password" to create a secure password</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="custom-analysis-section">
        <div className="section-header">
          <h2>Analyze Your Password</h2>
        </div>
        
        <div className="custom-input-group">
          <input
            type="password"
            placeholder="Enter a password to analyze its strength..."
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            className="custom-password-input"
          />
          <Button
            variant={ButtonVariant.SECONDARY}
            onClick={analyzeCustomPassword}
            disabled={!customInput.trim()}
          >
            Analyze
          </Button>
        </div>
      </div>

      <div className="password-info-section">
        <div className="section-header">
          <h2>Password Security Tips</h2>
        </div>
        
        <div className="tips-grid">
          <div className="tip-card">
            <div className="tip-icon">📏</div>
            <h3>Length Matters</h3>
            <p>Longer passwords are exponentially harder to crack. Aim for at least 12 characters.</p>
          </div>
          
          <div className="tip-card">
            <div className="tip-icon">🎭</div>
            <h3>Mix Character Types</h3>
            <p>Use uppercase, lowercase, numbers, and special characters for maximum security.</p>
          </div>
          
          <div className="tip-card">
            <div className="tip-icon">🔄</div>
            <h3>Unique for Each Account</h3>
            <p>Never reuse passwords across different accounts or services.</p>
          </div>
          
          <div className="tip-card">
            <div className="tip-icon">🔒</div>
            <h3>Use a Password Manager</h3>
            <p>Let a password manager generate and store unique passwords for each account.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordGenerator;