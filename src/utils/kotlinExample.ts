/**
 * Turns an Explore snippet into a runnable Kotlin source file.
 * Existing entry points are preserved. Package/import directives must remain
 * at file scope, so only the remaining snippet body is placed inside main().
 */
export function makeKotlinExampleRunnable(lines: string[]): string {
  const source = lines.join('\n').replace(/\r\n?/g, '\n').trimEnd();
  if (/\bfun\s+main\s*\(/.test(source)) return source;

  const sourceLines = source.split('\n');
  const header: string[] = [];
  const body: string[] = [];
  let readingHeader = true;

  for (const line of sourceLines) {
    const trimmed = line.trim();
    const isDirective = /^(package|import)\s+/.test(trimmed);
    const isHeaderSpacing = readingHeader && trimmed === '';
    if (readingHeader && (isDirective || isHeaderSpacing)) {
      header.push(line);
    } else {
      readingHeader = false;
      body.push(line);
    }
  }

  while (header.length > 0 && header[header.length - 1].trim() === '') header.pop();
  while (body.length > 0 && body[0].trim() === '') body.shift();
  while (body.length > 0 && body[body.length - 1].trim() === '') body.pop();

  const wrapped = [
    'fun main() {',
    ...(body.length > 0 ? body.map((line) => line === '' ? '' : `  ${line}`) : []),
    '}',
  ];
  return [...header, ...(header.length > 0 ? [''] : []), ...wrapped].join('\n');
}
