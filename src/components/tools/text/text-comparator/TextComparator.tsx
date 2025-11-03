import React, { useState, useCallback, useEffect, useRef } from 'react';
import Button from '../../../common/Button';
import ToolHeader from '../../../common/ToolHeader';
import { useCopyToClipboard } from '../../../../hooks/useCopyToClipboard';
import { useDebounce } from '../../../../hooks/useDebounce';
import {
  TextDiff,
  ComparisonOptions,
  ComparisonResult,
  DEFAULT_COMPARISON_OPTIONS,
  TEXT_COMPARISON_EXAMPLES,
  ViewMode
} from '../../../../models/text';
import {
  compareTexts,
  exportComparison,
  loadFile,
  copyToClipboard as copyToClipboardUtil,
  validateTextInput
} from '../../../../utils/textUtils';
import './TextComparator.css';

const TextComparator: React.FC = () => {
  const [leftText, setLeftText] = useState<string>(TEXT_COMPARISON_EXAMPLES.basic.left);
  const [rightText, setRightText] = useState<string>(TEXT_COMPARISON_EXAMPLES.basic.right);
  const [options, setOptions] = useState<ComparisonOptions>(DEFAULT_COMPARISON_OPTIONS);
  const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [selectedExample, setSelectedExample] = useState<string>('basic');
  const [toastMessage, setToastMessage] = useState<string>('');

  const leftFileRef = useRef<HTMLInputElement>(null);
  const rightFileRef = useRef<HTMLInputElement>(null);
  const { isCopied, copy } = useCopyToClipboard();

  // Debounced comparison
  const debouncedLeftText = useDebounce(leftText, 300);
  const debouncedRightText = useDebounce(rightText, 300);

  const performComparison = useCallback(async () => {
    if (!leftText.trim() && !rightText.trim()) {
      setComparisonResult(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Validate inputs
      const leftValidation = validateTextInput(leftText);
      const rightValidation = validateTextInput(rightText);

      if (!leftValidation.isValid) {
        throw new Error(`Left text: ${leftValidation.error}`);
      }
      if (!rightValidation.isValid) {
        throw new Error(`Right text: ${rightValidation.error}`);
      }

      // Perform comparison
      const result = compareTexts(leftText, rightText, options);
      setComparisonResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during comparison');
      setComparisonResult(null);
    } finally {
      setIsLoading(false);
    }
  }, [leftText, rightText, options]);

  // Perform comparison when text or options change
  useEffect(() => {
    if (debouncedLeftText || debouncedRightText) {
      performComparison();
    }
  }, [debouncedLeftText, debouncedRightText, performComparison]);

  const handleFileLoad = useCallback(async (file: File, side: 'left' | 'right') => {
    try {
      setIsLoading(true);
      const textFile = await loadFile(file);
      
      if (side === 'left') {
        setLeftText(textFile.content);
      } else {
        setRightText(textFile.content);
      }
    } catch (err) {
      setError(`Failed to load file: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleLeftFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileLoad(file, 'left');
    }
  }, [handleFileLoad]);

  const handleRightFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileLoad(file, 'right');
    }
  }, [handleFileLoad]);

  const handleExampleChange = useCallback((exampleKey: string) => {
    setSelectedExample(exampleKey);
    const example = TEXT_COMPARISON_EXAMPLES[exampleKey as keyof typeof TEXT_COMPARISON_EXAMPLES];
    if (example) {
      setLeftText(example.left);
      setRightText(example.right);
    }
  }, []);

  const handleClearAll = useCallback(() => {
    setLeftText('');
    setRightText('');
    setComparisonResult(null);
    setError(null);
    if (leftFileRef.current) leftFileRef.current.value = '';
    if (rightFileRef.current) rightFileRef.current.value = '';
  }, []);

  const handleExportComparison = useCallback(async (format: 'text' | 'html' | 'json') => {
    if (!comparisonResult) return;

    try {
      const exported = exportComparison(comparisonResult, format);
      await copyToClipboardUtil(exported);
      setToastMessage(`Comparison exported as ${format.toUpperCase()}`);
      copy(exported);
    } catch (err) {
      setError(`Failed to export: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }, [comparisonResult, copy]);

  const renderDiffLine = useCallback((diff: TextDiff, index: number) => {
    const getLineClass = () => {
      switch (diff.type) {
        case 'insert': return 'diff-line diff-line--added';
        case 'delete': return 'diff-line diff-line--deleted';
        case 'replace': return 'diff-line diff-line--modified';
        case 'equal': return 'diff-line diff-line--equal';
        default: return 'diff-line';
      }
    };

    const getLinePrefix = () => {
      switch (diff.type) {
        case 'insert': return '+';
        case 'delete': return '-';
        case 'replace': return '~';
        case 'equal': return ' ';
        default: return ' ';
      }
    };

    if (diff.type === 'replace') {
      return (
        <div key={index} className="diff-group">
          <div className="diff-line diff-line--deleted">
            {options.showLineNumbers && (
              <span className="line-number">{diff.oldLineNumber}</span>
            )}
            <span className="line-prefix">-</span>
            <span className="line-content">{diff.oldValue}</span>
          </div>
          <div className="diff-line diff-line--added">
            {options.showLineNumbers && (
              <span className="line-number">{diff.newLineNumber}</span>
            )}
            <span className="line-prefix">+</span>
            <span className="line-content">{diff.newValue}</span>
          </div>
        </div>
      );
    }

    return (
      <div key={index} className={getLineClass()}>
        {options.showLineNumbers && (
          <span className="line-number">
            {diff.type === 'insert' ? diff.newLineNumber : diff.oldLineNumber}
          </span>
        )}
        <span className="line-prefix">{getLinePrefix()}</span>
        <span className="line-content">
          {diff.type === 'insert' ? diff.newValue : diff.oldValue}
        </span>
      </div>
    );
  }, [options.showLineNumbers]);

  const renderSplitView = useCallback(() => {
    if (!comparisonResult) return null;

    const leftLines: React.ReactNode[] = [];
    const rightLines: React.ReactNode[] = [];

    comparisonResult.diffs.forEach((diff, index) => {
      switch (diff.type) {
        case 'equal':
          leftLines.push(
            <div key={`left-${index}`} className="diff-line diff-line--equal">
              {options.showLineNumbers && (
                <span className="line-number">{diff.oldLineNumber}</span>
              )}
              <span className="line-prefix"> </span>
              <span className="line-content">{diff.oldValue}</span>
            </div>
          );
          rightLines.push(
            <div key={`right-${index}`} className="diff-line diff-line--equal">
              {options.showLineNumbers && (
                <span className="line-number">{diff.newLineNumber}</span>
              )}
              <span className="line-prefix"> </span>
              <span className="line-content">{diff.newValue}</span>
            </div>
          );
          break;
        case 'delete':
          leftLines.push(
            <div key={`left-${index}`} className="diff-line diff-line--deleted">
              {options.showLineNumbers && (
                <span className="line-number">{diff.oldLineNumber}</span>
              )}
              <span className="line-prefix">-</span>
              <span className="line-content">{diff.oldValue}</span>
            </div>
          );
          rightLines.push(
            <div key={`right-${index}`} className="diff-line diff-line--empty"></div>
          );
          break;
        case 'insert':
          leftLines.push(
            <div key={`left-${index}`} className="diff-line diff-line--empty"></div>
          );
          rightLines.push(
            <div key={`right-${index}`} className="diff-line diff-line--added">
              {options.showLineNumbers && (
                <span className="line-number">{diff.newLineNumber}</span>
              )}
              <span className="line-prefix">+</span>
              <span className="line-content">{diff.newValue}</span>
            </div>
          );
          break;
        case 'replace':
          leftLines.push(
            <div key={`left-${index}`} className="diff-line diff-line--modified">
              {options.showLineNumbers && (
                <span className="line-number">{diff.oldLineNumber}</span>
              )}
              <span className="line-prefix">~</span>
              <span className="line-content">{diff.oldValue}</span>
            </div>
          );
          rightLines.push(
            <div key={`right-${index}`} className="diff-line diff-line--modified">
              {options.showLineNumbers && (
                <span className="line-number">{diff.newLineNumber}</span>
              )}
              <span className="line-prefix">~</span>
              <span className="line-content">{diff.newValue}</span>
            </div>
          );
          break;
      }
    });

    return (
      <div className="diff-split-view">
        <div className="diff-panel">
          <div className="diff-panel-header">Original</div>
          <div className="diff-content">{leftLines}</div>
        </div>
        <div className="diff-panel">
          <div className="diff-panel-header">Modified</div>
          <div className="diff-content">{rightLines}</div>
        </div>
      </div>
    );
  }, [comparisonResult, options.showLineNumbers]);

  const renderUnifiedView = useCallback(() => {
    if (!comparisonResult) return null;

    return (
      <div className="diff-unified-view">
        <div className="diff-content">
          {comparisonResult.diffs.map((diff, index) => renderDiffLine(diff, index))}
        </div>
      </div>
    );
  }, [comparisonResult, renderDiffLine]);

  return (
    <div className="text-comparator">
      <ToolHeader
        title="Text Comparator"
        description="Compare two texts side by side and see the differences highlighted with detailed statistics."
      />

      {error && (
        <div className="text-comparator__error" role="alert">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      <div className="text-comparator__controls">
        <div className="controls-section">
          <h3>Examples</h3>
          <div className="example-buttons">
            {Object.keys(TEXT_COMPARISON_EXAMPLES).map(key => (
              <Button
                key={key}
                onClick={() => handleExampleChange(key)}
                variant={selectedExample === key ? 'primary' : 'secondary'}
                size="small"
              >
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        <div className="controls-section">
          <h3>File Upload</h3>
          <div className="file-upload-group">
            <div className="file-upload">
              <input
                ref={leftFileRef}
                type="file"
                accept=".txt,.md,.json,.js,.ts,.html,.css,.xml,.log"
                onChange={handleLeftFileChange}
                className="file-input"
                id="left-file"
              />
              <label htmlFor="left-file" className="file-label">
                📁 Load Left File
              </label>
            </div>
            <div className="file-upload">
              <input
                ref={rightFileRef}
                type="file"
                accept=".txt,.md,.json,.js,.ts,.html,.css,.xml,.log"
                onChange={handleRightFileChange}
                className="file-input"
                id="right-file"
              />
              <label htmlFor="right-file" className="file-label">
                📁 Load Right File
              </label>
            </div>
          </div>
        </div>

        <div className="controls-section">
          <h3>Comparison Options</h3>
          <div className="options-grid">
            <label className="option-item">
              <input
                type="checkbox"
                checked={options.ignoreCase}
                onChange={(e) => setOptions(prev => ({ ...prev, ignoreCase: e.target.checked }))}
              />
              Ignore Case
            </label>
            <label className="option-item">
              <input
                type="checkbox"
                checked={options.ignoreWhitespace}
                onChange={(e) => setOptions(prev => ({ ...prev, ignoreWhitespace: e.target.checked }))}
              />
              Ignore Whitespace
            </label>
            <label className="option-item">
              <input
                type="checkbox"
                checked={options.showLineNumbers}
                onChange={(e) => setOptions(prev => ({ ...prev, showLineNumbers: e.target.checked }))}
              />
              Show Line Numbers
            </label>
            <label className="option-item">
              <input
                type="checkbox"
                checked={options.highlightWords}
                onChange={(e) => setOptions(prev => ({ ...prev, highlightWords: e.target.checked }))}
              />
              Highlight Words
            </label>
          </div>
        </div>

        <div className="controls-section">
          <h3>View Mode</h3>
          <div className="view-mode-buttons">
            <Button
              onClick={() => setViewMode('split')}
              variant={viewMode === 'split' ? 'primary' : 'secondary'}
              size="small"
            >
              Split View
            </Button>
            <Button
              onClick={() => setViewMode('unified')}
              variant={viewMode === 'unified' ? 'primary' : 'secondary'}
              size="small"
            >
              Unified View
            </Button>
          </div>
        </div>

        <div className="controls-section">
          <h3>Actions</h3>
          <div className="action-buttons">
            <Button onClick={handleClearAll} variant="secondary" size="small">
              🗑️ Clear All
            </Button>
            {comparisonResult && (
              <>
                <Button
                  onClick={() => handleExportComparison('text')}
                  variant="secondary"
                  size="small"
                >
                  📄 Export Text
                </Button>
                <Button
                  onClick={() => handleExportComparison('html')}
                  variant="secondary"
                  size="small"
                >
                  🌐 Export HTML
                </Button>
                <Button
                  onClick={() => handleExportComparison('json')}
                  variant="secondary"
                  size="small"
                >
                  📊 Export JSON
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="text-comparator__input">
        <div className="input-panel">
          <div className="input-panel-header">
            <h3>Original Text</h3>
            <span className="text-stats">{leftText.length} characters</span>
          </div>
          <textarea
            value={leftText}
            onChange={(e) => setLeftText(e.target.value)}
            placeholder="Enter or paste your original text here..."
            className="text-input"
            spellCheck="false"
          />
        </div>

        <div className="input-panel">
          <div className="input-panel-header">
            <h3>Modified Text</h3>
            <span className="text-stats">{rightText.length} characters</span>
          </div>
          <textarea
            value={rightText}
            onChange={(e) => setRightText(e.target.value)}
            placeholder="Enter or paste your modified text here..."
            className="text-input"
            spellCheck="false"
          />
        </div>
      </div>

      {isLoading && (
        <div className="text-comparator__loading">
          <div className="loading-spinner">⏳</div>
          <span>Comparing texts...</span>
        </div>
      )}

      {comparisonResult && (
        <div className="text-comparator__result">
          <div className="result-header">
            <h3>Comparison Result</h3>
            <div className="statistics">
              <div className="stat-item">
                <span className="stat-label">Similarity:</span>
                <span className="stat-value">{comparisonResult.statistics.similarity}%</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Added:</span>
                <span className="stat-value stat-value--added">{comparisonResult.statistics.addedLines}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Deleted:</span>
                <span className="stat-value stat-value--deleted">{comparisonResult.statistics.deletedLines}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Modified:</span>
                <span className="stat-value stat-value--modified">{comparisonResult.statistics.modifiedLines}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Unchanged:</span>
                <span className="stat-value">{comparisonResult.statistics.unchangedLines}</span>
              </div>
            </div>
          </div>

          <div className="diff-viewer">
            {viewMode === 'split' ? renderSplitView() : renderUnifiedView()}
          </div>
        </div>
      )}

      {(isCopied && toastMessage) && (
        <div className="text-comparator__toast">
          ✓ {toastMessage}
        </div>
      )}
    </div>
  );
};

export { TextComparator };
export default TextComparator;