import { AppTheme, FontSize, UserStats, UserMistake } from '../types';

const STATS_KEY = 'codedo_user_stats';
const THEME_KEY = 'codedo_app_theme';
const SOUND_KEY = 'codedo_sound_enabled';
const FONT_SIZE_KEY = 'codedo_font_size';
const MISTAKES_KEY = 'codedo_user_mistakes';
const LAST_ACTIVE_DATE_KEY = 'codedo_last_active_date';
const PRACTICE_PROBLEM_STATUS_KEY = 'codedo_practice_problem_status';
const LAST_PRACTICE_ATTEMPT_KEY = 'codedo_last_practice_attempt';
const QUIZ_CORRECT_KEY = 'codedo_quiz_correct_ids';
const PATH_STYLE_KEY = 'codedo_path_style';

export type PracticeProblemMode = 'writeRun' | 'debug';

// How much guidance Practice Write & Run tasks show. Chosen by the learner.
export type PracticeHelpLevel = 'beginner' | 'intermediate' | 'experienced';
const PRACTICE_HELP_LEVEL_KEY = 'codedo_practice_help_level';
export type PracticeProblemStatus = 'not_started' | 'in_progress' | 'completed';
type PracticeProblemStatusMap = Record<string, Partial<Record<PracticeProblemMode, PracticeProblemStatus>>>;

export interface LastPracticeAttempt {
  lessonKey: string;
  mode: PracticeProblemMode;
}

export const DEFAULT_USER_STATS: UserStats = {
  streak: 0,
  stars: 0,
  gems: 0,
  hearts: 5,
  xp: 0,
  completedLessons: 0,
  todayLessonsCompleted: 0,
  todayGoal: 3,
  completedWorlds: 0,
};

function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Robust, typed storage manager with daily reset handling and fallbacks
 */
