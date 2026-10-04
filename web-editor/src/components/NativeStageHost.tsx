import React, { useEffect, useRef, useState } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
import { Detail, DetailHandle } from './Detail';
import { AppTheme, FontSize } from '../types';
import { StorageManager } from '../utils/storage';
import { applyFontComboToDom, getSavedFontCombo } from '../utils/fontThemes';
import { closeNativeStage, notifyStageReady, setNativeStageTheme, NativeStageLaunch } from '../utils/nativeScreens';
import { setLessonSource } from '../utils/lessonSource';
import { setStageVisible } from '../utils/stageVisibility';
import { loadStageLessonSource } from '../data/stageLessonSource';


/**
 * What the Android `WebStageActivity` shows: one stage (Write & Run or Debug) of a lesson, opened by the React Native lesson screen.
 * Continuing from the stage or leaving it closes the activity and hands the result back to React Native, which owns every other stage.
 */
export const NativeStageHost: React.FC<{ launch: NativeStageLaunch }> = ({ launch }) => {
  const [theme, setTheme] = useState<AppTheme>(launch.dark ? 'dark' : 'light');
  const [fontSize] = useState<FontSize>(() => StorageManager.getFontSize());
  const detailRef = useRef<DetailHandle>(null);
  const firstTheme = useRef<boolean>(true);
  // Load only this lesson's World data (not every World's lessons) before showing the stage.
  const [ready, setReady] = useState<boolean>(false);

  useEffect(() => {
    let cancelled = false;
    loadStageLessonSource(launch.lessonKey)
      .then((source) => {
        if (cancelled) return;
        setLessonSource(source);
        setReady(true);
      })
      .catch(() => {
        // Could not load the lesson data: leave the stage so the learner is not stuck on a blank screen.
        if (!cancelled) void closeNativeStage('back');
      });
    return () => {
      cancelled = true;
    };
  }, [launch.lessonKey]);

  useEffect(() => {
    applyFontComboToDom(getSavedFontCombo());
  }, []);

  // Once the stage is on screen, give fonts and the first layout a moment to settle, then tell the activity to drop its loading overlay.
  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    const fontsReady = document.fonts?.ready ?? Promise.resolve();
    Promise.race([fontsReady, new Promise((resolve) => setTimeout(resolve, 1000))]).then(() => {
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          if (!cancelled) {
            setTimeout(() => {
              // The native overlay fades out over ~180 ms after this call; the stage counts as visible once it has gone.
              void notifyStageReady().then(() => setTimeout(() => setStageVisible(true), 200));
            }, 150);
          }
        }),
      );
    });
    return () => {
      cancelled = true;
    };
  }, [ready]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    // The activity already colored the system bars for the launch theme; this only follows a theme toggle made inside the stage.
    if (firstTheme.current) firstTheme.current = false;
    else void setNativeStageTheme(theme === 'dark');
  }, [theme]);

  // Android Back steps back inside the stage like the in-screen arrow does; the activity closes when there is nothing left to step back to.
  useEffect(() => {
    let remove: (() => void) | null = null;
    CapacitorApp.addListener('backButton', () => detailRef.current?.goBack())
      .then((h) => {
        remove = () => h.remove();
      })
      .catch(() => {});
    return () => remove?.();
  }, []);

  return (
    <div className={`min-h-full min-h-screen w-full flex flex-col relative ${theme === 'dark' ? 'bg-[#0b0f19] text-[#dfe2f1]' : 'bg-[#f8f9fb] text-[#191c1e]'}`}>
      <main className={`flex-1 w-full flex flex-col font-size-${fontSize}`}>
        {ready && (
        <Detail
          ref={detailRef}
          theme={theme}
          initialLessonKey={launch.lessonKey}
          initialStageKey={launch.stage}
          isPracticeMode={launch.practice}
          userStats={StorageManager.getUserStats()}
          onExit={() => void closeNativeStage('back')}
          onCompleteLesson={() => void closeNativeStage('continue')}
          onStageContinue={() => void closeNativeStage('continue')}
          onToggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
        />
        )}
      </main>
    </div>
  );
};
