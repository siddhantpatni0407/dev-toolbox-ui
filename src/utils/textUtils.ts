// Text Comparison Utilities

import { TextDiff, ComparisonOptions, ComparisonResult, TextFile } from '../models/text';

/**
 * Simple diff algorithm using Myers' algorithm concept
 */
export function compareTexts(
  oldText: string,
  newText: string,
  options: ComparisonOptions
): ComparisonResult {
  // Preprocess texts based on options
  let processedOldText = preprocessText(oldText, options);
  let processedNewText = preprocessText(newText, options);

  const oldLines = processedOldText.split('\n');
  const newLines = processedNewText.split('\n');

  const diffs = computeLineDiffs(oldLines, newLines, options);
  const statistics = calculateStatistics(diffs, oldLines.length, newLines.length);

  return {
    diffs,
    statistics
  };
}

/**
 * Preprocess text based on comparison options
 */
function preprocessText(text: string, options: ComparisonOptions): string {
  let processed = text;

  if (options.ignoreCase) {
    processed = processed.toLowerCase();
  }

  if (options.ignoreWhitespace) {
    processed = processed.replace(/\s+/g, ' ').trim();
  }

  if (options.ignoreLineBreaks) {
    processed = processed.replace(/\r?\n/g, ' ');
  }

  return processed;
}

/**
 * Compute line-by-line differences
 */
function computeLineDiffs(
  oldLines: string[],
  newLines: string[],
  options: ComparisonOptions
): TextDiff[] {
  const diffs: TextDiff[] = [];

  let oldIndex = 0;
  let newIndex = 0;

  while (oldIndex < oldLines.length || newIndex < newLines.length) {
    const oldLine = oldIndex < oldLines.length ? oldLines[oldIndex] : undefined;
    const newLine = newIndex < newLines.length ? newLines[newIndex] : undefined;

    if (oldLine === undefined) {
      // Line added
      diffs.push({
        type: 'insert',
        newValue: newLine,
        oldLineNumber: undefined,
        newLineNumber: newIndex + 1
      });
      newIndex++;
    } else if (newLine === undefined) {
      // Line deleted
      diffs.push({
        type: 'delete',
        oldValue: oldLine,
        oldLineNumber: oldIndex + 1,
        newLineNumber: undefined
      });
      oldIndex++;
    } else if (oldLine === newLine) {
      // Lines are equal
      diffs.push({
        type: 'equal',
        oldValue: oldLine,
        newValue: newLine,
        oldLineNumber: oldIndex + 1,
        newLineNumber: newIndex + 1
      });
      oldIndex++;
      newIndex++;
    } else {
      // Lines are different - look ahead to see if it's a replace or insert/delete
      const lookahead = findBestMatch(oldLines, newLines, oldIndex, newIndex, 5);
      
      if (lookahead.type === 'replace') {
        diffs.push({
          type: 'replace',
          oldValue: oldLine,
          newValue: newLine,
          oldLineNumber: oldIndex + 1,
          newLineNumber: newIndex + 1
        });
        oldIndex++;
        newIndex++;
      } else if (lookahead.type === 'insert') {
        diffs.push({
          type: 'insert',
          newValue: newLine,
          oldLineNumber: undefined,
          newLineNumber: newIndex + 1
        });
        newIndex++;
      } else {
        diffs.push({
          type: 'delete',
          oldValue: oldLine,
          oldLineNumber: oldIndex + 1,
          newLineNumber: undefined
        });
        oldIndex++;
      }
    }
  }

  return diffs;
}

/**
 * Find the best match for diff computation
 */
function findBestMatch(
  oldLines: string[],
  newLines: string[],
  oldIndex: number,
  newIndex: number,
  lookahead: number
): { type: 'replace' | 'insert' | 'delete' } {
  const oldLine = oldLines[oldIndex];
  const newLine = newLines[newIndex];

  // Check if the next few lines match better
  for (let i = 1; i <= lookahead; i++) {
    if (oldIndex + i < oldLines.length && oldLines[oldIndex + i] === newLine) {
      return { type: 'delete' };
    }
    if (newIndex + i < newLines.length && newLines[newIndex + i] === oldLine) {
      return { type: 'insert' };
    }
  }

  return { type: 'replace' };
}

/**
 * Calculate comparison statistics
 */
function calculateStatistics(
  diffs: TextDiff[],
  oldLineCount: number,
  newLineCount: number
): ComparisonResult['statistics'] {
  let addedLines = 0;
  let deletedLines = 0;
  let modifiedLines = 0;
  let unchangedLines = 0;

  diffs.forEach(diff => {
    switch (diff.type) {
      case 'insert':
        addedLines++;
        break;
      case 'delete':
        deletedLines++;
        break;
      case 'replace':
        modifiedLines++;
        break;
      case 'equal':
        unchangedLines++;
        break;
    }
  });

  const totalLines = Math.max(oldLineCount, newLineCount);
  const similarity = totalLines > 0 ? (unchangedLines / totalLines) * 100 : 100;

  return {
    totalLines,
    addedLines,
    deletedLines,
    modifiedLines,
    unchangedLines,
    similarity: Math.round(similarity * 100) / 100
  };
}