export const StorageManager = {
  getTheme(): AppTheme {
    try {
      const saved = localStorage.getItem(THEME_KEY);
      if (saved === 'light' || saved === 'dark') return saved;
    } catch {
      // ignore
    }
    return 'dark';
  },

  setTheme(theme: AppTheme): void {
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      // ignore
    }
  },

  getSoundEnabled(): boolean {
    try {
      const saved = localStorage.getItem(SOUND_KEY);
      if (saved !== null) return saved === 'true';
    } catch {
      // ignore
    }
    return true;
  },

  setSoundEnabled(enabled: boolean): void {
    try {
      localStorage.setItem(SOUND_KEY, String(enabled));
    } catch {
      // ignore
    }
  },

  getFontSize(): FontSize {
    try {
      const saved = localStorage.getItem(FONT_SIZE_KEY);
      if (saved === 'small' || saved === 'medium' || saved === 'large') return saved;
    } catch {
      // ignore
    }
    return 'medium';
  },

  setFontSize(fontSize: FontSize): void {
    try {
      localStorage.setItem(FONT_SIZE_KEY, fontSize);
    } catch {
      // ignore
    }
  },

  getUserStats(): UserStats {
    try {
      const today = getTodayDateString();
      const lastActive = localStorage.getItem(LAST_ACTIVE_DATE_KEY);
      const savedStatsStr = localStorage.getItem(STATS_KEY);

      let stats: UserStats = DEFAULT_USER_STATS;
      if (savedStatsStr) {
        const parsed = JSON.parse(savedStatsStr);
        stats = {
          ...DEFAULT_USER_STATS,
          ...parsed,
        };
      }

      // Check daily reset
      if (lastActive && lastActive !== today) {
        // New day detected! Reset daily progress counter
        stats.todayLessonsCompleted = 0;
        localStorage.setItem(STATS_KEY, JSON.stringify(stats));
        localStorage.setItem(LAST_ACTIVE_DATE_KEY, today);
      } else if (!lastActive) {
        localStorage.setItem(LAST_ACTIVE_DATE_KEY, today);
      }

      return stats;
    } catch {
      return DEFAULT_USER_STATS;
    }
  },

  saveUserStats(stats: UserStats): void {
    try {
      localStorage.setItem(STATS_KEY, JSON.stringify(stats));
      localStorage.setItem(LAST_ACTIVE_DATE_KEY, getTodayDateString());
    } catch {
      // Quota exceeded or private browsing
    }
  },

  getMistakes(): UserMistake[] {
    try {
      const data = localStorage.getItem(MISTAKES_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  recordMistake(questionId: string, skill: string, questionTitle: string): void {
    try {
      const mistakes = this.getMistakes();
      const existingIdx = mistakes.findIndex((m) => m.questionId === questionId);
      const today = getTodayDateString();

      if (existingIdx >= 0) {
        mistakes[existingIdx].mistakeCount += 1;
        mistakes[existingIdx].lastMistakeDate = today;
      } else {
        mistakes.push({
          questionId,
          skill,
          questionTitle,
          mistakeCount: 1,
          lastMistakeDate: today,
        });
      }
      localStorage.setItem(MISTAKES_KEY, JSON.stringify(mistakes));
    } catch {
      // ignore
    }
  },

  clearMistakes(): void {
    try {
      localStorage.removeItem(MISTAKES_KEY);
    } catch {
      // ignore
    }
  },

  resetAll(): void {
    try {
      localStorage.setItem(STATS_KEY, JSON.stringify(DEFAULT_USER_STATS));
      localStorage.setItem(LAST_ACTIVE_DATE_KEY, getTodayDateString());
      localStorage.removeItem(MISTAKES_KEY);
      localStorage.removeItem(PRACTICE_PROBLEM_STATUS_KEY);
      localStorage.removeItem(LAST_PRACTICE_ATTEMPT_KEY);
      localStorage.removeItem(QUIZ_CORRECT_KEY);
      localStorage.removeItem('codedo_quiz_question_progress');
    } catch {
      // ignore
    }
  },

  // TEMPORARY: which shape the Learn tab's journey path is drawn in (see utils/pathStyles.ts). null = the default shape.
  getPathStyleId(): string | null {
    try {
      return localStorage.getItem(PATH_STYLE_KEY);
    } catch {
      return null;
    }
  },

  setPathStyleId(id: string): void {
    try {
      localStorage.setItem(PATH_STYLE_KEY, id);
    } catch {
      // ignore
    }
  },

  // Quiz tab: ids of the questions the learner has answered correctly at least once. Drives each World card's progress bar.
  getQuizCorrectIds(): string[] {
    try {
      const data = localStorage.getItem(QUIZ_CORRECT_KEY);
      const parsed = data ? JSON.parse(data) : [];
      return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : [];
    } catch {
      return [];
    }
  },

  markQuizCorrect(questionId: string): void {
    try {
      const ids = this.getQuizCorrectIds();
      if (ids.includes(questionId)) return;
      localStorage.setItem(QUIZ_CORRECT_KEY, JSON.stringify([...ids, questionId]));
    } catch {
      // ignore
    }
  },

  // Tracked independently of the 5-stage lesson flow's own mastery/XP state --
  // this only records, per lesson + mode, whether the learner has started or
  // passed that specific Write & Run / Debug problem from the Practice tab's
  // per-world problems list.
  // null until the learner has chosen (the Practice tab then asks once).
  getPracticeHelpLevel(): PracticeHelpLevel | null {
    try {
      const v = localStorage.getItem(PRACTICE_HELP_LEVEL_KEY);
      return v === 'beginner' || v === 'intermediate' || v === 'experienced' ? v : null;
    } catch {
      return null;
    }
  },

  setPracticeHelpLevel(level: PracticeHelpLevel): void {
    try {
      localStorage.setItem(PRACTICE_HELP_LEVEL_KEY, level);
    } catch {
      // ignore
    }
  },

  getPracticeProblemStatusMap(): PracticeProblemStatusMap {
    try {
      const data = localStorage.getItem(PRACTICE_PROBLEM_STATUS_KEY);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  },

  getPracticeProblemStatus(lessonKey: string, mode: PracticeProblemMode): PracticeProblemStatus {
    const map = this.getPracticeProblemStatusMap();
    return map[lessonKey]?.[mode] || 'not_started';
  },

  setPracticeProblemStatus(lessonKey: string, mode: PracticeProblemMode, status: PracticeProblemStatus): void {
    try {
      const map = this.getPracticeProblemStatusMap();
      map[lessonKey] = { ...map[lessonKey], [mode]: status };
      localStorage.setItem(PRACTICE_PROBLEM_STATUS_KEY, JSON.stringify(map));
      localStorage.setItem(LAST_PRACTICE_ATTEMPT_KEY, JSON.stringify({ lessonKey, mode }));
    } catch {
      // ignore
    }
  },

  // Whichever Write & Run / Debug problem the learner most recently opened
  // (from TaskListScreen, Surprise Me, or Next Task/Next Random Task) --
  // drives PracticeTab's "Continue Practicing" card, which shows nothing at
  // all until this exists (see setPracticeProblemStatus, which is the only
  // writer).
  getLastPracticeAttempt(): LastPracticeAttempt | null {
    try {
      const data = localStorage.getItem(LAST_PRACTICE_ATTEMPT_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },
};
