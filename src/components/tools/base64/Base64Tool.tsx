import React, { useState, useCallback, useRef } from 'react';
import Button from '../../common/Button';
import ToolHeader from '../../common/ToolHeader';
import { useCopyToClipboard } from '../../../hooks/useCopyToClipboard';
import {
  encodeToBase64,
  decodeFromBase64,
  validateBase64,
  fileToBase64,
  downloadBase64AsFile,
  parseDataUri,
  createDataUri,
  formatFileSize,
  getMimeTypeDescription
} from '../../../utils/base64Utils';
import { Base64Options, BASE64_EXAMPLES } from '../../../models/base64';
import './Base64Tool.css';

export const Base64Tool: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [error, setError] = useState<string>('');
  const [options, setOptions] = useState<Base64Options>({
    urlSafe: false,
    padding: true,
    lineBreaks: false,
    maxLineLength: 76
  });
  const [dragOver, setDragOver] = useState(false);
  const [fileInfo, setFileInfo] = useState<{
    name: string;
    size: number;
    type: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { copy } = useCopyToClipboard();

  const handleProcess = useCallback(() => {
    setError('');
    
    if (!input.trim()) {
      setError('Please enter some text to process');
      setOutput('');
      return;
    }

    let result;
    if (mode === 'encode') {
      result = encodeToBase64(input, options);
    } else {
      result = decodeFromBase64(input, options);
    }

    if (result.success) {
      setOutput(result.result);
    } else {
      setError(result.error || 'An error occurred');
      setOutput('');
    }
  }, [input, mode, options]);

  const handleSwap = useCallback(() => {
    setInput(output);
    setOutput(input);
    setMode(mode === 'encode' ? 'decode' : 'encode');
    setError('');
    setFileInfo(null);
  }, [input, output, mode]);

  const handleClear = useCallback(() => {
    setInput('');
    setOutput('');
    setError('');
    setFileInfo(null);
  }, []);

  const handleCopyInput = useCallback(() => {
    copy(input);
  }, [input, copy]);

  const handleCopyOutput = useCallback(() => {
    copy(output);
  }, [output, copy]);

  const handleLoadExample = useCallback((example: keyof typeof BASE64_EXAMPLES) => {
    const exampleData = BASE64_EXAMPLES[example];
    setInput(mode === 'encode' ? exampleData.plain : exampleData.encoded);
    setError('');
    setFileInfo(null);
  }, [mode]);

  const handleFileSelect = useCallback(async (file: File) => {
    try {
      setError('');
      setFileInfo({
        name: file.name,
        size: file.size,
        type: file.type
      });

      const result = await fileToBase64(file);
      
      if (mode === 'encode') {
        setInput(result.base64Data);
      } else {
        // For decode mode, create a data URI
        const dataUri = createDataUri(result.base64Data, result.mimeType);
        setInput(dataUri);
      }
    } catch (error) {
      setError(`File processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setFileInfo(null);
    }
  }, [mode]);

  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleDownload = useCallback(() => {
    try {
      if (!output) {
        setError('No output to download');
        return;
      }

      let fileName = 'base64-output';
      let mimeType = 'text/plain';
      let dataToDownload = output;

      // Check if output is a data URI
      const parsedUri = parseDataUri(output);
      if (parsedUri) {
        mimeType = parsedUri.mimeType;
        dataToDownload = parsedUri.base64Data;
        
        // Get file extension from MIME type
        const extension = mimeType.split('/')[1] || 'bin';
        fileName = `decoded-file.${extension}`;
      } else if (mode === 'decode') {
        fileName = 'decoded-text.txt';
      } else {
        fileName = 'encoded-base64.txt';
      }

      if (mode === 'decode' && parsedUri) {
        downloadBase64AsFile(dataToDownload, fileName, mimeType);
      } else {
        // Download as text file
        const blob = new Blob([output], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      setError(`Download failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [output, mode]);

  const isValidBase64 = mode === 'decode' ? validateBase64(input).isValid : true;

  return (
    <div className="base64-tool">
      <ToolHeader
        title="Base64 Encoder/Decoder"
        description="Encode and decode text, URLs, or files to/from Base64 format"
      />

      <div className="base64-tool__mode-selector">
        <Button
          variant={mode === 'encode' ? 'primary' : 'secondary'}
          onClick={() => setMode('encode')}
        >
          Encode to Base64
        </Button>
        <Button
          variant={mode === 'decode' ? 'primary' : 'secondary'}
          onClick={() => setMode('decode')}
        >
          Decode from Base64
        </Button>
      </div>

      <div className="base64-tool__options">
        <h3>Options</h3>
        <div className="base64-tool__options-grid">
          <label className="base64-tool__option">
            <input
              type="checkbox"
              checked={options.urlSafe}
              onChange={(e) => setOptions(prev => ({ ...prev, urlSafe: e.target.checked }))}
            />
            URL Safe (use - and _ instead of + and /)
          </label>
          
          <label className="base64-tool__option">
            <input
              type="checkbox"
              checked={options.padding}
              onChange={(e) => setOptions(prev => ({ ...prev, padding: e.target.checked }))}
            />
            Include padding (=)
          </label>
          
          <label className="base64-tool__option">
            <input
              type="checkbox"
              checked={options.lineBreaks}
              onChange={(e) => setOptions(prev => ({ ...prev, lineBreaks: e.target.checked }))}
            />
            Insert line breaks
          </label>
          
          {options.lineBreaks && (
            <label className="base64-tool__option">
              Line length:
              <input
                type="number"
                min="1"
                max="200"
                value={options.maxLineLength}
                onChange={(e) => setOptions(prev => ({ ...prev, maxLineLength: parseInt(e.target.value) || 76 }))}
                className="base64-tool__line-length-input"
              />
            </label>
          )}
        </div>
      </div>

      <div className="base64-tool__examples">
        <h3>Quick Examples</h3>
        <div className="base64-tool__examples-grid">
          <Button
            variant="outline"
            size="small"
            onClick={() => handleLoadExample('text')}
          >
            Text Example
          </Button>
          <Button
            variant="outline"
            size="small"
            onClick={() => handleLoadExample('json')}
          >
            JSON Example
          </Button>
          <Button
            variant="outline"
            size="small"
            onClick={() => handleLoadExample('html')}
          >
            HTML Example
          </Button>
          <Button
            variant="outline"
            size="small"
            onClick={() => handleLoadExample('url')}
          >
            URL Example
          </Button>
        </div>
      </div>

      <div className="base64-tool__content">
        <div className="base64-tool__input-section">
          <div className="base64-tool__section-header">
            <h3>{mode === 'encode' ? 'Input Text' : 'Base64 Input'}</h3>
            <div className="base64-tool__section-actions">
              <Button
                variant="outline"
                size="small"
                onClick={handleCopyInput}
                disabled={!input}
              >
                Copy
              </Button>
              <Button
                variant="outline"
                size="small"
                onClick={() => fileInputRef.current?.click()}
              >
                Load File
              </Button>
            </div>
          </div>

          <div
            className={`base64-tool__file-drop-zone ${dragOver ? 'base64-tool__file-drop-zone--active' : ''}`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleFileDrop}
          >
            <textarea
              className={`base64-tool__textarea ${!isValidBase64 ? 'base64-tool__textarea--invalid' : ''}`}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={mode === 'encode' 
                ? 'Enter text to encode to Base64...' 
                : 'Enter Base64 string to decode...'
              }
              rows={8}
            />
            <div className="base64-tool__file-drop-overlay">
              <div className="base64-tool__file-drop-content">
                <span>Drop a file here to {mode}</span>
              </div>
            </div>
          </div>

          {fileInfo && (
            <div className="base64-tool__file-info">
              <span className="base64-tool__file-name">{fileInfo.name}</span>
              <span className="base64-tool__file-details">
                {formatFileSize(fileInfo.size)} • {getMimeTypeDescription(fileInfo.type)}
              </span>
            </div>
          )}

          {!isValidBase64 && mode === 'decode' && input && (
            <div className="base64-tool__validation-error">
              Invalid Base64 format
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileInputChange}
            style={{ display: 'none' }}
          />
        </div>

        <div className="base64-tool__controls">
          <Button
            variant="primary"
            onClick={handleProcess}
            disabled={!input.trim() || (mode === 'decode' && !isValidBase64)}
          >
            {mode === 'encode' ? 'Encode' : 'Decode'}
          </Button>
          <Button
            variant="outline"
            onClick={handleSwap}
            disabled={!input && !output}
          >
            ⇄ Swap
          </Button>
          <Button
            variant="outline"
            onClick={handleClear}
            disabled={!input && !output}
          >
            Clear
          </Button>
        </div>

        <div className="base64-tool__output-section">
          <div className="base64-tool__section-header">
            <h3>{mode === 'encode' ? 'Base64 Output' : 'Decoded Output'}</h3>
            <div className="base64-tool__section-actions">
              <Button
                variant="outline"
                size="small"
                onClick={handleCopyOutput}
                disabled={!output}
              >
                Copy
              </Button>
              <Button
                variant="outline"
                size="small"
                onClick={handleDownload}
                disabled={!output}
              >
                Download
              </Button>
            </div>
          </div>

          <textarea
            className="base64-tool__textarea"
            value={output}
            readOnly
            placeholder={`${mode === 'encode' ? 'Base64 encoded' : 'Decoded'} result will appear here...`}
            rows={8}
          />

          {output && (
            <div className="base64-tool__output-info">
              <span>Length: {output.length} characters</span>
              {mode === 'decode' && parseDataUri(input) && (
                <span> • File size: {formatFileSize(output.length)}</span>
              )}
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="base64-tool__error">
          {error}
        </div>
      )}
    </div>
  );
};