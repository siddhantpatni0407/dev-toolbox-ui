/**
 * World Clock Component
 * Displays world clocks with dropdown selector and analog clock visualization
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  WorldClockTimezone,
  WorldClockData,
  WorldClockSettings,
  DEFAULT_WORLD_CLOCK_SETTINGS
} from '../../../../models/worldClock';
import {
  getWorldClockData,
  searchWorldClockTimezones,
  getPopularTimezones,
  getTimezoneSuggestions,
  isDaylightSavingTime,
  getClockAngles,
  formatTimezoneOffset,
  formatTime
} from '../../../../utils/worldClockUtils';
import { useDebounce } from '../../../../hooks/useDebounce';
import Button from '../../../common/Button';
import './WorldClock.css';

interface AnalogClockProps {
  time: WorldClockData;
  size?: number;
  showSecondHand?: boolean;
  showNumbers?: boolean;
  showTicks?: boolean;
  theme?: 'light' | 'dark' | 'auto';
  style?: 'modern' | 'classic' | 'minimal';
}

const AnalogClock: React.FC<AnalogClockProps> = ({
  time,
  size = 200,
  showSecondHand = true,
  showNumbers = true,
  showTicks = true,
  theme = 'auto',
  style = 'modern'
}) => {
  const angles = getClockAngles(time.currentTime);
  const radius = size / 2;
  const centerX = radius;
  const centerY = radius;

  // Generate hour markers
  const hourMarkers = Array.from({ length: 12 }, (_, i) => {
    const angle = (i * 30) - 90;
    const radian = (angle * Math.PI) / 180;
    const innerRadius = radius * 0.85;
    const outerRadius = radius * 0.95;
    
    return {
      number: i === 0 ? 12 : i,
      x1: centerX + Math.cos(radian) * innerRadius,
      y1: centerY + Math.sin(radian) * innerRadius,
      x2: centerX + Math.cos(radian) * outerRadius,
      y2: centerY + Math.sin(radian) * outerRadius,
      textX: centerX + Math.cos(radian) * (radius * 0.75),
      textY: centerY + Math.sin(radian) * (radius * 0.75)
    };
  });

  // Generate minute markers
  const minuteMarkers = Array.from({ length: 60 }, (_, i) => {
    if (i % 5 === 0) return null; // Skip hour positions
    const angle = (i * 6) - 90;
    const radian = (angle * Math.PI) / 180;
    const innerRadius = radius * 0.9;
    const outerRadius = radius * 0.95;
    
    return {
      x1: centerX + Math.cos(radian) * innerRadius,
      y1: centerY + Math.sin(radian) * innerRadius,
      x2: centerX + Math.cos(radian) * outerRadius,
      y2: centerY + Math.sin(radian) * outerRadius
    };
  }).filter(Boolean);

  return (
    <div className={`analog-clock analog-clock--${theme} analog-clock--${style}`}>
      <svg width={size} height={size} className="analog-clock__svg">
        {/* Clock face */}
        <circle
          cx={centerX}
          cy={centerY}
          r={radius - 10}
          className="analog-clock__face"
        />
        
        {/* Hour markers */}
        {showTicks && hourMarkers.map((marker, index) => (
          <line
            key={index}
            x1={marker.x1}
            y1={marker.y1}
            x2={marker.x2}
            y2={marker.y2}
            className="analog-clock__hour-tick"
          />
        ))}
        
        {/* Minute markers */}
        {showTicks && minuteMarkers.map((marker, index) => 
          marker && (
            <line
              key={index}
              x1={marker.x1}
              y1={marker.y1}
              x2={marker.x2}
              y2={marker.y2}
              className="analog-clock__minute-tick"
            />
          )
        )}
        
        {/* Numbers */}
        {showNumbers && hourMarkers.map((marker, index) => (
          <text
            key={index}
            x={marker.textX}
            y={marker.textY}
            className="analog-clock__number"
            textAnchor="middle"
            dominantBaseline="middle"
          >
            {marker.number}
          </text>
        ))}
        
        {/* Hour hand */}
        <line
          x1={centerX}
          y1={centerY}
          x2={centerX + Math.cos((angles.hour * Math.PI) / 180) * (radius * 0.5)}
          y2={centerY + Math.sin((angles.hour * Math.PI) / 180) * (radius * 0.5)}
          className="analog-clock__hour-hand"
          style={{ transform: 'rotate(0deg)', transformOrigin: `${centerX}px ${centerY}px` }}
        />
        
        {/* Minute hand */}
        <line
          x1={centerX}
          y1={centerY}
          x2={centerX + Math.cos((angles.minute * Math.PI) / 180) * (radius * 0.75)}
          y2={centerY + Math.sin((angles.minute * Math.PI) / 180) * (radius * 0.75)}
          className="analog-clock__minute-hand"
        />
        
        {/* Second hand */}
        {showSecondHand && (
          <line
            x1={centerX}
            y1={centerY}
            x2={centerX + Math.cos((angles.second * Math.PI) / 180) * (radius * 0.85)}
            y2={centerY + Math.sin((angles.second * Math.PI) / 180) * (radius * 0.85)}
            className="analog-clock__second-hand"
          />
        )}
        
        {/* Center dot */}
        <circle
          cx={centerX}
          cy={centerY}
          r="4"
          className="analog-clock__center"
        />
      </svg>
    </div>
  );
};

