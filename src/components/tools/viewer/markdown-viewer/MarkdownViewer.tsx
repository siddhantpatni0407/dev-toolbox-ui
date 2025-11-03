import React, { useState, useCallback, useEffect } from 'react';
import Button from '../../../common/Button';
import ToolHeader from '../../../common/ToolHeader';
import { useCopyToClipboard } from '../../../../hooks/useCopyToClipboard';
import { useDebounce } from '../../../../hooks/useDebounce';
import {
  parseMarkdown,
  exportContent,
  copyToClipboard as copyToClipboardUtil
} from '../../../../utils/viewerUtils';
import {
  MarkdownOptions,
  MarkdownPreviewOptions,
  MarkdownContent,
  MARKDOWN_THEMES,
  MARKDOWN_EXAMPLES
} from '../../../../models/viewer';
import './MarkdownViewer.css';

export const MarkdownViewer: React.FC = () => {
  const [input, setInput] = useState<string>(MARKDOWN_EXAMPLES.basic);
  const [content, setContent] = useState<MarkdownContent | null>(null);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  
  const [options, setOptions] = useState<MarkdownOptions>({
    breaks: true,
    linkify: true,
    typographer: true,
    highlight: true,
    html: false,
    xhtmlOut: false
  });

  const [previewOptions, setPreviewOptions] = useState<MarkdownPreviewOptions>({
    theme: 'github',
    fontSize: 'medium',
    width: 'medium',
    showLineNumbers: false
  });

  const [activeTab, setActiveTab] = useState<'editor' | 'preview' | 'split'>('split');
  const [showOptions, setShowOptions] = useState(false);

  const { copy } = useCopyToClipboard();
  const debouncedInput = useDebounce(input, 300);

  const processMarkdown = useCallback((markdown: string) => {
    if (!markdown.trim()) {
      setContent(null);
      setError('');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = parseMarkdown(markdown, options);
      
      if (result.success && result.content) {
        setContent(result.content);
      } else {
        setError(result.error || 'Failed to parse markdown');
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
    processMarkdown(debouncedInput);
  }, [debouncedInput, processMarkdown]);

  const handleLoadExample = useCallback((exampleKey: keyof typeof MARKDOWN_EXAMPLES) => {
    setInput(MARKDOWN_EXAMPLES[exampleKey]);
    setError('');
  }, []);

  const handleClear = useCallback(() => {
    setInput('');
    setContent(null);
    setError('');
  }, []);

  const handleCopyMarkdown = useCallback(async () => {
    const success = await copyToClipboardUtil(input);
    if (success) {
      copy('Markdown copied to clipboard!');
    }
  }, [input, copy]);

  const handleCopyHTML = useCallback(async () => {
    if (content) {
      const success = await copyToClipboardUtil(content.html);
      if (success) {
        copy('HTML copied to clipboard!');
      }
    }
  }, [content, copy]);

  const handleExport = useCallback((format: 'html' | 'txt' | 'md') => {
    if (!content) return;
    
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const filename = `markdown-export-${timestamp}.${format}`;
    
    const exportData = format === 'html' ? content.html : 
                      format === 'md' ? content.raw : content.html;
    
    exportContent(exportData, format, filename);
  }, [content]);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && (file.type === 'text/markdown' || file.name.endsWith('.md'))) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setInput(text);
      };
      reader.readAsText(file);
    }
  }, []);

  const currentTheme = MARKDOWN_THEMES[previewOptions.theme];

  return (
    <div className="markdown-viewer">
      <ToolHeader
        title="Markdown Viewer"
        description="Write, preview, and export Markdown content with live rendering"
      />

      <div className="markdown-viewer__toolbar">
        <div className="markdown-viewer__tabs">
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

        <div className="markdown-viewer__actions">
          <Button
            variant="outline"
            size="small"
            onClick={() => setShowOptions(!showOptions)}
          >
            ⚙️ Options
          </Button>
          <label className="markdown-viewer__file-upload">
            <Button variant="outline" size="small">
              📁 Load File
            </Button>
            <input
              type="file"
              accept=".md,.markdown,.txt"
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
        <div className="markdown-viewer__options">
          <div className="options-section">
            <h4>Parsing Options</h4>
            <div className="options-grid">
              <label className="option-item">
                <input
                  type="checkbox"
                  checked={options.breaks}
                  onChange={(e) => setOptions(prev => ({ ...prev, breaks: e.target.checked }))}
                />
                Line breaks
              </label>
              <label className="option-item">
                <input
                  type="checkbox"
                  checked={options.linkify}
                  onChange={(e) => setOptions(prev => ({ ...prev, linkify: e.target.checked }))}
                />
                Auto-link URLs
              </label>
              <label className="option-item">
                <input
                  type="checkbox"
                  checked={options.typographer}
                  onChange={(e) => setOptions(prev => ({ ...prev, typographer: e.target.checked }))}
                />
                Typography
              </label>
              <label className="option-item">
                <input
                  type="checkbox"
                  checked={options.html}
                  onChange={(e) => setOptions(prev => ({ ...prev, html: e.target.checked }))}
                />
                Allow HTML
              </label>
            </div>
          </div>

          <div className="options-section">
            <h4>Preview Options</h4>
            <div className="options-grid">
              <label className="option-item">
                Theme:
                <select
                  value={previewOptions.theme}
                  onChange={(e) => setPreviewOptions(prev => ({ 
                    ...prev, 
                    theme: e.target.value as MarkdownPreviewOptions['theme']
                  }))}
                >
                  {Object.entries(MARKDOWN_THEMES).map(([key, theme]) => (
                    <option key={key} value={key}>{theme.name}</option>
                  ))}
                </select>
              </label>
              <label className="option-item">
                Font Size:
                <select
                  value={previewOptions.fontSize}
                  onChange={(e) => setPreviewOptions(prev => ({ 
                    ...prev, 
                    fontSize: e.target.value as MarkdownPreviewOptions['fontSize']
                  }))}
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </label>
              <label className="option-item">
                Width:
                <select
                  value={previewOptions.width}
                  onChange={(e) => setPreviewOptions(prev => ({ 
                    ...prev, 
                    width: e.target.value as MarkdownPreviewOptions['width']
                  }))}
                >
                  <option value="narrow">Narrow</option>
                  <option value="medium">Medium</option>
                  <option value="wide">Wide</option>
                </select>
              </label>
            </div>
          </div>
        </div>
      )}

      <div className="markdown-viewer__examples">
        <h4>Quick Examples</h4>
        <div className="examples-grid">
          <Button
            variant="outline"
            size="small"
            onClick={() => handleLoadExample('basic')}
          >
            Basic Markdown
          </Button>
          <Button
            variant="outline"
            size="small"
            onClick={() => handleLoadExample('advanced')}
          >
            Advanced Features
          </Button>
          <Button
            variant="outline"
            size="small"
            onClick={() => handleLoadExample('documentation')}
          >
            Documentation
          </Button>
        </div>
      </div>

      <div className={`markdown-viewer__content markdown-viewer__content--${activeTab}`}>
        {(activeTab === 'editor' || activeTab === 'split') && (
          <div className="markdown-viewer__editor">
            <div className="editor-header">
              <h4>Markdown Input</h4>
              <div className="editor-actions">
                <Button
                  variant="outline"
                  size="small"
                  onClick={handleCopyMarkdown}
                  disabled={!input}
                >
                  Copy
                </Button>
              </div>
            </div>
            <textarea
              className="markdown-editor"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter your Markdown content here..."
              spellCheck={false}
            />
            {input && (
              <div className="editor-stats">
                {content && (
                  <>
                    <span>Words: {content.wordCount}</span>
                    <span>Characters: {content.characterCount}</span>
                    <span>Lines: {content.lineCount}</span>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {(activeTab === 'preview' || activeTab === 'split') && (
          <div className="markdown-viewer__preview">
            <div className="preview-header">
              <h4>HTML Preview</h4>
              <div className="preview-actions">
                <Button
                  variant="outline"
                  size="small"
                  onClick={handleCopyHTML}
                  disabled={!content}
                >
                  Copy HTML
                </Button>
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
                  onClick={() => handleExport('md')}
                  disabled={!content}
                >
                  Export MD
                </Button>
              </div>
            </div>

            <div 
              className={`markdown-preview markdown-preview--${previewOptions.theme} markdown-preview--${previewOptions.fontSize} markdown-preview--${previewOptions.width}`}
              style={{
                backgroundColor: currentTheme.background,
                color: currentTheme.text
              }}
            >
              {isLoading && (
                <div className="preview-loading">
                  <div className="loading-spinner"></div>
                  <span>Processing markdown...</span>
                </div>
              )}
              
              {error && (
                <div className="preview-error">
                  <strong>Error:</strong> {error}
                </div>
              )}
              
              {content && !isLoading && !error && (
                <div
                  className="preview-content"
                  dangerouslySetInnerHTML={{ __html: content.html }}
                />
              )}
              
              {!content && !isLoading && !error && (
                <div className="preview-placeholder">
                  <p>👈 Start typing Markdown on the left to see the preview here</p>
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