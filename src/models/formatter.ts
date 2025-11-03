// Code Formatter Models and Types

export interface FormatterOptions {
  indentSize: number;
  indentType: 'spaces' | 'tabs';
  maxLineLength: number;
  trimTrailingWhitespace: boolean;
  insertFinalNewline: boolean;
  preserveNewlines: boolean;
}

export interface LanguageSpecificOptions {
  // JavaScript/TypeScript
  semicolons?: boolean;
  singleQuote?: boolean;
  trailingComma?: 'none' | 'es5' | 'all';
  bracketSpacing?: boolean;
  
  // Python
  lineLength?: number;
  skipStringNormalization?: boolean;
  
  // Java
  allmanBraces?: boolean;
  spaceBeforeParens?: boolean;
  
  // JSON
  sortKeys?: boolean;
  compactArrays?: boolean;
  
  // HTML/XML
  wrapAttributes?: 'auto' | 'force' | 'force-aligned' | 'force-expand-multiline';
  selfClosingTags?: boolean;
  
  // CSS
  expandShorthand?: boolean;
  selectorSeparator?: '\n' | ', ' | ',\n';
}

export interface CodeContent {
  raw: string;
  formatted: string;
  language: SupportedLanguage;
  lineCount: number;
  characterCount: number;
  size: string;
  errors: FormatterError[];
  warnings: FormatterWarning[];
}

export interface FormatterError {
  line: number;
  column: number;
  message: string;
  severity: 'error' | 'warning';
  rule?: string;
}

export interface FormatterWarning {
  line: number;
  column: number;
  message: string;
  suggestion?: string;
}

export interface FormatterResult {
  success: boolean;
  content?: CodeContent;
  error?: string;
}

export interface FormatterStats {
  originalLines: number;
  formattedLines: number;
  originalSize: number;
  formattedSize: number;
  compressionRatio: number;
  formattingTime: number;
}

export type SupportedLanguage = 
  | 'javascript'
  | 'typescript'
  | 'python'
  | 'java'
  | 'json'
  | 'html'
  | 'css'
  | 'scss'
  | 'xml'
  | 'sql'
  | 'php'
  | 'go'
  | 'rust'
  | 'cpp'
  | 'csharp'
  | 'yaml'
  | 'markdown'
  | 'bash'
  | 'powershell';

export interface LanguageConfig {
  name: string;
  displayName: string;
  extensions: string[];
  icon: string;
  defaultOptions: Partial<LanguageSpecificOptions>;
  syntaxPatterns: SyntaxPattern[];
}

export interface SyntaxPattern {
  name: string;
  pattern: RegExp;
  className: string;
  priority: number;
}

