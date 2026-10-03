import React from 'react';
import { Text, View } from 'react-native';
import { MAIN, fz } from './shell';
import { FONT } from './theme';

// Kotlin colouring for lesson code (web: src/utils/codeHighlighter.tsx, renderKotlinCodeLines). Same token regex and word lists, the
// same dark/light colours, and a `/* ... */` comment that carries across lines.

const KEYWORDS = new Set(['val', 'var', 'fun', 'class', 'when', 'if', 'else', 'for', 'in', 'downTo', 'step', 'until', 'return', 'is']);
const LITERALS = new Set(['null', 'true', 'false']);
const TYPES = new Set(['Int', 'String', 'Boolean', 'Double', 'Unit', 'Float', 'List', 'Set', 'Map']);
const CALLS = new Set(['println', 'print', 'listOf', 'mutableListOf']);
const TOKEN =
  /(\/\/.*$|"[^"]*"|'(?:\\.|[^'\\])*'|_____|\b(?:val|var|fun|class|when|if|else|for|in|downTo|step|until|return|null|true|false|is)\b|\b(?:Int|String|Boolean|Double|Unit|Float|List|Set|Map)\b|\b(?:println|print|listOf|mutableListOf)\b|\d[\d_]*(?:\.[\d_]+)?[fFdDL]?|[{}()+\-*\/=?:.,!<>"&|\\]+|[A-Za-z_][A-Za-z0-9_]*|\s+)/g;

const colors = (dark: boolean) => ({
  comment: dark ? '#64748B' : '#94A3B8',
  string: dark ? '#6EE7B7' : '#059669',
  keyword: dark ? '#C084FC' : '#4F46E5',
  literal: dark ? '#FBBF24' : '#D97706',
  type: dark ? '#A5B4FC' : '#4338CA',
  call: dark ? '#22D3EE' : '#2563EB',
  number: dark ? '#FCD34D' : '#D97706',
  punct: dark ? '#94A3B8' : '#64748B',
  plain: dark ? '#E2E8F0' : '#1E293B',
});

function Fragmented({ text, dark }: { text: string; dark: boolean }) {
  const c = colors(dark);
  const out: React.ReactNode[] = [];
  let last = 0;
  let i = 0;
  const re = new RegExp(TOKEN.source, 'g');
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m[0] === '') {
      re.lastIndex++;
      continue;
    }
    const tok = m[0];
    let style: object = { color: c.plain };
    if (tok.startsWith('//')) style = { color: c.comment, fontStyle: 'italic' };
    else if (tok.startsWith('"') || tok.startsWith("'")) style = { color: c.string };
    else if (KEYWORDS.has(tok)) style = { color: c.keyword, fontFamily: FONT.mono.b };
    else if (LITERALS.has(tok)) style = { color: c.literal, fontFamily: FONT.mono.b };
    else if (TYPES.has(tok)) style = { color: c.type, fontFamily: FONT.mono.sb };
    else if (CALLS.has(tok)) style = { color: c.call, fontFamily: FONT.mono.md };
    else if (/^\d/.test(tok)) style = { color: c.number };
    else if (/^[{}()+\-*\/=?:.,!<>"&|\\]+$/.test(tok)) style = { color: c.punct };
    out.push(
      <Text key={i++} style={style}>
        {tok}
      </Text>
    );
    last = m.index + tok.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return <>{out}</>;
}

/**
 * The lines of a code array, one row each (a blank line keeps its height). `size` is the CSS font size of the code (13, 14 or 12 in the
 * lesson stages); the line height is the web's `leading-relaxed` (1.625).
 */
function KotlinLinesView({ lines, dark, size }: { lines: string[]; dark: boolean; size: number }) {
  const c = colors(dark);
  const fs = fz(size * MAIN);
  const lineHeight = size * MAIN * 1.625;
  let inBlock = false;
  return (
    <View style={{ alignSelf: 'flex-start' }}>
      {lines.map((line, idx) => {
        let body: React.ReactNode;
        if (line === '') {
          body = ' ';
        } else if (inBlock) {
          const end = line.indexOf('*/');
          if (end < 0) {
            body = <Text style={{ color: c.comment, fontStyle: 'italic' }}>{line}</Text>;
          } else {
            inBlock = false;
            body = (
              <>
                <Text style={{ color: c.comment, fontStyle: 'italic' }}>{line.slice(0, end + 2)}</Text>
                <Fragmented text={line.slice(end + 2)} dark={dark} />
              </>
            );
          }
        } else {
          const start = line.indexOf('/*');
          const lineComment = line.indexOf('//');
          if (start >= 0 && (lineComment < 0 || start < lineComment) && line.indexOf('*/', start + 2) < 0) {
            inBlock = true;
            body = (
              <>
                <Fragmented text={line.slice(0, start)} dark={dark} />
                <Text style={{ color: c.comment, fontStyle: 'italic' }}>{line.slice(start)}</Text>
              </>
            );
          } else {
            body = <Fragmented text={line} dark={dark} />;
          }
        }
        return (
          <Text
            key={idx}
            numberOfLines={1}
            style={{ fontFamily: FONT.mono.r, fontSize: fs, lineHeight, color: c.plain, includeFontPadding: false }}
          >
            {body}
          </Text>
        );
      })}
    </View>
  );
}

export const KotlinLines = React.memo(KotlinLinesView);
