/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { AppTheme, LessonMeta } from '../types';
import { CODEDO_MASTER_WORLDS } from '../data/curriculum/masterCurriculumCatalog';
import { FiveStageLesson } from '../data/lessonStagesData';
import { PRACTICE_WRITE_RUN_BANK, PRACTICE_DEBUG_BANK, PRACTICE_BANK_SYNTHETIC_LESSONS } from '../data/practiceBank';
import { StorageManager, PracticeProblemMode, PracticeProblemStatus } from '../utils/storage';
import { soundFX } from '../utils/audio';
import { accentForWorld } from '../utils/worldAccents';
import { renderKotlinCodeLines } from '../utils/codeHighlighter';
import { extractGivenLines } from './WriteRun';

interface TaskListScreenProps {
  theme: AppTheme;
  worldId: string;
  mode: PracticeProblemMode;
  onBack: () => void;
  onOpenLesson: (lessonKey: string, mode: PracticeProblemMode) => void;
  onToggleTheme?: () => void;
}

interface ProblemEntry {
  lesson: LessonMeta;
  five: FiveStageLesson;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  status: PracticeProblemStatus;
}

// Difficulty uses editor syntax tones: gold for medium, orange for hard (easy is kept for completeness). Picked with the app's own
// theme flag, because Tailwind's dark variant does not follow the in-app theme switch.
const difficultyStyle = (difficulty: 'easy' | 'medium' | 'hard', isDark: boolean): string =>
  ({
    easy: isDark ? 'text-[#98c379] border-[#98c379]/50' : 'text-[#4a7a28] border-[#98c379]/70',
    medium: isDark ? 'text-[#e5c07b] border-[#e5c07b]/50' : 'text-[#936a14] border-[#c79a2e]/70',
    hard: isDark ? 'text-[#ce9178] border-[#ce9178]/50' : 'text-[#a8502f] border-[#ce9178]/80',
  })[difficulty];

