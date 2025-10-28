import React from 'react';
import { BaseComponent } from '../../../models/common';
import './JsonDisplay.css';

interface JsonDisplayProps extends BaseComponent {
  data: any;
  title?: string;
}

/**
 * Enhanced JSON display component with syntax highlighting
 * Memoized for performance optimization
 */
const JsonDisplay: React.FC<JsonDisplayProps> = React.memo(({ 
  data, 
  title, 
  className = '', 
  id 
}) => {
  const formatJson = (obj: any): string => {
    if (obj === null || obj === undefined) {
      return 'null';
    }
    
    if (typeof obj === 'string') {
      return `"${obj}"`;
    }
    
    if (typeof obj === 'number' || typeof obj === 'boolean') {
      return obj.toString();
    }
    
    if (Array.isArray(obj)) {
      if (obj.length === 0) return '[]';
      const formattedItems = obj.map(item => formatJson(item));
      return `[\n${formattedItems.map(item => `  ${item}`).join(',\n')}\n]`;
    }
    
    if (typeof obj === 'object') {
      const entries = Object.entries(obj);
      if (entries.length === 0) return '{}';
      
      const formattedEntries = entries.map(([key, value]) => {
        const formattedKey = `"${key}"`;
        const formattedValue = formatJson(value);
        return `  ${formattedKey}: ${formattedValue}`;
      });
      
      return `{\n${formattedEntries.join(',\n')}\n}`;
    }
    
    return String(obj);
  };

  interface Token {
    type: 'string' | 'number' | 'boolean' | 'null' | 'key' | 'punctuation' | 'whitespace';
    value: string;
  }

  const tokenizeJson = (jsonString: string): Token[] => {
    const tokens: Token[] = [];
    let i = 0;
    
    while (i < jsonString.length) {
      const char = jsonString[i];
      
      // Handle whitespace
      if (/\s/.test(char)) {
        let whitespace = '';
        while (i < jsonString.length && /\s/.test(jsonString[i])) {
          whitespace += jsonString[i];
          i++;
        }
        tokens.push({ type: 'whitespace', value: whitespace });
        continue;
      }
      
      // Handle strings
      if (char === '"') {
        let str = '"';
        i++;
        let escaped = false;
        
        while (i < jsonString.length) {
          const c = jsonString[i];
          str += c;
          
          if (c === '"' && !escaped) {
            i++;
            break;
          }
          
          escaped = c === '\\' && !escaped;
          i++;
        }
        
        // Determine if this is a key (followed by colon) or value
        let j = i;
        while (j < jsonString.length && /\s/.test(jsonString[j])) j++;
        const isKey = jsonString[j] === ':';
        
        tokens.push({ type: isKey ? 'key' : 'string', value: str });
        continue;
      }
      
      // Handle numbers
      if (/[-\d]/.test(char)) {
        let num = '';
        while (i < jsonString.length && /[-\d.eE+]/.test(jsonString[i])) {
          num += jsonString[i];
          i++;
        }
        tokens.push({ type: 'number', value: num });
        continue;
      }
      
      // Handle booleans and null
      if (/[a-z]/.test(char)) {
        let word = '';
        while (i < jsonString.length && /[a-z]/.test(jsonString[i])) {
          word += jsonString[i];
          i++;
        }
        
        if (word === 'true' || word === 'false') {
          tokens.push({ type: 'boolean', value: word });
        } else if (word === 'null') {
          tokens.push({ type: 'null', value: word });
        } else {
          tokens.push({ type: 'punctuation', value: word });
        }
        continue;
      }
      
      // Handle punctuation
      tokens.push({ type: 'punctuation', value: char });
      i++;
    }
    
    return tokens;
  };

  const renderJsonWithSyntaxHighlighting = (jsonString: string): React.ReactNode => {
    const tokens = tokenizeJson(jsonString);
    
    return tokens.map((token, index) => {
      const className = `json-${token.type}`;
      return (
        <span key={index} className={className}>
          {token.value}
        </span>
      );
    });
  };

  const jsonString = data ? formatJson(data) : '';

  return (
    <div className={`json-display ${className}`} id={id}>
      {title && (
        <div className="json-display-header">
          <h3 className="json-display-title">{title}</h3>
          <div className="json-display-meta">
            {data && typeof data === 'object' && (
              <span className="json-meta-info">
                {Array.isArray(data) 
                  ? `${data.length} items` 
                  : `${Object.keys(data).length} properties`
                }
              </span>
            )}
          </div>
        </div>
      )}
      <div className="json-content">
        <pre className="json-pre">
          {data ? renderJsonWithSyntaxHighlighting(jsonString) : (
            <span className="json-placeholder">No data to display</span>
          )}
        </pre>
      </div>
    </div>
  );
});

export default JsonDisplay;