// Language configurations
export const LANGUAGE_CONFIGS: Record<SupportedLanguage, LanguageConfig> = {
  javascript: {
    name: 'javascript',
    displayName: 'JavaScript',
    extensions: ['.js', '.mjs'],
    icon: '🟨',
    defaultOptions: {
      semicolons: true,
      singleQuote: false,
      trailingComma: 'es5',
      bracketSpacing: true
    },
    syntaxPatterns: [
      { name: 'keyword', pattern: /\b(function|const|let|var|if|else|for|while|return|class|import|export)\b/g, className: 'syntax-keyword', priority: 3 },
      { name: 'string', pattern: /(["'`])(?:(?!\1)[^\\]|\\.)* \1/g, className: 'syntax-string', priority: 2 },
      { name: 'comment', pattern: /\/\/.*|\/\*[\s\S]*?\*\//g, className: 'syntax-comment', priority: 1 },
      { name: 'number', pattern: /\b\d+\.?\d*\b/g, className: 'syntax-number', priority: 2 }
    ]
  },
  typescript: {
    name: 'typescript',
    displayName: 'TypeScript',
    extensions: ['.ts', '.tsx'],
    icon: '🔷',
    defaultOptions: {
      semicolons: true,
      singleQuote: false,
      trailingComma: 'all',
      bracketSpacing: true
    },
    syntaxPatterns: [
      { name: 'keyword', pattern: /\b(function|const|let|var|if|else|for|while|return|class|import|export|interface|type|enum)\b/g, className: 'syntax-keyword', priority: 3 },
      { name: 'type', pattern: /\b(string|number|boolean|object|any|void|never|unknown)\b/g, className: 'syntax-type', priority: 3 },
      { name: 'string', pattern: /(["'`])(?:(?!\1)[^\\]|\\.)*\1/g, className: 'syntax-string', priority: 2 },
      { name: 'comment', pattern: /\/\/.*|\/\*[\s\S]*?\*\//g, className: 'syntax-comment', priority: 1 }
    ]
  },
  python: {
    name: 'python',
    displayName: 'Python',
    extensions: ['.py', '.pyw'],
    icon: '🐍',
    defaultOptions: {
      lineLength: 88,
      skipStringNormalization: false
    },
    syntaxPatterns: [
      { name: 'keyword', pattern: /\b(def|class|if|elif|else|for|while|return|import|from|try|except|finally|with|as|pass|break|continue)\b/g, className: 'syntax-keyword', priority: 3 },
      { name: 'builtin', pattern: /\b(print|len|range|str|int|float|list|dict|set|tuple)\b/g, className: 'syntax-builtin', priority: 3 },
      { name: 'string', pattern: /(["'])(?:(?!\1)[^\\]|\\.)*\1|"""[\s\S]*?"""|'''[\s\S]*?'''/g, className: 'syntax-string', priority: 2 },
      { name: 'comment', pattern: /#.*/g, className: 'syntax-comment', priority: 1 }
    ]
  },
  java: {
    name: 'java',
    displayName: 'Java',
    extensions: ['.java'],
    icon: '☕',
    defaultOptions: {
      allmanBraces: false,
      spaceBeforeParens: false
    },
    syntaxPatterns: [
      { name: 'keyword', pattern: /\b(public|private|protected|static|final|class|interface|extends|implements|if|else|for|while|return|new|this|super)\b/g, className: 'syntax-keyword', priority: 3 },
      { name: 'type', pattern: /\b(String|int|double|boolean|void|Object|List|Map|Set)\b/g, className: 'syntax-type', priority: 3 },
      { name: 'string', pattern: /"(?:[^"\\]|\\.)*"/g, className: 'syntax-string', priority: 2 },
      { name: 'comment', pattern: /\/\/.*|\/\*[\s\S]*?\*\//g, className: 'syntax-comment', priority: 1 }
    ]
  },
  json: {
    name: 'json',
    displayName: 'JSON',
    extensions: ['.json'],
    icon: '📄',
    defaultOptions: {
      sortKeys: false,
      compactArrays: false
    },
    syntaxPatterns: [
      { name: 'key', pattern: /"[^"]*"(?=\s*:)/g, className: 'syntax-key', priority: 3 },
      { name: 'string', pattern: /"[^"]*"(?!\s*:)/g, className: 'syntax-string', priority: 2 },
      { name: 'number', pattern: /\b-?\d+\.?\d*([eE][+-]?\d+)?\b/g, className: 'syntax-number', priority: 2 },
      { name: 'boolean', pattern: /\b(true|false|null)\b/g, className: 'syntax-boolean', priority: 3 }
    ]
  },
  html: {
    name: 'html',
    displayName: 'HTML',
    extensions: ['.html', '.htm'],
    icon: '🌐',
    defaultOptions: {
      wrapAttributes: 'auto',
      selfClosingTags: true
    },
    syntaxPatterns: [
      { name: 'tag', pattern: /<\/?[a-zA-Z][^>]*>/g, className: 'syntax-tag', priority: 3 },
      { name: 'attribute', pattern: /\s[a-zA-Z-]+(?==)/g, className: 'syntax-attribute', priority: 2 },
      { name: 'string', pattern: /"[^"]*"|'[^']*'/g, className: 'syntax-string', priority: 2 },
      { name: 'comment', pattern: /<!--[\s\S]*?-->/g, className: 'syntax-comment', priority: 1 }
    ]
  },
  css: {
    name: 'css',
    displayName: 'CSS',
    extensions: ['.css'],
    icon: '🎨',
    defaultOptions: {
      expandShorthand: false,
      selectorSeparator: ',\n'
    },
    syntaxPatterns: [
      { name: 'selector', pattern: /[^{]+(?={)/g, className: 'syntax-selector', priority: 3 },
      { name: 'property', pattern: /[a-zA-Z-]+(?=:)/g, className: 'syntax-property', priority: 3 },
      { name: 'value', pattern: /:[^;]+/g, className: 'syntax-value', priority: 2 },
      { name: 'comment', pattern: /\/\*[\s\S]*?\*\//g, className: 'syntax-comment', priority: 1 }
    ]
  },
  scss: {
    name: 'scss',
    displayName: 'SCSS',
    extensions: ['.scss'],
    icon: '💅',
    defaultOptions: {
      expandShorthand: false,
      selectorSeparator: ',\n'
    },
    syntaxPatterns: [
      { name: 'variable', pattern: /\$[a-zA-Z-]+/g, className: 'syntax-variable', priority: 3 },
      { name: 'selector', pattern: /[^{]+(?={)/g, className: 'syntax-selector', priority: 2 },
      { name: 'property', pattern: /[a-zA-Z-]+(?=:)/g, className: 'syntax-property', priority: 3 },
      { name: 'comment', pattern: /\/\/.*|\/\*[\s\S]*?\*\//g, className: 'syntax-comment', priority: 1 }
    ]
  },
  xml: {
    name: 'xml',
    displayName: 'XML',
    extensions: ['.xml'],
    icon: '📋',
    defaultOptions: {
      wrapAttributes: 'auto',
      selfClosingTags: true
    },
    syntaxPatterns: [
      { name: 'tag', pattern: /<\/?[a-zA-Z][^>]*>/g, className: 'syntax-tag', priority: 3 },
      { name: 'attribute', pattern: /\s[a-zA-Z-]+(?==)/g, className: 'syntax-attribute', priority: 2 },
      { name: 'string', pattern: /"[^"]*"|'[^']*'/g, className: 'syntax-string', priority: 2 },
      { name: 'comment', pattern: /<!--[\s\S]*?-->/g, className: 'syntax-comment', priority: 1 }
    ]
  },
  sql: {
    name: 'sql',
    displayName: 'SQL',
    extensions: ['.sql'],
    icon: '🗃️',
    defaultOptions: {},
    syntaxPatterns: [
      { name: 'keyword', pattern: /\b(SELECT|FROM|WHERE|JOIN|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP|TABLE|INDEX|PRIMARY|KEY|FOREIGN)\b/gi, className: 'syntax-keyword', priority: 3 },
      { name: 'function', pattern: /\b(COUNT|SUM|AVG|MIN|MAX|CONCAT|SUBSTRING|LENGTH)\b/gi, className: 'syntax-function', priority: 3 },
      { name: 'string', pattern: /'[^']*'/g, className: 'syntax-string', priority: 2 },
      { name: 'comment', pattern: /--.*|\/\*[\s\S]*?\*\//g, className: 'syntax-comment', priority: 1 }
    ]
  },
  php: {
    name: 'php',
    displayName: 'PHP',
    extensions: ['.php'],
    icon: '🐘',
    defaultOptions: {},
    syntaxPatterns: [
      { name: 'php-tag', pattern: /<\?php|\?>/g, className: 'syntax-php-tag', priority: 4 },
      { name: 'keyword', pattern: /\b(function|class|if|else|elseif|for|foreach|while|return|public|private|protected|static)\b/g, className: 'syntax-keyword', priority: 3 },
      { name: 'variable', pattern: /\$[a-zA-Z_][a-zA-Z0-9_]*/g, className: 'syntax-variable', priority: 3 },
      { name: 'string', pattern: /"[^"]*"|'[^']*'/g, className: 'syntax-string', priority: 2 }
    ]
  },
  go: {
    name: 'go',
    displayName: 'Go',
    extensions: ['.go'],
    icon: '🐹',
    defaultOptions: {},
    syntaxPatterns: [
      { name: 'keyword', pattern: /\b(func|var|const|if|else|for|range|return|package|import|type|struct|interface)\b/g, className: 'syntax-keyword', priority: 3 },
      { name: 'type', pattern: /\b(string|int|int64|float64|bool|byte|rune)\b/g, className: 'syntax-type', priority: 3 },
      { name: 'string', pattern: /"[^"]*"|`[^`]*`/g, className: 'syntax-string', priority: 2 },
      { name: 'comment', pattern: /\/\/.*|\/\*[\s\S]*?\*\//g, className: 'syntax-comment', priority: 1 }
    ]
  },
  rust: {
    name: 'rust',
    displayName: 'Rust',
    extensions: ['.rs'],
    icon: '🦀',
    defaultOptions: {},
    syntaxPatterns: [
      { name: 'keyword', pattern: /\b(fn|let|mut|const|if|else|for|while|loop|return|struct|enum|impl|trait|pub|use)\b/g, className: 'syntax-keyword', priority: 3 },
      { name: 'type', pattern: /\b(i32|i64|u32|u64|f32|f64|bool|char|String|Vec|Option|Result)\b/g, className: 'syntax-type', priority: 3 },
      { name: 'string', pattern: /"[^"]*"/g, className: 'syntax-string', priority: 2 },
      { name: 'comment', pattern: /\/\/.*|\/\*[\s\S]*?\*\//g, className: 'syntax-comment', priority: 1 }
    ]
  },
  cpp: {
    name: 'cpp',
    displayName: 'C++',
    extensions: ['.cpp', '.cc', '.cxx', '.hpp', '.h'],
    icon: '⚡',
    defaultOptions: {},
    syntaxPatterns: [
      { name: 'preprocessor', pattern: /#[a-zA-Z]+.*/g, className: 'syntax-preprocessor', priority: 4 },
      { name: 'keyword', pattern: /\b(int|char|float|double|bool|void|if|else|for|while|return|class|public|private|protected|static|const)\b/g, className: 'syntax-keyword', priority: 3 },
      { name: 'string', pattern: /"[^"]*"|'[^']*'/g, className: 'syntax-string', priority: 2 },
      { name: 'comment', pattern: /\/\/.*|\/\*[\s\S]*?\*\//g, className: 'syntax-comment', priority: 1 }
    ]
  },
  csharp: {
    name: 'csharp',
    displayName: 'C#',
    extensions: ['.cs'],
    icon: '💙',
    defaultOptions: {},
    syntaxPatterns: [
      { name: 'keyword', pattern: /\b(using|namespace|class|public|private|protected|static|if|else|for|foreach|while|return|new|this|base)\b/g, className: 'syntax-keyword', priority: 3 },
      { name: 'type', pattern: /\b(string|int|double|bool|void|object|List|Dictionary|var)\b/g, className: 'syntax-type', priority: 3 },
      { name: 'string', pattern: /"[^"]*"|@"[^"]*"/g, className: 'syntax-string', priority: 2 },
      { name: 'comment', pattern: /\/\/.*|\/\*[\s\S]*?\*\//g, className: 'syntax-comment', priority: 1 }
    ]
  },
  yaml: {
    name: 'yaml',
    displayName: 'YAML',
    extensions: ['.yml', '.yaml'],
    icon: '📝',
    defaultOptions: {},
    syntaxPatterns: [
      { name: 'key', pattern: /^[\s]*[^:\s][^:]*(?=:)/gm, className: 'syntax-key', priority: 3 },
      { name: 'string', pattern: /"[^"]*"|'[^']*'/g, className: 'syntax-string', priority: 2 },
      { name: 'comment', pattern: /#.*/g, className: 'syntax-comment', priority: 1 },
      { name: 'boolean', pattern: /\b(true|false|yes|no|on|off)\b/g, className: 'syntax-boolean', priority: 3 }
    ]
  },
  markdown: {
    name: 'markdown',
    displayName: 'Markdown',
    extensions: ['.md', '.markdown'],
    icon: '📄',
    defaultOptions: {},
    syntaxPatterns: [
      { name: 'header', pattern: /^#{1,6}\s.*/gm, className: 'syntax-header', priority: 3 },
      { name: 'bold', pattern: /\*\*[^*]+\*\*|__[^_]+__/g, className: 'syntax-bold', priority: 2 },
      { name: 'italic', pattern: /\*[^*]+\*|_[^_]+_/g, className: 'syntax-italic', priority: 2 },
      { name: 'code', pattern: /`[^`]+`/g, className: 'syntax-code', priority: 2 }
    ]
  },
  bash: {
    name: 'bash',
    displayName: 'Bash',
    extensions: ['.sh', '.bash'],
    icon: '🐚',
    defaultOptions: {},
    syntaxPatterns: [
      { name: 'shebang', pattern: /^#!.*/m, className: 'syntax-shebang', priority: 4 },
      { name: 'keyword', pattern: /\b(if|then|else|elif|fi|for|do|done|while|function|case|esac)\b/g, className: 'syntax-keyword', priority: 3 },
      { name: 'variable', pattern: /\$[a-zA-Z_][a-zA-Z0-9_]*|\$\{[^}]+\}/g, className: 'syntax-variable', priority: 3 },
      { name: 'string', pattern: /"[^"]*"|'[^']*'/g, className: 'syntax-string', priority: 2 },
      { name: 'comment', pattern: /#.*/g, className: 'syntax-comment', priority: 1 }
    ]
  },
  powershell: {
    name: 'powershell',
    displayName: 'PowerShell',
    extensions: ['.ps1', '.psm1'],
    icon: '🔵',
    defaultOptions: {},
    syntaxPatterns: [
      { name: 'keyword', pattern: /\b(function|param|if|else|elseif|for|foreach|while|do|switch|try|catch|finally|return)\b/gi, className: 'syntax-keyword', priority: 3 },
      { name: 'cmdlet', pattern: /\b[A-Z][a-z]+-[A-Z][a-z]+\b/g, className: 'syntax-cmdlet', priority: 3 },
      { name: 'variable', pattern: /\$[a-zA-Z_][a-zA-Z0-9_]*/g, className: 'syntax-variable', priority: 3 },
      { name: 'string', pattern: /"[^"]*"|'[^']*'/g, className: 'syntax-string', priority: 2 },
      { name: 'comment', pattern: /#.*/g, className: 'syntax-comment', priority: 1 }
    ]
  }
};

// Example code snippets for each language
export const FORMATTER_EXAMPLES: Record<SupportedLanguage, string> = {
  javascript: `// JavaScript Example
function calculateSum(a, b) {
const result = a + b;
console.log("Sum:", result);
return result;
}

const numbers = [1, 2, 3, 4, 5];
const total = numbers.reduce((acc, num) => acc + num, 0);`,

  typescript: `// TypeScript Example
interface User {
  id: number;
  name: string;
  email?: string;
}

class UserService {
  private users: User[] = [];
  
  addUser(user: User): void {
    this.users.push(user);
  }
  
  findById(id: number): User | undefined {
    return this.users.find(u => u.id === id);
  }
}`,

  python: `# Python Example
def calculate_fibonacci(n):
    if n <= 1:
        return n
    return calculate_fibonacci(n-1) + calculate_fibonacci(n-2)

class Calculator:
    def __init__(self):
        self.history = []
    
    def add(self, a, b):
        result = a + b
        self.history.append(f"{a} + {b} = {result}")
        return result`,

  java: `// Java Example
public class Calculator {
    private List<String> history;
    
    public Calculator() {
        this.history = new ArrayList<>();
    }
    
    public int add(int a, int b) {
        int result = a + b;
        history.add(a + " + " + b + " = " + result);
        return result;
    }
    
    public static void main(String[] args) {
        Calculator calc = new Calculator();
        System.out.println(calc.add(5, 3));
    }
}`,

  json: `{
"name": "John Doe",
"age": 30,
"isActive": true,
"address": {
"street": "123 Main St",
"city": "New York",
"zipCode": "10001"
},
"hobbies": ["reading", "coding", "traveling"],
"spouse": null
}`,

  html: `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Sample Page</title>
</head>
<body>
<header>
<h1>Welcome to My Website</h1>
<nav>
<a href="#home">Home</a>
<a href="#about">About</a>
<a href="#contact">Contact</a>
</nav>
</header>
<main>
<section id="content">
<p>This is a sample paragraph with <strong>bold</strong> and <em>italic</em> text.</p>
</section>
</main>
</body>
</html>`,

  css: `/* CSS Example */
body {
margin: 0;
padding: 0;
font-family: Arial, sans-serif;
background-color: #f4f4f4;
}

.container {
max-width: 1200px;
margin: 0 auto;
padding: 20px;
}

.card {
background: white;
border-radius: 8px;
box-shadow: 0 2px 4px rgba(0,0,0,0.1);
padding: 1rem;
margin-bottom: 1rem;
}`,

  scss: `// SCSS Example
$primary-color: #3498db;
$font-size-base: 16px;
$border-radius: 4px;

.button {
  background-color: $primary-color;
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: $border-radius;
  font-size: $font-size-base;
  
  &:hover {
    background-color: darken($primary-color, 10%);
  }
  
  &.large {
    font-size: $font-size-base * 1.2;
    padding: 0.75rem 1.5rem;
  }
}`,

  xml: `<?xml version="1.0" encoding="UTF-8"?>
<bookstore>
<book id="1" category="fiction">
<title>Great Gatsby</title>
<author>F. Scott Fitzgerald</author>
<price currency="USD">12.99</price>
<availability>in-stock</availability>
</book>
<book id="2" category="mystery">
<title>The Girl with the Dragon Tattoo</title>
<author>Stieg Larsson</author>
<price currency="USD">14.99</price>
<availability>out-of-stock</availability>
</book>
</bookstore>`,

  sql: `-- SQL Example
CREATE TABLE users (
id INT PRIMARY KEY AUTO_INCREMENT,
username VARCHAR(50) NOT NULL UNIQUE,
email VARCHAR(100) NOT NULL,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (username, email) VALUES 
('john_doe', 'john@example.com'),
('jane_smith', 'jane@example.com');

SELECT u.username, u.email, COUNT(p.id) as post_count
FROM users u
LEFT JOIN posts p ON u.id = p.user_id
WHERE u.created_at >= '2023-01-01'
GROUP BY u.id
ORDER BY post_count DESC;`,

  php: `<?php
// PHP Example
class UserManager {
    private $pdo;
    
    public function __construct(PDO $pdo) {
        $this->pdo = $pdo;
    }
    
    public function createUser($username, $email) {
        $stmt = $this->pdo->prepare("INSERT INTO users (username, email) VALUES (?, ?)");
        return $stmt->execute([$username, $email]);
    }
    
    public function findUser($id) {
        $stmt = $this->pdo->prepare("SELECT * FROM users WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
}
?>`,

  go: `// Go Example
package main

import (
    "fmt"
    "net/http"
    "log"
)

type User struct {
    ID   int    \`json:"id"\`
    Name string \`json:"name"\`
    Email string \`json:"email"\`
}

func main() {
    users := []User{
        {ID: 1, Name: "John Doe", Email: "john@example.com"},
        {ID: 2, Name: "Jane Smith", Email: "jane@example.com"},
    }
    
    http.HandleFunc("/users", func(w http.ResponseWriter, r *http.Request) {
        fmt.Fprintf(w, "Users: %+v", users)
    })
    
    log.Println("Server starting on :8080")
    log.Fatal(http.ListenAndServe(":8080", nil))
}`,

  rust: `// Rust Example
use std::collections::HashMap;

#[derive(Debug)]
struct User {
    id: u32,
    name: String,
    email: String,
}

impl User {
    fn new(id: u32, name: &str, email: &str) -> Self {
        User {
            id,
            name: name.to_string(),
            email: email.to_string(),
        }
    }
}

fn main() {
    let mut users: HashMap<u32, User> = HashMap::new();
    
    let user1 = User::new(1, "John Doe", "john@example.com");
    users.insert(user1.id, user1);
    
    match users.get(&1) {
        Some(user) => println!("Found user: {:?}", user),
        None => println!("User not found"),
    }
}`,

  cpp: `// C++ Example
#include <iostream>
#include <vector>
#include <algorithm>

class Calculator {
private:
    std::vector<double> history;
    
public:
    double add(double a, double b) {
        double result = a + b;
        history.push_back(result);
        return result;
    }
    
    void printHistory() const {
        std::cout << "Calculation History:" << std::endl;
        for (const auto& result : history) {
            std::cout << result << std::endl;
        }
    }
};

int main() {
    Calculator calc;
    std::cout << "5 + 3 = " << calc.add(5, 3) << std::endl;
    calc.printHistory();
    return 0;
}`,

  csharp: `// C# Example
using System;
using System.Collections.Generic;
using System.Linq;

namespace CalculatorApp
{
    public class Calculator
    {
        private List<double> _history = new List<double>();
        
        public double Add(double a, double b)
        {
            var result = a + b;
            _history.Add(result);
            return result;
        }
        
        public void PrintHistory()
        {
            Console.WriteLine("Calculation History:");
            foreach (var result in _history)
            {
                Console.WriteLine(result);
            }
        }
    }
    
    class Program
    {
        static void Main(string[] args)
        {
            var calc = new Calculator();
            Console.WriteLine($"5 + 3 = {calc.Add(5, 3)}");
            calc.PrintHistory();
        }
    }
}`,

  yaml: `# YAML Example
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
  namespace: production
data:
  database_url: "postgresql://user:pass@localhost:5432/mydb"
  redis_url: "redis://localhost:6379"
  debug: "false"
  features:
    - user_registration
    - email_notifications
    - premium_features
  limits:
    max_users: 1000
    max_requests_per_minute: 100`,

  markdown: `# Markdown Example

This is a **comprehensive** example of *Markdown* formatting.

## Features

- **Bold text**
- *Italic text*
- \`Inline code\`
- [Links](https://example.com)

### Code Block

\`\`\`javascript
function hello() {
    console.log("Hello, World!");
}
\`\`\`

### Table

| Feature | Supported | Notes |
|---------|-----------|-------|
| Headers | ✅ | H1-H6 |
| Lists | ✅ | Ordered & Unordered |
| Code | ✅ | Inline & Blocks |

> This is a blockquote with important information.`,

  bash: `#!/bin/bash
# Bash Script Example

set -e

USER_NAME="john_doe"
LOG_FILE="/var/log/script.log"

function log_message() {
    echo "$(date): $1" >> "$LOG_FILE"
}

function create_user() {
    local username=$1
    if id "$username" &>/dev/null; then
        log_message "User $username already exists"
        return 1
    else
        useradd -m "$username"
        log_message "Created user $username"
        return 0
    fi
}

# Main execution
if [[ $# -eq 0 ]]; then
    echo "Usage: $0 <username>"
    exit 1
fi

create_user "$1"`,

  powershell: `# PowerShell Example
param(
    [Parameter(Mandatory=$true)]
    [string]$UserName,
    
    [Parameter(Mandatory=$false)]
    [string]$LogPath = "C:\\Logs\\script.log"
)

function Write-LogMessage {
    param([string]$Message)
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logEntry = "$timestamp: $Message"
    Add-Content -Path $LogPath -Value $logEntry
    Write-Output $logEntry
}

function Test-UserExists {
    param([string]$Username)
    
    try {
        Get-LocalUser -Name $Username -ErrorAction Stop
        return $true
    }
    catch {
        return $false
    }
}

# Main execution
if (Test-UserExists -Username $UserName) {
    Write-LogMessage "User $UserName already exists"
} else {
    New-LocalUser -Name $UserName -NoPassword
    Write-LogMessage "Created user $UserName"
}`
};