import {
  MarkdownContent,
  MarkdownParseResult,
  MarkdownOptions,
  HTMLContent,
  HTMLParseResult,
  HTMLOptions,
  HTMLValidationError,
  HTMLStatistics
} from '../models/viewer';

/**
 * Simple Markdown parser (basic implementation)
 * Note: In a real application, you might want to use a library like 'marked' or 'markdown-it'
 */
export const parseMarkdown = (markdown: string, options: MarkdownOptions = {
  breaks: true,
  linkify: true,
  typographer: true,
  highlight: true,
  html: false,
  xhtmlOut: false
}): MarkdownParseResult => {
  try {
    if (!markdown || typeof markdown !== 'string') {
      return {
        success: false,
        error: 'Invalid markdown input'
      };
    }

    let html = markdown;

    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

    // Bold
    html = html.replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>');
    html = html.replace(/__(.*)__/gim, '<strong>$1</strong>');

    // Italic
    html = html.replace(/\*(.*)\*/gim, '<em>$1</em>');
    html = html.replace(/_(.*)_/gim, '<em>$1</em>');

    // Code blocks
    html = html.replace(/```(\w+)?\n([\s\S]*?)\n```/gim, (match, lang, code) => {
      const language = lang || 'text';
      return `<pre><code class="language-${language}">${escapeHtml(code.trim())}</code></pre>`;
    });

    // Inline code
    html = html.replace(/`([^`]+)`/gim, '<code>$1</code>');

    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

    // Images
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/gim, '<img src="$2" alt="$1" style="max-width: 100%; height: auto;">');

    // Lists
    html = html.replace(/^\* (.+)$/gim, '<li>$1</li>');
    html = html.replace(/^\d+\. (.+)$/gim, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/gi, '<ul>$1</ul>');

    // Blockquotes
    html = html.replace(/^> (.+)$/gim, '<blockquote>$1</blockquote>');

    // Horizontal rules
    html = html.replace(/^---$/gim, '<hr>');

    // Line breaks
    if (options.breaks) {
      html = html.replace(/\n/gim, '<br>');
    }

    // Tables (basic support)
    html = html.replace(/\|(.+)\|/gim, (match, content) => {
      const cells = content.split('|').map((cell: string) => cell.trim());
      const cellsHtml = cells.map((cell: string) => `<td>${cell}</td>`).join('');
      return `<tr>${cellsHtml}</tr>`;
    });
    html = html.replace(/(<tr>.*<\/tr>)/gi, '<table>$1</table>');

    // Task lists
    html = html.replace(/^- \[x\] (.+)$/gim, '<li><input type="checkbox" checked disabled> $1</li>');
    html = html.replace(/^- \[ \] (.+)$/gim, '<li><input type="checkbox" disabled> $1</li>');

    // Clean up multiple breaks
    html = html.replace(/(<br>\s*){3,}/gim, '<br><br>');

    const content: MarkdownContent = {
      raw: markdown,
      html: html,
      wordCount: countWords(markdown),
      characterCount: markdown.length,
      lineCount: markdown.split('\n').length
    };

    return {
      success: true,
      content
    };
  } catch (error) {
    return {
      success: false,
      error: `Markdown parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
};

/**
 * Parse and validate HTML content
 */
