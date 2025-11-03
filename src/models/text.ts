// Text Comparator Models and Types

export interface TextDiff {
  type: 'equal' | 'insert' | 'delete' | 'replace';
  oldValue?: string;
  newValue?: string;
  lineNumber?: number;
  oldLineNumber?: number;
  newLineNumber?: number;
}

export interface ComparisonOptions {
  ignoreCase: boolean;
  ignoreWhitespace: boolean;
  ignoreLineBreaks: boolean;
  showLineNumbers: boolean;
  highlightWords: boolean;
  splitView: boolean;
  contextLines: number;
}

export interface ComparisonResult {
  diffs: TextDiff[];
  statistics: {
    totalLines: number;
    addedLines: number;
    deletedLines: number;
    modifiedLines: number;
    unchangedLines: number;
    similarity: number;
  };
}

export interface TextFile {
  name: string;
  content: string;
  encoding?: string;
  size?: number;
  lastModified?: Date;
}

export const DEFAULT_COMPARISON_OPTIONS: ComparisonOptions = {
  ignoreCase: false,
  ignoreWhitespace: false,
  ignoreLineBreaks: false,
  showLineNumbers: true,
  highlightWords: true,
  splitView: true,
  contextLines: 3,
};

export const TEXT_COMPARISON_EXAMPLES = {
  basic: {
    left: `Hello World
This is a sample text
for comparison testing
with multiple lines`,
    right: `Hello Universe
This is a sample text
for comparison testing
with several lines
and additional content`
  },
  code: {
    left: `function calculateSum(a, b) {
  return a + b;
}

const result = calculateSum(5, 3);
console.log(result);`,
    right: `function calculateSum(a, b, c = 0) {
  return a + b + c;
}

const result = calculateSum(5, 3, 2);
console.log('Result:', result);`
  },
  json: {
    left: `{
  "name": "John Doe",
  "age": 30,
  "city": "New York"
}`,
    right: `{
  "name": "John Smith",
  "age": 32,
  "city": "New York",
  "country": "USA"
}`
  }
};

export type DiffType = 'equal' | 'insert' | 'delete' | 'replace';
export type ViewMode = 'split' | 'unified';
export type ComparisonMode = 'line' | 'word' | 'character';