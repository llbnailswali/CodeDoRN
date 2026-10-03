import React from 'react';
import { AppTheme, UserStats } from '../types';
import { CODEDO_MASTER_WORLDS, MasterWorldEntry } from '../data/curriculum/masterCurriculumCatalog';
import { PRACTICE_WRITE_RUN_BANK, PRACTICE_DEBUG_BANK, resolveLessonOrPracticeContent } from '../data/practiceBank';
import { LessonRepository } from '../data/dailyBattleQuestions';
import { StorageManager, PracticeProblemMode, PracticeHelpLevel } from '../utils/storage';
import { PracticeHelpSheet, PRACTICE_HELP_OPTIONS } from './PracticeHelpSheet';
import { pickRandomPracticeTask } from '../utils/randomPractice';
import { soundFX } from '../utils/audio';
import { accentForWorld } from '../utils/worldAccents';
import { DrillType } from './PracticeView';

interface PracticeTabProps {
  theme: AppTheme;
  userStats: UserStats;
  onStartDrill: (drillType?: DrillType) => void;
  onOpenWorldProblems: (worldId: string, mode: PracticeProblemMode) => void;
  onOpenLesson: (lessonKey: string, mode: PracticeProblemMode, isRandomPractice?: boolean) => void;
}

// Same "content is authored" check Listing.tsx uses -- a world only counts
// as practice-able once every one of its lessons has real five-stage data.
const hasCollectedWorldData = (world: MasterWorldEntry) =>
  world.lessons.length > 0 && world.lessons.every((l) => Boolean(l.fiveStageLessonKey));

