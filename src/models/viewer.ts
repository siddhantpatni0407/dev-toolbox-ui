export interface MarkdownContent {
  raw: string;
  html: string;
  wordCount: number;
  characterCount: number;
  lineCount: number;
}

export interface MarkdownParseResult {
  success: boolean;
  content?: MarkdownContent;
  error?: string;
}

export interface MarkdownOptions {
  breaks: boolean;
  linkify: boolean;
  typographer: boolean;
  highlight: boolean;
  html: boolean;
  xhtmlOut: boolean;
}

export interface MarkdownPreviewOptions {
  theme: 'light' | 'dark' | 'github' | 'minimal';
  fontSize: 'small' | 'medium' | 'large';
  width: 'narrow' | 'medium' | 'wide';
  showLineNumbers: boolean;
}

export interface HTMLContent {
  raw: string;
  sanitized: string;
  isValid: boolean;
  errors: HTMLValidationError[];
  statistics: HTMLStatistics;
}

export interface HTMLValidationError {
  line: number;
  column: number;
  message: string;
  type: 'error' | 'warning';
  rule?: string;
}

export interface HTMLStatistics {
  elementCount: number;
  attributeCount: number;
  textLength: number;
  scriptTags: number;
  styleTags: number;
  linkTags: number;
  imageCount: number;
  formCount: number;
}

export interface HTMLParseResult {
  success: boolean;
  content?: HTMLContent;
  error?: string;
}

export interface HTMLOptions {
  validateSyntax: boolean;
  sanitizeContent: boolean;
  showStatistics: boolean;
  allowScripts: boolean;
  allowStyles: boolean;
  prettify: boolean;
}

export interface HTMLPreviewOptions {
  sandbox: boolean;
  responsive: boolean;
  showSource: boolean;
  theme: 'light' | 'dark';
  zoom: number;
}

// Common interfaces
export interface ViewerTab {
  id: string;
  label: string;
  content: string;
  type: 'markdown' | 'html';
  active: boolean;
}

export interface ExportOptions {
  format: 'html' | 'pdf' | 'txt' | 'md';
  includeStyles: boolean;
  filename: string;
}

// Predefined themes and templates
export const MARKDOWN_THEMES = {
  light: {
    name: 'Light',
    background: '#ffffff',
    text: '#333333',
    accent: '#6366f1'
  },
  dark: {
    name: 'Dark', 
    background: '#1a1a1a',
    text: '#e5e5e5',
    accent: '#8b5cf6'
  },
  github: {
    name: 'GitHub',
    background: '#ffffff',
    text: '#24292f',
    accent: '#0969da'
  },
  minimal: {
    name: 'Minimal',
    background: '#fafafa',
    text: '#2d3748',
    accent: '#4a5568'
  }
} as const;

export const HTML_SAFE_TAGS = [
  'div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'a', 'img', 'ul', 'ol', 'li', 'br', 'hr', 'strong', 'em',
  'code', 'pre', 'blockquote', 'table', 'tr', 'td', 'th',
  'thead', 'tbody', 'section', 'article', 'header', 'footer',
  'main', 'aside', 'nav', 'figure', 'figcaption'
] as const;

export const HTML_SAFE_ATTRIBUTES = [
  'id', 'class', 'src', 'alt', 'title', 'href', 'target',
  'width', 'height', 'style', 'data-*', 'aria-*', 'role'
] as const;

export const MARKDOWN_EXAMPLES = {
  basic: `# Welcome to Markdown Viewer

This is a **basic example** of Markdown formatting.

## Features

- Live preview
- Syntax highlighting  
- Export options
- Multiple themes

### Code Example

\`\`\`javascript
function hello() {
  console.log("Hello, World!");
}
\`\`\`

> This is a blockquote with *emphasis*.

[Learn more about Markdown](https://www.markdownguide.org/)`,

  advanced: `# Advanced Markdown Features

## Table Example

| Feature | Supported | Notes |
|---------|-----------|-------|
| Headers | ✅ | H1-H6 |
| Lists | ✅ | Ordered & Unordered |
| Code | ✅ | Inline & Blocks |
| Links | ✅ | Internal & External |

## Task Lists

- [x] Create Markdown viewer
- [x] Add syntax highlighting
- [ ] Add export functionality
- [ ] Mobile responsive design

## Math (if supported)

Inline math: $E = mc^2$

Block math:
$$
\\sum_{i=1}^{n} x_i = x_1 + x_2 + \\ldots + x_n
$$`,

  documentation: `# API Documentation

## Authentication

All API requests require authentication using API keys.

### Headers Required

\`\`\`http
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json
\`\`\`

### Example Request

\`\`\`curl
curl -X GET "https://api.example.com/users" \\
  -H "Authorization: Bearer your-api-key" \\
  -H "Accept: application/json"
\`\`\`

### Response Format

\`\`\`json
{
  "status": "success",
  "data": {
    "users": []
  },
  "pagination": {
    "page": 1,
    "total": 100
  }
}
\`\`\``
} as const;

export const HTML_EXAMPLES = {
  basic: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Basic HTML Example</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 2rem; }
        .highlight { background-color: #ffeb3b; }
    </style>
</head>
<body>
    <h1>Welcome to HTML Viewer</h1>
    <p>This is a <span class="highlight">basic example</span> of HTML content.</p>
    
    <h2>Features</h2>
    <ul>
        <li>Live preview</li>
        <li>HTML validation</li>
        <li>Syntax highlighting</li>
        <li>Safe rendering</li>
    </ul>
    
    <a href="#" onclick="alert('Hello!')">Click me</a>
</body>
</html>`,

  form: `<div style="max-width: 500px; margin: 2rem auto; padding: 2rem; border: 1px solid #ddd; border-radius: 8px;">
    <h2>Contact Form</h2>
    <form>
        <div style="margin-bottom: 1rem;">
            <label for="name">Name:</label><br>
            <input type="text" id="name" name="name" style="width: 100%; padding: 0.5rem;">
        </div>
        
        <div style="margin-bottom: 1rem;">
            <label for="email">Email:</label><br>
            <input type="email" id="email" name="email" style="width: 100%; padding: 0.5rem;">
        </div>
        
        <div style="margin-bottom: 1rem;">
            <label for="message">Message:</label><br>
            <textarea id="message" name="message" rows="4" style="width: 100%; padding: 0.5rem;"></textarea>
        </div>
        
        <button type="submit" style="background: #6366f1; color: white; padding: 0.75rem 1.5rem; border: none; border-radius: 4px;">
            Send Message
        </button>
    </form>
</div>`,

  card: `<div style="display: flex; gap: 1rem; flex-wrap: wrap; padding: 2rem;">
    <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 1.5rem; max-width: 300px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h3 style="margin-top: 0; color: #1a202c;">Product Card</h3>
        <img src="https://via.placeholder.com/250x150" alt="Product" style="width: 100%; border-radius: 4px;">
        <p style="color: #4a5568;">This is a sample product description.</p>
        <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 1.25rem; font-weight: bold; color: #2d3748;">$29.99</span>
            <button style="background: #4299e1; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px;">
                Add to Cart
            </button>
        </div>
    </div>
</div>`
} as const;