import React, { useState, useEffect, useCallback } from 'react';
import ToolHeader from '../../../common/ToolHeader';
import { LocationTime, TimeDifference, ClockDisplayOptions, TimezoneSearchResult } from '../../../../models/timezone';
import { 
  createLocationTime, 
  updateLocationTime, 
  calculateTimeDifference, 
  searchTimezones, 
  getPopularTimezones,
  formatTime,
  getTimezonePresets,
  createLocationsFromPreset,
  searchByAbbreviation
} from '../../../../utils/timezoneUtils';
import { useCopyToClipboard } from '../../../../hooks/useCopyToClipboard';
import Button from '../../../common/Button';
import './LocationComparator.css';

const LocationComparator: React.FC = () => {
  const [locations, setLocations] = useState<LocationTime[]>([]);
  const [baseLocationId, setBaseLocationId] = useState<string>('');
  const [timeDifferences, setTimeDifferences] = useState<TimeDifference[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<TimezoneSearchResult[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const [isRunning, setIsRunning] = useState(true);
  const [displayOptions, setDisplayOptions] = useState<ClockDisplayOptions>({
    format24Hour: false,
    showSeconds: true,
    showDate: true,
    showTimezone: true,
    showBusinessHours: true
  });
  
  const { copy, isCopied } = useCopyToClipboard();
  const timezonePresets = getTimezonePresets();

  // Real-time clock updates
  useEffect(() => {
    if (!isRunning || locations.length === 0) return;

    const interval = setInterval(() => {
      setLocations(prevLocations => 
        prevLocations.map(location => updateLocationTime(location))
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, locations.length]);

  // Calculate time differences when locations or base location changes
  useEffect(() => {
    if (locations.length === 0 || !baseLocationId) {
      setTimeDifferences([]);
      return;
    }

    const baseLocation = locations.find(loc => loc.id === baseLocationId);
    if (!baseLocation) return;

    const differences = locations
      .filter(loc => loc.id !== baseLocationId)
      .map(loc => calculateTimeDifference(baseLocation, loc));

    setTimeDifferences(differences);
  }, [locations, baseLocationId]);

  // Search timezone suggestions
  useEffect(() => {
    const results = searchTimezones(searchQuery);
    setSearchResults(results);
  }, [searchQuery]);

  // Initialize with popular timezones
  useEffect(() => {
    const popularTimezones = getPopularTimezones().slice(0, 4);
    const initialLocations = popularTimezones.map(tz => 
      createLocationTime(tz.timezone, tz.city, tz.country, tz.coordinates)
    );
    setLocations(initialLocations);
    if (initialLocations.length > 0) {
      setBaseLocationId(initialLocations[0].id);
    }
  }, []);

  const handleAddLocation = useCallback((timezone: TimezoneSearchResult) => {
    // Check if location already exists
    const exists = locations.some(loc => loc.timezone.timezone === timezone.timezone);
    if (exists) {
      alert('This location is already added to your comparison.');
      return;
    }

    const newLocation = createLocationTime(
      timezone.timezone, 
      timezone.city, 
      timezone.country, 
      timezone.coordinates
    );
    
    setLocations(prev => [...prev, newLocation]);
    
    // Set as base location if it's the first one
    if (locations.length === 0) {
      setBaseLocationId(newLocation.id);
    }
    
    setSearchQuery('');
    setShowSearch(false);
  }, [locations]);

  const handleRemoveLocation = useCallback((locationId: string) => {
    setLocations(prev => prev.filter(loc => loc.id !== locationId));
    
    // Update base location if the removed location was the base
    if (baseLocationId === locationId) {
      const remainingLocations = locations.filter(loc => loc.id !== locationId);
      setBaseLocationId(remainingLocations.length > 0 ? remainingLocations[0].id : '');
    }
  }, [baseLocationId, locations]);

  const handleSetBaseLocation = useCallback((locationId: string) => {
    setBaseLocationId(locationId);
  }, []);

  const handleCopyTime = useCallback((location: LocationTime) => {
    const timeString = `${location.name}: ${location.formattedTime} (${location.timezone.abbreviation})`;
    copy(timeString);
  }, [copy]);

  const handleCopyAllTimes = useCallback(() => {
    const allTimes = locations.map(loc => 
      `${loc.name}: ${loc.formattedTime} (${loc.timezone.abbreviation})`
    ).join('\n');
    copy(allTimes);
  }, [locations, copy]);

  const toggleClock = useCallback(() => {
    setIsRunning(prev => !prev);
  }, []);

  const handleLoadPreset = useCallback((presetName: keyof typeof timezonePresets) => {
    const presetLocations = createLocationsFromPreset(presetName);
    setLocations(presetLocations);
    
    if (presetLocations.length > 0) {
      setBaseLocationId(presetLocations[0].id);
    }
    
    setShowPresets(false);
  }, []);

  const handleSearchByAbbreviation = useCallback((abbreviation: string) => {
    const results = searchByAbbreviation(abbreviation);
    setSearchResults(results);
  }, []);

  const clearAllLocations = useCallback(() => {
    setLocations([]);
    setBaseLocationId('');
    setTimeDifferences([]);
  }, []);

  const baseLocation = locations.find(loc => loc.id === baseLocationId);

  return (
    <div className="location-comparator">
      <ToolHeader
        title="🌍 Location & Timezone Comparator"
        description="Compare times across different locations and track multiple world clocks"
      />
      
      <div className="comparator-header">
        <div className="header-controls">
          <div className="clock-controls">
            <Button
              variant={isRunning ? 'secondary' : 'primary'}
              onClick={toggleClock}
            >
              {isRunning ? '⏸️ Pause' : '▶️ Start'} Clocks
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowSearch(!showSearch)}
            >
              ➕ Add Location
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowPresets(!showPresets)}
            >
              🎯 Quick Presets
            </Button>
            <Button
              variant="outline"
              onClick={clearAllLocations}
              disabled={locations.length === 0}
            >
              🗑️ Clear All
            </Button>
          </div>
        </div>
      </div>

      {/* Search Section */}
      {showSearch && (
        <div className="search-section">
          <div className="search-container">
            <div className="search-input-group">
              <input
                type="text"
                placeholder="Search by city, country, or timezone abbreviation (e.g., IST, CET, PST)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              <Button
                variant="outline"
                onClick={() => setShowSearch(false)}
              >
                ✕
              </Button>
            </div>

            {/* Quick timezone abbreviation buttons */}
            <div className="abbreviation-quick-select">
              <h4>🔤 Popular Timezone Abbreviations</h4>
              <div className="abbreviation-grid">
                {['IST', 'CET', 'EST', 'PST', 'JST', 'GMT', 'CST_ASIA', 'AEST'].map((abbr) => (
                  <button
                    key={abbr}
                    className="abbreviation-btn"
                    onClick={() => handleSearchByAbbreviation(abbr)}
                  >
                    {abbr.replace('_ASIA', '').replace('_NA', '')}
                  </button>
                ))}
              </div>
            </div>
            
            {searchResults.length > 0 && (
              <div className="search-results">
                <h3>🔍 Search Results</h3>
                <div className="results-grid">
                  {searchResults.slice(0, 12).map((result, index) => (
                    <div
                      key={`${result.timezone}-${index}`}
                      className="result-item"
                      onClick={() => handleAddLocation(result)}
                    >
                      <div className="result-info">
                        <span className="result-city">{result.city}</span>
                        <span className="result-country">{result.country}</span>
                        <span className="result-timezone">{result.timezone}</span>
                      </div>
                      <Button variant="primary" size="small">
                        Add
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Preset Selection */}
      {showPresets && (
        <div className="presets-section">
          <div className="presets-container">
            <div className="presets-header">
              <h3>🎯 Quick Timezone Presets</h3>
              <Button
                variant="outline"
                onClick={() => setShowPresets(false)}
              >
                ✕
              </Button>
            </div>
            
            <div className="presets-grid">
              {Object.entries(timezonePresets).map(([presetName, presetData]) => (
                <div
                  key={presetName}
                  className="preset-card"
                  onClick={() => handleLoadPreset(presetName as keyof typeof timezonePresets)}
                >
                  <div className="preset-header">
                    <h4>{presetName}</h4>
                    <span className="preset-count">{presetData.length} zones</span>
                  </div>
                  <div className="preset-zones">
                    {presetData.slice(0, 3).map((zone, index) => (
                      <span key={index} className="preset-zone">
                        {zone.name.split('(')[0].trim()}
                      </span>
                    ))}
                    {presetData.length > 3 && <span className="preset-more">+{presetData.length - 3} more</span>}
                  </div>
                  <Button variant="primary" size="small">
                    Load Preset
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Display Options */}
      <div className="display-options">
        <h3>⚙️ Display Options</h3>
        <div className="options-grid">
          <label className="option-item">
            <input
              type="checkbox"
              checked={displayOptions.format24Hour}
              onChange={(e) => setDisplayOptions(prev => ({ ...prev, format24Hour: e.target.checked }))}
            />
            <span>24-hour format</span>
          </label>
          <label className="option-item">
            <input
              type="checkbox"
              checked={displayOptions.showSeconds}
              onChange={(e) => setDisplayOptions(prev => ({ ...prev, showSeconds: e.target.checked }))}
            />
            <span>Show seconds</span>
          </label>
          <label className="option-item">
            <input
              type="checkbox"
              checked={displayOptions.showDate}
              onChange={(e) => setDisplayOptions(prev => ({ ...prev, showDate: e.target.checked }))}
            />
            <span>Show date</span>
          </label>
          <label className="option-item">
            <input
              type="checkbox"
              checked={displayOptions.showTimezone}
              onChange={(e) => setDisplayOptions(prev => ({ ...prev, showTimezone: e.target.checked }))}
            />
            <span>Show timezone</span>
          </label>
          <label className="option-item">
            <input
              type="checkbox"
              checked={displayOptions.showBusinessHours}
              onChange={(e) => setDisplayOptions(prev => ({ ...prev, showBusinessHours: e.target.checked }))}
            />
            <span>Show business hours</span>
          </label>
        </div>
      </div>

      {/* World Clocks Grid */}
      {locations.length > 0 && (
        <div className="world-clocks">
          <div className="clocks-header">
            <h2>🕐 World Clocks</h2>
            <Button
              variant="outline"
              onClick={handleCopyAllTimes}
              title="Copy all times"
            >
              📋 Copy All
            </Button>
          </div>
          
          <div className="clocks-grid">
            {locations.map((location) => (
              <div
                key={location.id}
                className={`clock-card ${baseLocationId === location.id ? 'base-location' : ''}`}
              >
                <div className="clock-header">
                  <div className="location-info">
                    <h3 className="location-name">{location.name}</h3>
                    <span className="location-country">{location.country}</span>
                  </div>
                  <div className="clock-actions">
                    <button
                      className="copy-time-btn"
                      onClick={() => handleCopyTime(location)}
                      title="Copy time"
                    >
                      📋
                    </button>
                    <button
                      className="remove-btn"
                      onClick={() => handleRemoveLocation(location.id)}
                      title="Remove location"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                <div className="clock-display">
                  <div className="digital-clock">
                    <span className="time-display">
                      {formatTime(location.currentTime, displayOptions.format24Hour, displayOptions.showSeconds)}
                    </span>
                    {displayOptions.showTimezone && (
                      <span className="timezone-display">
                        {location.timezone.abbreviation}
                      </span>
                    )}
                  </div>
                  
                  {displayOptions.showDate && (
                    <div className="date-display">
                      {location.formattedDate}
                    </div>
                  )}
                </div>

                <div className="clock-details">
                  <div className="timezone-info">
                    <span className="timezone-name">{location.timezone.timezone}</span>
                    <span className="utc-offset">{location.timezone.utcOffset}</span>
                  </div>
                  
                  {displayOptions.showBusinessHours && (
                    <div className={`business-hours ${location.isBusinessHours ? 'open' : 'closed'}`}>
                      {location.isBusinessHours ? '🟢 Business Hours' : '🔴 After Hours'}
                    </div>
                  )}
                </div>

                <div className="clock-controls">
                  {baseLocationId !== location.id && (
                    <Button
                      variant="outline"
                      size="small"
                      onClick={() => handleSetBaseLocation(location.id)}
                    >
                      Set as Base
                    </Button>
                  )}
                  {baseLocationId === location.id && (
                    <span className="base-indicator">⭐ Base Location</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Time Differences */}
      {baseLocation && timeDifferences.length > 0 && (
        <div className="time-differences">
          <h2>⏰ Time Differences from {baseLocation.name}</h2>
          <div className="differences-table">
            <div className="table-header">
              <span>Location</span>
              <span>Local Time</span>
              <span>Time Difference</span>
              <span>Status</span>
            </div>
            {timeDifferences.map((diff) => {
              const location = locations.find(loc => loc.id === diff.locationId);
              if (!location) return null;

              return (
                <div key={diff.locationId} className="table-row">
                  <div className="location-cell">
                    <span className="location-name">{diff.locationName}</span>
                    <span className="location-country">{location.country}</span>
                  </div>
                  <div className="time-cell">
                    <span className="time-value">
                      {formatTime(location.currentTime, displayOptions.format24Hour, false)}
                    </span>
                    <span className="timezone-abbr">{location.timezone.abbreviation}</span>
                  </div>
                  <div className="difference-cell">
                    <span className={`difference-value ${diff.formattedDifference.includes('+') ? 'ahead' : 'behind'}`}>
                      {diff.formattedDifference}
                    </span>
                  </div>
                  <div className="status-cell">
                    <span className={`status-indicator ${location.isBusinessHours ? 'open' : 'closed'}`}>
                      {location.isBusinessHours ? '🟢 Open' : '🔴 Closed'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Copy Notification */}
      {isCopied && (
        <div className="copy-notification">
          ✅ Copied to clipboard!
        </div>
      )}

      {/* Empty State */}
      {locations.length === 0 && (
        <div className="empty-state">
          <div className="empty-content">
            <div className="empty-icon">🌍</div>
            <h3>No locations added yet</h3>
            <p>Add some locations to start comparing times across different time zones.</p>
            <Button
              variant="primary"
              onClick={() => setShowSearch(true)}
            >
              ➕ Add Your First Location
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationComparator;