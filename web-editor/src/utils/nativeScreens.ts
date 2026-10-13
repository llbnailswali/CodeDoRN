import { Capacitor, registerPlugin } from '@capacitor/core';

declare global {
  interface Window {
    webkit?: {
      messageHandlers?: {
        NativeScreens?: { postMessage: (message: Record<string, unknown>) => void };
      };
    };
    __CODEDO_STAGE_LAUNCH__?: NativeStageLaunch;
  }
}

/** Native (Jetpack Compose) screens, provided by the Android app's `NativeScreensPlugin`. Only available inside the Android app. */
interface NativeScreensPlugin {
  /** The Home screen in Jetpack Compose. */
  openHome(): Promise<void>;
  /** The Home screen in React Native. */
  openReactHome(): Promise<void>;
  /** Set only inside the activity the React Native lesson screen opens for a web stage; empty in the normal app. */
  getStageLaunch(): Promise<{ lessonKey?: string; stage?: string; dark?: boolean; practice?: boolean; tryIt?: boolean; prefillCode?: string }>;
  /** Closes that activity and returns `action` to React Native. */
  closeStage(options: { action: 'continue' | 'back' }): Promise<void>;
  /** Tells the activity the stage has rendered, so it can remove its loading overlay. */
  stageReady(): Promise<void>;
  /** Recolors the activity's system bars and window for a theme. */
  setStageTheme(options: { dark: boolean }): Promise<void>;
  /** The system clipboard's text (empty when there is none). */
  readClipboard(): Promise<{ value: string }>;
  writeClipboard(options: { value: string }): Promise<void>;
}

const NativeScreens = registerPlugin<NativeScreensPlugin>('NativeScreens');

export const nativeScreensAvailable = (): boolean => ['android', 'ios'].includes(Capacitor.getPlatform());

const iosMessage = (method: string, payload: Record<string, unknown> = {}) => {
  window.webkit?.messageHandlers?.NativeScreens?.postMessage({ method, ...payload });
};

const decodeUtf8Base64 = (value: string | null): string | undefined => {
  if (!value) return undefined;
  try {
    const bytes = Uint8Array.from(atob(value), character => character.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  } catch {
    return undefined;
  }
};

export const openNativeHome = (): Promise<void> => NativeScreens.openHome();

export const openReactNativeHome = (): Promise<void> => NativeScreens.openReactHome();

export interface NativeStageLaunch {
  lessonKey: string;
  stage: 'writeRun' | 'debug';
  dark: boolean;
  practice: boolean;
  tryIt: boolean;
  prefillCode?: string;
}

const injectedIosLaunch = (): NativeStageLaunch | undefined => {
  if (typeof window === 'undefined') return undefined;
  return window.__CODEDO_STAGE_LAUNCH__;
};

/** The stage the React Native lesson screen asked this web view to show, or null in the normal app. */
export const getNativeStageLaunch = async (): Promise<NativeStageLaunch | null> => {
  const injectedLaunch = injectedIosLaunch();
  const iosStage = typeof window !== 'undefined' && !!window.webkit?.messageHandlers?.NativeScreens && (injectedLaunch !== undefined || new URLSearchParams(window.location.search).has('stageLessonKey'));
  if (!nativeScreensAvailable() && !iosStage) return null;
  if (Capacitor.getPlatform() === 'ios' || iosStage) {
    if (injectedLaunch?.lessonKey && (injectedLaunch.stage === 'writeRun' || injectedLaunch.stage === 'debug')) {
      return injectedLaunch;
    }
    const params = new URLSearchParams(window.location.search);
    const lessonKey = params.get('stageLessonKey');
    const stage = params.get('stage');
    if (lessonKey && (stage === 'writeRun' || stage === 'debug')) return { lessonKey, stage, dark: params.get('dark') !== 'false', practice: params.get('practice') === 'true', tryIt: params.get('tryIt') === 'true', prefillCode: decodeUtf8Base64(params.get('prefillCodeBase64')) ?? params.get('prefillCode') ?? undefined };
    return null;
  }
  try {
    const r = await NativeScreens.getStageLaunch();
    if (r.lessonKey && (r.stage === 'writeRun' || r.stage === 'debug')) {
      return { lessonKey: r.lessonKey, stage: r.stage, dark: r.dark !== false, practice: r.practice === true, tryIt: r.tryIt === true, prefillCode: r.prefillCode };
    }
  } catch {
    // an older app build without the method: behave as the normal app
  }
  return null;
};

export const closeNativeStage = (action: 'continue' | 'back'): Promise<void> => {
  if (Capacitor.getPlatform() === 'ios' || (typeof window !== 'undefined' && !!window.webkit?.messageHandlers?.NativeScreens)) { iosMessage('closeStage', { action }); return Promise.resolve(); }
  return NativeScreens.closeStage({ action });
};

/** The stage has rendered and settled: the native loading overlay can go. A no-op (not an error) in an older app build without it. */
export const notifyStageReady = (): Promise<void> => { if (Capacitor.getPlatform() === 'ios') return Promise.resolve(); return NativeScreens.stageReady().catch(() => {}); };

/** Colors the system bars for the stage's theme (they are also set natively from the launch theme, before the page loads). */
export const setNativeStageTheme = (dark: boolean): Promise<void> => { if (Capacitor.getPlatform() === 'ios') { iosMessage('setStageTheme', { dark }); return Promise.resolve(); } return NativeScreens.setStageTheme({ dark }).catch(() => {}); };

/** Reads the clipboard through the app. Throws outside the Android app or in an older build without the method. */
export const readNativeClipboard = async (): Promise<string> => (await NativeScreens.readClipboard()).value ?? '';

export const writeNativeClipboard = (value: string): Promise<void> => NativeScreens.writeClipboard({ value });
