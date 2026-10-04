import { Capacitor, registerPlugin } from '@capacitor/core';

/** Native (Jetpack Compose) screens, provided by the Android app's `NativeScreensPlugin`. Only available inside the Android app. */
interface NativeScreensPlugin {
  /** The Home screen in Jetpack Compose. */
  openHome(): Promise<void>;
  /** The Home screen in React Native. */
  openReactHome(): Promise<void>;
  /** Set only inside the activity the React Native lesson screen opens for a web stage; empty in the normal app. */
  getStageLaunch(): Promise<{ lessonKey?: string; stage?: string; dark?: boolean; practice?: boolean }>;
  /** Closes that activity and returns `action` to React Native. */
  closeStage(options: { action: 'continue' | 'back' }): Promise<void>;
  /** Tells the activity the stage has rendered, so it can remove its loading overlay. */
  stageReady(): Promise<void>;
  /** Recolors the activity's system bars and window for a theme. */
  setStageTheme(options: { dark: boolean }): Promise<void>;
}

const NativeScreens = registerPlugin<NativeScreensPlugin>('NativeScreens');

export const nativeScreensAvailable = (): boolean => Capacitor.getPlatform() === 'android';

export const openNativeHome = (): Promise<void> => NativeScreens.openHome();

export const openReactNativeHome = (): Promise<void> => NativeScreens.openReactHome();

export interface NativeStageLaunch {
  lessonKey: string;
  stage: 'writeRun' | 'debug';
  dark: boolean;
  practice: boolean;
}

/** The stage the React Native lesson screen asked this web view to show, or null in the normal app. */
export const getNativeStageLaunch = async (): Promise<NativeStageLaunch | null> => {
  if (!nativeScreensAvailable()) return null;
  try {
    const r = await NativeScreens.getStageLaunch();
    if (r.lessonKey && (r.stage === 'writeRun' || r.stage === 'debug')) {
      return { lessonKey: r.lessonKey, stage: r.stage, dark: r.dark !== false, practice: r.practice === true };
    }
  } catch {
    // an older app build without the method: behave as the normal app
  }
  return null;
};

export const closeNativeStage = (action: 'continue' | 'back'): Promise<void> => NativeScreens.closeStage({ action });

/** The stage has rendered and settled: the native loading overlay can go. A no-op (not an error) in an older app build without it. */
export const notifyStageReady = (): Promise<void> => NativeScreens.stageReady().catch(() => {});

/** Colors the system bars for the stage's theme (they are also set natively from the launch theme, before the page loads). */
export const setNativeStageTheme = (dark: boolean): Promise<void> => NativeScreens.setStageTheme({ dark }).catch(() => {});