/**
 * Export comparison result to various formats
 */
export function exportComparison(
  result: ComparisonResult,
  format: 'text' | 'html' | 'json' = 'text'
): string {
  switch (format) {
    case 'json':
      return JSON.stringify(result, null, 2);
    case 'html':
      return generateHTMLReport(result);
    case 'text':
    default:
      return generateTextReport(result);
  }
}

/**
 * Generate text report
 */
function generateTextReport(result: ComparisonResult): string {
  const { statistics, diffs } = result;
  
  let report = `Text Comparison Report\n`;
  report += `======================\n\n`;
  report += `Statistics:\n`;
  report += `- Total Lines: ${statistics.totalLines}\n`;
  report += `- Added Lines: ${statistics.addedLines}\n`;
  report += `- Deleted Lines: ${statistics.deletedLines}\n`;
  report += `- Modified Lines: ${statistics.modifiedLines}\n`;
  report += `- Unchanged Lines: ${statistics.unchangedLines}\n`;
  report += `- Similarity: ${statistics.similarity}%\n\n`;
  
  report += `Differences:\n`;
  report += `============\n\n`;
  
  diffs.forEach((diff, index) => {
    switch (diff.type) {
      case 'insert':
        report += `+ Line ${diff.newLineNumber}: ${diff.newValue}\n`;
        break;
      case 'delete':
        report += `- Line ${diff.oldLineNumber}: ${diff.oldValue}\n`;
        break;
      case 'replace':
        report += `~ Line ${diff.oldLineNumber} -> ${diff.newLineNumber}:\n`;
        report += `  - ${diff.oldValue}\n`;
        report += `  + ${diff.newValue}\n`;
        break;
      case 'equal':
        // Skip equal lines in report
        break;
    }
  });
  
  return report;
}

/**
 * Generate HTML report
 */
function generateHTMLReport(result: ComparisonResult): string {
  const { statistics, diffs } = result;
  
  let html = `<!DOCTYPE html>
<html>
<head>
  <title>Text Comparison Report</title>
  <style>
    body { font-family: monospace; margin: 20px; }
    .stats { background: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
    .diff-line { margin: 2px 0; padding: 2px 5px; }
    .added { background-color: #d4edda; color: #155724; }
    .deleted { background-color: #f8d7da; color: #721c24; }
    .modified { background-color: #fff3cd; color: #856404; }
  </style>
</head>
<body>
  <h1>Text Comparison Report</h1>
  
  <div class="stats">
    <h2>Statistics</h2>
    <p>Total Lines: ${statistics.totalLines}</p>
    <p>Added Lines: ${statistics.addedLines}</p>
    <p>Deleted Lines: ${statistics.deletedLines}</p>
    <p>Modified Lines: ${statistics.modifiedLines}</p>
    <p>Unchanged Lines: ${statistics.unchangedLines}</p>
    <p>Similarity: ${statistics.similarity}%</p>
  </div>
  
  <h2>Differences</h2>
  <div class="diffs">`;
  
  diffs.forEach(diff => {
    switch (diff.type) {
      case 'insert':
        html += `<div class="diff-line added">+ Line ${diff.newLineNumber}: ${escapeHtml(diff.newValue || '')}</div>`;
        break;
      case 'delete':
        html += `<div class="diff-line deleted">- Line ${diff.oldLineNumber}: ${escapeHtml(diff.oldValue || '')}</div>`;
        break;
      case 'replace':
        html += `<div class="diff-line modified">~ Line ${diff.oldLineNumber} -> ${diff.newLineNumber}:</div>`;
        html += `<div class="diff-line deleted">  - ${escapeHtml(diff.oldValue || '')}</div>`;
        html += `<div class="diff-line added">  + ${escapeHtml(diff.newValue || '')}</div>`;
        break;
    }
  });
  
  html += `  </div>
</body>
</html>`;
  
  return html;
}

/**
 * Escape HTML characters
 */
function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Load file content
 */
export function loadFile(file: File): Promise<TextFile> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const content = event.target?.result as string;
      resolve({
        name: file.name,
        content,
        encoding: 'UTF-8',
        size: file.size,
        lastModified: new Date(file.lastModified)
      });
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
}

/**
 * Copy comparison result to clipboard
 */
export async function copyToClipboard(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
  } catch (error) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
  }
}

/**
 * Validate text input
 */
export function validateTextInput(text: string): { isValid: boolean; error?: string } {
  if (text.length > 1000000) { // 1MB limit
    return {
      isValid: false,
      error: 'Text is too large. Maximum size is 1MB.'
    };
  }
  
  return { isValid: true };
}