const WorldClock: React.FC = () => {
  const [selectedTimezone, setSelectedTimezone] = useState<WorldClockTimezone | null>(null);
  const [clockData, setClockData] = useState<WorldClockData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [settings, setSettings] = useState<WorldClockSettings>(DEFAULT_WORLD_CLOCK_SETTINGS);
  const [searchResults, setSearchResults] = useState<WorldClockTimezone[]>([]);
  const [popularTimezones] = useState(getPopularTimezones());
  const [suggestions] = useState(getTimezoneSuggestions());

  const debouncedSearch = useDebounce(searchQuery, 300);

  // Search timezones
  useEffect(() => {
    if (debouncedSearch.trim()) {
      setSearchResults(searchWorldClockTimezones(debouncedSearch));
    } else {
      setSearchResults(popularTimezones);
    }
  }, [debouncedSearch, popularTimezones]);

  // Update clock data
  const updateClockData = useCallback(() => {
    if (selectedTimezone) {
      const data = getWorldClockData(selectedTimezone, settings.format24Hour);
      setClockData(data);
    }
  }, [selectedTimezone, settings.format24Hour]);

  // Auto-update timer
  useEffect(() => {
    if (settings.autoUpdate && selectedTimezone) {
      updateClockData();
      const interval = setInterval(updateClockData, settings.updateInterval);
      return () => clearInterval(interval);
    }
  }, [settings.autoUpdate, settings.updateInterval, updateClockData, selectedTimezone]);

  // Initial update
  useEffect(() => {
    updateClockData();
  }, [updateClockData]);

  const selectTimezone = useCallback((timezone: WorldClockTimezone) => {
    setSelectedTimezone(timezone);
    setSearchQuery(timezone.name);
    setShowDropdown(false);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedTimezone(null);
    setClockData(null);
    setSearchQuery('');
  }, []);

  const toggleFormat = useCallback(() => {
    setSettings(prev => ({
      ...prev,
      format24Hour: !prev.format24Hour
    }));
  }, []);

  const toggleAutoUpdate = useCallback(() => {
    setSettings(prev => ({
      ...prev,
      autoUpdate: !prev.autoUpdate
    }));
  }, []);

  return (
    <div className="world-clock">
      <div className="world-clock__header">
        <h1>World Clock</h1>
        <p>Select any timezone to view current time with analog clock</p>
      </div>

      <div className="world-clock__controls">
        <div className="timezone-selector">
          <label htmlFor="timezone-search">Select Timezone</label>
          <div className="selector-container">
            <input
              id="timezone-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowDropdown(true)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
              placeholder="Search timezone (e.g., New York, London, Tokyo)"
              className="timezone-input"
            />
            {showDropdown && (
              <div className="timezone-dropdown">
                {searchResults.length === 0 ? (
                  <div className="timezone-dropdown__no-results">
                    No timezones found matching "{searchQuery}"
                  </div>
                ) : (
                  <>
                    {!debouncedSearch.trim() && (
                      <div className="timezone-dropdown__section">
                        <div className="timezone-dropdown__section-title">Suggested</div>
                        {suggestions.slice(0, 3).map((suggestion) => (
                          <div
                            key={suggestion.timezone.id}
                            className="timezone-option timezone-option--suggested"
                            onClick={() => selectTimezone(suggestion.timezone)}
                          >
                            <div className="timezone-option__main">
                              <span className="timezone-abbreviation">{suggestion.timezone.abbreviation}</span>
                              <span className="timezone-name">{suggestion.timezone.name}</span>
                              <span className="timezone-flag">{suggestion.timezone.flag}</span>
                            </div>
                            <div className="timezone-option__details">
                              <span className="timezone-offset">{formatTimezoneOffset(suggestion.timezone, true)}</span>
                              <span className="timezone-reason">{suggestion.reason}</span>
                            </div>
                          </div>
                        ))}
                        <div className="timezone-dropdown__section-title">Popular</div>
                      </div>
                    )}
                    {searchResults.map((timezone) => (
                      <div
                        key={timezone.id}
                        className="timezone-option"
                        onClick={() => selectTimezone(timezone)}
                      >
                        <div className="timezone-option__main">
                          <span className="timezone-abbreviation">{timezone.abbreviation}</span>
                          <span className="timezone-name">{timezone.name}</span>
                          <span className="timezone-flag">{timezone.flag}</span>
                        </div>
                        <div className="timezone-option__details">
                          <span className="timezone-offset">{formatTimezoneOffset(timezone, true)}</span>
                          <span className="timezone-cities">
                            {timezone.cities.slice(0, 3).join(', ')}
                            {timezone.cities.length > 3 && '...'}
                          </span>
                          <span className="timezone-region">{timezone.region}</span>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="world-clock__settings">
          <Button
            variant={settings.format24Hour ? 'primary' : 'outline'}
            size="small"
            onClick={toggleFormat}
          >
            {settings.format24Hour ? '24H' : '12H'}
          </Button>
          <Button
            variant={settings.autoUpdate ? 'primary' : 'outline'}
            size="small"
            onClick={toggleAutoUpdate}
          >
            {settings.autoUpdate ? 'Auto ✓' : 'Manual'}
          </Button>
          {selectedTimezone && (
            <Button
              variant="outline"
              size="small"
              onClick={clearSelection}
            >
              Clear
            </Button>
          )}
        </div>
      </div>

      {clockData && selectedTimezone && (
        <div className="world-clock__display">
          <div className="clock-info">
            <div className="clock-info__header">
              <h2>
                <span className="clock-info__flag">{selectedTimezone.flag}</span>
                {selectedTimezone.name}
              </h2>
              <div className="clock-info__meta">
                <span className="clock-info__country">{selectedTimezone.country}</span>
                <span className="clock-info__abbreviation">{selectedTimezone.abbreviation}</span>
                {isDaylightSavingTime(selectedTimezone) && (
                  <span className="clock-info__dst">DST</span>
                )}
              </div>
            </div>

            <div className="clock-info__time">
              <div className="digital-time">
                <span className="digital-time__value">
                  {formatTime(clockData.currentTime, settings.showSeconds)}
                </span>
                <span className="digital-time__offset">
                  {formatTimezoneOffset(selectedTimezone, true)}
                </span>
              </div>
              {settings.showDate && (
                <div className="digital-date">{clockData.dateString}</div>
              )}
            </div>

            <div className="clock-info__details">
              <div className="detail-item">
                <span className="detail-label">Major Cities:</span>
                <span className="detail-value">{selectedTimezone.cities.join(', ')}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">IANA Code:</span>
                <span className="detail-value">{selectedTimezone.ianaCode}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Region:</span>
                <span className="detail-value">{selectedTimezone.region}</span>
              </div>
              {clockData.isCurrentTimezone && (
                <div className="detail-item detail-item--current">
                  <span className="detail-value">📍 This is your current timezone</span>
                </div>
              )}
            </div>
          </div>

          <div className="analog-clock-container">
            <AnalogClock
              time={clockData}
              size={settings.analogClock.size}
              showSecondHand={settings.analogClock.showSecondHand}
              showNumbers={settings.analogClock.showNumbers}
              showTicks={settings.analogClock.showTicks}
              theme={settings.analogClock.theme}
              style={settings.analogClock.style}
            />
            <div className="analog-clock__label">
              <div className="analog-clock__time">
                {formatTime(clockData.currentTime, false)}
              </div>
              <div className="analog-clock__timezone">
                {selectedTimezone.abbreviation}
              </div>
            </div>
          </div>
        </div>
      )}

      {!selectedTimezone && (
        <div className="world-clock__empty">
          <div className="empty-state">
            <div className="empty-state__icon">🌍</div>
            <h3>Select a Timezone</h3>
            <p>Choose any timezone from the dropdown to view current time with an analog clock display.</p>
            <div className="empty-state__suggestions">
              <h4>Popular Timezones:</h4>
              <div className="timezone-chips">
                {popularTimezones.slice(0, 6).map((timezone) => (
                  <button
                    key={timezone.id}
                    className="timezone-chip"
                    onClick={() => selectTimezone(timezone)}
                  >
                    <span className="timezone-chip__flag">{timezone.flag}</span>
                    <span className="timezone-chip__name">{timezone.abbreviation}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorldClock;