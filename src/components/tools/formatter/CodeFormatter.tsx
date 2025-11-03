import React, { useState, useCallback, useEffect, useRef } from 'react';
import Button from '../../common/Button';
import ToolHeader from '../../common/ToolHeader';
import { useCopyToClipboard } from '../../../hooks/useCopyToClipboard';
import { useDebounce } from '../../../hooks/useDebounce';
import {
  formatCode,
  applySyntaxHighlighting,
  detectLanguage,
  getDefaultFormatterOptions,
  calculateStats,
  copyToClipboard as copyToClipboardUtil,
  exportFormattedCode
} from '../../../utils/formatterUtils';
import {
  FormatterOptions,
  LanguageSpecificOptions,
  CodeContent,
  SupportedLanguage,
  LANGUAGE_CONFIGS,
  FORMATTER_EXAMPLES,
  FormatterStats
} from '../../../models/formatter';
import './CodeFormatter.css';

export const CodeFormatter: React.FC = () => {
  const [input, setInput] = useState<string>('');
  const [content, setContent] = useState<CodeContent | null>(null);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>('javascript');
  const [autoDetect, setAutoDetect] = useState(true);
  const [stats, setStats] = useState<FormatterStats | null>(null);
  
  const [formatterOptions, setFormatterOptions] = useState<FormatterOptions>(getDefaultFormatterOptions());
  const [languageOptions, setLanguageOptions] = useState<LanguageSpecificOptions>({});
  
  const [activeTab, setActiveTab] = useState<'editor' | 'formatted' | 'split'>('split');
  const [showOptions, setShowOptions] = useState(false);
  const [showStats, setShowStats] = useState(false);

  const { copy } = useCopyToClipboard();
  const debouncedInput = useDebounce(input, 500);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processCode = useCallback((code: string, language: SupportedLanguage) => {
    if (!code.trim()) {
      setContent(null);
      setError('');
      setStats(null);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const startTime = performance.now();
      const result = formatCode(code, language, formatterOptions, languageOptions);
      const endTime = performance.now();
      
      if (result.success && result.content) {
        setContent(result.content);
        const formattingStats = calculateStats(code, result.content.formatted, endTime - startTime);
        setStats(formattingStats);
      } else {
        setError(result.error || 'Failed to format code');
        setContent(null);
        setStats(null);
      }
    } catch (err) {
      setError(`Processing error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setContent(null);
      setStats(null);
    } finally {
      setIsLoading(false);
    }
  }, [formatterOptions, languageOptions]);

  useEffect(() => {
    if (debouncedInput) {
      let language = selectedLanguage;
      
      if (autoDetect) {
        const detected = detectLanguage(debouncedInput);
        if (detected) {
          language = detected;
          setSelectedLanguage(detected);
        }
      }
      
      processCode(debouncedInput, language);
    } else {
      setContent(null);
      setError('');
      setStats(null);
    }
  }, [debouncedInput, selectedLanguage, autoDetect, processCode]);

  const handleLanguageChange = useCallback((language: SupportedLanguage) => {
    setSelectedLanguage(language);
    setAutoDetect(false);
    
    // Set default language-specific options
    const defaultOptions = LANGUAGE_CONFIGS[language].defaultOptions;
    setLanguageOptions(defaultOptions);
    
    if (input) {
      processCode(input, language);
    }
  }, [input, processCode]);

  const handleLoadExample = useCallback((language: SupportedLanguage) => {
    const example = FORMATTER_EXAMPLES[language];
    setInput(example);
    setSelectedLanguage(language);
    setAutoDetect(false);
    setError('');
  }, []);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text) {
        setInput(text);
        
        // Auto-detect language from filename
        const detected = detectLanguage(text, file.name);
        if (detected) {
          setSelectedLanguage(detected);
          setAutoDetect(false);
        }
        
        setError('');
      }
    };
    reader.readAsText(file);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const handleClear = useCallback(() => {
    setInput('');
    setContent(null);
    setError('');
    setStats(null);
  }, []);

  const handleCopyOriginal = useCallback(async () => {
    const success = await copyToClipboardUtil(input);
    if (success) {
      copy('Original code copied to clipboard!');
    }
  }, [input, copy]);

  const handleCopyFormatted = useCallback(async () => {
    if (content) {
      const success = await copyToClipboardUtil(content.formatted);
      if (success) {
        copy('Formatted code copied to clipboard!');
      }
    }
  }, [content, copy]);

  const handleExport = useCallback((format: 'text' | 'html') => {
    if (content) {
      exportFormattedCode(content, format);
      copy(`Code exported as ${format.toUpperCase()}!`);
    }
  }, [content, copy]);

  const handleOptionsChange = useCallback((key: keyof FormatterOptions, value: any) => {
    setFormatterOptions(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleLanguageOptionsChange = useCallback((key: keyof LanguageSpecificOptions, value: any) => {
    setLanguageOptions(prev => ({ ...prev, [key]: value }));
  }, []);

  const supportedLanguages = Object.keys(LANGUAGE_CONFIGS) as SupportedLanguage[];
  const currentLanguageConfig = LANGUAGE_CONFIGS[selectedLanguage];

  return (
    <div className="code-formatter">
      <ToolHeader
        title="Code Formatter"
        description="Format and beautify code in 20+ programming languages with syntax highlighting"
      />

      <div className="code-formatter__toolbar">
        <div className="toolbar-section">
          <label className="language-selector">
            <span>Language:</span>
            <select
              value={selectedLanguage}
              onChange={(e) => handleLanguageChange(e.target.value as SupportedLanguage)}
              disabled={autoDetect}
            >
              {supportedLanguages.map(lang => (
                <option key={lang} value={lang}>
                  {currentLanguageConfig.icon} {LANGUAGE_CONFIGS[lang].displayName}
                </option>
              ))}
            </select>
          </label>
          
          <label className="auto-detect">
            <input
              type="checkbox"
              checked={autoDetect}
              onChange={(e) => setAutoDetect(e.target.checked)}
            />
            Auto-detect language
          </label>
        </div>

        <div className="toolbar-section">
          <div className="code-formatter__tabs">
            <Button
              variant={activeTab === 'editor' ? 'primary' : 'outline'}
              size="small"
              onClick={() => setActiveTab('editor')}
            >
              Editor
            </Button>
            <Button
              variant={activeTab === 'formatted' ? 'primary' : 'outline'}
              size="small"
              onClick={() => setActiveTab('formatted')}
            >
              Formatted
            </Button>
            <Button
              variant={activeTab === 'split' ? 'primary' : 'outline'}
              size="small"
              onClick={() => setActiveTab('split')}
            >
              Split View
            </Button>
          </div>
        </div>

        <div className="toolbar-section">
          <Button
            variant="outline"
            size="small"
            onClick={() => setShowOptions(!showOptions)}
          >
            ⚙️ Options
          </Button>
          
          <label className="file-upload">
            <Button variant="outline" size="small">
              📁 Load File
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".js,.ts,.py,.java,.json,.html,.css,.scss,.xml,.sql,.php,.go,.rs,.cpp,.cs,.yml,.yaml,.md,.sh,.ps1"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
          </label>
          
          <Button
            variant="outline"
            size="small"
            onClick={handleClear}
            disabled={!input}
          >
            🗑️ Clear
          </Button>
          
          {stats && (
            <Button
              variant="outline"
              size="small"
              onClick={() => setShowStats(!showStats)}
            >
              📊 Stats
            </Button>
          )}
        </div>
      </div>

      {showOptions && (
        <div className="code-formatter__options">
          <div className="options-section">
            <h4>Formatting Options</h4>
            <div className="options-grid">
              <label className="option-item">
                <span>Indent Type:</span>
                <select
                  value={formatterOptions.indentType}
                  onChange={(e) => handleOptionsChange('indentType', e.target.value)}
                >
                  <option value="spaces">Spaces</option>
                  <option value="tabs">Tabs</option>
                </select>
              </label>
              
              <label className="option-item">
                <span>Indent Size:</span>
                <input
                  type="number"
                  min="1"
                  max="8"
                  value={formatterOptions.indentSize}
                  onChange={(e) => handleOptionsChange('indentSize', parseInt(e.target.value))}
                />
              </label>
              
              <label className="option-item">
                <span>Max Line Length:</span>
                <input
                  type="number"
                  min="40"
                  max="200"
                  value={formatterOptions.maxLineLength}
                  onChange={(e) => handleOptionsChange('maxLineLength', parseInt(e.target.value))}
                />
              </label>
              
              <label className="option-item">
                <input
                  type="checkbox"
                  checked={formatterOptions.trimTrailingWhitespace}
                  onChange={(e) => handleOptionsChange('trimTrailingWhitespace', e.target.checked)}
                />
                Trim trailing whitespace
              </label>
              
              <label className="option-item">
                <input
                  type="checkbox"
                  checked={formatterOptions.insertFinalNewline}
                  onChange={(e) => handleOptionsChange('insertFinalNewline', e.target.checked)}
                />
                Insert final newline
              </label>
            </div>
          </div>

          {/* Language-specific options */}
          {(selectedLanguage === 'javascript' || selectedLanguage === 'typescript') && (
            <div className="options-section">
              <h4>JavaScript/TypeScript Options</h4>
              <div className="options-grid">
                <label className="option-item">
                  <input
                    type="checkbox"
                    checked={languageOptions.semicolons !== false}
                    onChange={(e) => handleLanguageOptionsChange('semicolons', e.target.checked)}
                  />
                  Add semicolons
                </label>
                
                <label className="option-item">
                  <input
                    type="checkbox"
                    checked={languageOptions.singleQuote || false}
                    onChange={(e) => handleLanguageOptionsChange('singleQuote', e.target.checked)}
                  />
                  Use single quotes
                </label>
                
                <label className="option-item">
                  <input
                    type="checkbox"
                    checked={languageOptions.bracketSpacing !== false}
                    onChange={(e) => handleLanguageOptionsChange('bracketSpacing', e.target.checked)}
                  />
                  Bracket spacing
                </label>
              </div>
            </div>
          )}

          {selectedLanguage === 'json' && (
            <div className="options-section">
              <h4>JSON Options</h4>
              <div className="options-grid">
                <label className="option-item">
                  <input
                    type="checkbox"
                    checked={languageOptions.sortKeys || false}
                    onChange={(e) => handleLanguageOptionsChange('sortKeys', e.target.checked)}
                  />
                  Sort keys alphabetically
                </label>
              </div>
            </div>
          )}
        </div>
      )}

      {showStats && stats && (
        <div className="code-formatter__stats">
          <h4>Formatting Statistics</h4>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">Original Lines:</span>
              <span className="stat-value">{stats.originalLines}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Formatted Lines:</span>
              <span className="stat-value">{stats.formattedLines}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Original Size:</span>
              <span className="stat-value">{stats.originalSize} chars</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Formatted Size:</span>
              <span className="stat-value">{stats.formattedSize} chars</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Size Change:</span>
              <span className="stat-value">{stats.compressionRatio.toFixed(1)}%</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Format Time:</span>
              <span className="stat-value">{stats.formattingTime.toFixed(2)}ms</span>
            </div>
          </div>
        </div>
      )}

      <div className="code-formatter__examples">
        <h4>Quick Examples</h4>
        <div className="examples-grid">
          {supportedLanguages.slice(0, 8).map(lang => (
            <Button
              key={lang}
              variant="outline"
              size="small"
              onClick={() => handleLoadExample(lang)}
            >
              {LANGUAGE_CONFIGS[lang].icon} {LANGUAGE_CONFIGS[lang].displayName}
            </Button>
          ))}
        </div>
      </div>

      <div className={`code-formatter__content code-formatter__content--${activeTab}`}>
        {(activeTab === 'editor' || activeTab === 'split') && (
          <div className="code-formatter__editor">
            <div className="editor-header">
              <h4>{currentLanguageConfig.icon} Input Code ({currentLanguageConfig.displayName})</h4>
              <div className="editor-actions">
                <Button
                  variant="outline"
                  size="small"
                  onClick={handleCopyOriginal}
                  disabled={!input}
                >
                  Copy Original
                </Button>
              </div>
            </div>
            
            <textarea
              className="code-editor"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Paste your ${currentLanguageConfig.displayName} code here or load an example...`}
              spellCheck={false}
            />
            
            {error && (
              <div className="editor-error">
                <strong>Error:</strong> {error}
              </div>
            )}
          </div>
        )}

        {(activeTab === 'formatted' || activeTab === 'split') && (
          <div className="code-formatter__preview">
            <div className="preview-header">
              <h4>🎨 Formatted Code</h4>
              <div className="preview-actions">
                <Button
                  variant="outline"
                  size="small"
                  onClick={handleCopyFormatted}
                  disabled={!content}
                >
                  Copy Formatted
                </Button>
                <Button
                  variant="outline"
                  size="small"
                  onClick={() => handleExport('text')}
                  disabled={!content}
                >
                  Export Text
                </Button>
                <Button
                  variant="outline"
                  size="small"
                  onClick={() => handleExport('html')}
                  disabled={!content}
                >
                  Export HTML
                </Button>
              </div>
            </div>

            <div className="formatted-code-container">
              {isLoading && (
                <div className="preview-loading">
                  <div className="loading-spinner"></div>
                  <span>Formatting code...</span>
                </div>
              )}
              
              {error && (
                <div className="preview-error">
                  <strong>Error:</strong> {error}
                </div>
              )}
              
              {content && !isLoading && !error && (
                <pre className="formatted-code">
                  <code
                    dangerouslySetInnerHTML={{
                      __html: applySyntaxHighlighting(content.formatted, selectedLanguage)
                    }}
                  />
                </pre>
              )}
              
              {!content && !isLoading && !error && (
                <div className="preview-placeholder">
                  <p>👈 Paste code on the left to see formatted output</p>
                  <p>Or load one of the examples above to get started!</p>
                </div>
              )}
            </div>

            {content && (
              <div className="code-info">
                <div className="info-grid">
                  <span>Lines: {content.lineCount}</span>
                  <span>Characters: {content.characterCount}</span>
                  <span>Size: {content.size}</span>
                  {content.errors.length > 0 && (
                    <span className="error-count">Errors: {content.errors.length}</span>
                  )}
                  {content.warnings.length > 0 && (
                    <span className="warning-count">Warnings: {content.warnings.length}</span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};