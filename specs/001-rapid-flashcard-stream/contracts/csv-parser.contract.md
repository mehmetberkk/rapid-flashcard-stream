# Contract: Fault-Tolerant CSV Parser

**Feature**: `001-rapid-flashcard-stream`
**Module**: `src/core/parser/CsvParser.ts`

## Purpose

Parses raw CSV, TSV, or delimited text into validated card objects. Satisfies Constitution Principle IV (Fault-Tolerant Input) and Principle V (Headless Business Logic).

## Interface Definition

```typescript
export interface ParsedCardItem {
  front: string;
  back: string;
  orderIndex: number;
}

export interface ImportErrorItem {
  lineNumber: number;
  rawContent: string;
  reason: string;
}

export interface CsvParseResult {
  fileName: string;
  totalLines: number;
  importedCards: ParsedCardItem[];
  errors: ImportErrorItem[];
  detectedDelimiter: string;
}

export interface CsvParserOptions {
  delimiter?: ',' | ';' | '\t' | 'auto'; // Default: 'auto'
  hasHeader?: boolean | 'auto';          // Default: 'auto'
  stripBom?: boolean;                    // Default: true
}

export interface ICsvParser {
  /**
   * Parses raw file text into valid cards and an error report.
   * Never throws on malformed rows; gracefully accumulates diagnostics.
   */
  parse(rawText: string, fileName?: string, options?: CsvParserOptions): CsvParseResult;

  /**
   * Auto-detects the delimiter by inspecting the first N rows.
   */
  detectDelimiter(sampleText: string): ',' | ';' | '\t';
}
```

## Behavior and Invariants

1. **Non-Fatal Resilience**: A malformed row (e.g. only 1 column, unclosed quotes, empty line) must NEVER abort the parsing of subsequent lines.
2. **BOM & UTF-8 Handling**: Leading UTF-8 Byte Order Marks (`\uFEFF`) and Windows CRLF (`\r\n`) line endings are stripped cleanly.
3. **Quotation Handling**: Supports RFC-4180 standard quotes (e.g. `"word with, comma","meaning"`).
4. **Header Detection**: If the first row contains standard header keywords like `front`, `back`, `kelime`, `anlam`, `term`, `definition`, it is automatically detected and skipped from the flashcard deck.