// Debug's `subtitle` is authored as one run-on paragraph with no "\n\n"
// breaks (see PITFALLS.md's "Learn's subtitle/explanation/keyTakeaway..."
// entry -- that's the data-level version of this same problem), so break
// onto a new line after each completed sentence there. Write & Run's own
// `description` already follows the numbered-steps authoring standard with
// real "\n\n" breaks -- including "1. ...", "2. ..." markers whose trailing
// "N." would otherwise look like a sentence end to this same regex and get
// wrongly split from its own step text. Any text that already has a real
// line break is trusted as-is and left untouched.
const breakAfterSentences = (text: string): string =>
  text.includes('\n') ? text : text.replace(/([.!?])\s+(?=[A-Z(])/g, '$1\n\n');

export const TaskListScreen: React.FC<TaskListScreenProps> = ({
  theme,
  worldId,
  mode,
  onBack,
  onOpenLesson,
  onToggleTheme,
}) => {
  const isDark = theme === 'dark';
  const world = CODEDO_MASTER_WORLDS.find((w) => w.id === worldId);
  const [activeMode, setActiveMode] = useState<PracticeProblemMode>(mode);
  // The task whose details are open right on its card (one at a time).
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const helpLevel = StorageManager.getPracticeHelpLevel() ?? 'beginner';

  useEffect(() => {
    setActiveMode(mode);
  }, [mode]);
  useEffect(() => {
    setExpandedId(null);
  }, [activeMode]);

  // The Practice tab shows ONLY practiceBank problems -- never a lesson's
  // own writeRun/debug task (that's already solved once during Learn, and
  // showing it again here would just be re-solving the same exact problem
  // rather than genuinely practicing). See src/data/practiceBank/.
  const problems: ProblemEntry[] = [];
  if (activeMode === 'writeRun') {
    (PRACTICE_WRITE_RUN_BANK[worldId] ?? []).forEach((problem) => {
      const five = PRACTICE_BANK_SYNTHETIC_LESSONS[problem.id];
      if (!five?.writeRun) return;
      problems.push({
        lesson: {
          id: problem.id,
          title: problem.title,
          worldId,
          skill: 'practice',
          durationMinutes: 10,
          xpReward: problem.xpReward,
          description: problem.description,
          questionsCount: 0,
          fiveStageLessonKey: problem.id,
        },
        five,
        title: five.writeRun.title,
        description: problem.summary ?? problem.description,
        difficulty: problem.difficulty,
        status: StorageManager.getPracticeProblemStatus(five.id, 'writeRun'),
      });
    });
  } else {
    (PRACTICE_DEBUG_BANK[worldId] ?? []).forEach((problem) => {
      const five = PRACTICE_BANK_SYNTHETIC_LESSONS[problem.id];
      if (!five?.debug) return;
      problems.push({
        lesson: {
          id: problem.id,
          title: problem.title,
          worldId,
          skill: 'practice',
          durationMinutes: 10,
          xpReward: 15,
          description: problem.subtitle,
          questionsCount: 0,
          fiveStageLessonKey: problem.id,
        },
        five,
        title: five.debug.title,
        description: problem.summary ?? five.debug.subtitle,
        difficulty: five.debug.difficulty,
        status: StorageManager.getPracticeProblemStatus(five.id, 'debug'),
      });
    });
  }

  const totalCount = problems.length;
  const completedCount = problems.filter((p) => p.status === 'completed').length;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const modeLabel = activeMode === 'writeRun' ? 'Write & Run' : 'Debug';
  const modeIcon = activeMode === 'writeRun' ? 'code' : 'bug_report';
  const blue = isDark ? 'text-[#569cd6]' : 'text-[#1f6fb5]';
  const orange = isDark ? 'text-[#ce9178]' : 'text-[#a8502f]';
  const modeColor = activeMode === 'writeRun' ? blue : orange;
  const expandedBorder = activeMode === 'writeRun' ? (isDark ? '!border-t-[#569cd6]/25 !border-r-[#569cd6]/25 !border-b-[#569cd6]/25' : '!border-t-[#1f6fb5]/25 !border-r-[#1f6fb5]/25 !border-b-[#1f6fb5]/25') : (isDark ? '!border-t-[#ce9178]/25 !border-r-[#ce9178]/25 !border-b-[#ce9178]/25' : '!border-t-[#a8502f]/25 !border-r-[#a8502f]/25 !border-b-[#a8502f]/25');
  const modeStripe = activeMode === 'writeRun' ? 'border-l-[#569cd6]' : 'border-l-[#ce9178]';
  const modeBorder = activeMode === 'writeRun' ? (isDark ? 'border-[#569cd6]/50 bg-[#569cd6]/10' : 'border-[#1f6fb5]/40 bg-[#1f6fb5]/10') : (isDark ? 'border-[#ce9178]/50 bg-[#ce9178]/10' : 'border-[#a8502f]/40 bg-[#a8502f]/10');
  const accent = accentForWorld(world?.order ?? 1);
  const accentText = isDark ? accent.textDark : accent.text;
  const title = isDark ? 'text-slate-100' : 'text-[#2e3040]';
  const muted = isDark ? 'text-slate-400' : 'text-slate-500';
  const pageBg = isDark ? 'bg-[#0b0f19]' : 'bg-[#e8eaf0]';
  const panel = isDark ? 'bg-[#0f1420] border-white/10 shadow-md shadow-black/30' : 'bg-[#f6f7fa] border-slate-300/70 shadow-sm';

  const sectionLabel = `font-mono text-[10px] font-bold tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-500'}`;

  // The task's details, opened in place on its card: the goal, what you start with and the expected output (Debug: the bug description and the
  // expected output). The steps are deliberately NOT shown here: they belong to the task screen, so the list stays a list.
  const renderDetails = (problem: ProblemEntry) => {
    const writeRun = activeMode === 'writeRun' ? problem.five.writeRun : undefined;
    const debug = activeMode === 'debug' ? problem.five.debug : undefined;
    const expectedOutput = writeRun?.expectedOutput ?? debug?.expectedOutput ?? '';
    const given = writeRun ? extractGivenLines(writeRun.initialCode) : [];
    return (
      <div
        className={`mt-1 pt-3 border-t border-dashed flex flex-col gap-3 cursor-default ${isDark ? 'border-white/15' : 'border-slate-300'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {writeRun?.goal && (
          <div>
            <span className={sectionLabel}>{'// goal'}</span>
            <p className={`text-[13px] leading-relaxed mt-1 font-['Plus_Jakarta_Sans'] ${isDark ? 'text-[#dbe1ee]' : 'text-[#2e3345]'}`}>{writeRun.goal}</p>
          </div>
        )}
        {debug && (
          <div>
            <span className={sectionLabel}>{'// the bug'}</span>
            <p className={`text-[13px] leading-relaxed mt-1 font-['Plus_Jakarta_Sans'] ${isDark ? 'text-[#dbe1ee]' : 'text-[#2e3345]'}`}>{debug.subtitle}</p>
          </div>
        )}
        {given.length > 0 && (
          <div>
            <span className={sectionLabel}>{'// you start with'}</span>
            <div className="mt-1 rounded-lg border border-slate-800 bg-[#0a0e17] px-3 py-2 text-xs font-mono overflow-x-auto">
              {renderKotlinCodeLines(given, { isDark: true }).map((node, idx) => (
                <div key={idx} className="whitespace-pre">{node}</div>
              ))}
            </div>
          </div>
        )}
        {writeRun && (
          <p className={`font-mono text-[11px] ${muted}`}>
            {helpLevel === 'beginner' ? '// the full steps are shown when you open the task' : '// the steps appear as hints while you code'}
          </p>
        )}
        {expectedOutput && (
          <div className="rounded-lg border border-slate-800 bg-[#0a0e17] overflow-hidden text-xs font-mono">
            <div className="flex items-center gap-1.5 px-3 py-1.5 border-b border-slate-800">
              <span className="w-2 h-2 rounded-full bg-rose-500/70" />
              <span className="w-2 h-2 rounded-full bg-amber-500/70" />
              <span className="w-2 h-2 rounded-full bg-emerald-500/70" />
              <span className="ml-2 text-[10px] font-bold tracking-wider text-slate-500">expected_output</span>
            </div>
            <div className="p-3 leading-snug break-words whitespace-pre-line text-emerald-400 font-bold">{expectedOutput}</div>
          </div>
        )}
      </div>
    );
  };

  const handleOpenProblem = (problem: ProblemEntry) => {
    soundFX.playClick();
    if (problem.status === 'not_started') {
      StorageManager.setPracticeProblemStatus(problem.five.id, activeMode, 'in_progress');
    }
    onOpenLesson(problem.lesson.fiveStageLessonKey!, activeMode);
  };

  return (
    <div className={`min-h-screen w-full transition-colors duration-300 ${pageBg} ${isDark ? 'text-[#dfe2f1]' : 'text-[#2e3040]'}`}>
      {/* Header -- sticky within the app's single #root scroll container
          (not its own nested overflow-y-auto div), so this screen's scroll
          position is captured/restored the same way every other tab screen's
          is (see App.tsx's pushRoute/scrollTop handling). */}
      <header
        className={`sticky top-0 h-14 px-4 border-b flex items-center gap-3 z-30 backdrop-blur-xl transition-colors ${
          isDark ? 'bg-[#0b0f19]/90 border-white/10' : 'bg-[#e8eaf0]/90 border-slate-300/70'
        }`}
      >
        <button
          type="button"
          onClick={() => {
            soundFX.playClick();
            onBack();
          }}
          className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-all active:scale-95 border ${
            isDark ? 'bg-[#0f1420] text-slate-200 border-white/10' : 'bg-[#f6f7fa] text-slate-700 border-slate-300/70'
          }`}
          aria-label="Back"
        >
          <span className="material-symbols-outlined !text-[20px]">arrow_back</span>
        </button>
        <div className="flex-1 flex items-center gap-2 min-w-0">
          <span className={`material-symbols-outlined !text-[16px] shrink-0 ${modeColor}`}>{modeIcon}</span>
          <div className="flex flex-col min-w-0">
            <h1 className={`text-sm font-bold truncate leading-tight tracking-tight font-['Outfit'] ${title}`}>
              {world?.title ?? 'Practice'}
            </h1>
            <span className={`font-mono text-[10px] leading-none mt-1 truncate ${muted}`}>
              <span className={`font-bold ${accentText}`}>WORLD_{String(world?.order ?? 0).padStart(2, '0')}</span>
              {' / '}
              {modeLabel}
            </span>
          </div>
        </div>
        {onToggleTheme && (
          <button
            type="button"
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            onClick={() => {
              soundFX.playClick();
              onToggleTheme();
            }}
            className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-all active:scale-95 border ${
              isDark ? 'bg-[#0f1420] text-amber-400 border-white/10' : 'bg-[#f6f7fa] text-slate-600 border-slate-300/70'
            }`}
          >
            <span className="material-symbols-outlined !text-[18px]">{isDark ? 'light_mode' : 'dark_mode'}</span>
          </button>
        )}
      </header>

      <div className={`sticky top-14 z-20 px-4 pt-2.5 pb-1 ${pageBg}`}>
        {/* One recessed track (with its own visible outer border) and a single borderless chip for the selected tab, so there are no doubled edges. */}
        <div
          className={`mx-auto flex w-full max-w-md rounded-xl border p-1 gap-1 ${isDark ? 'bg-black/40 border-white/20 shadow-[inset_0_1px_3px_rgba(0,0,0,0.6)]' : 'bg-slate-300/45 border-slate-400/50 shadow-[inset_0_1px_2px_rgba(15,23,42,0.12)]'}`}
          role="tablist"
          aria-label="Practice task type"
        >
          {([
            ['writeRun', 'code', 'Write & Run'],
            ['debug', 'bug_report', 'Debug'],
          ] as const).map(([tabMode, icon, label]) => {
            const selected = activeMode === tabMode;
            return (
              <button
                key={tabMode}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => {
                  if (!selected) soundFX.playClick();
                  setActiveMode(tabMode);
                }}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-[13px] font-semibold transition-all outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-inset ${
                  isDark ? 'focus-visible:ring-white/25' : 'focus-visible:ring-slate-500/40'
                } ${
                  selected
                    ? 'bg-[#6366f1] text-white shadow-[0_2px_8px_rgba(99,102,241,0.45)]'
                    : `${muted} ${isDark ? 'hover:text-slate-200' : 'hover:text-slate-700'}`
                }`}
              >
                <span className="material-symbols-outlined !text-[19px]">{icon}</span>
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="w-full max-w-md mx-auto pb-8">
        {/* Practice Progress */}
        <div className="px-4 pt-2 pb-2 flex flex-col gap-2.5">
          <div className={`p-3.5 rounded-xl border border-l-[3px] ${accent.stripe} transition-all ${panel}`}>
            <div className="flex items-center justify-between font-mono text-[11px] mb-2">
              <span className={muted}>
                completed = <span className={`font-bold ${title}`}>{completedCount} / {totalCount}</span>
              </span>
              <span className={`font-bold ${accentText}`}>{progressPct}%</span>
            </div>
            <div className={`w-full h-1 rounded-full overflow-hidden ${isDark ? 'bg-white/10' : 'bg-slate-300/70'}`}>
              <div className={`h-full rounded-full ${accent.bar}`} style={{ width: `${progressPct}%` }} />
            </div>
          </div>
        </div>

        {/* Problems List */}
        <div className="px-4 mt-2">
          {totalCount === 0 ? (
            <div className={`p-4 rounded-xl border text-center ${panel} ${muted}`}>
              <p className="font-mono text-xs">{'// no problems available for this World yet'}</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {problems.map((problem, idx) => {
                const completed = problem.status === 'completed';
                const inProgress = problem.status === 'in_progress';
                const expanded = expandedId === problem.five.id;
                const actionLabel = completed ? 'practice_again()' : inProgress ? 'continue()' : 'start()';
                // The left stripe shows the task's state: green done, the mode's colour (blue Write & Run, orange Debug) in progress, grey not started.
                const stripe = completed ? 'border-l-[#98c379]' : inProgress ? modeStripe : isDark ? 'border-l-slate-600' : 'border-l-slate-400';

                return (
                  <article
                    key={problem.five.id}
                    onClick={() => {
                      soundFX.playClick();
                      setExpandedId(expanded ? null : problem.five.id);
                    }}
                    role="button"
                    tabIndex={0}
                    aria-expanded={expanded}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        soundFX.playClick();
                        setExpandedId(expanded ? null : problem.five.id);
                      }
                    }}
                    className={`p-3.5 rounded-xl border border-l-[3px] ${stripe} flex flex-col gap-2 transition-all active:scale-[0.99] cursor-pointer outline-none focus:outline-none focus-visible:outline-none ${expanded ? expandedBorder : ''} ${panel}`}
                  >
                    <div className="flex flex-col min-w-0 w-full gap-1.5">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className={`font-mono text-xs font-bold shrink-0 ${modeColor}`}>{String(idx + 1).padStart(2, '0')}</span>
                        <h4 className={`text-[15px] font-semibold leading-snug tracking-tight min-w-0 flex-1 font-['Outfit'] ${title}`}>{problem.title}</h4>
                        {completed && <span className={`material-symbols-outlined !text-[15px] shrink-0 ${isDark ? 'text-[#98c379]' : 'text-[#4a7a28]'}`}>check</span>}
                        <span className={`material-symbols-outlined !text-[18px] shrink-0 ${muted}`} aria-hidden="true">{expanded ? 'expand_less' : 'expand_more'}</span>
                      </div>
                      <p className={`text-[13px] font-normal leading-relaxed whitespace-pre-line text-left pt-0.5 pb-1 font-['Plus_Jakarta_Sans'] ${isDark ? 'text-[#c4cbda]' : 'text-[#3f4558]'}`}>
                        {breakAfterSentences(problem.description)}
                      </p>
                      {expanded && renderDetails(problem)}
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border shrink-0 ${difficultyStyle(problem.difficulty, isDark)}`}>
                          {problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1)}
                        </span>
                        {completed && <span className={`text-[10px] font-medium truncate ${muted}`}>Completed</span>}
                        {inProgress && <span className={`text-[10px] font-semibold truncate ${modeColor}`}>In progress</span>}
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenProblem(problem);
                        }}
                        className={`flex-shrink-0 px-3 py-1.5 rounded-lg font-mono text-[11px] font-bold flex items-center gap-1 active:scale-95 transition-all border ${
                          inProgress
                            ? `${modeColor} ${modeBorder}`
                            : completed
                            ? `${muted} ${isDark ? 'border-white/10' : 'border-slate-300'}`
                            : `${accentText} ${isDark ? 'border-white/15' : 'border-slate-300'}`
                        }`}
                      >
                        <span>{actionLabel}</span>
                        <span className="material-symbols-outlined !text-[12px]">chevron_right</span>
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
