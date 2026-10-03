import React from 'react';

/**
 * High-fidelity syntax highlighter matching the CodeDo IDE design specification:
 * - keywords: #c084fc (fun, return, val, var, if, else, when, class)
 * - funcs: #38bdf8 (multiply, println, etc.)
 * - params/identifiers: #f8fafc
 * - types: #fbbf24 (Int, String, Boolean, Unit, etc.)
 * - operators: #f43f5e (*, +, -, /, =, ->, etc.)
 * - punctuation: #94a3b8 (:, (, ), {, }, [, ], ,, .)
 * - comments: #64748b (// ...)
 */

export const KEYWORDS = new Set(['fun', 'return', 'val', 'var', 'if', 'else', 'when', 'class', 'package', 'import', 'true', 'false', 'null', 'for', 'in', 'while', 'do']);
const TYPES = new Set(['Int', 'String', 'Boolean', 'Double', 'Float', 'Long', 'Short', 'Byte', 'Unit', 'Any', 'List', 'Map', 'Set', 'Array']);
const OPERATORS = new Set(['*', '+', '-', '/', '%', '=', '==', '!=', '<', '>', '<=', '>=', '->', '?:', '&&', '||', '!']);
const PUNCTUATION = new Set([':', '(', ')', '{', '}', '[', ']', ',', '.', ';']);

export interface SyntaxToken {
  text: string;
  type: 'keyword' | 'func' | 'type' | 'param' | 'op' | 'punct' | 'comment' | 'number' | 'string' | 'whitespace';
}

export function tokenizeKotlinLine(line: string): SyntaxToken[] {
  const tokens: SyntaxToken[] = [];
  let i = 0;

  while (i < line.length) {
    // 1. Comments
    if (line.startsWith('//', i)) {
      tokens.push({ text: line.slice(i), type: 'comment' });
      break;
    }

    // 2. Whitespace
    if (/\s/.test(line[i])) {
      let ws = '';
      while (i < line.length && /\s/.test(line[i])) {
        ws += line[i];
        i++;
      }
      tokens.push({ text: ws, type: 'whitespace' });
      continue;
    }

    // 3. String literals
    if (line[i] === '"') {
      let str = '"';
      i++;
      while (i < line.length && line[i] !== '"') {
        if (line[i] === '\\' && i + 1 < line.length) {
          str += line[i] + line[i + 1];
          i += 2;
        } else {
          str += line[i];
          i++;
        }
      }
      if (i < line.length && line[i] === '"') {
        str += '"';
        i++;
      }
      tokens.push({ text: str, type: 'string' });
      continue;
    }

    // 4. Number literals
    if (/\d/.test(line[i])) {
      let num = '';
      while (i < line.length && /[\d._]/.test(line[i])) {
        num += line[i];
        i++;
      }
      tokens.push({ text: num, type: 'number' });
      continue;
    }

    // 5. Multi-character operators
    const twoChar = line.slice(i, i + 2);
    if (OPERATORS.has(twoChar)) {
      tokens.push({ text: twoChar, type: 'op' });
      i += 2;
      continue;
    }

    // 6. Single-character operators & punctuation
    if (OPERATORS.has(line[i])) {
      tokens.push({ text: line[i], type: 'op' });
      i++;
      continue;
    }
    if (PUNCTUATION.has(line[i])) {
      tokens.push({ text: line[i], type: 'punct' });
      i++;
      continue;
    }

    // 7. Word / Identifiers
    if (/[a-zA-Z_$]/.test(line[i])) {
      let word = '';
      while (i < line.length && /[a-zA-Z0-9_$]/.test(line[i])) {
        word += line[i];
        i++;
      }

      if (KEYWORDS.has(word)) {
        tokens.push({ text: word, type: 'keyword' });
      } else if (TYPES.has(word)) {
        tokens.push({ text: word, type: 'type' });
      } else if (word.startsWith('return') && word.length > 6) {
        tokens.push({ text: 'return', type: 'keyword' });
        tokens.push({ text: word.slice(6), type: 'param' });
      } else {
        // Look ahead for '(' to determine if function name
        let j = i;
        while (j < line.length && /\s/.test(line[j])) j++;
        if (line[j] === '(') {
          tokens.push({ text: word, type: 'func' });
        } else {
          tokens.push({ text: word, type: 'param' });
        }
      }
      continue;
    }

    // 8. Fallback char
    tokens.push({ text: line[i], type: 'param' });
    i++;
  }

  return tokens;
}