export const parseHTML = (html: string, options: HTMLOptions = {
  validateSyntax: true,
  sanitizeContent: true,
  showStatistics: true,
  allowScripts: false,
  allowStyles: true,
  prettify: false
}): HTMLParseResult => {
  try {
    if (!html || typeof html !== 'string') {
      return {
        success: false,
        error: 'Invalid HTML input'
      };
    }

    const errors: HTMLValidationError[] = [];
    let sanitized = html;

    // Basic HTML validation
    if (options.validateSyntax) {
      errors.push(...validateHTMLSyntax(html));
    }

    // Sanitize content if requested
    if (options.sanitizeContent) {
      sanitized = sanitizeHTML(html, options);
    }

    // Generate statistics
    const statistics = options.showStatistics ? generateHTMLStatistics(html) : {
      elementCount: 0,
      attributeCount: 0,
      textLength: 0,
      scriptTags: 0,
      styleTags: 0,
      linkTags: 0,
      imageCount: 0,
      formCount: 0
    };

    // Prettify HTML if requested
    if (options.prettify) {
      sanitized = prettifyHTML(sanitized);
    }

    const content: HTMLContent = {
      raw: html,
      sanitized,
      isValid: errors.filter(e => e.type === 'error').length === 0,
      errors,
      statistics
    };

    return {
      success: true,
      content
    };
  } catch (error) {
    return {
      success: false,
      error: `HTML parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
};

/**
 * Sanitize HTML content by removing dangerous elements and attributes
 */
export const sanitizeHTML = (html: string, options: HTMLOptions): string => {
  let sanitized = html;

  // Remove script tags if not allowed
  if (!options.allowScripts) {
    sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    sanitized = sanitized.replace(/on\w+="[^"]*"/gi, ''); // Remove event handlers
    sanitized = sanitized.replace(/javascript:/gi, ''); // Remove javascript: URLs
  }

  // Remove style tags if not allowed
  if (!options.allowStyles) {
    sanitized = sanitized.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
  }

  // Remove potentially dangerous elements
  const dangerousTags = ['object', 'embed', 'applet', 'form'];
  dangerousTags.forEach(tag => {
    const regex = new RegExp(`<${tag}\\b[^<]*(?:(?!<\\/${tag}>)<[^<]*)*<\\/${tag}>`, 'gi');
    sanitized = sanitized.replace(regex, '');
  });

  return sanitized;
};

/**
 * Validate HTML syntax and return errors
 */
export const validateHTMLSyntax = (html: string): HTMLValidationError[] => {
  const errors: HTMLValidationError[] = [];
  const lines = html.split('\n');

  lines.forEach((line, index) => {
    const lineNumber = index + 1;

    // Check for unclosed tags (basic check)
    const openTags = line.match(/<(\w+)(?:\s[^>]*)?>/g) || [];
    const closeTags = line.match(/<\/(\w+)>/g) || [];

    if (openTags.length !== closeTags.length) {
      // This is a very basic check - a real validator would be more sophisticated
      if (openTags.length > closeTags.length) {
        errors.push({
          line: lineNumber,
          column: 1,
          message: 'Possible unclosed tag detected',
          type: 'warning',
          rule: 'unclosed-tag'
        });
      }
    }

    // Check for malformed tags
    const malformedTags = line.match(/<[^>]*$/g);
    if (malformedTags) {
      errors.push({
        line: lineNumber,
        column: line.indexOf('<') + 1,
        message: 'Malformed HTML tag',
        type: 'error',
        rule: 'malformed-tag'
      });
    }

    // Check for missing alt attributes on images
    const imgTags = line.match(/<img(?:\s[^>]*)?>/g);
    if (imgTags) {
      imgTags.forEach(tag => {
        if (!tag.includes('alt=')) {
          errors.push({
            line: lineNumber,
            column: line.indexOf(tag) + 1,
            message: 'Image missing alt attribute',
            type: 'warning',
            rule: 'missing-alt'
          });
        }
      });
    }
  });

  return errors;
};

/**
 * Generate HTML statistics
 */
export const generateHTMLStatistics = (html: string): HTMLStatistics => {
  const elementCount = (html.match(/<\w+/g) || []).length;
  const attributeCount = (html.match(/\w+="/g) || []).length;
  const textContent = html.replace(/<[^>]*>/g, '');
  const textLength = textContent.trim().length;
  const scriptTags = (html.match(/<script/gi) || []).length;
  const styleTags = (html.match(/<style/gi) || []).length;
  const linkTags = (html.match(/<link/gi) || []).length;
  const imageCount = (html.match(/<img/gi) || []).length;
  const formCount = (html.match(/<form/gi) || []).length;

  return {
    elementCount,
    attributeCount,
    textLength,
    scriptTags,
    styleTags,
    linkTags,
    imageCount,
    formCount
  };
};

/**
 * Basic HTML prettifier
 */
export const prettifyHTML = (html: string): string => {
  let formatted = html;
  let indent = 0;
  const indentSize = 2;

  // Split by tags
  const tokens = formatted.split(/(<[^>]*>)/);
  const lines: string[] = [];

  tokens.forEach(token => {
    if (token.trim() === '') return;

    if (token.startsWith('</')) {
      // Closing tag
      indent -= indentSize;
      lines.push(' '.repeat(Math.max(0, indent)) + token.trim());
    } else if (token.startsWith('<') && !token.endsWith('/>')) {
      // Opening tag
      lines.push(' '.repeat(indent) + token.trim());
      indent += indentSize;
    } else if (token.startsWith('<') && token.endsWith('/>')) {
      // Self-closing tag
      lines.push(' '.repeat(indent) + token.trim());
    } else {
      // Text content
      const trimmed = token.trim();
      if (trimmed) {
        lines.push(' '.repeat(indent) + trimmed);
      }
    }
  });

  return lines.join('\n');
};

/**
 * Escape HTML characters
 */
export const escapeHtml = (text: string): string => {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };

  return text.replace(/[&<>"']/g, (char) => map[char] || char);
};

/**
 * Count words in text
 */
export const countWords = (text: string): number => {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
};

/**
 * Convert HTML to plain text
 */
export const htmlToText = (html: string): string => {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/?(div|p|h[1-6]|li)\b[^>]*>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/\n\s*\n/g, '\n\n')
    .trim();
};

/**
 * Export content to different formats
 */
export const exportContent = (content: string, format: 'html' | 'txt' | 'md', filename: string): void => {
  let exportData = content;
  let mimeType = 'text/plain';

  switch (format) {
    case 'html':
      mimeType = 'text/html';
      break;
    case 'txt':
      exportData = htmlToText(content);
      mimeType = 'text/plain';
      break;
    case 'md':
      // Basic HTML to Markdown conversion (simplified)
      exportData = content
        .replace(/<h1>(.*?)<\/h1>/g, '# $1\n')
        .replace(/<h2>(.*?)<\/h2>/g, '## $1\n')
        .replace(/<h3>(.*?)<\/h3>/g, '### $1\n')
        .replace(/<strong>(.*?)<\/strong>/g, '**$1**')
        .replace(/<em>(.*?)<\/em>/g, '*$1*')
        .replace(/<code>(.*?)<\/code>/g, '`$1`')
        .replace(/<a href="([^"]*)"[^>]*>(.*?)<\/a>/g, '[$2]($1)')
        .replace(/<br\s*\/?>/g, '\n')
        .replace(/<[^>]*>/g, '')
        .trim();
      mimeType = 'text/markdown';
      break;
  }

  const blob = new Blob([exportData], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Copy content to clipboard
 */
export const copyToClipboard = async (content: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(content);
    return true;
  } catch (error) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = content;
    document.body.appendChild(textArea);
    textArea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textArea);
    return success;
  }
};