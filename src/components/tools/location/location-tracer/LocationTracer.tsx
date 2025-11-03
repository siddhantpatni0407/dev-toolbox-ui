import React, { useState, useCallback } from 'react';
import ToolHeader from '../../../common/ToolHeader';
import { 
  Coordinates, 
  LocationInfo, 
  LocationResponse 
} from '../../../../models/location';
import { 
  reverseGeocode, 
  validateCoordinates, 
  parseCoordinates, 
  formatCoordinates, 
  getCurrentLocation, 
  generateMapsUrl 
} from '../../../../utils/locationUtils';
import { useCopyToClipboard } from '../../../../hooks/useCopyToClipboard';
import { ButtonVariant, InputSize } from '../../../../enums';
import Button from '../../../common/Button';
import './LocationTracer.css';

const LocationTracer: React.FC = () => {
  const [latitude, setLatitude] = useState<string>('');
  const [longitude, setLongitude] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [locationInfo, setLocationInfo] = useState<LocationInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [coordinateFormat, setCoordinateFormat] = useState<'decimal' | 'dms'>('decimal');
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [copyStatus, setCopyStatus] = useState<string>('');
  
  const { isCopied, copy } = useCopyToClipboard();

  const clearResults = useCallback(() => {
    setLocationInfo(null);
    setError(null);
    setValidationErrors([]);
  }, []);

  const clearAll = useCallback(() => {
    setLatitude('');
    setLongitude('');
    clearResults();
  }, [clearResults]);

  const convertToDMS = useCallback((decimal: number, isLatitude: boolean): string => {
    const absolute = Math.abs(decimal);
    const degrees = Math.floor(absolute);
    const minutesFloat = (absolute - degrees) * 60;
    const minutes = Math.floor(minutesFloat);
    const seconds = ((minutesFloat - minutes) * 60).toFixed(2);
    
    const direction = isLatitude 
      ? (decimal >= 0 ? 'N' : 'S')
      : (decimal >= 0 ? 'E' : 'W');
    
    return `${degrees}° ${minutes}' ${seconds}" ${direction}`;
  }, []);

  const getFormattedCoordinates = useCallback(() => {
    if (!locationInfo) return '';
    
    if (coordinateFormat === 'dms') {
      const latDMS = convertToDMS(locationInfo.coordinates.latitude, true);
      const lngDMS = convertToDMS(locationInfo.coordinates.longitude, false);
      return `${latDMS}, ${lngDMS}`;
    }
    
    return formatCoordinates(locationInfo.coordinates);
  }, [locationInfo, coordinateFormat, convertToDMS]);

  const handleInputChange = useCallback((type: 'lat' | 'lng', value: string) => {
    if (type === 'lat') {
      setLatitude(value);
    } else {
      setLongitude(value);
    }
    clearResults();
    
    // Real-time validation feedback
    if (value.trim()) {
      const num = parseFloat(value);
      if (!isNaN(num)) {
        const isLat = type === 'lat';
        const min = isLat ? -90 : -180;
        const max = isLat ? 90 : 180;
        
        if (num < min || num > max) {
          setValidationErrors([`${isLat ? 'Latitude' : 'Longitude'} must be between ${min} and ${max}`]);
        } else {
          setValidationErrors([]);
        }
      }
    } else {
      setValidationErrors([]);
    }
  }, [clearResults]);

  const handleTraceLocation = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setValidationErrors([]);
    setLocationInfo(null);

    try {
      // Parse coordinates
      const parsed = parseCoordinates(latitude, longitude);
      if (!parsed) {
        setValidationErrors(['Please enter valid numeric coordinates']);
        return;
      }

      // Validate coordinates
      const validation = validateCoordinates(parsed.lat, parsed.lng);
      if (!validation.isValid) {
        setValidationErrors(validation.errors);
        return;
      }

      const coordinates: Coordinates = {
        latitude: parsed.lat,
        longitude: parsed.lng
      };

      // Perform reverse geocoding
      const response: LocationResponse = await reverseGeocode(coordinates);
      
      if (response.success && response.data) {
        setLocationInfo(response.data);
      } else {
        setError(response.error?.message || 'Failed to trace location');
      }

    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [latitude, longitude]);

  const handleGetCurrentLocation = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setValidationErrors([]);

    try {
      const coordinates = await getCurrentLocation();
      setLatitude(coordinates.latitude.toString());
      setLongitude(coordinates.longitude.toString());
      
      // Automatically trace the current location
      const response: LocationResponse = await reverseGeocode(coordinates);
      
      if (response.success && response.data) {
        setLocationInfo(response.data);
      } else {
        setError(response.error?.message || 'Failed to trace current location');
      }

    } catch (err: any) {
      setError(err.message || 'Failed to get current location');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleCopyCoordinates = useCallback(async () => {
    if (locationInfo) {
      const coordStr = getFormattedCoordinates();
      const success = await copy(coordStr);
      setCopyStatus(success ? 'Coordinates copied!' : 'Copy failed');
      setTimeout(() => setCopyStatus(''), 2000);
    }
  }, [locationInfo, copy, getFormattedCoordinates]);

  const handleCopyAddress = useCallback(async () => {
    if (locationInfo) {
      const success = await copy(locationInfo.formattedAddress);
      setCopyStatus(success ? 'Address copied!' : 'Copy failed');
      setTimeout(() => setCopyStatus(''), 2000);
    }
  }, [locationInfo, copy]);

  return (
    <div className="location-tracer">
      <div className="container">
        <ToolHeader
          title="Location Tracer"
          description="Find location details from latitude and longitude coordinates"
        />

        <div className="location-content">
          <div className="input-section">
            <h2>Coordinate Input</h2>
            
            <div className="coordinate-inputs">
              <div className="input-group">
                <label htmlFor="latitude">Latitude</label>
                <input
                  id="latitude"
                  type="text"
                  value={latitude}
                  onChange={(e) => handleInputChange('lat', e.target.value)}
                  placeholder="e.g., 40.7128"
                  className={`coordinate-input ${validationErrors.length > 0 && latitude.trim() ? 'error' : ''}`}
                />
                <small className="input-hint">Range: -90 to 90</small>
              </div>

              <div className="input-group">
                <label htmlFor="longitude">Longitude</label>
                <input
                  id="longitude"
                  type="text"
                  value={longitude}
                  onChange={(e) => handleInputChange('lng', e.target.value)}
                  placeholder="e.g., -74.0060"
                  className={`coordinate-input ${validationErrors.length > 0 && longitude.trim() ? 'error' : ''}`}
                />
                <small className="input-hint">Range: -180 to 180</small>
              </div>
            </div>

            {latitude.trim() && longitude.trim() && validationErrors.length === 0 && (
              <div className="coordinate-preview">
                <div className="preview-header">📍 Coordinate Preview</div>
                <div className="preview-content">
                  <strong>Decimal:</strong> {parseFloat(latitude).toFixed(6)}, {parseFloat(longitude).toFixed(6)}
                  <br />
                  <strong>DMS:</strong> {convertToDMS(parseFloat(latitude), true)}, {convertToDMS(parseFloat(longitude), false)}
                </div>
              </div>
            )}

            <div className="settings-section">
              <button 
                className="advanced-toggle"
                onClick={() => setShowAdvanced(!showAdvanced)}
                type="button"
              >
                ⚙️ Advanced Settings {showAdvanced ? '▼' : '▶'}
              </button>
              
              {showAdvanced && (
                <div className="advanced-settings">
                  <div className="setting-group">
                    <label htmlFor="coordinate-format">Coordinate Format:</label>
                    <select
                      id="coordinate-format"
                      value={coordinateFormat}
                      onChange={(e) => setCoordinateFormat(e.target.value as 'decimal' | 'dms')}
                      className="format-select"
                    >
                      <option value="decimal">Decimal Degrees (40.7128, -74.0060)</option>
                      <option value="dms">Degrees Minutes Seconds (40° 42' 46.08" N)</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {validationErrors.length > 0 && (
              <div className="validation-errors">
                {validationErrors.map((error, index) => (
                  <div key={index} className="error-message">
                    ⚠️ {error}
                  </div>
                ))}
              </div>
            )}

            <div className="action-buttons">
              <Button
                variant={ButtonVariant.PRIMARY}
                size={InputSize.LARGE}
                onClick={handleTraceLocation}
                loading={isLoading}
                disabled={!latitude.trim() || !longitude.trim()}
                className="trace-button"
              >
                🌍 Trace Location
              </Button>

              <Button
                variant={ButtonVariant.SECONDARY}
                size={InputSize.LARGE}
                onClick={handleGetCurrentLocation}
                loading={isLoading}
                className="current-location-button"
              >
                📍 Use Current Location
              </Button>

              <Button
                variant={ButtonVariant.OUTLINE}
                size={InputSize.LARGE}
                onClick={clearAll}
                disabled={isLoading || (!latitude.trim() && !longitude.trim())}
                className="clear-button"
              >
                🗑️ Clear All
              </Button>
            </div>
          </div>

          <div className="result-section">
            <h2>Location Information</h2>
            
            {error && (
              <div className="error-result">
                <div className="error-icon">❌</div>
                <div className="error-content">
                  <h3>Error</h3>
                  <p>{error}</p>
                </div>
              </div>
            )}

            {locationInfo ? (
              <div className="location-result">
                <div className="result-header">
                  <div className="location-icon">🌍</div>
                  <div className="location-title">
                    <h3>Location Found</h3>
                    <p>Coordinates: {getFormattedCoordinates()}</p>
                  </div>
                  <div className="coordinate-format-toggle">
                    <button
                      className={`format-btn ${coordinateFormat === 'decimal' ? 'active' : ''}`}
                      onClick={() => setCoordinateFormat('decimal')}
                      title="Decimal format"
                    >
                      DD
                    </button>
                    <button
                      className={`format-btn ${coordinateFormat === 'dms' ? 'active' : ''}`}
                      onClick={() => setCoordinateFormat('dms')}
                      title="Degrees, Minutes, Seconds format"
                    >
                      DMS
                    </button>
                  </div>
                </div>

                <div className="location-details">
                  <div className="location-table-container">
                    <table className="location-table">
                      <tbody>
                        <tr className="table-row">
                          <td className="table-label">
                            <div className="label-content">
                              <span className="label-icon">📍</span>
                              <span>Full Address</span>
                            </div>
                          </td>
                          <td className="table-value">
                            <div className="value-content">
                              <span className="value-text">{locationInfo.formattedAddress}</span>
                              <button 
                                className="copy-btn table-copy-btn"
                                onClick={handleCopyAddress}
                                title="Copy address"
                              >
                                📋
                              </button>
                            </div>
                          </td>
                        </tr>

                        {locationInfo.address && (
                          <tr className="table-row">
                            <td className="table-label">
                              <div className="label-content">
                                <span className="label-icon">🛣️</span>
                                <span>Street</span>
                              </div>
                            </td>
                            <td className="table-value">
                              <span className="value-text">{locationInfo.address}</span>
                            </td>
                          </tr>
                        )}

                        {locationInfo.city && (
                          <tr className="table-row">
                            <td className="table-label">
                              <div className="label-content">
                                <span className="label-icon">🏙️</span>
                                <span>City</span>
                              </div>
                            </td>
                            <td className="table-value">
                              <span className="value-text">{locationInfo.city}</span>
                            </td>
                          </tr>
                        )}

                        {locationInfo.state && (
                          <tr className="table-row">
                            <td className="table-label">
                              <div className="label-content">
                                <span className="label-icon">🗺️</span>
                                <span>State/Region</span>
                              </div>
                            </td>
                            <td className="table-value">
                              <span className="value-text">{locationInfo.state}</span>
                            </td>
                          </tr>
                        )}

                        {locationInfo.country && (
                          <tr className="table-row">
                            <td className="table-label">
                              <div className="label-content">
                                <span className="label-icon">🏳️</span>
                                <span>Country</span>
                              </div>
                            </td>
                            <td className="table-value">
                              <span className="value-text">{locationInfo.country}</span>
                            </td>
                          </tr>
                        )}

                        {locationInfo.postalCode && (
                          <tr className="table-row">
                            <td className="table-label">
                              <div className="label-content">
                                <span className="label-icon">📮</span>
                                <span>Postal Code</span>
                              </div>
                            </td>
                            <td className="table-value">
                              <span className="value-text">{locationInfo.postalCode}</span>
                            </td>
                          </tr>
                        )}

                        <tr className="table-row coordinates-row">
                          <td className="table-label">
                            <div className="label-content">
                              <span className="label-icon">🎯</span>
                              <span>Coordinates ({coordinateFormat.toUpperCase()})</span>
                            </div>
                          </td>
                          <td className="table-value">
                            <div className="value-content">
                              <span className="value-text coordinates-text">{getFormattedCoordinates()}</span>
                              <button 
                                className="copy-btn table-copy-btn"
                                onClick={handleCopyCoordinates}
                                title="Copy coordinates"
                              >
                                📋
                              </button>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="coordinate-details-section">
                    <h4 className="details-title">📊 Coordinate Breakdown</h4>
                    <div className="coordinate-breakdown-table">
                      <table className="breakdown-table">
                        <tbody>
                          <tr className="breakdown-row">
                            <td className="breakdown-label">Latitude:</td>
                            <td className="breakdown-value">
                              {coordinateFormat === 'decimal' 
                                ? locationInfo.coordinates.latitude.toFixed(6)
                                : convertToDMS(locationInfo.coordinates.latitude, true)
                              }
                            </td>
                          </tr>
                          <tr className="breakdown-row">
                            <td className="breakdown-label">Longitude:</td>
                            <td className="breakdown-value">
                              {coordinateFormat === 'decimal' 
                                ? locationInfo.coordinates.longitude.toFixed(6)
                                : convertToDMS(locationInfo.coordinates.longitude, false)
                              }
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <div className="location-actions">
                  <Button
                    variant={ButtonVariant.INFO}
                    size={InputSize.MEDIUM}
                    onClick={() => window.open(generateMapsUrl(locationInfo.coordinates), '_blank')}
                  >
                    🗺️ View on Google Maps
                  </Button>
                  
                  <Button
                    variant={ButtonVariant.SUCCESS}
                    size={InputSize.MEDIUM}
                    onClick={() => window.open(`https://www.openstreetmap.org/?mlat=${locationInfo.coordinates.latitude}&mlon=${locationInfo.coordinates.longitude}&zoom=15`, '_blank')}
                  >
                    🌐 View on OpenStreetMap
                  </Button>
                </div>
              </div>
            ) : !error && !isLoading ? (
              <div className="location-placeholder">
                <div className="placeholder-icon">🌍</div>
                <h3>Ready to Trace</h3>
                <p>Enter latitude and longitude coordinates to find location information</p>
              </div>
            ) : null}

            {isLoading && (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Tracing location...</p>
              </div>
            )}
          </div>
        </div>

        {(isCopied || copyStatus) && (
          <div className="copy-notification success">
            ✅ {copyStatus || 'Copied to clipboard!'}
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationTracer;