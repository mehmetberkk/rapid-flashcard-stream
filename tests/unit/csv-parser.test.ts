import { describe, it, expect } from 'vitest';
import { CsvParser } from '../../src/core/parser/CsvParser';

describe('CsvParser Unit Tests', () => {
  const parser = new CsvParser();

  it('correctly auto-detects comma, semicolon, and tab delimiters', () => {
    expect(parser.detectDelimiter(['apple,elma', 'banana,muz'])).toBe(',');
    expect(parser.detectDelimiter(['apple;elma', 'banana;muz'])).toBe(';');
    expect(parser.detectDelimiter(['apple\telma', 'banana\tmuz'])).toBe('\t');
  });

  it('skips header line when standard header keywords are present', () => {
    const csvData = `Term,Definition\nAbundant,Bol\nAccelerate,Hızlandırmak`;
    const result = parser.parse(csvData, 'vocab.csv');

    expect(result.importedCards.length).toBe(2);
    expect(result.importedCards[0].front).toBe('Abundant');
    expect(result.importedCards[0].back).toBe('Bol');
  });

  it('handles quotes with embedded commas and stripped whitespace', () => {
    const csvData = `"Word, with comma","Meaning, with, multiple, commas"\nSimple,Basit`;
    const result = parser.parse(csvData);

    expect(result.importedCards.length).toBe(2);
    expect(result.importedCards[0].front).toBe('Word, with comma');
    expect(result.importedCards[0].back).toBe('Meaning, with, multiple, commas');
  });

  it('strips UTF-8 BOM automatically', () => {
    const bomCsv = '\uFEFFterm,definition\ncat,kedi\ndog,kopek';
    const result = parser.parse(bomCsv);

    expect(result.importedCards.length).toBe(2);
    expect(result.importedCards[0].front).toBe('cat');
  });

  it('tolerates malformed lines, records errors with line numbers, and imports valid rows', () => {
    const malformedCsv = [
      'front,back',
      'good1,iyi1',
      'broken_row_no_delimiter',
      'good2,iyi2',
      ',empty_front',
      'empty_back,',
      'good3,iyi3'
    ].join('\n');

    const result = parser.parse(malformedCsv, 'test.csv');

    // 3 good cards: good1, good2, good3
    expect(result.importedCards.length).toBe(3);
    expect(result.importedCards.map(c => c.front)).toEqual(['good1', 'good2', 'good3']);

    // 3 errors: line 3 (broken), line 5 (empty front), line 6 (empty back)
    expect(result.errors.length).toBe(3);
    expect(result.errors[0].lineNumber).toBe(3);
    expect(result.errors[1].lineNumber).toBe(5);
    expect(result.errors[2].lineNumber).toBe(6);
  });
});

