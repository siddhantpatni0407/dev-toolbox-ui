import React, { useState, useCallback, useEffect, useRef } from 'react';
import Button from '../../../common/Button';
import ToolHeader from '../../../common/ToolHeader';
import { useCopyToClipboard } from '../../../../hooks/useCopyToClipboard';
import { useDebounce } from '../../../../hooks/useDebounce';
import {
  parseHTML,
  exportContent,
  copyToClipboard as copyToClipboardUtil,
  prettifyHTML
} from '../../../../utils/viewerUtils';
import {
  HTMLOptions,
  HTMLPreviewOptions,
  HTMLContent,
  HTML_EXAMPLES
} from '../../../../models/viewer';
import './HTMLViewer.css';

export const HTMLViewer: React.FC = () => {
  const [input, setInput] = useState('');
  const [content, setContent] = useState<HTMLContent | null>(null);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  
  const [options, setOptions] = useState<HTMLOptions>({
    validateSyntax: true,
    sanitizeContent: true,
    showStatistics: true,
    allowScripts: false,
    allowStyles: true,
    prettify: false
  });

  const [previewOptions, setPreviewOptions] = useState<HTMLPreviewOptions>({
    sandbox: true,
    responsive: true,
    showSource: false,
    theme: 'light',
    zoom: 1
  });

  const [activeTab, setActiveTab] = useState<'editor' | 'preview' | 'split'>('split');
  const [showOptions, setShowOptions] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { copy } = useCopyToClipboard();
  const debouncedInput = useDebounce(input, 300);

  const processHTML = useCallback((html: string) => {
    if (!html.trim()) {
      setContent(null);
      setError('');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = parseHTML(html, options);
      
      if (result.success && result.content) {
        setContent(result.content);
        
        // Update iframe content
        if (iframeRef.current) {
          const iframe = iframeRef.current;
          const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
          if (iframeDoc) {
            iframeDoc.open();
            iframeDoc.write(result.content.sanitized);
            iframeDoc.close();
          }
        }
      } else {
        setError(result.error || 'Failed to parse HTML');
        setContent(null);
      }
    } catch (err) {
      setError(`Processing error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setContent(null);
    } finally {
      setIsLoading(false);
    }
  }, [options]);

  useEffect(() => {
    processHTML(debouncedInput);
  }, [debouncedInput, processHTML]);

  const handleLoadExample = useCallback((exampleKey: keyof typeof HTML_EXAMPLES) => {
    setInput(HTML_EXAMPLES[exampleKey]);
    setError('');
  }, []);

  const handleClear = useCallback(() => {
    setInput('');
    setContent(null);
    setError('');
  }, []);

  const handlePrettify = useCallback(() => {
    if (input) {
      const prettified = prettifyHTML(input);
      setInput(prettified);
    }
  }, [input]);

  const handleCopyHTML = useCallback(async () => {
    const success = await copyToClipboardUtil(input);
    if (success) {
      copy('HTML copied to clipboard!');
    }
  }, [input, copy]);

  const handleCopySanitized = useCallback(async () => {
    if (content) {
      const success = await copyToClipboardUtil(content.sanitized);
      if (success) {
        copy('Sanitized HTML copied to clipboard!');
      }
    }
  }, [content, copy]);

  const handleExport = useCallback((format: 'html' | 'txt') => {
    if (!content) return;
    
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const filename = `html-export-${timestamp}.${format}`;
    
    exportContent(content.sanitized, format, filename);
  }, [content]);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && (file.type === 'text/html' || file.name.endsWith('.html') || file.name.endsWith('.htm'))) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setInput(text);
      };
      reader.readAsText(file);
    }
  }, []);

  const renderErrors = () => {
    if (!content || content.errors.length === 0) return null;

    const errors = content.errors.filter(e => e.type === 'error');
    const warnings = content.errors.filter(e => e.type === 'warning');

    return (
      <div className="html-errors">
        {errors.length > 0 && (
          <div className="error-section">
            <h5>Errors ({errors.length})</h5>
            {errors.map((error, index) => (
              <div key={index} className="error-item error-item--error">
                <span className="error-location">Line {error.line}:{error.column}</span>
                <span className="error-message">{error.message}</span>
                {error.rule && <span className="error-rule">{error.rule}</span>}
              </div>
            ))}
          </div>
        )}
        
        {warnings.length > 0 && (
          <div className="error-section">
            <h5>Warnings ({warnings.length})</h5>
            {warnings.map((warning, index) => (
              <div key={index} className="error-item error-item--warning">
                <span className="error-location">Line {warning.line}:{warning.column}</span>
                <span className="error-message">{warning.message}</span>
                {warning.rule && <span className="error-rule">{warning.rule}</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderStatistics = () => {
    if (!content || !options.showStatistics) return null;

    const stats = content.statistics;
    return (
      <div className="html-statistics">
        <h5>Document Statistics</h5>
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-label">Elements:</span>
            <span className="stat-value">{stats.elementCount}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Attributes:</span>
            <span className="stat-value">{stats.attributeCount}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Text Length:</span>
            <span className="stat-value">{stats.textLength}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Images:</span>
            <span className="stat-value">{stats.imageCount}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Scripts:</span>
            <span className="stat-value">{stats.scriptTags}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Styles:</span>
            <span className="stat-value">{stats.styleTags}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="html-viewer">
      <ToolHeader
        title="HTML Viewer"
        description="Preview, validate, and analyze HTML content with safety features"
      />

      <div className="html-viewer__toolbar">
        <div className="html-viewer__tabs">
          <Button
            variant={activeTab === 'editor' ? 'primary' : 'outline'}
            size="small"
            onClick={() => setActiveTab('editor')}
          >
            Editor
          </Button>
          <Button
            variant={activeTab === 'preview' ? 'primary' : 'outline'}
            size="small"
            onClick={() => setActiveTab('preview')}
          >
            Preview
          </Button>
          <Button
            variant={activeTab === 'split' ? 'primary' : 'outline'}
            size="small"
            onClick={() => setActiveTab('split')}
          >
            Split View
          </Button>
        </div>

        <div className="html-viewer__actions">
          <Button
            variant="outline"
            size="small"
            onClick={() => setShowOptions(!showOptions)}
          >
            ⚙️ Options
          </Button>
          <Button
            variant="outline"
            size="small"
            onClick={handlePrettify}
            disabled={!input}
          >
            ✨ Prettify
          </Button>
          <label className="html-viewer__file-upload">
            <Button variant="outline" size="small">
              📁 Load File
            </Button>
            <input
              type="file"
              accept=".html,.htm,.txt"
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
        </div>
      </div>

      {showOptions && (
        <div className="html-viewer__options">
          <div className="options-section">
            <h4>Processing Options</h4>
            <div className="options-grid">
              <label className="option-item">
                <input
                  type="checkbox"
                  checked={options.validateSyntax}
                  onChange={(e) => setOptions(prev => ({ ...prev, validateSyntax: e.target.checked }))}
                />
                Validate syntax
              </label>
              <label className="option-item">
                <input
                  type="checkbox"
                  checked={options.sanitizeContent}
                  onChange={(e) => setOptions(prev => ({ ...prev, sanitizeContent: e.target.checked }))}
                />
                Sanitize content
              </label>
              <label className="option-item">
                <input
                  type="checkbox"
                  checked={options.showStatistics}
                  onChange={(e) => setOptions(prev => ({ ...prev, showStatistics: e.target.checked }))}
                />
                Show statistics
              </label>
              <label className="option-item">
                <input
                  type="checkbox"
                  checked={options.allowScripts}
                  onChange={(e) => setOptions(prev => ({ ...prev, allowScripts: e.target.checked }))}
                />
                Allow scripts (⚠️ Unsafe)
              </label>
              <label className="option-item">
                <input
                  type="checkbox"
                  checked={options.allowStyles}
                  onChange={(e) => setOptions(prev => ({ ...prev, allowStyles: e.target.checked }))}
                />
                Allow styles
              </label>
            </div>
          </div>

          <div className="options-section">
            <h4>Preview Options</h4>
            <div className="options-grid">
              <label className="option-item">
                <input
                  type="checkbox"
                  checked={previewOptions.sandbox}
                  onChange={(e) => setPreviewOptions(prev => ({ ...prev, sandbox: e.target.checked }))}
                />
                Sandbox mode
              </label>
              <label className="option-item">
                <input
                  type="checkbox"
                  checked={previewOptions.responsive}
                  onChange={(e) => setPreviewOptions(prev => ({ ...prev, responsive: e.target.checked }))}
                />
                Responsive view
              </label>
              <label className="option-item">
                Zoom:
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={previewOptions.zoom}
                  onChange={(e) => setPreviewOptions(prev => ({ ...prev, zoom: parseFloat(e.target.value) }))}
                />
                <span>{Math.round(previewOptions.zoom * 100)}%</span>
              </label>
            </div>
          </div>
        </div>
      )}

      <div className="html-viewer__examples">
        <h4>Quick Examples</h4>
        <div className="examples-grid">
          <Button
            variant="outline"
            size="small"
            onClick={() => handleLoadExample('basic')}
          >
            Basic HTML
          </Button>
          <Button
            variant="outline"
            size="small"
            onClick={() => handleLoadExample('form')}
          >
            Form Example
          </Button>
          <Button
            variant="outline"
            size="small"
            onClick={() => handleLoadExample('card')}
          >
            Card Layout
          </Button>
        </div>
      </div>

      <div className={`html-viewer__content html-viewer__content--${activeTab}`}>
        {(activeTab === 'editor' || activeTab === 'split') && (
          <div className="html-viewer__editor">
            <div className="editor-header">
              <h4>HTML Input</h4>
              <div className="editor-actions">
                <Button
                  variant="outline"
                  size="small"
                  onClick={handleCopyHTML}
                  disabled={!input}
                >
                  Copy Raw
                </Button>
                <Button
                  variant="outline"
                  size="small"
                  onClick={handleCopySanitized}
                  disabled={!content}
                >
                  Copy Sanitized
                </Button>
              </div>
            </div>
            
            <textarea
              className="html-editor"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter your HTML content here..."
              spellCheck={false}
            />

            {content && content.errors.length > 0 && (
              <div className="editor-validation">
                <Button
                  variant={content.isValid ? 'success' : 'danger'}
                  size="small"
                  onClick={() => setShowErrors(!showErrors)}
                >
                  {content.isValid ? '✅' : '❌'} 
                  {content.errors.filter(e => e.type === 'error').length} errors, 
                  {content.errors.filter(e => e.type === 'warning').length} warnings
                </Button>
                {showErrors && renderErrors()}
              </div>
            )}

            {renderStatistics()}
          </div>
        )}

        {(activeTab === 'preview' || activeTab === 'split') && (
          <div className="html-viewer__preview">
            <div className="preview-header">
              <h4>HTML Preview</h4>
              <div className="preview-actions">
                <Button
                  variant="outline"
                  size="small"
                  onClick={() => handleExport('html')}
                  disabled={!content}
                >
                  Export HTML
                </Button>
                <Button
                  variant="outline"
                  size="small"
                  onClick={() => handleExport('txt')}
                  disabled={!content}
                >
                  Export Text
                </Button>
              </div>
            </div>

            <div className="html-preview-container">
              {isLoading && (
                <div className="preview-loading">
                  <div className="loading-spinner"></div>
                  <span>Processing HTML...</span>
                </div>
              )}
              
              {error && (
                <div className="preview-error">
                  <strong>Error:</strong> {error}
                </div>
              )}
              
              {content && !isLoading && !error && (
                <iframe
                  ref={iframeRef}
                  className="html-preview-frame"
                  style={{
                    transform: `scale(${previewOptions.zoom})`,
                    transformOrigin: 'top left',
                    width: `${100 / previewOptions.zoom}%`,
                    height: `${100 / previewOptions.zoom}%`
                  }}
                  sandbox={previewOptions.sandbox ? "allow-same-origin" : undefined}
                  title="HTML Preview"
                />
              )}
              
              {!content && !isLoading && !error && (
                <div className="preview-placeholder">
                  <p>👈 Start typing HTML on the left to see the preview here</p>
                  <p>Or load one of the examples above to get started!</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};