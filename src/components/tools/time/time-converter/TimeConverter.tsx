import React, { useState, useCallback, useEffect } from 'react';
import Button from '../../../common/Button';
import ToolHeader from '../../../common/ToolHeader';
import { useDebounce } from '../../../../hooks/useDebounce';
import {
  TimeUnit,
  TimeConversion,
  ConversionResult,
  ConversionOptions,
  ConversionHistory,
  ConversionFilter,
  TimeCategory,
  DEFAULT_CONVERSION_OPTIONS,
  DEFAULT_CONVERSION_FILTER,
  TIME_CONVERSION_EXAMPLES,
  COMMON_CONVERSIONS
} from '../../../../models/time';
import {
  convertTime,
  validateConversionInput,
  getTimeUnitById,
  filterTimeUnits,
  getConversionFormula,
  convertToMultipleUnits,
  getCommonConversions,
  createConversionHistory,
  exportConversion,
  copyConversionToClipboard,
  loadConversionHistory,
  saveConversionHistory,
  clearConversionHistory
} from '../../../../utils/timeUtils';
import './TimeConverter.css';

const TimeConverter: React.FC = () => {
  const [inputValue, setInputValue] = useState<string>('1');
  const [fromUnit, setFromUnit] = useState<TimeUnit | null>(getTimeUnitById('hour'));
  const [toUnit, setToUnit] = useState<TimeUnit | null>(getTimeUnitById('minute'));
  const [options, setOptions] = useState<ConversionOptions>(DEFAULT_CONVERSION_OPTIONS);
  const [filter, setFilter] = useState<ConversionFilter>(DEFAULT_CONVERSION_FILTER);
  const [conversionResult, setConversionResult] = useState<ConversionResult | null>(null);
  const [bulkResults, setBulkResults] = useState<ConversionResult[]>([]);
  const [history, setHistory] = useState<ConversionHistory[]>([]);
  const [selectedExample, setSelectedExample] = useState<string>('basic');
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'converter' | 'bulk' | 'history'>('converter');

  const debouncedInputValue = useDebounce(inputValue, 300);

  // Load history on component mount
  useEffect(() => {
    setHistory(loadConversionHistory());
  }, []);

  const performConversion = useCallback(() => {
    setError(null);
    
    // Clear result if input is empty
    if (!inputValue.trim()) {
      setConversionResult(null);
      return;
    }
    
    const validation = validateConversionInput(inputValue, fromUnit, toUnit);
    if (!validation.isValid) {
      // For auto-convert, don't show validation errors, just clear results
      if (options.autoConvert) {
        setConversionResult(null);
        return;
      }
      setError(validation.error!);
      setConversionResult(null);
      return;
    }

    try {
      const numValue = parseFloat(inputValue);
      const result = convertTime(numValue, fromUnit!, toUnit!, options);
      setConversionResult(result);
      
    } catch (err) {
      if (options.autoConvert) {
        setConversionResult(null);
      } else {
        setError(err instanceof Error ? err.message : 'Conversion failed');
        setConversionResult(null);
      }
    }
  }, [inputValue, fromUnit, toUnit, options]);

  // Auto-convert when inputs change
  useEffect(() => {
    if (options.autoConvert && fromUnit && toUnit) {
      // Only auto-convert if there's a valid input value
      if (debouncedInputValue && debouncedInputValue.trim()) {
        performConversion();
      } else {
        // Clear results when input is empty
        setConversionResult(null);
        setError(null);
      }
    }
  }, [debouncedInputValue, fromUnit, toUnit, options, performConversion]);

  const handleManualConversion = useCallback(() => {
    setError(null);
    
    // Clear result if input is empty
    if (!inputValue || !inputValue.trim()) {
      setConversionResult(null);
      setError('Please enter a value to convert');
      return;
    }
    
    const validation = validateConversionInput(inputValue, fromUnit, toUnit);
    if (!validation.isValid) {
      setError(validation.error!);
      setConversionResult(null);
      return;
    }

    try {
      const numValue = parseFloat(inputValue);
      const result = convertTime(numValue, fromUnit!, toUnit!, options);
      setConversionResult(result);

      // Always add to history for manual conversions
      const historyEntry = createConversionHistory(
        numValue,
        fromUnit!,
        toUnit!,
        result,
        options.precision
      );
      
      const newHistory = [historyEntry, ...history.slice(0, 49)]; // Keep last 50 entries
      setHistory(newHistory);
      saveConversionHistory(newHistory);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Conversion failed');
      setConversionResult(null);
    }
  }, [inputValue, fromUnit, toUnit, options, history]);

  const performBulkConversion = useCallback(() => {
    if (!inputValue || !fromUnit) {
      setError('Please enter a value and select a source unit');
      return;
    }

    try {
      const numValue = parseFloat(inputValue);
      const targetUnits = filterTimeUnits(filter.categories, filter.searchTerm)
        .filter(unit => unit.id !== fromUnit.id);
      
      const results = convertToMultipleUnits(numValue, fromUnit, targetUnits, options);
      setBulkResults(results);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bulk conversion failed');
      setBulkResults([]);
    }
  }, [inputValue, fromUnit, filter, options]);

  const handleSwapUnits = () => {
    if (fromUnit && toUnit) {
      setFromUnit(toUnit);
      setToUnit(fromUnit);
    }
  };

  const handleLoadExample = (exampleKey: string) => {
    const example = TIME_CONVERSION_EXAMPLES[exampleKey as keyof typeof TIME_CONVERSION_EXAMPLES];
    if (example) {
      setInputValue(example.value.toString());
      setFromUnit(getTimeUnitById(example.fromUnit));
      setToUnit(getTimeUnitById(example.toUnit));
      setSelectedExample(exampleKey);
    }
  };

  const handleQuickConversion = (fromId: string, toId: string) => {
    const from = getTimeUnitById(fromId);
    const to = getTimeUnitById(toId);
    if (from && to) {
      setFromUnit(from);
      setToUnit(to);
    }
  };

  const handleCopyResult = async (format: 'text' | 'json' | 'value' = 'value') => {
    if (!conversionResult || !fromUnit || !toUnit) return;

    const conversion: TimeConversion = {
      from: { value: parseFloat(inputValue), unit: fromUnit },
      to: { value: conversionResult.value, unit: conversionResult.unit },
      precision: options.precision
    };

    const success = await copyConversionToClipboard(conversion, format);
    if (success) {
      setToastMessage(`Copied ${format} to clipboard!`);
      setTimeout(() => setToastMessage(''), 3000);
    }
  };

  const handleExport = (format: 'text' | 'json' | 'csv') => {
    if (!conversionResult || !fromUnit || !toUnit) return;

    const conversion: TimeConversion = {
      from: { value: parseFloat(inputValue), unit: fromUnit },
      to: { value: conversionResult.value, unit: conversionResult.unit },
      precision: options.precision
    };

    const exported = exportConversion(conversion, format);
    const blob = new Blob([exported], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `time-conversion.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleToggleFavorite = (historyId: string) => {
    const updatedHistory = history.map(item =>
      item.id === historyId ? { ...item, isFavorite: !item.isFavorite } : item
    );
    setHistory(updatedHistory);
    saveConversionHistory(updatedHistory);
  };

  const handleClearHistory = () => {
    setHistory([]);
    clearConversionHistory();
    setToastMessage('History cleared!');
    setTimeout(() => setToastMessage(''), 3000);
  };

  const filteredFromUnits = filterTimeUnits(filter.categories, filter.searchTerm);
  const filteredToUnits = filterTimeUnits(filter.categories, filter.searchTerm);

  return (
    <main className="time-converter" role="main" aria-labelledby="time-converter-title">
      {/* Unified Tool Header */}
      <ToolHeader
        title="Time Converter & Calculator"
        description="Convert between different time units with precision, bulk conversion support, and comprehensive analysis"
      />

      {/* Tabs */}
      <div className="time-converter__tabs">
        <button
          className={`tab ${activeTab === 'converter' ? 'active' : ''}`}
          onClick={() => setActiveTab('converter')}
        >
          Converter
        </button>
        <button
          className={`tab ${activeTab === 'bulk' ? 'active' : ''}`}
          onClick={() => setActiveTab('bulk')}
        >
          Bulk Conversion
        </button>
        <button
          className={`tab ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          History ({history.length})
        </button>
      </div>

      {/* Main Converter Tab */}
      {activeTab === 'converter' && (
        <div className="time-converter__main">
          {/* Quick Examples */}
          <div className="time-converter__examples">
            <h3>Quick Examples</h3>
            <div className="examples-grid">
              {Object.entries(TIME_CONVERSION_EXAMPLES).map(([key, example]) => (
                <button
                  key={key}
                  className={`example-btn ${selectedExample === key ? 'active' : ''}`}
                  onClick={() => handleLoadExample(key)}
                >
                  {example.value} {getTimeUnitById(example.fromUnit)?.abbreviation} → {getTimeUnitById(example.toUnit)?.abbreviation}
                </button>
              ))}
            </div>
          </div>

          {/* Common Conversions */}
          <div className="time-converter__quick">
            <h3>Common Conversions</h3>
            <div className="quick-conversions">
              {COMMON_CONVERSIONS.map((conv, index) => (
                <button
                  key={index}
                  className="quick-conversion-btn"
                  onClick={() => handleQuickConversion(conv.from, conv.to)}
                >
                  <span>{conv.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Input Section */}
          <div className="time-converter__input">
            <div className="input-group">
              <label htmlFor="value-input">Value</label>
              <input
                id="value-input"
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Enter value to convert"
                step="any"
                min="0"
              />
            </div>

            <div className="conversion-units">
              <div className="unit-selector">
                <label htmlFor="from-unit">From</label>
                <select
                  id="from-unit"
                  value={fromUnit?.id || ''}
                  onChange={(e) => setFromUnit(getTimeUnitById(e.target.value))}
                >
                  <option value="">Select unit</option>
                  {Object.values(TimeCategory).map(category => (
                    <optgroup key={category} label={category.charAt(0).toUpperCase() + category.slice(1)}>
                      {filteredFromUnits
                        .filter(unit => unit.category === category)
                        .map(unit => (
                          <option key={unit.id} value={unit.id}>
                            {unit.name} ({unit.abbreviation})
                          </option>
                        ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              <button
                className="swap-button"
                onClick={handleSwapUnits}
                disabled={!fromUnit || !toUnit}
                title="Swap units"
              >
                ⇄
              </button>

              <div className="unit-selector">
                <label htmlFor="to-unit">To</label>
                <select
                  id="to-unit"
                  value={toUnit?.id || ''}
                  onChange={(e) => setToUnit(getTimeUnitById(e.target.value))}
                >
                  <option value="">Select unit</option>
                  {Object.values(TimeCategory).map(category => (
                    <optgroup key={category} label={category.charAt(0).toUpperCase() + category.slice(1)}>
                      {filteredToUnits
                        .filter(unit => unit.category === category)
                        .map(unit => (
                          <option key={unit.id} value={unit.id}>
                            {unit.name} ({unit.abbreviation})
                          </option>
                        ))}
                    </optgroup>
                  ))}
                </select>
              </div>
            </div>

            <div className="action-buttons">
              <Button
                variant="primary"
                onClick={handleManualConversion}
                disabled={!inputValue?.trim() || !fromUnit || !toUnit}
              >
                Convert
              </Button>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="time-converter__error">
              {error}
            </div>
          )}

          {/* Result Display */}
          {conversionResult && !error && (
            <div className="time-converter__result">
              <h3>Result</h3>
              <div className="result-value">
                <span className="input-display">
                  {inputValue} {fromUnit?.name} ({fromUnit?.abbreviation})
                </span>
                <span className="equals">=</span>
                <span className="output-display">
                  {conversionResult.formattedValue} {conversionResult.unit.name} ({conversionResult.unit.abbreviation})
                </span>
              </div>

              {options.showFormula && fromUnit && toUnit && (
                <div className="formula">
                  <strong>Formula:</strong> {getConversionFormula(fromUnit, toUnit)}
                </div>
              )}

              <div className="result-actions">
                <Button
                  variant="outline"
                  onClick={() => handleCopyResult('value')}
                >
                  Copy Value
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleCopyResult('text')}
                >
                  Copy Result
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleExport('text')}
                >
                  Export
                </Button>
              </div>

              {/* Common Conversions for Current Unit */}
              {fromUnit && (
                <div className="related-conversions">
                  <h4>Common conversions from {fromUnit.name}</h4>
                  <div className="related-grid">
                    {getCommonConversions(fromUnit).map(unit => {
                      const relatedResult = convertTime(parseFloat(inputValue), fromUnit, unit, options);
                      return (
                        <div key={unit.id} className="related-item">
                          <span className="related-value">{relatedResult.formattedValue}</span>
                          <span className="related-unit">{unit.abbreviation}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Bulk Conversion Tab */}
      {activeTab === 'bulk' && (
        <div className="time-converter__bulk">
          <h3>Bulk Conversion</h3>
          
          {/* Filters */}
          <div className="bulk-filters">
            <div className="filter-group">
              <label>Categories</label>
              <div className="category-filters">
                {Object.values(TimeCategory).map(category => (
                  <label key={category} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={filter.categories.includes(category)}
                      onChange={(e) => {
                        const newCategories = e.target.checked
                          ? [...filter.categories, category]
                          : filter.categories.filter(c => c !== category);
                        setFilter(prev => ({ ...prev, categories: newCategories }));
                      }}
                    />
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </label>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <label htmlFor="search-units">Search Units</label>
              <input
                id="search-units"
                type="text"
                value={filter.searchTerm}
                onChange={(e) => setFilter(prev => ({ ...prev, searchTerm: e.target.value }))}
                placeholder="Search by name or abbreviation"
              />
            </div>
          </div>

          <div className="bulk-input">
            <div className="input-group">
              <label htmlFor="bulk-value">Value</label>
              <input
                id="bulk-value"
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Enter value"
                step="any"
                min="0"
              />
            </div>

            <div className="unit-selector">
              <label htmlFor="bulk-from-unit">From Unit</label>
              <select
                id="bulk-from-unit"
                value={fromUnit?.id || ''}
                onChange={(e) => setFromUnit(getTimeUnitById(e.target.value))}
              >
                <option value="">Select unit</option>
                {filteredFromUnits.map(unit => (
                  <option key={unit.id} value={unit.id}>
                    {unit.name} ({unit.abbreviation})
                  </option>
                ))}
              </select>
            </div>

            <Button
              variant="primary"
              onClick={performBulkConversion}
              disabled={!inputValue || !fromUnit}
            >
              Convert to All Units
            </Button>
          </div>

          {bulkResults.length > 0 && (
            <div className="bulk-results">
              <h4>Conversion Results</h4>
              <div className="bulk-results-grid">
                {bulkResults.map((result, index) => (
                  <div key={index} className="bulk-result-item">
                    <div className="result-unit">{result.unit.name}</div>
                    <div className="result-value">{result.formattedValue}</div>
                    <div className="result-abbr">{result.unit.abbreviation}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="time-converter__history">
          <div className="history-header">
            <h3>Conversion History</h3>
            <div className="history-actions">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={filter.favoriteOnly}
                  onChange={(e) => setFilter(prev => ({ ...prev, favoriteOnly: e.target.checked }))}
                />
                Favorites Only
              </label>
              <Button
                variant="danger"
                onClick={handleClearHistory}
                disabled={history.length === 0}
              >
                Clear History
              </Button>
            </div>
          </div>

          <div className="history-list">
            {history
              .filter(item => !filter.favoriteOnly || item.isFavorite)
              .map(item => (
                <div key={item.id} className="history-item">
                  <div className="history-conversion">
                    <span className="history-input">
                      {item.conversion.from.value} {item.conversion.from.unit.abbreviation}
                    </span>
                    <span className="history-arrow">→</span>
                    <span className="history-output">
                      {item.conversion.to.value} {item.conversion.to.unit.abbreviation}
                    </span>
                  </div>
                  <div className="history-meta">
                    <span className="history-time">
                      {item.timestamp.toLocaleString()}
                    </span>
                    <div className="history-actions">
                      <button
                        className={`favorite-btn ${item.isFavorite ? 'active' : ''}`}
                        onClick={() => handleToggleFavorite(item.id)}
                        title={item.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                      >
                        ⭐
                      </button>
                      <button
                        className="reload-btn"
                        onClick={() => {
                          setInputValue(item.conversion.from.value.toString());
                          setFromUnit(item.conversion.from.unit);
                          setToUnit(item.conversion.to.unit);
                          setActiveTab('converter');
                        }}
                        title="Load this conversion"
                      >
                        ↻
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            
            {history.filter(item => !filter.favoriteOnly || item.isFavorite).length === 0 && (
              <div className="empty-history">
                {filter.favoriteOnly ? 'No favorite conversions found' : 'No conversion history'}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Options Panel */}
      <div className="time-converter__options">
        <h3>Options</h3>
        <div className="options-grid">
          <div className="option-group">
            <label htmlFor="precision">Decimal Precision</label>
            <input
              id="precision"
              type="number"
              min="0"
              max="15"
              value={options.precision}
              onChange={(e) => setOptions(prev => ({ ...prev, precision: parseInt(e.target.value) || 0 }))}
            />
          </div>

          <div className="option-group">
            <label htmlFor="rounding">Rounding Mode</label>
            <select
              id="rounding"
              value={options.roundingMode}
              onChange={(e) => setOptions(prev => ({ ...prev, roundingMode: e.target.value as any }))}
            >
              <option value="round">Round</option>
              <option value="floor">Floor</option>
              <option value="ceil">Ceil</option>
            </select>
          </div>

          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={options.showFormula}
              onChange={(e) => setOptions(prev => ({ ...prev, showFormula: e.target.checked }))}
            />
            Show Formula
          </label>

          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={options.scientificNotation}
              onChange={(e) => setOptions(prev => ({ ...prev, scientificNotation: e.target.checked }))}
            />
            Scientific Notation
          </label>

          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={options.autoConvert}
              onChange={(e) => setOptions(prev => ({ ...prev, autoConvert: e.target.checked }))}
            />
            Auto Convert
          </label>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="time-converter__toast">
          {toastMessage}
        </div>
      )}
    </main>
  );
};

export default TimeConverter;