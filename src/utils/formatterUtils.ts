// Code Formatter Utilities

import {
  FormatterOptions,
  LanguageSpecificOptions,
  CodeContent,
  FormatterResult,
  FormatterStats,
  SupportedLanguage,
  LANGUAGE_CONFIGS,
  FormatterError,
  FormatterWarning
} from '../models/formatter';

/**
 * Main formatting function that handles all supported languages
 */
export const formatCode = (
  code: string,
  language: SupportedLanguage,
  options: FormatterOptions = getDefaultFormatterOptions(),
  languageOptions: LanguageSpecificOptions = {}
): FormatterResult => {
  try {
    if (!code || typeof code !== 'string') {
      return {
        success: false,
        error: 'Invalid code input'
      };
    }

    let formattedCode = code;
    const errors: FormatterError[] = [];
    const warnings: FormatterWarning[] = [];

    // Apply basic formatting first
    formattedCode = applyBasicFormatting(formattedCode, options);

    // Apply language-specific formatting
    switch (language) {
      case 'javascript':
      case 'typescript':
        formattedCode = formatJavaScript(formattedCode, languageOptions);
        break;
      case 'python':
        formattedCode = formatPython(formattedCode, languageOptions);
        break;
      case 'java':
        formattedCode = formatJava(formattedCode, languageOptions);
        break;
      case 'json':
        formattedCode = formatJSON(formattedCode, languageOptions);
        break;
      case 'html':
      case 'xml':
        formattedCode = formatHTML(formattedCode, languageOptions);
        break;
      case 'css':
      case 'scss':
        formattedCode = formatCSS(formattedCode, languageOptions);
        break;
      case 'sql':
        formattedCode = formatSQL(formattedCode, languageOptions);
        break;
      case 'yaml':
        formattedCode = formatYAML(formattedCode, languageOptions);
        break;
      default:
        // For other languages, apply basic formatting only
        break;
    }

    // Final cleanup
    if (options.trimTrailingWhitespace) {
      formattedCode = trimTrailingWhitespace(formattedCode);
    }

    if (options.insertFinalNewline && !formattedCode.endsWith('\n')) {
      formattedCode += '\n';
    }

    const content: CodeContent = {
      raw: code,
      formatted: formattedCode,
      language,
      lineCount: formattedCode.split('\n').length,
      characterCount: formattedCode.length,
      size: formatBytes(formattedCode.length),
      errors,
      warnings
    };

    return {
      success: true,
      content
    };
  } catch (error) {
    return {
      success: false,
      error: `Formatting failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
};

/**
 * Apply basic formatting rules (indentation, line breaks, etc.)
 */
const applyBasicFormatting = (code: string, options: FormatterOptions): string => {
  let formatted = code;

  // Normalize line endings
  formatted = formatted.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // Handle indentation
  const indentString = options.indentType === 'tabs' ? '\t' : ' '.repeat(options.indentSize);
  
  // Split into lines and process each line
  const lines = formatted.split('\n');
  let indentLevel = 0;
  
  const processedLines = lines.map((line, index) => {
    const trimmedLine = line.trim();
    
    if (!trimmedLine) {
      return ''; // Empty line
    }

    // Detect language-specific indentation patterns
    const isPython = code.includes('def ') || code.includes('class ') || (code.includes('if ') && code.includes(':'));
    
    if (isPython) {
      // Python indentation logic
      // Decrease indent for lines that end a block
      if (trimmedLine.match(/^(return|break|continue|pass|raise)\b/) ||
          (index > 0 && !trimmedLine.startsWith('elif') && !trimmedLine.startsWith('except') && !trimmedLine.startsWith('finally'))) {
        // Check if previous line ended with colon, indicating a new block
        const prevLine = index > 0 ? lines[index - 1].trim() : '';
        if (prevLine.endsWith(':') && (prevLine.includes('def ') || prevLine.includes('class ') || 
            prevLine.includes('if ') || prevLine.includes('for ') || prevLine.includes('while ') || 
            prevLine.includes('try:') || prevLine.includes('else:') || prevLine.includes('elif ') || 
            prevLine.includes('except') || prevLine.includes('finally:'))) {
          // Don't change indent for lines after colon
        } else if (!trimmedLine.endsWith(':')) {
          // Maintain current indent level
        }
      }
      
      const indentedLine = indentString.repeat(indentLevel) + trimmedLine;
      
      // Increase indent for lines ending with colon
      if (trimmedLine.endsWith(':') && (trimmedLine.includes('def ') || trimmedLine.includes('class ') || 
          trimmedLine.includes('if ') || trimmedLine.includes('for ') || trimmedLine.includes('while ') || 
          trimmedLine.includes('try:') || trimmedLine.includes('else:') || trimmedLine.includes('elif ') || 
          trimmedLine.includes('except') || trimmedLine.includes('finally:'))) {
        indentLevel++;
      }
      
      return indentedLine;
    } else {
      // General indentation logic for other languages
      // Adjust indent level based on line content
      if (trimmedLine.includes('}') || trimmedLine.includes(']') || trimmedLine.includes('</')) {
        indentLevel = Math.max(0, indentLevel - 1);
      }

      const indentedLine = indentString.repeat(indentLevel) + trimmedLine;

      // Increase indent for next line if needed
      if (trimmedLine.includes('{') || trimmedLine.includes('[') || (trimmedLine.includes('<') && !trimmedLine.includes('</'))) {
        indentLevel++;
      }

      return indentedLine;
    }
  });

  return processedLines.join('\n');
};

/**
 * Format JavaScript/TypeScript code
 */
const formatJavaScript = (code: string, options: LanguageSpecificOptions): string => {
  let formatted = code;

  // Add semicolons if required
  if (options.semicolons !== false) {
    formatted = formatted.replace(/([^;\s{}])\s*\n/g, '$1;\n');
  }

  // Handle quotes
  if (options.singleQuote) {
    formatted = formatted.replace(/"([^"\\]*(\\.[^"\\]*)*)"/g, "'$1'");
  }

  // Handle bracket spacing
  if (options.bracketSpacing !== false) {
    formatted = formatted.replace(/\{([^\s}])/g, '{ $1');
    formatted = formatted.replace(/([^\s{])\}/g, '$1 }');
  }

  return formatted;
};

/**
 * Format Python code
 */
const formatPython = (code: string, options: LanguageSpecificOptions): string => {
  let formatted = code;
  const maxLineLength = options.lineLength || 88;

  // Remove extra whitespace and normalize line endings
  formatted = formatted.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  formatted = formatted.replace(/\s+\n/g, '\n'); // Remove trailing whitespace
  formatted = formatted.replace(/\n\s*\n\s*\n/g, '\n\n'); // Collapse multiple empty lines

  // Handle string quotes normalization
  if (!options.skipStringNormalization) {
    // Convert single quotes to double quotes (except for strings containing double quotes)
    formatted = formatted.replace(/'([^'\\]*(?:\\.[^'\\]*)*)'(?!["])/g, (match, content) => {
      if (content.includes('"') && !content.includes('\\"')) {
        return match; // Keep single quotes if string contains unescaped double quotes
      }
      return `"${content}"`;
    });
  }

  // Add spacing around operators (PEP 8 compliance)
  formatted = formatted.replace(/([^=!<>])=([^=])/g, '$1 = $2');
  formatted = formatted.replace(/([^=!<>])==([^=])/g, '$1 == $2');
  formatted = formatted.replace(/([^=!<>])!=([^=])/g, '$1 != $2');
  formatted = formatted.replace(/([^<>])<=([^=])/g, '$1 <= $2');
  formatted = formatted.replace(/([^<>])>=([^=])/g, '$1 >= $2');
  formatted = formatted.replace(/([^+])\+([^+=])/g, '$1 + $2');
  formatted = formatted.replace(/([^-])-([^-=])/g, '$1 - $2');
  formatted = formatted.replace(/([^*])\*([^*=])/g, '$1 * $2');
  formatted = formatted.replace(/([^/])\/([^/=])/g, '$1 / $2');

  // Format function definitions and calls
  formatted = formatted.replace(/def\s+(\w+)\s*\(/g, 'def $1(');
  formatted = formatted.replace(/class\s+(\w+)\s*\(/g, 'class $1(');
  formatted = formatted.replace(/class\s+(\w+)\s*:/g, 'class $1:');

  // Add space after commas
  formatted = formatted.replace(/,([^\s\n])/g, ', $1');

  // Format colons in dictionaries and function definitions
  formatted = formatted.replace(/:\s*([^\s\n])/g, ': $1');
  
  // Format list comprehensions
  formatted = formatted.replace(/\[\s*([^[\]]*)\s*for\s+([^[\]]*)\s*in\s+([^[\]]*)\s*\]/g, '[$1 for $2 in $3]');

  // Remove spaces around parentheses, brackets, and braces (PEP 8)
  formatted = formatted.replace(/\(\s+/g, '(');
  formatted = formatted.replace(/\s+\)/g, ')');
  formatted = formatted.replace(/\[\s+/g, '[');
  formatted = formatted.replace(/\s+\]/g, ']');
  formatted = formatted.replace(/\{\s+/g, '{');
  formatted = formatted.replace(/\s+\}/g, '}');

  // Handle imports formatting
  formatted = formatted.replace(/^from\s+(\S+)\s+import\s+/gm, 'from $1 import ');
  formatted = formatted.replace(/^import\s+/gm, 'import ');

  // Break long lines
  const lines = formatted.split('\n');
  const processedLines = lines.map(line => {
    const trimmedLine = line.trim();
    if (trimmedLine.length > maxLineLength) {
      // Break long function calls and method chains
      if (trimmedLine.includes('(') && trimmedLine.includes(',')) {
        const indent = line.match(/^\s*/)?.[0] || '';
        return line.replace(/,\s+/g, ',\n' + indent + '    ');
      }
      // Break long import statements
      if (trimmedLine.startsWith('from ') && trimmedLine.includes('import')) {
        const indent = line.match(/^\s*/)?.[0] || '';
        return line.replace(/,\s+/g, ',\n' + indent + '    ');
      }
      // Break long list/dict literals
      if ((trimmedLine.includes('[') || trimmedLine.includes('{')) && trimmedLine.includes(',')) {
        const indent = line.match(/^\s*/)?.[0] || '';
        return line.replace(/,\s+/g, ',\n' + indent + '    ');
      }
    }
    return line;
  });

  formatted = processedLines.join('\n');

  // Clean up extra spaces while preserving indentation
  const finalLines = formatted.split('\n').map(line => {
    const indent = line.match(/^\s*/)?.[0] || '';
    const content = line.trim();
    return content ? indent + content.replace(/\s+/g, ' ') : '';
  });

  // Remove excessive blank lines while keeping proper spacing
  let result = finalLines.join('\n');
  result = result.replace(/\n\s*\n\s*\n/g, '\n\n');
  
  // Ensure proper spacing around class and function definitions
  result = result.replace(/(\n\s*)(def\s+\w+|class\s+\w+)/g, '\n\n$2');
  result = result.replace(/^(\s*)(def\s+\w+|class\s+\w+)/gm, '\n$1$2');
  
  // Clean up leading/trailing newlines
  result = result.replace(/^\n+/, '').replace(/\n+$/, '\n');

  return result;
};

/**
 * Format Java code
 */
const formatJava = (code: string, options: LanguageSpecificOptions): string => {
  let formatted = code;

  // Remove extra whitespace and normalize line endings
  formatted = formatted.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  formatted = formatted.replace(/\s+\n/g, '\n'); // Remove trailing whitespace
  formatted = formatted.replace(/\n\s*\n\s*\n/g, '\n\n'); // Collapse multiple empty lines

  // Format package and import statements
  formatted = formatted.replace(/^\s*package\s+/gm, 'package ');
  formatted = formatted.replace(/^\s*import\s+/gm, 'import ');
  
  // Add spacing around operators
  formatted = formatted.replace(/([^=!<>])=([^=])/g, '$1 = $2');
  formatted = formatted.replace(/([^=!<>])==([^=])/g, '$1 == $2');
  formatted = formatted.replace(/([^=!<>])!=([^=])/g, '$1 != $2');
  formatted = formatted.replace(/([^<>])<=([^=])/g, '$1 <= $2');
  formatted = formatted.replace(/([^<>])>=([^=])/g, '$1 >= $2');
  formatted = formatted.replace(/([^+])\+([^+=])/g, '$1 + $2');
  formatted = formatted.replace(/([^-])-([^-=])/g, '$1 - $2');
  formatted = formatted.replace(/([^*])\*([^*=])/g, '$1 * $2');
  formatted = formatted.replace(/([^/])\/([^/=])/g, '$1 / $2');

  // Format method declarations and calls
  formatted = formatted.replace(/(\w+)\s*\(/g, '$1('); // Remove space before parentheses in method calls
  if (options.spaceBeforeParens) {
    formatted = formatted.replace(/(\b(?:if|for|while|switch|catch)\s*)\(/g, '$1 (');
  }

  // Handle brace formatting
  if (options.allmanBraces) {
    // Allman style: braces on new line
    formatted = formatted.replace(/\s*\{\s*/g, '\n{\n');
    formatted = formatted.replace(/\s*\}\s*/g, '\n}\n');
  } else {
    // K&R style: opening brace on same line
    formatted = formatted.replace(/\s*\{\s*/g, ' {\n');
    formatted = formatted.replace(/\s*\}\s*/g, '\n}\n');
  }

  // Format control structures
  formatted = formatted.replace(/\}\s*else\s*\{/g, '} else {');
  formatted = formatted.replace(/\}\s*else\s*if\s*\(/g, '} else if (');
  formatted = formatted.replace(/\}\s*catch\s*\(/g, '} catch (');
  formatted = formatted.replace(/\}\s*finally\s*\{/g, '} finally {');

  // Add spacing after commas
  formatted = formatted.replace(/,([^\s\n])/g, ', $1');

  // Add spacing after semicolons in for loops
  formatted = formatted.replace(/;([^\s\n])/g, '; $1');

  // Format array and list declarations
  formatted = formatted.replace(/\[\s*\]/g, '[]');
  formatted = formatted.replace(/new\s+(\w+)\s*\[\s*\]/g, 'new $1[]');

  // Clean up extra spaces
  formatted = formatted.replace(/\s+/g, ' ');
  formatted = formatted.replace(/\s*\n\s*/g, '\n');

  return formatted;
};

/**
 * Format JSON code
 */
const formatJSON = (code: string, options: LanguageSpecificOptions): string => {
  try {
    const parsed = JSON.parse(code);
    
    if (options.sortKeys) {
      const sortedObj = sortObjectKeys(parsed);
      return JSON.stringify(sortedObj, null, 2);
    }
    
    return JSON.stringify(parsed, null, 2);
  } catch (error) {
    // If JSON is invalid, return original with basic formatting
    return code;
  }
};

/**
 * Format HTML/XML code
 */
const formatHTML = (code: string, options: LanguageSpecificOptions): string => {
  let formatted = code;

  // Basic HTML formatting
  formatted = formatted.replace(/></g, '>\n<');
  
  // Handle self-closing tags
  if (options.selfClosingTags) {
    formatted = formatted.replace(/<(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)([^>]*)>/gi, '<$1$2 />');
  }

  return formatted;
};

/**
 * Format CSS/SCSS code
 */
const formatCSS = (code: string, options: LanguageSpecificOptions): string => {
  let formatted = code;

  // Basic CSS formatting
  formatted = formatted.replace(/;\s*(?=\w)/g, ';\n  ');
  formatted = formatted.replace(/\{\s*/g, ' {\n  ');
  formatted = formatted.replace(/\s*\}/g, '\n}');

  // Handle selector separator
  if (options.selectorSeparator) {
    formatted = formatted.replace(/,\s*(?=[\w.#:])/g, options.selectorSeparator);
  }

  return formatted;
};

/**
 * Format SQL code
 */
const formatSQL = (code: string, options: LanguageSpecificOptions): string => {
  let formatted = code;

  // Convert keywords to uppercase
  const keywords = ['select', 'from', 'where', 'join', 'inner', 'left', 'right', 'outer', 'on', 'and', 'or', 'order', 'by', 'group', 'having', 'insert', 'update', 'delete', 'create', 'alter', 'drop', 'table', 'index'];
  
  keywords.forEach(keyword => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
    formatted = formatted.replace(regex, keyword.toUpperCase());
  });

  // Add line breaks after major clauses
  formatted = formatted.replace(/\b(SELECT|FROM|WHERE|JOIN|ORDER BY|GROUP BY|HAVING)\b/gi, '\n$1');
  formatted = formatted.replace(/^\n/, ''); // Remove leading newline

  return formatted;
};

/**
 * Format YAML code
 */
const formatYAML = (code: string, options: LanguageSpecificOptions): string => {
  let formatted = code;

  // Basic YAML formatting - ensure proper spacing around colons
  formatted = formatted.replace(/:\s*/g, ': ');
  
  // Handle array formatting
  formatted = formatted.replace(/^(\s*)- /gm, '$1- ');

  return formatted;
};

/**
 * Apply syntax highlighting to code
 */
export const applySyntaxHighlighting = (code: string, language: SupportedLanguage): string => {
  const config = LANGUAGE_CONFIGS[language];
  if (!config) return code;

  let highlighted = escapeHtml(code);

  // Sort patterns by priority (higher priority first)
  const sortedPatterns = [...config.syntaxPatterns].sort((a, b) => b.priority - a.priority);

  sortedPatterns.forEach(pattern => {
    highlighted = highlighted.replace(pattern.pattern, (match) => {
      return `<span class="${pattern.className}">${match}</span>`;
    });
  });

  return highlighted;
};

/**
 * Detect language from code content
 */
export const detectLanguage = (code: string, filename?: string): SupportedLanguage | null => {
  // Try to detect from filename extension first
  if (filename) {
    const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
    for (const [lang, config] of Object.entries(LANGUAGE_CONFIGS)) {
      if (config.extensions.includes(extension)) {
        return lang as SupportedLanguage;
      }
    }
  }

  // Try to detect from code patterns
  const trimmedCode = code.trim().toLowerCase();

  // JSON detection
  if ((trimmedCode.startsWith('{') && trimmedCode.endsWith('}')) ||
      (trimmedCode.startsWith('[') && trimmedCode.endsWith(']'))) {
    try {
      JSON.parse(code);
      return 'json';
    } catch {
      // Not valid JSON
    }
  }

  // HTML detection
  if (trimmedCode.includes('<!doctype html') || 
      (trimmedCode.includes('<html') && trimmedCode.includes('</html>'))) {
    return 'html';
  }

  // XML detection
  if (trimmedCode.startsWith('<?xml')) {
    return 'xml';
  }

  // CSS detection
  if (trimmedCode.includes('{') && trimmedCode.includes('}') && 
      trimmedCode.includes(':') && !trimmedCode.includes('function')) {
    return 'css';
  }

  // Python detection
  if (code.includes('def ') || code.includes('import ') || code.includes('from ')) {
    return 'python';
  }

  // JavaScript detection
  if (code.includes('function') || code.includes('const ') || code.includes('let ')) {
    return 'javascript';
  }

  // Java detection
  if (code.includes('public class') || code.includes('public static void main')) {
    return 'java';
  }

  return null;
};

/**
 * Get default formatter options
 */
export const getDefaultFormatterOptions = (): FormatterOptions => ({
  indentSize: 2,
  indentType: 'spaces',
  maxLineLength: 120,
  trimTrailingWhitespace: true,
  insertFinalNewline: true,
  preserveNewlines: false
});

/**
 * Calculate formatting statistics
 */
export const calculateStats = (original: string, formatted: string, formattingTime: number): FormatterStats => {
  const originalLines = original.split('\n').length;
  const formattedLines = formatted.split('\n').length;
  const originalSize = original.length;
  const formattedSize = formatted.length;
  
  return {
    originalLines,
    formattedLines,
    originalSize,
    formattedSize,
    compressionRatio: originalSize > 0 ? ((originalSize - formattedSize) / originalSize) * 100 : 0,
    formattingTime
  };
};

/**
 * Validate code syntax (basic validation)
 */
export const validateSyntax = (code: string, language: SupportedLanguage): FormatterError[] => {
  const errors: FormatterError[] = [];

  try {
    switch (language) {
      case 'json':
        JSON.parse(code);
        break;
      case 'javascript':
      case 'typescript':
        // Basic bracket matching
        if (!isBalanced(code, ['{', '}', '[', ']', '(', ')'])) {
          errors.push({
            line: 0,
            column: 0,
            message: 'Unbalanced brackets detected',
            severity: 'error'
          });
        }
        break;
      default:
        // Basic validation for other languages
        break;
    }
  } catch (error) {
    errors.push({
      line: 0,
      column: 0,
      message: error instanceof Error ? error.message : 'Syntax error',
      severity: 'error'
    });
  }

  return errors;
};

/**
 * Helper functions
 */
const escapeHtml = (text: string): string => {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
};

const trimTrailingWhitespace = (code: string): string => {
  return code.replace(/[ \t]+$/gm, '');
};

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const sortObjectKeys = (obj: any): any => {
  if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) {
    return obj;
  }
  
  const sorted: any = {};
  Object.keys(obj).sort().forEach(key => {
    sorted[key] = sortObjectKeys(obj[key]);
  });
  
  return sorted;
};

const isBalanced = (code: string, brackets: string[]): boolean => {
  const stack: string[] = [];
  const openBrackets = brackets.filter((_, i) => i % 2 === 0);
  const closeBrackets = brackets.filter((_, i) => i % 2 === 1);
  
  for (const char of code) {
    if (openBrackets.includes(char)) {
      stack.push(char);
    } else if (closeBrackets.includes(char)) {
      const lastOpen = stack.pop();
      const expectedOpen = openBrackets[closeBrackets.indexOf(char)];
      if (lastOpen !== expectedOpen) {
        return false;
      }
    }
  }
  
  return stack.length === 0;
};

/**
 * Copy content to clipboard
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const success = document.execCommand('copy');
      textArea.remove();
      return success;
    }
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
};

/**
 * Export formatted code
 */
export const exportFormattedCode = (content: CodeContent, format: 'text' | 'html' = 'text'): void => {
  const filename = `formatted-code.${content.language}`;
  const mimeType = format === 'html' ? 'text/html' : 'text/plain';
  
  let exportContent = content.formatted;
  
  if (format === 'html') {
    exportContent = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Formatted ${content.language.toUpperCase()} Code</title>
    <style>
        body { font-family: 'Courier New', monospace; margin: 20px; }
        pre { background: #f5f5f5; padding: 15px; border-radius: 5px; overflow-x: auto; }
        .syntax-keyword { color: #0000ff; font-weight: bold; }
        .syntax-string { color: #008000; }
        .syntax-comment { color: #808080; font-style: italic; }
        .syntax-number { color: #ff0000; }
        .syntax-type { color: #2b91af; }
    </style>
</head>
<body>
    <h1>Formatted ${content.language.toUpperCase()} Code</h1>
    <pre><code>${applySyntaxHighlighting(content.formatted, content.language)}</code></pre>
</body>
</html>`;
  }
  
  const blob = new Blob([exportContent], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = format === 'html' ? `${filename}.html` : filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};