/**
 * Renders every lesson "How it works" visual (src/LessonVisual.tsx) with react-test-renderer, with react-native and
 * react-native-svg replaced by plain stand-ins, and checks: it renders in both themes at a narrow and a wide phone width, every
 * coordinate it draws is a finite number, and nothing is drawn outside the card width.
 *   npm run test:lesson-visual   (from web-editor/)
 * (Jest cannot run here: the react-native preset package for 0.87 is not installed.)
 */
import Module, { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const React = require('react');

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
const host = (name: string) => (props: any) => React.createElement(name, props, props.children);
const stubs: Record<string, any> = {
  'react-native': {
    View: host('View'), Text: host('Text'), StyleSheet: { create: (s: any) => s, absoluteFill: { position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 } },
    PixelRatio: { getFontScale: () => 1, get: () => 1, roundToNearestPixel: (n: number) => n }, Platform: { OS: 'android', select: (o: any) => o.android ?? o.default },
    Dimensions: { get: () => ({ width: 360, height: 800, scale: 1, fontScale: 1 }) }, useWindowDimensions: () => ({ width: 360, height: 800 }),
  },
  'react-native-svg': { __esModule: true, default: host('Svg'), Svg: host('Svg'), Path: host('Path'), Polygon: host('Polygon'), Circle: host('Circle') },
};
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const origLoad = (Module as any)._load;
(Module as any)._load = function (request: string, parent: any, isMain: boolean) {
  if (stubs[request]) return stubs[request];
  if (request === './shell') return { BW: 1, MAIN: 1, fz: (n: number) => n };
  if (request === './parts') return { lh: (size: number, ratio: number) => size * ratio };
  if (request === './theme') return { FONT: { outfit: { sb: 'o', b: 'ob' }, mono: { md: 'm', b: 'mb', r: 'mr' }, body: 'b' } };
  return origLoad.call(this, request, parent, isMain);
};

// ---- optional HTML preview: `npm run test:lesson-visual -- --html /tmp/visuals.html [lessonId ...]` ----
const LENGTH_PROPS = new Set(['width', 'height', 'minHeight', 'minWidth', 'maxWidth', 'left', 'right', 'top', 'bottom', 'margin', 'marginTop', 'marginBottom', 'marginLeft', 'marginRight', 'marginHorizontal', 'marginVertical',
  'padding', 'paddingTop', 'paddingBottom', 'paddingLeft', 'paddingRight', 'paddingHorizontal', 'paddingVertical', 'borderRadius', 'borderWidth', 'gap', 'fontSize', 'lineHeight', 'letterSpacing']);
const flat = (st: any): any => (Array.isArray(st) ? Object.assign({}, ...st.map(flat)) : st ?? {});
const css = (st: any) => {
  const o = flat(st);
  const out: string[] = [];
  for (const [k, v] of Object.entries(o)) {
    if (v === undefined || v === null) continue;
    const name = k.replace(/[A-Z]/g, (c) => '-' + c.toLowerCase());
    if (k === 'marginHorizontal') { out.push(`margin-left:${v}px;margin-right:${v}px`); continue; }
    if (k === 'marginVertical') { out.push(`margin-top:${v}px;margin-bottom:${v}px`); continue; }
    if (k === 'paddingHorizontal') { out.push(`padding-left:${v}px;padding-right:${v}px`); continue; }
    if (k === 'paddingVertical') { out.push(`padding-top:${v}px;padding-bottom:${v}px`); continue; }
    if (k === 'includeFontPadding' || k === 'elevation') continue;
    if (k === 'fontFamily') { out.push(String(v).startsWith('m') ? 'font-family:ui-monospace,Menlo,monospace' : 'font-family:-apple-system,Helvetica,Arial,sans-serif;font-weight:600'); continue; }
    out.push(`${name}:${typeof v === 'number' && LENGTH_PROPS.has(k) ? v + 'px' : v}`);
  }
  return out.join(';');
};
const attr = (v: any) => String(v).replace(/"/g, '&quot;');
function toHtml(node: any): string {
  if (node === null || node === undefined) return '';
  if (typeof node === 'string') return node.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/\n/g, '<br>');
  if (Array.isArray(node)) return node.map(toHtml).join('');
  const kids = (node.children ?? []).map(toHtml).join('');
  const p = node.props ?? {};
  switch (node.type) {
    case 'View':
      return `<div style="display:flex;flex-direction:column;position:relative;box-sizing:border-box;min-width:0;flex-shrink:0;${css(p.style)}${flat(p.style).borderWidth ? ';border-style:solid' : ''}">${kids}</div>`;
    case 'Text':
      return `<div style="box-sizing:border-box;${css(p.style)}">${kids}</div>`;
    case 'Svg':
      return `<svg width="${p.width}" height="${p.height}" viewBox="${p.viewBox ?? `0 0 ${p.width} ${p.height}`}" style="flex-shrink:0;display:block;${css(p.style)}">${kids}</svg>`;
    case 'Path':
      return `<path d="${attr(p.d)}" stroke="${attr(p.stroke ?? 'none')}" stroke-width="${p.strokeWidth ?? 1}" fill="${attr(p.fill ?? 'none')}" stroke-linejoin="${p.strokeLinejoin ?? 'miter'}"${p.strokeDasharray ? ` stroke-dasharray="${p.strokeDasharray}"` : ''}/>`;
    case 'Polygon':
      return `<polygon points="${attr(p.points)}" fill="${attr(p.fill ?? 'none')}" stroke="${attr(p.stroke ?? 'none')}" stroke-width="${p.strokeWidth ?? 1}" stroke-linejoin="${p.strokeLinejoin ?? 'miter'}"/>`;
    case 'Circle':
      return `<circle cx="${p.cx}" cy="${p.cy}" r="${p.r}" fill="${attr(p.fill ?? 'none')}"/>`;
    default:
      return kids;
  }
}

async function main() {
  const TestRenderer = require('react-test-renderer');
  const { LessonVisual } = require(path.join(root, 'src/LessonVisual.tsx'));
  const { LESSONS } = require(path.join(root, 'src/lessonData.ts'));
  // Test every selectable variant, not just the default shown in a lesson.
  const withVisual = (Object.values(LESSONS) as any[]).flatMap((lesson) => {
    const variants = lesson.learn.visualVariants as Record<string, unknown> | undefined;
    if (!variants) return lesson.learn.visual ? [lesson] : [];
    return Object.entries(variants).map(([author, visual]) => ({
      ...lesson,
      id: `${lesson.id}/${author}`,
      learn: { ...lesson.learn, visual },
    }));
  });
  if (withVisual.length === 0) throw new Error('no lesson has a visual');
  let checks = 0;
  const numbersIn = (s: string) => (s.match(/-?\d+(\.\d+)?/g) ?? []).map(Number);
  for (const lesson of withVisual) {
    for (const dark of [false, true]) {
      for (const width of [280, 340]) {
        let tree!: any;
        TestRenderer.act(() => { tree = TestRenderer.create(React.createElement(LessonVisual, { visual: lesson.learn.visual, dark })); });
        // The card hands its inner width to the blocks once its inner View is measured; then blocks that measure themselves get sizes.
        TestRenderer.act(() => { tree.root.findAll((n: any) => typeof n.props.onLayout === 'function')[0].props.onLayout({ nativeEvent: { layout: { x: 0, y: 0, width, height: 700 } } }); });
        TestRenderer.act(() => {
          for (const n of tree.root.findAll((x: any) => typeof x.props.onLayout === 'function' && x.type === 'View')) {
            n.props.onLayout({ nativeEvent: { layout: { x: 0, y: 130, width: width - 26, height: 80 } } });
          }
        });
        const strings: string[] = [];
        const walk = (node: any) => {
          if (!node) return;
          if (Array.isArray(node)) return node.forEach(walk);
          for (const k of ['d', 'points']) if (typeof node.props?.[k] === 'string') strings.push(node.props[k]);
          for (const k of ['width', 'height', 'left', 'top']) if (typeof node.props?.[k] === 'number' && !Number.isFinite(node.props[k])) throw new Error(`${lesson.id}: ${k} is not finite`);
          (node.children ?? []).forEach(walk);
        };
        walk(tree.toJSON());
        if (strings.length === 0) throw new Error(`${lesson.id}: drew no lines`);
        for (const s of strings) {
          if (/NaN|undefined|Infinity/.test(s)) throw new Error(`${lesson.id} (${width}px): bad coordinate in "${s}"`);
          if (/[SsCcAaTtz]/.test(s)) { checks++; continue; }
          if (/^[\d\s.,-]+$/.test(s)) {
            // "x,y x,y ..." points of a polygon
            const nums = numbersIn(s);
            for (let i = 0; i < nums.length; i += 2) if (nums[i] < -1 || nums[i] > width + 1) throw new Error(`${lesson.id} (${width}px): polygon point x=${nums[i]} is outside the card`);
          } else {
            // absolute M / H / V / Q commands: check every x that the path reaches
            let x = 0;
            for (const m of s.matchAll(/([MHVQ])\s*(-?[\d.]+)(?:[ ,]+(-?[\d.]+))?(?:[ ,]+(-?[\d.]+))?(?:[ ,]+(-?[\d.]+))?/g)) {
              const xs = m[1] === 'M' || m[1] === 'H' ? [Number(m[2])] : m[1] === 'Q' ? [Number(m[2]), Number(m[4])] : [];
              if (xs.length) x = xs[xs.length - 1];
              for (const v of xs) if (v < -1 || v > width + 1) throw new Error(`${lesson.id} (${width}px): path reaches x=${v}, outside the card: "${s}"`);
            }
          }
          checks++;
        }
        tree.unmount();
      }
    }
  }
  const htmlAt = process.argv.indexOf('--html');
  if (htmlAt !== -1) {
    const out = process.argv[htmlAt + 1];
    const ids = process.argv.slice(htmlAt + 2);
    const pick = withVisual.filter((l) => ids.length === 0 || ids.includes(l.id));
    const fs = require('node:fs');
    let body = '';
    for (const dark of [false, true]) {
      body += `<div style="width:50%;padding:12px;box-sizing:border-box;background:${dark ? '#0F131D' : '#F1F4F9'}">`;
      for (const lesson of pick) {
        let tree!: any;
        const W = 330;
        TestRenderer.act(() => { tree = TestRenderer.create(React.createElement(LessonVisual, { visual: lesson.learn.visual, dark })); });
        TestRenderer.act(() => { tree.root.findAll((n: any) => typeof n.props.onLayout === 'function')[0].props.onLayout({ nativeEvent: { layout: { x: 0, y: 0, width: W - 28, height: 700 } } }); });
        // A loop measures its body and the last step of the body. The browser preview cannot tell it, so feed typical sizes.
        const loop: any = (lesson.learn.visual.items ?? []).find((i: any) => i.kind === 'loop');
        if (loop) {
          TestRenderer.act(() => {
            const handlers = tree.root.findAll((n: any) => typeof n.props.onLayout === 'function' && n.type === 'View');
            const steps = loop.body.length;
            const stepH = 50;
            const bodyH = steps * stepH + (steps - 1) * 16;
            // handlers[1] is the loop body column, handlers[2] its last step
            handlers[1]?.props.onLayout({ nativeEvent: { layout: { x: 0, y: 80 + 24, width: W - 28 - 26, height: bodyH } } });
            handlers[2]?.props.onLayout({ nativeEvent: { layout: { x: 0, y: (steps - 1) * (stepH + 16), width: W - 28 - 26, height: stepH } } });
          });
        }
        body += `<div style="color:${dark ? '#94A3B8' : '#475569'};font:600 11px sans-serif;margin:14px 0 4px">${lesson.id}</div><div style="width:${W}px">${toHtml(tree.toJSON())}</div>`;
        tree.unmount();
      }
      body += '</div>';
    }
    fs.writeFileSync(out, `<!doctype html><meta charset="utf-8"><body style="margin:0;display:flex;font-family:sans-serif">${body}</body>`);
    console.log('wrote', out);
  }
  console.log(`LessonVisual: ${withVisual.length} visuals, ${checks} drawn shapes checked, all finite.`);
}
main().catch((e) => { console.error(e); process.exit(1); });