function renderToken(t: SyntaxToken, key: string, isDark: boolean): React.ReactNode {
  switch (t.type) {
    case 'keyword':
      return (
        <span key={key} className={isDark ? 'text-[#c084fc] font-semibold' : 'text-[#7c3aed] font-semibold'}>
          {t.text}
        </span>
      );
    case 'func':
      return (
        <span key={key} className={isDark ? 'text-[#38bdf8] font-semibold' : 'text-[#0284c7] font-semibold'}>
          {t.text}
        </span>
      );
    case 'type':
      return (
        <span key={key} className={isDark ? 'text-[#fbbf24] font-medium' : 'text-[#b45309] font-medium'}>
          {t.text}
        </span>
      );
    case 'op':
      return (
        <span key={key} className={isDark ? 'text-[#f43f5e] font-bold' : 'text-[#e11d48] font-bold'}>
          {t.text}
        </span>
      );
    case 'punct':
      return <span key={key} className={isDark ? 'text-[#94a3b8]' : 'text-[#64748b]'}>{t.text}</span>;
    case 'comment':
      return (
        <span key={key} className={isDark ? 'text-[#64748b] italic text-[11px]' : 'text-[#94a3b8] italic text-[11px]'}>
          {t.text}
        </span>
      );
    case 'string':
      return (
        <span key={key} className={isDark ? 'text-[#34d399] font-medium' : 'text-[#059669] font-medium'}>
          {t.text}
        </span>
      );
    case 'number':
      return (
        <span key={key} className={isDark ? 'text-[#fb923c] font-medium' : 'text-[#c2410c] font-medium'}>
          {t.text}
        </span>
      );
    case 'whitespace':
      return <span key={key}>{t.text}</span>;
    case 'param':
    default:
      return <span key={key} className={isDark ? 'text-slate-100' : 'text-slate-800'}>{t.text}</span>;
  }
}

export function renderHighlightedLine(line: string, keyPrefix: string = 'token', isDark: boolean = true): React.ReactNode[] {
  const tokens = tokenizeKotlinLine(line);
  return tokens.map((t, idx) => renderToken(t, `${keyPrefix}-${idx}`, isDark));
}

// Tokenizes the WHOLE line ONCE, then splits the resulting styled output at
// `splitPoints` (e.g. the caret column, or a selection's start/end columns)
// into `splitPoints.length + 1` segments. This exists specifically because
// the editor previously highlighted the text before/after the cursor (and
// around a selection) by slicing the raw string first and tokenizing each
// slice independently -- which loses the surrounding context a multi-
// character token needs to be classified correctly. A cursor sitting in the
// middle of "println(" split it into "p" + "rintln(": the first half has no
// "(" left in its own slice to look ahead to, so it fell through to the
// plain identifier color instead of the function color the other half got,
// producing a visible color change exactly at the cursor. Splitting each
// token's already-classified TEXT here (never re-tokenizing a fragment)
// keeps both sides colored the same way the whole token would have been.
export function renderHighlightedLineSegments(
  line: string,
  splitPoints: number[],
  keyPrefix: string = 'token',
  isDark: boolean = true
): React.ReactNode[][] {
  const tokens = tokenizeKotlinLine(line);
  const points = Array.from(new Set(splitPoints.map((p) => Math.max(0, Math.min(line.length, p))))).sort((a, b) => a - b);
  const segments: React.ReactNode[][] = Array.from({ length: points.length + 1 }, () => []);

  let pos = 0;
  tokens.forEach((t, tIdx) => {
    const start = pos;
    const end = pos + t.text.length;
    pos = end;

    let segIdx = points.filter((p) => p <= start).length;
    let sliceStart = 0;

    for (const p of points) {
      if (p <= start || p >= end) continue;
      const cutAt = p - start;
      const piece = t.text.slice(sliceStart, cutAt);
      if (piece) segments[segIdx].push(renderToken({ text: piece, type: t.type }, `${keyPrefix}-${tIdx}-${segIdx}`, isDark));
      sliceStart = cutAt;
      segIdx++;
    }

    const finalPiece = t.text.slice(sliceStart);
    if (finalPiece) segments[segIdx].push(renderToken({ text: finalPiece, type: t.type }, `${keyPrefix}-${tIdx}-${segIdx}`, isDark));
  });

  return segments;
}
