import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

// React Native (Android) has no CSS box-shadow: no blur radius, no offset, no inset, no stacking. The web Home gets its depth from
// box-shadows (src/index.css: .neu-raised, .neu-pressed, .neu-nav, plus the band glows in Home.tsx), so they are rebuilt here.
// A Gaussian-blurred shadow is approximated by a stack of translucent shapes whose alphas follow the blur's falloff curve.

export interface ShadowSpec {
  dx?: number;
  dy?: number;
  /** CSS blur radius in px (sigma = blur / 2). */
  blur: number;
  /** 'r,g,b' */
  rgb: string;
  alpha: number;
}

const LAYERS = 16; // more layers = smoother steps in the stacked shadows

const erf = (x: number): number => {
  const sign = x < 0 ? -1 : 1;
  const ax = Math.abs(x);
  const t = 1 / (1 + 0.3275911 * ax);
  const y = 1 - (((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t) * Math.exp(-ax * ax);
  return sign * y;
};
/** Share of a blurred edge's shadow found `x` px outside it (1 deep inside, 0.5 on the edge, 0 far outside). */
const outside = (x: number, sigma: number) => 0.5 * (1 - erf(x / (sigma * Math.SQRT2)));

/** Alpha for each stacked layer so the composite reaches `targets[k]` after layer k (layers composite with normal blending). */
const layerAlphas = (targets: number[]): number[] => {
  let prev = 0;
  return targets.map((target) => {
    const a = 1 - (1 - target) / (1 - prev);
    prev = target;
    return Math.min(1, Math.max(0, a));
  });
};

/** Outer box-shadow(s) behind a box. Render as the FIRST child of a wrapper that is exactly the box's size. */
export function ShadowStack({ r, shadows }: { r: number; shadows: ShadowSpec[] }) {
  return (
    <>
      {shadows.map((sh, si) => {
        const sigma = Math.max(0.5, sh.blur / 2);
        const dx = sh.dx ?? 0;
        const dy = sh.dy ?? 0;
        // expansions from +blur/2 (faintest, outermost) down to -blur/2 (strongest, innermost)
        // from +blur (2 sigma out, where a Gaussian edge has all but faded: no visible rim) in to -blur/2
        const exts = Array.from({ length: LAYERS }, (_, k) => sh.blur - (k * 1.5 * sh.blur) / LAYERS);
        const targets = exts.map((e, k) => {
          const next = k + 1 < LAYERS ? exts[k + 1] : -sh.blur / 2;
          return sh.alpha * outside((e + next) / 2, sigma);
        });
        const alphas = layerAlphas(targets);
        return exts.map((e, k) => (
          <View
            key={`${si}-${k}`}
            pointerEvents="none"
            style={{
              position: 'absolute',
              left: dx - e,
              right: -dx - e,
              top: dy - e,
              bottom: -dy - e,
              borderRadius: Math.max(0, r + e),
              backgroundColor: `rgba(${sh.rgb},${alphas[k].toFixed(4)})`,
            }}
          />
        ));
      })}
    </>
  );
}

/**
 * The glow a full-width bar casts above and below itself (the web's `shadow-[0_4px_18px_...]` on the chapter bands), as a smooth
 * vertical gradient (no visible steps). Only the outside is drawn, because the web's box-shadow is never painted under the box
 * itself (the bands are translucent).
 */
export function EdgeGlow({ rgb, alpha, blur, offset }: { rgb: string; alpha: number; blur: number; offset: number }) {
  const sigma = Math.max(0.5, blur / 2);
  const STOPS = 24;
  const side = (dir: 'top' | 'bottom') => {
    const o = dir === 'bottom' ? offset : -offset; // how far the shadow's edge sits beyond this bar edge
    const ext = Math.max(0, o + blur); // out to 2 sigma, where the blur has nearly faded
    if (ext <= 0.5) return null;
    return (
      <Svg
        key={dir}
        pointerEvents="none"
        width="100%"
        height={ext}
        style={{ position: 'absolute', left: 0, right: 0, ...(dir === 'bottom' ? { top: '100%' } : { bottom: '100%' }) }}
      >
        <Defs>
          {/* the gradient runs away from the bar's edge: strongest at the edge, fading to nothing at `ext` */}
          <LinearGradient id={`glow-${dir}`} x1="0" y1={dir === 'bottom' ? '0' : '1'} x2="0" y2={dir === 'bottom' ? '1' : '0'}>
            {Array.from({ length: STOPS + 1 }, (_, i) => {
              const x = (ext * i) / STOPS;
              // the last stop is forced to 0 so the gradient never ends on a visible edge
              const op = i === STOPS ? 0 : alpha * outside(x - o, sigma);
              return <Stop key={i} offset={i / STOPS} stopColor={`rgb(${rgb})`} stopOpacity={op} />;
            })}
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill={`url(#glow-${dir})`} />
      </Svg>
    );
  };
  return (
    <>
      {side('bottom')}
      {side('top')}
    </>
  );
}

const roundedRect = (x: number, y: number, w: number, h: number, r: number): string => {
  const rr = Math.max(0, Math.min(r, w / 2, h / 2));
  return (
    `M${x + rr},${y} H${x + w - rr} A${rr},${rr} 0 0 1 ${x + w},${y + rr} V${y + h - rr} A${rr},${rr} 0 0 1 ${x + w - rr},${y + h} ` +
    `H${x + rr} A${rr},${rr} 0 0 1 ${x},${y + h - rr} V${y + rr} A${rr},${rr} 0 0 1 ${x + rr},${y} Z`
  );
};

/**
 * Inset box-shadow(s) (the web's `.neu-pressed`). Render as the first child of an element that has `overflow: 'hidden'` and the
 * same border radius `r`; it fills the element and draws the shadow inside.
 */
export function InsetShadow({ r, shadows }: { r: number; shadows: ShadowSpec[] }) {
  const [size, setSize] = React.useState<{ w: number; h: number } | null>(null);
  return (
    <View
      pointerEvents="none"
      style={StyleSheet.absoluteFill}
      onLayout={(e) => setSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}
    >
      {size && (
        <Svg width={size.w} height={size.h}>
          {shadows.map((sh, si) => {
            const sigma = Math.max(0.5, sh.blur / 2);
            const dx = sh.dx ?? 0;
            const dy = sh.dy ?? 0;
            // hole expansions from -blur/2 (largest shadow region, faintest) to +blur/2... see layerAlphas: processed in this order
            const holes = Array.from({ length: LAYERS }, (_, k) => -sh.blur + (k * 2 * sh.blur) / LAYERS);
            const targets = holes.map((h, k) => {
              const next = k + 1 < LAYERS ? holes[k + 1] : sh.blur;
              const mid = (h + next) / 2;
              return sh.alpha * (1 - outside(mid, sigma)); // shadow strength grows with distance outside the hole edge
            });
            const alphas = layerAlphas(targets);
            return holes.map((h, k) => {
              const hw = size.w + 2 * h;
              const hh = size.h + 2 * h;
              const frame = `M0,0 H${size.w} V${size.h} H0 Z`;
              const hole = hw > 0 && hh > 0 ? roundedRect(dx - h, dy - h, hw, hh, r + h) : '';
              return (
                <Path key={`${si}-${k}`} d={frame + hole} fillRule="evenodd" fill={`rgb(${sh.rgb})`} fillOpacity={alphas[k]} />
              );
            });
          })}
        </Svg>
      )}
    </View>
  );
}