export const PracticeTab: React.FC<PracticeTabProps> = ({
  theme,
  userStats,
  onStartDrill,
  onOpenWorldProblems,
  onOpenLesson,
}) => {
  const isDark = theme === 'dark';
  const [helpLevel, setHelpLevel] = React.useState<PracticeHelpLevel | null>(() => StorageManager.getPracticeHelpLevel());
  const [helpSheetOpen, setHelpSheetOpen] = React.useState(false);
  const chooseHelpLevel = (level: PracticeHelpLevel) => {
    soundFX.playClick();
    StorageManager.setPracticeHelpLevel(level);
    setHelpLevel(level);
    setHelpSheetOpen(false);
  };

  // Same coarse, global-counter progress approximation Listing.tsx already
  // uses (there's no true per-lesson completion tracking yet) -- reused
  // here rather than inventing a second, differently-shaped estimate.
  const completedWorldsCount =
    (userStats.completedLessons ?? 0) > 15 ? userStats.completedWorlds ?? 0 : 0;

  const worldStats = CODEDO_MASTER_WORLDS.filter(hasCollectedWorldData).map((world) => {
    const visibleLessons = world.lessons.filter((l) => !l.isBoss);
    const totalLessons = Math.max(1, visibleLessons.length);
    const completedInThisWorld =
      world.order === 1
        ? Math.min(totalLessons, userStats.completedLessons ?? 0)
        : world.order <= completedWorldsCount
        ? totalLessons
        : 0;

    // Counts reflect the Practice tab's own task list (practiceBank only,
    // never a lesson's own writeRun/debug task -- see TaskListScreen.tsx),
    // so a World card's displayed count always matches what tapping into it
    // actually shows.
    const writeRunProblems = PRACTICE_WRITE_RUN_BANK[world.id] ?? [];
    const debugProblems = PRACTICE_DEBUG_BANK[world.id] ?? [];
    const writeRunCount = writeRunProblems.length;
    const debugCount = debugProblems.length;
    const completedChallenges =
      writeRunProblems.filter((p) => StorageManager.getPracticeProblemStatus(p.id, 'writeRun') === 'completed').length +
      debugProblems.filter((p) => StorageManager.getPracticeProblemStatus(p.id, 'debug') === 'completed').length;

    return {
      world,
      visibleLessons,
      totalLessons,
      completedInThisWorld,
      writeRunCount,
      debugCount,
      completedChallenges,
      // Temporarily unlocked for all worlds regardless of progress.
      practiceLocked: false,
    };
  });

  const handleSurpriseMe = () => {
    soundFX.playClick();
    const pick = pickRandomPracticeTask(userStats);
    if (!pick) return;

    const five = resolveLessonOrPracticeContent(pick.lessonKey);
    if (five && StorageManager.getPracticeProblemStatus(five.id, pick.mode) === 'not_started') {
      StorageManager.setPracticeProblemStatus(five.id, pick.mode, 'in_progress');
    }
    onOpenLesson(pick.lessonKey, pick.mode, true);
  };

  // Weak-skill counts, derived from real logged mistakes (StorageManager) --
  // never fabricated. Only shown once the learner actually has some.
  const mistakeQuestions = StorageManager.getMistakes()
    .map((m) => LessonRepository.getById(m.questionId))
    .filter((q): q is NonNullable<typeof q> => Boolean(q));
  const bugFixMistakeCount = mistakeQuestions.filter((q) => q.challengeType === 'bug-fix').length;
  const writeRunMistakeCount = mistakeQuestions.length - bugFixMistakeCount;

  const handleReviewMistakes = () => {
    onStartDrill('mistakes');
  };

  const title = isDark ? 'text-slate-100' : 'text-[#2e3040]';
  const muted = isDark ? 'text-slate-400' : 'text-slate-500';
  const panel = isDark ? 'bg-[#0f1420] border-white/10 shadow-md shadow-black/30' : 'bg-[#f6f7fa] border-slate-300/70 shadow-sm';

  return (
    <div
      className={`min-h-full min-h-screen w-full flex flex-col items-center select-none pb-28 pt-2 px-4 transition-colors duration-300 ${
        isDark ? 'bg-[#0b0f19] text-[#e2e8f0]' : 'bg-[#e8eaf0] text-[#2e3040]'
      }`}
    >
      <div className="w-full max-w-md flex flex-col space-y-4">
        <div className="pt-1 space-y-3">
          <div className="flex items-center justify-between gap-4">
            <h1 className={`text-xl font-semibold font-['Outfit'] tracking-tight ${title}`}>Ready to practice?</h1>
            {/* Practice help level -- how much guidance Write & Run tasks show; tap to change */}
            <button
              type="button"
              aria-label={`Practice help: ${PRACTICE_HELP_OPTIONS.find((o) => o.level === (helpLevel ?? 'beginner'))?.label}. Change`}
              onClick={() => {
                soundFX.playClick();
                setHelpSheetOpen(true);
              }}
              className={`shrink-0 flex items-center gap-1.5 rounded-lg border px-3 py-2 font-mono text-[11px] font-semibold transition-colors ${panel} ${
                isDark ? 'text-[#ce9178]' : 'text-[#a8502f]'
              }`}
            >
              <span className="material-symbols-outlined !text-[15px]">tune</span>
              {PRACTICE_HELP_OPTIONS.find((o) => o.level === (helpLevel ?? 'beginner'))?.label}
              <span className="material-symbols-outlined !text-[15px] opacity-70">expand_more</span>
            </button>
          </div>
          <p className={`text-xs leading-relaxed ${muted}`}>Sharpen your Kotlin skills with quick coding challenges.</p>
        </div>

        {/* Surprise Challenge: a dark editor-style panel */}
        <section>
          <button
            type="button"
            onClick={handleSurpriseMe}
            className="relative w-full rounded-2xl text-left overflow-hidden transition-all active:scale-[0.99] bg-[#0d1322] border border-slate-700/60 shadow-lg"
          >
            <div className="flex items-center gap-1.5 px-3.5 py-2 bg-[#090d17] border-b border-slate-800/70">
              <span className="w-2 h-2 rounded-full bg-red-400/80" />
              <span className="w-2 h-2 rounded-full bg-amber-400/80" />
              <span className="w-2 h-2 rounded-full bg-emerald-400/80" />
              <span className="font-mono text-[11px] text-slate-400 ml-2">surprise_challenge.kt</span>
              <span className="ml-auto flex items-center gap-1 font-mono text-[11px] font-medium text-[#4ec9b0]/75">
                <span className="material-symbols-outlined !text-[13px]">autorenew</span>
                randomize()
              </span>
            </div>
            <div className="flex items-center gap-3.5 px-4 py-3.5">
              <div className="flex-1 min-w-0">
                <div className="font-mono text-[13px] font-semibold leading-snug">
                  <span className="text-[#c586c0]">fun </span>
                  <span className="text-[#dcdcaa]">surpriseMe</span>
                  <span className="text-slate-400">()</span>
                  <span className="text-slate-400">: </span>
                  <span className="text-[#4ec9b0]">Task</span>
                </div>
                <p className="font-mono text-[12px] truncate mt-1 text-[#7d8ca4]">{"// a random concept you've learned"}</p>
              </div>
              <div className="w-9 h-9 rounded-lg border border-[#4ec9b0]/50 text-[#4ec9b0] bg-[#4ec9b0]/10 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined !text-[22px]">play_arrow</span>
              </div>
            </div>
          </button>
        </section>

        {/* Recommended for You -- only shown once real mistake data exists */}
        {mistakeQuestions.length > 0 && (
          <section className={`rounded-xl p-4 border border-l-[3px] border-l-[#e5c07b] flex flex-col gap-2.5 transition-all ${panel}`}>
            <div className="space-y-0.5">
              <span className={`font-mono text-[10px] font-bold tracking-wider block ${isDark ? 'text-[#e5c07b]' : 'text-[#936a14]'}`}>
                {'// recommended'}
              </span>
              <h3 className={`text-sm font-bold font-['Outfit'] tracking-tight ${title}`}>Strengthen Your Weak Skills</h3>
              <p className={`text-[11px] font-medium ${muted}`}>Personalized from your recent attempts</p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-0.5">
              <button
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  handleReviewMistakes();
                }}
                className={`p-2.5 rounded-lg border flex items-center justify-center gap-2 transition-all active:scale-95 ${
                  isDark ? 'bg-[#0b0f19] border-white/10' : 'bg-white border-slate-300/70'
                }`}
              >
                <span className={`material-symbols-outlined !text-[19px] ${isDark ? 'text-[#569cd6]' : 'text-[#1f6fb5]'}`}>code</span>
                <span className="font-mono font-bold text-[13px]">{writeRunMistakeCount}</span>
                <span className={`font-mono text-[11px] ${muted}`}>write_run</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  handleReviewMistakes();
                }}
                className={`p-2.5 rounded-lg border flex items-center justify-center gap-2 transition-all active:scale-95 ${
                  isDark ? 'bg-[#0b0f19] border-white/10' : 'bg-white border-slate-300/70'
                }`}
              >
                <span className={`material-symbols-outlined !text-[19px] ${isDark ? 'text-[#ce9178]' : 'text-[#a8502f]'}`}>bug_report</span>
                <span className="font-mono font-bold text-[13px]">{bugFixMistakeCount}</span>
                <span className={`font-mono text-[11px] ${muted}`}>debug</span>
              </button>
            </div>
          </section>
        )}

        {/* Divider: the surprise challenge above and the per-World practice below are two separate sections */}
        <div className="flex items-center gap-3 pt-2" aria-hidden="true">
          <div className={`h-px flex-1 ${isDark ? 'bg-white/15' : 'bg-slate-400/40'}`} />
          <span className={`font-mono text-[10px] tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{'// worlds'}</span>
          <div className={`h-px flex-1 ${isDark ? 'bg-white/15' : 'bg-slate-400/40'}`} />
        </div>

        {/* Practice by World */}
        <section className="space-y-3">
          <div className="space-y-0.5 px-0.5">
            <h2 className={`text-lg font-semibold font-['Outfit'] tracking-tight ${title}`}>Practice by World</h2>
            <p className={`text-xs font-medium ${muted}`}>Choose a World and sharpen your Kotlin skills</p>
          </div>
          <div className="space-y-3">
            {worldStats.map((entry) => {
              const accent = accentForWorld(entry.world.order);
              const accentText = isDark ? accent.textDark : accent.text;

              if (entry.practiceLocked) {
                return (
                  <div
                    key={entry.world.id}
                    className={`rounded-xl p-4 border border-l-[3px] border-l-slate-500/50 opacity-75 flex flex-col gap-2 ${panel}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className={`font-mono text-[10px] font-bold tracking-wider ${muted}`}>
                        WORLD_{String(entry.world.order).padStart(2, '0')}
                      </span>
                      <span className={`flex items-center gap-1 font-mono text-[11px] ${muted}`}>
                        <span className="material-symbols-outlined !text-[16px]">lock</span>
                        locked
                      </span>
                    </div>
                    <h3 className={`text-sm font-bold font-['Outfit'] tracking-tight ${muted}`}>{entry.world.title}</h3>
                    <p className={`font-mono text-[11px] leading-relaxed ${muted}`}>
                      {'// learn your first concept in this World to unlock practice'}
                    </p>
                  </div>
                );
              }

              const totalChallenges = entry.writeRunCount + entry.debugCount;
              const fullyLearned = totalChallenges > 0 && entry.completedChallenges >= totalChallenges;
              const inProgress = entry.completedChallenges > 0 && !fullyLearned;
              const progressPct =
                totalChallenges > 0 ? Math.round((entry.completedChallenges / totalChallenges) * 100) : 0;

              // TaskListScreen itself tabs between Write & Run / Debug Code
              // (see its `activeMode` state), so a single tap into the card
              // already reaches both -- the mode passed here is only the
              // tab that opens first. There's nothing to open at all once
              // both banks are empty for this World.
              const hasAnyProblems = entry.writeRunCount > 0 || entry.debugCount > 0;
              const openDefaultMode: PracticeProblemMode = entry.writeRunCount > 0 ? 'writeRun' : 'debug';

              return (
                <article
                  key={entry.world.id}
                  role="button"
                  tabIndex={hasAnyProblems ? 0 : -1}
                  aria-disabled={!hasAnyProblems}
                  aria-label={`${entry.world.title}, ${entry.completedChallenges} of ${totalChallenges} challenges completed`}
                  onClick={() => {
                    if (!hasAnyProblems) return;
                    soundFX.playClick();
                    onOpenWorldProblems(entry.world.id, openDefaultMode);
                  }}
                  onKeyDown={(e) => {
                    if (!hasAnyProblems) return;
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      soundFX.playClick();
                      onOpenWorldProblems(entry.world.id, openDefaultMode);
                    }
                  }}
                  className={`rounded-xl p-4 border border-l-[3px] ${accent.stripe} transition-all duration-200 select-none ${panel} ${
                    hasAnyProblems ? 'cursor-pointer active:scale-[0.985]' : 'opacity-60 cursor-default'
                  }`}
                >
                  {/* Header row: WORLD_NN label (+ "current" marker when in progress), check or chevron on the right */}
                  <div className="flex items-center justify-between mb-2 gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={`font-mono text-[11px] font-bold tracking-wider shrink-0 ${accentText}`}>
                        WORLD_{String(entry.world.order).padStart(2, '0')}
                      </span>
                      {inProgress && (
                        <span className={`inline-flex items-center gap-1 font-mono text-[10px] shrink-0 ${muted}`}>
                          <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${accent.bar}`} />
                          current
                        </span>
                      )}
                    </div>
                    {fullyLearned ? (
                      <span className={`material-symbols-outlined !text-[20px] shrink-0 ${accentText}`}>check</span>
                    ) : (
                      <span className={`material-symbols-outlined !text-[22px] shrink-0 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                        chevron_right
                      </span>
                    )}
                  </div>

                  {/* Title, with the challenge count beside it */}
                  <div className="flex items-baseline flex-wrap gap-x-2">
                    <h3 className={`text-base font-semibold font-['Outfit'] tracking-tight leading-snug ${title}`}>{entry.world.title}</h3>
                    <span className={`font-mono text-[11px] ${muted}`}>
                      {totalChallenges} {totalChallenges === 1 ? 'challenge' : 'challenges'}
                    </span>
                  </div>

                  {/* Write & Run count, Debug count, inline */}
                  <div className={`flex items-center flex-wrap gap-x-3 font-mono text-[12px] leading-relaxed mt-3 ${muted}`}>
                    <span className="inline-flex items-center gap-1.5">
                      <span className={`material-symbols-outlined !text-[18px] ${isDark ? 'text-[#569cd6]' : 'text-[#1f6fb5]'}`}>code</span>
                      <span className={`font-bold ${title}`}>{entry.writeRunCount}</span>
                      <span>write_run</span>
                    </span>
                    <span className="opacity-50">·</span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className={`material-symbols-outlined !text-[18px] ${isDark ? 'text-[#ce9178]' : 'text-[#a8502f]'}`}>bug_report</span>
                      <span className={`font-bold ${title}`}>{entry.debugCount}</span>
                      <span>debug</span>
                    </span>
                  </div>

                  {/* Progress footer */}
                  <div className="mt-3.5">
                    <div className={`w-full h-1 rounded-full overflow-hidden ${isDark ? 'bg-white/10' : 'bg-slate-300/70'}`}>
                      <div className={`h-full rounded-full transition-all duration-500 ${accent.bar}`} style={{ width: `${progressPct}%` }} />
                    </div>
                    <div className={`flex items-center justify-between font-mono text-[11px] mt-2 ${fullyLearned || inProgress ? accentText : muted}`}>
                      <span>
                        {fullyLearned
                          ? `all ${totalChallenges} completed`
                          : `${entry.completedChallenges} / ${totalChallenges} completed`}
                      </span>
                      <span className="font-bold">{progressPct}%</span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

      </div>
      {(helpSheetOpen || helpLevel === null) && (
        <PracticeHelpSheet
          isDark={isDark}
          current={helpLevel}
          onChoose={chooseHelpLevel}
          onClose={helpLevel === null ? undefined : () => setHelpSheetOpen(false)}
        />
      )}
    </div>
  );
};
