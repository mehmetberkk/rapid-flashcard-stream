import type { ImportErrorItem } from '../models';

export interface ParsedCardItem {
  front: string;
  back: string;
  orderIndex: number;
}

export interface CsvParseResult {
  fileName: string;
  totalLines: number;
  importedCards: ParsedCardItem[];
  errors: ImportErrorItem[];
  detectedDelimiter: string;
}

export interface CsvParserOptions {
  delimiter?: ',' | ';' | '\t' | 'auto';
  hasHeader?: boolean | 'auto';
  stripBom?: boolean;
}

const COMMON_HEADER_TERMS = new Set([
  'front', 'back', 'term', 'definition', 'word', 'meaning',
  'kelime', 'anlam', 'turkce', 'ingilizce', 'english', 'turkish',
  'soru', 'cevap', 'question', 'answer'
]);

export class CsvParser {
  public parse(
    rawContent: string,
    fileName: string = 'imported.csv',
    options: CsvParserOptions = {}
  ): CsvParseResult {
    let text = rawContent;
    if (options.stripBom !== false && text.charCodeAt(0) === 0xFEFF) {
      text = text.slice(1);
    }

    const lines = this.splitIntoLines(text);
    const delimiter = options.delimiter && options.delimiter !== 'auto'
      ? options.delimiter
      : this.detectDelimiter(lines);

    const importedCards: ParsedCardItem[] = [];
    const errors: ImportErrorItem[] = [];

    let startIndex = 0;
    if (lines.length > 0) {
      const isHeader = options.hasHeader === true ||
        (options.hasHeader !== false && this.isHeaderLine(lines[0], delimiter));
      if (isHeader) {
        startIndex = 1;
      }
    }

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i];
      const lineNumber = i + 1;

      // Skip completely empty lines without recording error
      if (!line || line.trim().length === 0) {
        continue;
      }

      const columns = this.parseLineColumns(line, delimiter);

      if (columns.length < 2) {
        errors.push({
          lineNumber,
          rawContent: line,
          reason: `Eksik sütun: En az 2 sütun (kelime ve anlam) bekleniyor, ${columns.length} bulundu.`
        });
        continue;
      }

      const front = columns[0].trim();
      const back = columns.slice(1).join(' - ').trim();

      if (front.length === 0 && back.length === 0) {
        continue;
      }

      if (front.length === 0) {
        errors.push({
          lineNumber,
          rawContent: line,
          reason: 'Kelime / Ön yüz boş olamaz.'
        });
        continue;
      }

      if (back.length === 0) {
        errors.push({
          lineNumber,
          rawContent: line,
          reason: 'Anlam / Arka yüz boş olamaz.'
        });
        continue;
      }

      importedCards.push({
        front,
        back,
        orderIndex: importedCards.length
      });
    }

    return {
      fileName,
      totalLines: lines.length,
      importedCards,
      errors,
      detectedDelimiter: delimiter
    };
  }

  public detectDelimiter(sampleLines: string[]): ',' | ';' | '\t' {
    const candidates: Array<',' | ';' | '\t'> = [',', ';', '\t'];
    const scores = { ',': 0, ';': 0, '\t': 0 };

    const testLines = sampleLines.slice(0, 15).filter(l => l && l.trim().length > 0);
    if (testLines.length === 0) return ',';

    for (const line of testLines) {
      for (const d of candidates) {
        const count = line.split(d).length - 1;
        if (count >= 1) {
          scores[d] += count;
        }
      }
    }

    if (scores['\t'] > scores[','] && scores['\t'] > scores[';']) return '\t';
    if (scores[';'] > scores[',']) return ';';
    return ',';
  }

  private splitIntoLines(text: string): string[] {
    // Normalizes CRLF and LF, handles basic line breaks
    return text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  }

  private parseLineColumns(line: string, delimiter: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          // Escaped quote: "" -> "
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === delimiter && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }

    result.push(current);
    return result;
  }

  private isHeaderLine(line: string, delimiter: string): boolean {
    const cols = this.parseLineColumns(line, delimiter).map(c =>
      c.toLowerCase().trim().replace(/[^a-zçğıöşü]/g, '')
    );
    if (cols.length < 2) return false;
    return cols.some(col => COMMON_HEADER_TERMS.has(col));
  }
}

export const csvParser = new CsvParser();
