import React, { useState, useCallback, useEffect } from 'react';
import Button from '../../../common/Button';
import ToolHeader from '../../../common/ToolHeader';
import { useCopyToClipboard } from '../../../../hooks/useCopyToClipboard';
import { useDebounce } from '../../../../hooks/useDebounce';
import {
  TimezoneData,
  TimezoneConversion,
  TimezoneConversionOptions,
  DEFAULT_TIMEZONE_CONVERSION_OPTIONS,
  POPULAR_TIMEZONE_SELECTIONS,
  TIMEZONE_CONVERSION_EXAMPLES
} from '../../../../models/timezoneConversion';
import {
  convertTimezone,
  searchTimezones,
  findTimezoneById,
  validateTimeString,
  formatTimeWithOffset,
  exportConversions,
  copyToClipboard as copyToClipboardUtil,
  saveConversionHistory,
  loadConversionHistory,
  getPopularTimezonePairs,
  getSuggestedMeetingTimes
} from '../../../../utils/timezoneConversionUtils';
import './TimezoneConverter.css';

export const TimezoneConverter: React.FC = () => {
  const [sourceTimezone, setSourceTimezone] = useState<TimezoneData | null>(null);
  const [targetTimezone, setTargetTimezone] = useState<TimezoneData | null>(null);
  const [sourceTime, setSourceTime] = useState<string>('');
  const [currentConversion, setCurrentConversion] = useState<TimezoneConversion | null>(null);
  const [conversionHistory, setConversionHistory] = useState<TimezoneConversion[]>([]);
  const [options, setOptions] = useState<TimezoneConversionOptions>(DEFAULT_TIMEZONE_CONVERSION_OPTIONS);
  
  const [sourceSearchQuery, setSourceSearchQuery] = useState<string>('');
  const [targetSearchQuery, setTargetSearchQuery] = useState<string>('');
  const [sourceSearchResults, setSourceSearchResults] = useState<TimezoneData[]>(POPULAR_TIMEZONE_SELECTIONS);
  const [targetSearchResults, setTargetSearchResults] = useState<TimezoneData[]>(POPULAR_TIMEZONE_SELECTIONS);
  const [showSourceDropdown, setShowSourceDropdown] = useState<boolean>(false);
  const [showTargetDropdown, setShowTargetDropdown] = useState<boolean>(false);
  
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'converter' | 'suggestions' | 'history'>('converter');
  const [showOptions, setShowOptions] = useState<boolean>(false);
  
  const { copy, isCopied } = useCopyToClipboard();
  const debouncedSourceSearch = useDebounce(sourceSearchQuery, 300);
  const debouncedTargetSearch = useDebounce(targetSearchQuery, 300);

  // Load history on component mount
  useEffect(() => {
    const savedHistory = loadConversionHistory();
    setConversionHistory(savedHistory);
  }, []);

  // Search timezones
  useEffect(() => {
    setSourceSearchResults(searchTimezones(debouncedSourceSearch));
  }, [debouncedSourceSearch]);

  useEffect(() => {
    setTargetSearchResults(searchTimezones(debouncedTargetSearch));
  }, [debouncedTargetSearch]);

  // Set current time as default
  useEffect(() => {
    if (!sourceTime) {
      const now = new Date();
      const timeString = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: !options.format24Hour
      });
      setSourceTime(timeString);
    }
  }, [options.format24Hour, sourceTime]);

  const performConversion = useCallback((timeValue: string) => {
    if (!sourceTimezone || !targetTimezone) {
      setError('Please select both source and target timezones');
      return;
    }

    const validation = validateTimeString(timeValue);
    if (!validation.isValid) {
      setError(validation.error || 'Invalid time format');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const conversion = convertTimezone(sourceTimezone, targetTimezone, timeValue);
      setCurrentConversion(conversion);
      
      // Add to history
      const newHistory = [conversion, ...conversionHistory.slice(0, 49)]; // Keep last 50
      setConversionHistory(newHistory);
      saveConversionHistory(newHistory);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Conversion failed');
    } finally {
      setIsLoading(false);
    }
  }, [sourceTimezone, targetTimezone, conversionHistory]);

  // Auto-convert when options change
  useEffect(() => {
    if (options.autoConvert && currentConversion && sourceTime) {
      performConversion(sourceTime);
    }
  }, [options.autoConvert, currentConversion, sourceTime, performConversion]);

  const handleTimeChange = useCallback((timeValue: string) => {
    setSourceTime(timeValue);
    if (options.autoConvert && timeValue.trim()) {
      performConversion(timeValue);
    }
  }, [options.autoConvert, performConversion]);

  const handleManualConvert = useCallback(() => {
    if (sourceTime.trim()) {
      performConversion(sourceTime);
    }
  }, [sourceTime, performConversion]);

  const selectSourceTimezone = useCallback((timezone: TimezoneData) => {
    setSourceTimezone(timezone);
    setSourceSearchQuery(`${timezone.abbreviation} - ${timezone.name}`);
    setShowSourceDropdown(false);
  }, []);

  const selectTargetTimezone = useCallback((timezone: TimezoneData) => {
    setTargetTimezone(timezone);
    setTargetSearchQuery(`${timezone.abbreviation} - ${timezone.name}`);
    setShowTargetDropdown(false);
  }, []);

  const swapTimezones = useCallback(() => {
    if (sourceTimezone && targetTimezone) {
      const tempSource = sourceTimezone;
      setSourceTimezone(targetTimezone);
      setTargetTimezone(tempSource);
      setSourceSearchQuery(`${targetTimezone.abbreviation} - ${targetTimezone.name}`);
      setTargetSearchQuery(`${tempSource.abbreviation} - ${tempSource.name}`);
      
      if (sourceTime.trim() && options.autoConvert) {
        // Re-trigger conversion with swapped timezones
        setTimeout(() => performConversion(sourceTime), 100);
      }
    }
  }, [sourceTimezone, targetTimezone, sourceTime, options.autoConvert, performConversion]);

  const useCurrentTime = useCallback(() => {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: !options.format24Hour
    });
    handleTimeChange(timeString);
  }, [options.format24Hour, handleTimeChange]);

  const loadExample = useCallback((exampleKey: keyof typeof TIMEZONE_CONVERSION_EXAMPLES) => {
    const example = TIMEZONE_CONVERSION_EXAMPLES[exampleKey];
    const sourceTimezoneData = findTimezoneById(example.source);
    const targetTimezoneData = findTimezoneById(example.target);
    
    if (sourceTimezoneData && targetTimezoneData) {
      selectSourceTimezone(sourceTimezoneData);
      selectTargetTimezone(targetTimezoneData);
      handleTimeChange(example.time);
    }
  }, [selectSourceTimezone, selectTargetTimezone, handleTimeChange]);

  const exportHistory = useCallback((format: 'json' | 'csv') => {
    if (conversionHistory.length === 0) {
      setError('No conversion history to export');
      return;
    }
    
    try {
      const exported = exportConversions(conversionHistory, format);
      const blob = new Blob([exported], { 
        type: format === 'json' ? 'application/json' : 'text/csv' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `timezone-conversions.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to export conversions');
    }
  }, [conversionHistory]);

  const clearHistory = useCallback(() => {
    setConversionHistory([]);
    saveConversionHistory([]);
  }, []);

  const copyConversionResult = useCallback(async () => {
    if (!currentConversion) return;
    
    const text = `${currentConversion.sourceTimeString} ${currentConversion.sourceTimezone.abbreviation} = ${currentConversion.targetTimeString} ${currentConversion.targetTimezone.abbreviation}`;
    const success = await copyToClipboardUtil(text);
    if (success) {
      copy(text);
    }
  }, [currentConversion, copy]);

  return (
    <div className="timezone-converter">
      <ToolHeader
        title="🌍 Timezone Converter"
        description="Convert time between different timezones with precision and ease"
      />

      {error && (
        <div className="timezone-converter__error" role="alert">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      <div className="timezone-converter__tabs">
        <Button
          variant={activeTab === 'converter' ? 'primary' : 'outline'}
          size="small"
          onClick={() => setActiveTab('converter')}
        >
          🔄 Converter
        </Button>
        <Button
          variant={activeTab === 'suggestions' ? 'primary' : 'outline'}
          size="small"
          onClick={() => setActiveTab('suggestions')}
        >
          💡 Suggestions
        </Button>
        <Button
          variant={activeTab === 'history' ? 'primary' : 'outline'}
          size="small"
          onClick={() => setActiveTab('history')}
        >
          📋 History ({conversionHistory.length})
        </Button>
      </div>

      {activeTab === 'converter' && (
        <div className="timezone-converter__main">
          <div className="timezone-converter__examples">
            <h3>Quick Examples</h3>
            <div className="examples-grid">
              {Object.entries(TIMEZONE_CONVERSION_EXAMPLES).map(([key, example]) => (
                <Button
                  key={key}
                  variant="outline"
                  size="small"
                  onClick={() => loadExample(key as keyof typeof TIMEZONE_CONVERSION_EXAMPLES)}
                >
                  {example.description}
                </Button>
              ))}
            </div>
          </div>

          <div className="timezone-converter__selectors">
            <div className="timezone-selector">
              <label htmlFor="source-timezone">From Timezone</label>
              <div className="selector-container">
                <input
                  id="source-timezone"
                  type="text"
                  value={sourceSearchQuery}
                  onChange={(e) => setSourceSearchQuery(e.target.value)}
                  onFocus={() => setShowSourceDropdown(true)}
                  onBlur={() => setTimeout(() => setShowSourceDropdown(false), 200)}
                  placeholder="Search timezone (e.g., IST, EST, CET)"
                  className="timezone-input"
                />
                {showSourceDropdown && (
                  <div className="timezone-dropdown">
                    {sourceSearchResults.length === 0 ? (
                      <div className="timezone-dropdown__no-results">
                        No timezones found matching "{sourceSearchQuery}"
                      </div>
                    ) : (
                      sourceSearchResults.map((timezone) => (
                        <div
                          key={timezone.id}
                          className="timezone-option"
                          onClick={() => selectSourceTimezone(timezone)}
                        >
                          <div className="timezone-option__main">
                            <span className="timezone-abbreviation">{timezone.abbreviation}</span>
                            <span className="timezone-name">{timezone.name}</span>
                            {timezone.flag && <span className="timezone-flag">{timezone.flag}</span>}
                          </div>
                          <div className="timezone-option__details">
                            <span className="timezone-offset">{timezone.offset}</span>
                            {timezone.cities && timezone.cities.length > 0 && (
                              <span className="timezone-cities">
                                {timezone.cities.slice(0, 3).join(', ')}
                                {timezone.cities.length > 3 && '...'}
                              </span>
                            )}
                            {timezone.region && (
                              <span className="timezone-region">{timezone.region}</span>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="timezone-swap">
              <Button
                variant="outline"
                size="small"
                onClick={swapTimezones}
                disabled={!sourceTimezone || !targetTimezone}
                title="Swap timezones"
              >
                ⇄
              </Button>
            </div>

            <div className="timezone-selector">
              <label htmlFor="target-timezone">To Timezone</label>
              <div className="selector-container">
                <input
                  id="target-timezone"
                  type="text"
                  value={targetSearchQuery}
                  onChange={(e) => setTargetSearchQuery(e.target.value)}
                  onFocus={() => setShowTargetDropdown(true)}
                  onBlur={() => setTimeout(() => setShowTargetDropdown(false), 200)}
                  placeholder="Search timezone (e.g., EST, PST, JST)"
                  className="timezone-input"
                />
                {showTargetDropdown && (
                  <div className="timezone-dropdown">
                    {targetSearchResults.length === 0 ? (
                      <div className="timezone-dropdown__no-results">
                        No timezones found matching "{targetSearchQuery}"
                      </div>
                    ) : (
                      targetSearchResults.map((timezone) => (
                        <div
                          key={timezone.id}
                          className="timezone-option"
                          onClick={() => selectTargetTimezone(timezone)}
                        >
                          <div className="timezone-option__main">
                            <span className="timezone-abbreviation">{timezone.abbreviation}</span>
                            <span className="timezone-name">{timezone.name}</span>
                            {timezone.flag && <span className="timezone-flag">{timezone.flag}</span>}
                          </div>
                          <div className="timezone-option__details">
                            <span className="timezone-offset">{timezone.offset}</span>
                            {timezone.cities && timezone.cities.length > 0 && (
                              <span className="timezone-cities">
                                {timezone.cities.slice(0, 3).join(', ')}
                                {timezone.cities.length > 3 && '...'}
                              </span>
                            )}
                            {timezone.region && (
                              <span className="timezone-region">{timezone.region}</span>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="timezone-converter__time-input">
            <div className="time-input-section">
              <label htmlFor="source-time">Time</label>
              <div className="time-input-group">
                <input
                  id="source-time"
                  type="text"
                  value={sourceTime}
                  onChange={(e) => handleTimeChange(e.target.value)}
                  placeholder="Enter time (e.g., 14:30 or 2:30 PM)"
                  className="time-input"
                />
                <Button
                  variant="outline"
                  size="small"
                  onClick={useCurrentTime}
                  title="Use current time"
                >
                  🕒 Now
                </Button>
                {!options.autoConvert && (
                  <Button
                    variant="primary"
                    size="small"
                    onClick={handleManualConvert}
                    disabled={!sourceTimezone || !targetTimezone || !sourceTime.trim() || isLoading}
                  >
                    {isLoading ? '⏳' : '🔄'} Convert
                  </Button>
                )}
              </div>
            </div>

            <Button
              variant="outline"
              size="small"
              onClick={() => setShowOptions(!showOptions)}
              className="options-toggle"
            >
              ⚙️ Options
            </Button>
          </div>

          {showOptions && (
            <div className="timezone-converter__options">
              <h4>Conversion Options</h4>
              <div className="options-grid">
                <label className="option-item">
                  <input
                    type="checkbox"
                    checked={options.format24Hour}
                    onChange={(e) => setOptions({ ...options, format24Hour: e.target.checked })}
                  />
                  24-hour format
                </label>
                <label className="option-item">
                  <input
                    type="checkbox"
                    checked={options.showSeconds}
                    onChange={(e) => setOptions({ ...options, showSeconds: e.target.checked })}
                  />
                  Show seconds
                </label>
                <label className="option-item">
                  <input
                    type="checkbox"
                    checked={options.showDate}
                    onChange={(e) => setOptions({ ...options, showDate: e.target.checked })}
                  />
                  Show date
                </label>
                <label className="option-item">
                  <input
                    type="checkbox"
                    checked={options.autoConvert}
                    onChange={(e) => setOptions({ ...options, autoConvert: e.target.checked })}
                  />
                  Auto-convert
                </label>
                <label className="option-item">
                  <input
                    type="checkbox"
                    checked={options.includeOffset}
                    onChange={(e) => setOptions({ ...options, includeOffset: e.target.checked })}
                  />
                  Include timezone offset
                </label>
              </div>
            </div>
          )}

          {currentConversion && (
            <div className="timezone-converter__result">
              <h3>Conversion Result</h3>
              <div className="conversion-display">
                <div className="conversion-from">
                  <div className="time-display">
                    {formatTimeWithOffset(currentConversion.sourceTime, currentConversion.sourceTimezone, options)}
                  </div>
                  <div className="timezone-info">
                    {currentConversion.sourceTimezone.name} ({currentConversion.sourceTimezone.abbreviation})
                  </div>
                </div>
                
                <div className="conversion-arrow">
                  <span>→</span>
                  <div className="time-difference">
                    {currentConversion.timeDifference.formattedDifference}
                  </div>
                </div>
                
                <div className="conversion-to">
                  <div className="time-display">
                    {formatTimeWithOffset(currentConversion.targetTime, currentConversion.targetTimezone, options)}
                  </div>
                  <div className="timezone-info">
                    {currentConversion.targetTimezone.name} ({currentConversion.targetTimezone.abbreviation})
                  </div>
                </div>
              </div>
              
              <div className="conversion-actions">
                <Button
                  variant="outline"
                  size="small"
                  onClick={copyConversionResult}
                >
                  {isCopied ? '✅' : '📋'} Copy Result
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'suggestions' && (
        <div className="timezone-converter__suggestions">
          <h3>Popular Timezone Pairs</h3>
          <div className="suggestions-grid">
            {getPopularTimezonePairs().map((pair, index) => (
              <div key={index} className="suggestion-card">
                <div className="suggestion-header">
                  <h4>{pair.description}</h4>
                </div>
                <div className="suggestion-timezones">
                  <span>{pair.source.abbreviation}</span>
                  <span>→</span>
                  <span>{pair.target.abbreviation}</span>
                </div>
                <Button
                  variant="outline"
                  size="small"
                  onClick={() => {
                    selectSourceTimezone(pair.source);
                    selectTargetTimezone(pair.target);
                    setActiveTab('converter');
                  }}
                >
                  Use This Pair
                </Button>
              </div>
            ))}
          </div>

          {sourceTimezone && targetTimezone && (
            <div className="meeting-suggestions">
              <h3>Suggested Meeting Times</h3>
              <div className="meeting-times">
                {getSuggestedMeetingTimes(sourceTimezone, targetTimezone).map((suggestion, index) => (
                  <div key={index} className="meeting-time">
                    {suggestion.description}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <div className="timezone-converter__history">
          <div className="history-header">
            <h3>Conversion History</h3>
            <div className="history-actions">
              <Button
                variant="outline"
                size="small"
                onClick={() => exportHistory('json')}
                disabled={conversionHistory.length === 0}
              >
                📄 Export JSON
              </Button>
              <Button
                variant="outline"
                size="small"
                onClick={() => exportHistory('csv')}
                disabled={conversionHistory.length === 0}
              >
                📊 Export CSV
              </Button>
              <Button
                variant="outline"
                size="small"
                onClick={clearHistory}
                disabled={conversionHistory.length === 0}
              >
                🗑️ Clear
              </Button>
            </div>
          </div>

          {conversionHistory.length === 0 ? (
            <div className="empty-history">
              <p>No conversions yet. Start converting to build your history!</p>
            </div>
          ) : (
            <div className="history-list">
              {conversionHistory.map((conversion) => (
                <div key={conversion.id} className="history-item">
                  <div className="history-conversion">
                    <div className="history-from">
                      <span className="history-time">{conversion.sourceTimeString}</span>
                      <span className="history-timezone">{conversion.sourceTimezone.abbreviation}</span>
                    </div>
                    <span className="history-arrow">→</span>
                    <div className="history-to">
                      <span className="history-time">{conversion.targetTimeString}</span>
                      <span className="history-timezone">{conversion.targetTimezone.abbreviation}</span>
                    </div>
                  </div>
                  <div className="history-meta">
                    <span className="history-date">
                      {conversion.timestamp.toLocaleDateString()}
                    </span>
                    <span className="history-difference">
                      {conversion.timeDifference.formattedDifference}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TimezoneConverter;