import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BackHandler, LayoutAnimation, Platform, StatusBar, StyleSheet, Text, UIManager, View } from 'react-native';
import { CurriculumScreen } from './CurriculumScreen';
import { HomeListContent } from './HomeListScreen';
import { LessonScreen } from './LessonScreen';
import { LessonScreenPersistent } from './LessonScreenPersistent';
import { HelpLevel, HelpSheet } from './HelpSheet';
import { PracticeContent } from './PracticeScreen';
import { QuizContent } from './QuizScreen';
import { QuizSessionScreen } from './QuizSessionScreen';
import { QuizHubScreen } from './QuizHubScreen';
import { TaskListScreen } from './TaskListScreen';
import { BottomNav, Header, TabId } from './shell';
import { DARK, FONT, LIGHT } from './theme';
import { ProfileScreen } from './ProfileScreen';
import { StatsScreen } from './StatsScreen';
import { QuizPass, QuizProgress, buildSession, getQuizBoss, getQuizSets, getQuizWorldBank, getQuizWorlds, quizPassStatus } from './quizData';
import { QuizQuestion } from './quizQuestions';
import { PRACTICE_TASKS } from './practiceTasks';

export type JourneyVariant = 'milestones' | 'milestonesCircle' | 'milestonesDiamond' | 'milestonesPill';

// The React Native app: ONE shell (top bar + bottom tab bar) that every tab shares, with each tab's content inside it. Tapping a tab
// swaps the content; the shell, the theme and the Learn tab's GAP setting stay put. UI only, with sample data.

const BADGES: Record<TabId, string> = { learn: 'LEARN', quiz: 'QUIZ', practice: 'PRACTICE', profile: 'PROFILE' };
const THEME_STORAGE_KEY = 'codedo_theme';
const HELP_LEVEL_KEY = 'codedo_help_level';
const QUIZ_PROGRESS_KEY = 'codedo_native_quiz_progress';
const QUIZ_PASS_KEY = 'codedo_native_quiz_pass';
// Experimental lesson implementation. Keep false until the persistent-stage
// version has been validated on-device; switching back is one line.
const USE_PERSISTENT_LESSON = true;
// Keep the current direct quiz flow available; switch to true to test the lesson-wise variant.
const USE_QUIZ_HUB = true;

/** Tabs that are not built in React Native yet (Profile). */
function Placeholder({ label, dark }: { label: string; dark: boolean }) {
  return (
    <View style={styles.placeholder}>
      <Text style={[styles.placeholderText, { color: dark ? '#94A3B8' : '#585A68' }]}>{label} is not in React Native yet.</Text>
    </View>
  );
}

export function App({ dark = true }: { dark?: boolean }) {
  const [isDark, setIsDark] = React.useState(dark);
  const [themeLoaded, setThemeLoaded] = React.useState(false);
  const [tab, setTab] = React.useState<TabId>('learn');
  const [visitedTabs, setVisitedTabs] = React.useState<Set<TabId>>(() => new Set(['learn']));
  const [gap, setGap] = React.useState(12);
  const [journeyVariant, setJourneyVariant] = React.useState<JourneyVariant>('milestones');
  const [showAccentBorder, setShowAccentBorder] = React.useState(true);
  const [helpLevel, setHelpLevel] = React.useState<HelpLevel>('beginner');
  const [helpOpen, setHelpOpen] = React.useState(false);
  // The help level is the learner's default for Practice, saved on the device (set from the Practice sheet or the Profile tab).
  React.useEffect(() => {
    AsyncStorage.getItem(HELP_LEVEL_KEY).then((saved) => {
      if (saved === 'beginner' || saved === 'intermediate' || saved === 'experienced') setHelpLevel(saved);
    }).catch(() => {});
  }, []);
  const chooseHelpLevel = React.useCallback((level: HelpLevel) => {
    setHelpLevel(level);
    AsyncStorage.setItem(HELP_LEVEL_KEY, level).catch(() => {});
  }, []);
  // The World whose task list is open (it is a full screen over the shell, like the web's separate route).
  const [taskWorld, setTaskWorld] = React.useState<{ order: number; mode: 'writeRun' | 'debug'; single?: boolean } | null>(null);
  // A quiz being played (full screen over the shell). `world` is absent for the Quick quiz.
  const [quiz, setQuiz] = React.useState<{ world?: { order: number; title: string }; questions: import('./quizQuestions').QuizQuestion[]; label?: string; /** Counts toward the current pass (sets and the full quiz), unlike a review or a quick quiz. */ track?: boolean; /** Practice on a finished set: nothing is saved, so it stays finished. */ explore?: boolean; /** Questions already answered before this session, and the whole quiz's length, for the position shown. */ offset?: number; total?: number } | null>(null);
  const [quizHub, setQuizHub] = React.useState<{ order: number; title: string } | null>(null);
  // Lifetime results per question (never reset by a retake) and the questions answered in the current pass through the ordered quizzes.
  // Both are saved on the device, each answer as it is given, so a quiz can be left at any point and continued later.
  const [quizProgress, setQuizProgress] = React.useState<QuizProgress>({});
  const [quizPass, setQuizPass] = React.useState<QuizPass>({});
  const [quizLoaded, setQuizLoaded] = React.useState(false);
  React.useEffect(() => {
    Promise.all([AsyncStorage.getItem(QUIZ_PROGRESS_KEY), AsyncStorage.getItem(QUIZ_PASS_KEY)])
      .then(([progress, pass]) => {
        try {
          if (progress) setQuizProgress((current) => ({ ...JSON.parse(progress), ...current }));
          if (pass) setQuizPass((current) => ({ ...JSON.parse(pass), ...current }));
        } catch {
          // unreadable saved progress: start fresh
        }
      })
      .catch(() => {})
      .finally(() => setQuizLoaded(true));
  }, []);
  React.useEffect(() => {
    if (quizLoaded) AsyncStorage.setItem(QUIZ_PROGRESS_KEY, JSON.stringify(quizProgress)).catch(() => {});
  }, [quizProgress, quizLoaded]);
  React.useEffect(() => {
    if (quizLoaded) AsyncStorage.setItem(QUIZ_PASS_KEY, JSON.stringify(quizPass)).catch(() => {});
  }, [quizPass, quizLoaded]);
  // The World whose lessons are listed (the Curriculum screen).
  const [curriculumWorld, setCurriculumWorld] = React.useState<number | null>(null);
  const [statsOpen, setStatsOpen] = React.useState(false);
  // The lesson being played (the five-stage screen, full screen over everything).
  const [lesson, setLesson] = React.useState<{ world: number; title: string } | null>(null);
  const p = isDark ? DARK : LIGHT;
  const topInset = StatusBar.currentHeight ?? 24;

  React.useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY).then((saved) => {
      if (saved === 'dark' || saved === 'light') setIsDark(saved === 'dark');
    }).finally(() => setThemeLoaded(true));
  }, []);

  React.useEffect(() => {
    if (Platform.OS === 'android') UIManager.setLayoutAnimationEnabledExperimental?.(true);
  }, []);

  const toggleTheme = React.useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsDark((value) => {
      const next = !value;
      if (themeLoaded) AsyncStorage.setItem(THEME_STORAGE_KEY, next ? 'dark' : 'light').catch(() => {});
      return next;
    });
  }, [themeLoaded]);

  // Android's back button closes the sheet or the task list before it would leave the app.
  React.useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (helpOpen) {
        setHelpOpen(false);
        return true;
      }
      // A playing quiz closes first and returns to the hub it was started from (if any); the hub then closes to the Quiz tab.
      if (quiz !== null) {
        setQuiz(null);
        return true;
      }
      if (quizHub !== null) {
        setQuizHub(null);
        return true;
      }
      if (statsOpen) {
        setStatsOpen(false);
        return true;
      }
      if (curriculumWorld !== null) {
        setCurriculumWorld(null);
        return true;
      }
      if (taskWorld !== null) {
        setTaskWorld(null);
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [helpOpen, quizHub, taskWorld, quiz, curriculumWorld, statsOpen]);

  // The Learn, Quiz and Practice tabs stay mounted (hidden when not shown), so each keeps its scroll position and nothing is re-measured.
  const selectTab = React.useCallback((nextTab: TabId) => {
    setVisitedTabs((visited) => {
      if (visited.has(nextTab)) return visited;
      const next = new Set(visited);
      next.add(nextTab);
      return next;
    });
    setTab(nextTab);
  }, []);
  const openHelp = React.useCallback(() => setHelpOpen(true), []);
  const openTaskWorld = React.useCallback((order: number) => setTaskWorld({ order, mode: 'writeRun' }), []);
  const openCurriculumWorld = React.useCallback((order: number) => setCurriculumWorld(order), []);
  const resetQuizProgress = React.useCallback(() => { setQuizProgress({}); setQuizPass({}); }, []);
  // Clears every answer, stat and pass mark of one World (all of its questions, including lessons the review filter hides).
  const resetWorldQuiz = React.useCallback((order: number) => {
    const ids = new Set(getQuizWorldBank(order).map((q) => q.id));
    const without = <T,>(record: Record<string, T>) => Object.fromEntries(Object.entries(record).filter(([id]) => !ids.has(id))) as Record<string, T>;
    setQuizProgress((previous) => without(previous));
    setQuizPass((previous) => without(previous));
  }, []);
  // Saves one answer the moment it is committed: the lifetime record always, the current pass only for an ordered quiz.
  const recordAnswer = React.useCallback((question: QuizQuestion, correct: boolean, track: boolean) => {
    setQuizProgress((previous) => {
      const old = previous[question.id] ?? { correct: 0, wrong: 0, last: 0 };
      return { ...previous, [question.id]: { correct: old.correct + (correct ? 1 : 0), wrong: old.wrong + (correct ? 0 : 1), last: Date.now(), lastCorrect: correct } };
    });
    if (track) setQuizPass((previous) => (previous[question.id] ? previous : { ...previous, [question.id]: true }));
  }, []);
  // Starts an ordered quiz (a set or the full quiz) where the learner left off. When everything in it is answered it is a retake: its
  // questions are cleared from the pass and it starts again from the first one. The order is fixed, never shuffled.
  const startOrdered = React.useCallback((world: { order: number; title: string }, ordered: QuizQuestion[], label: string) => {
    let remaining = ordered.filter((q) => !quizPass[q.id]);
    if (remaining.length === 0) {
      setQuizPass((previous) => {
        const next = { ...previous };
        ordered.forEach((q) => delete next[q.id]);
        return next;
      });
      remaining = ordered;
    }
    if (remaining.length) setQuiz({ world, questions: remaining, label, track: true, offset: ordered.length - remaining.length, total: ordered.length });
  }, [quizPass]);
  // What to offer when a set ends: the next unfinished set (later ones first, then earlier ones), then the Boss quiz once every set is answered.
  const nextAfterQuiz = React.useMemo(() => {
    if (!quiz || !quiz.track || !quiz.world) return null;
    const bank = getQuizWorlds().find((w) => w.order === quiz.world!.order)?.questions ?? [];
    const sets = getQuizSets(quiz.world.order, bank);
    const at = sets.findIndex((set) => set.title === quiz.label);
    if (at < 0) return null;
    // Only sets still to answer are offered next; a set waiting on review is reviewed from the hub, not restarted.
    const unfinished = (set: (typeof sets)[number]) => ['start', 'continue'].includes(quizPassStatus(set.questions, quizPass, quizProgress).state);
    const upcoming = [...sets.slice(at + 1), ...sets.slice(0, at)].find(unfinished);
    if (upcoming) return { label: upcoming.title, questions: upcoming.questions };
    const boss = getQuizBoss(quiz.world.order, bank);
    const setsFinished = sets.every((set) => quizPassStatus(set.questions, quizPass, quizProgress).state === 'retake');
    if (boss && setsFinished && ['start', 'continue'].includes(quizPassStatus(boss.questions, quizPass, quizProgress).state)) return { label: 'Boss quiz', questions: boss.questions };
    return null;
  }, [quiz, quizPass, quizProgress]);
  const openQuiz = React.useCallback((world?: { order: number; title: string }, review?: boolean) => {
    const questions = buildSession(getQuizWorlds(), world?.order, quizProgress, review);
    if (questions.length) setQuiz({ world, questions, label: review ? 'Review mistakes' : world ? 'Full quiz' : 'Quick quiz' });
  }, [quizProgress]);
  const openQuizCard = React.useCallback((world?: { order: number; title: string }, review?: boolean) => {
    // A World card opens that World's quiz hub (progress, the whole bank in one tap, review, lessons). No mode-choice sheet.
    if (world && !review && USE_QUIZ_HUB) {
      setQuizHub(world);
      return;
    }
    else openQuiz(world, review);
  }, [openQuiz]);
  const quizActivityCounts = React.useMemo(
    () => Object.fromEntries(getQuizWorlds().map((world) => [world.order, world.questions.length])),
    []
  );
  const writeRunActivityCounts = React.useMemo(
    () => Object.fromEntries(Object.entries(PRACTICE_TASKS).map(([order, modes]) => [Number(order), modes.writeRun.length])),
    []
  );
  const debugActivityCounts = React.useMemo(
    () => Object.fromEntries(Object.entries(PRACTICE_TASKS).map(([order, modes]) => [Number(order), modes.debug.length])),
    []
  );
  const openHomeActivity = React.useCallback((order: number, activity: 'quiz' | 'writeRun' | 'debug') => {
    if (activity === 'quiz') {
      const world = getQuizWorlds().find((candidate) => candidate.order === order);
      if (world) openQuizCard({ order: world.order, title: world.title });
      return;
    }
    setTaskWorld({ order, mode: activity, single: true });
  }, [openQuizCard]);
  const show = (id: TabId) => visitedTabs.has(id)
    ? { ...StyleSheet.absoluteFillObject, opacity: tab === id ? 1 : 0, zIndex: tab === id ? 1 : 0 }
    : { ...StyleSheet.absoluteFillObject, opacity: 0, zIndex: -1 };

  // Full-screen screens sit on top of the ones below them. A covered screen is switched to display: none, so Android neither lays it out
  // nor draws it on every frame (the Home journey alone is hundreds of views plus a large SVG), while its state and scroll position stay.
  const baseCovered = statsOpen || curriculumWorld !== null || lesson !== null || taskWorld !== null || quiz !== null || quizHub !== null;
  const curriculumCovered = lesson !== null || taskWorld !== null || quiz !== null;
  const quizHubCovered = quiz !== null;

  return (
    <View style={{ flex: 1, backgroundColor: p.page }}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor="transparent" translucent />
      <View style={{ flex: 1, display: baseCovered ? 'none' : 'flex' }}>
      <Header
        p={p}
        badge={BADGES[tab]}
        showGap={tab === 'learn'}
        gap={gap}
        onGap={setGap}
        onToggleTheme={toggleTheme}
        topInset={topInset}
      />
      <View style={{ flex: 1 }}>
        <View pointerEvents={tab === 'learn' ? 'auto' : 'none'} style={show('learn')}>
          <HomeListContent
            p={p}
            gap={gap}
            journeyVariant={journeyVariant}
            onOpenWorld={openCurriculumWorld}
            onOpenActivity={openHomeActivity}
            quizActivityCounts={quizActivityCounts}
            writeRunActivityCounts={writeRunActivityCounts}
            debugActivityCounts={debugActivityCounts}
          />
        </View>
        <View pointerEvents={tab === 'quiz' ? 'auto' : 'none'} style={show('quiz')}>
          <QuizContent p={p} progress={quizProgress} onOpenQuiz={openQuizCard} showAccentBorder={showAccentBorder} />
        </View>
        <View pointerEvents={tab === 'practice' ? 'auto' : 'none'} style={show('practice')}>
          <PracticeContent p={p} helpLevel={helpLevel} onOpenHelp={openHelp} onOpenWorld={openTaskWorld} showAccentBorder={showAccentBorder} />
        </View>
        <View pointerEvents={tab === 'profile' ? 'auto' : 'none'} style={show('profile')}>
          <ProfileScreen p={p} quizProgress={quizProgress} journeyVariant={journeyVariant} onJourneyVariant={setJourneyVariant} onToggleTheme={toggleTheme} onOpenStats={() => setStatsOpen(true)} showAccentBorder={showAccentBorder} onAccentBorder={setShowAccentBorder} />
        </View>
      </View>
      <BottomNav p={p} active={tab} onSelect={selectTab} />
      </View>
      {statsOpen && (
        <View style={[StyleSheet.absoluteFill, { zIndex: 100, backgroundColor: p.page }]}>
          <StatsScreen p={p} topInset={topInset} onBack={() => setStatsOpen(false)} onToggleTheme={toggleTheme} />
        </View>
      )}
      {curriculumWorld !== null && (
        <View style={[StyleSheet.absoluteFill, { zIndex: 100, backgroundColor: p.page, display: curriculumCovered ? 'none' : 'flex' }]}>
          <CurriculumScreen
            p={p}
            worldOrder={curriculumWorld}
            topInset={topInset}
            onBack={() => setCurriculumWorld(null)}
            onToggleTheme={toggleTheme}
            onOpenLesson={(world, title) => setLesson({ world, title })}
          />
        </View>
      )}
      {lesson !== null && (
        <View style={[StyleSheet.absoluteFill, { zIndex: 100, backgroundColor: p.page }]}>
          {USE_PERSISTENT_LESSON ? <LessonScreenPersistent
            dark={isDark}
            worldOrder={lesson.world}
            lessonTitle={lesson.title}
            topInset={topInset}
            onExit={() => setLesson(null)}
            onToggleTheme={toggleTheme}
          /> : <LessonScreen
            dark={isDark}
            worldOrder={lesson.world}
            lessonTitle={lesson.title}
            topInset={topInset}
            onExit={() => setLesson(null)}
            onToggleTheme={toggleTheme}
          />}
        </View>
      )}
      {taskWorld !== null && (
        <View style={[StyleSheet.absoluteFill, { zIndex: 100, backgroundColor: p.page }]}>
          <TaskListScreen
            key={`${taskWorld.order}-${taskWorld.mode}`}
            p={p}
            worldOrder={taskWorld.order}
            mode={taskWorld.mode}
            showTabs={!taskWorld.single}
            helpLevel={helpLevel}
            topInset={topInset}
            onBack={() => setTaskWorld(null)}
            onToggleTheme={toggleTheme}
          />
        </View>
      )}
      {quiz !== null && (
        <View style={[StyleSheet.absoluteFill, { zIndex: 110, backgroundColor: p.page }]}>
          <QuizSessionScreen key={`${quiz.label}-${quiz.offset ?? 0}`} p={p} world={quiz.world} label={quiz.label} questions={quiz.questions} nextLabel={nextAfterQuiz?.label} onNext={nextAfterQuiz && quiz.world ? () => startOrdered(quiz.world!, nextAfterQuiz.questions, nextAfterQuiz.label) : undefined} stepOffset={quiz.offset} totalOverride={quiz.total} topInset={topInset} onExit={() => setQuiz(null)} onAnswer={(question, correct) => { if (!quiz.explore) recordAnswer(question, correct, !!quiz.track); }} />
        </View>
      )}
      {quizHub !== null && (
        <View style={[StyleSheet.absoluteFill, { zIndex: 100, backgroundColor: p.page, display: quizHubCovered ? 'none' : 'flex' }]}> 
          <QuizHubScreen
            p={p}
            world={quizHub}
            questions={getQuizWorlds().find((w) => w.order === quizHub.order)?.questions ?? []}
            sets={getQuizSets(quizHub.order, getQuizWorlds().find((w) => w.order === quizHub.order)?.questions ?? [])}
            boss={getQuizBoss(quizHub.order, getQuizWorlds().find((w) => w.order === quizHub.order)?.questions ?? [])}
            progress={quizProgress}
            pass={quizPass}
            topInset={topInset}
            onBack={() => setQuizHub(null)}
            // The hub stays mounted under the quiz, so leaving the quiz returns here (with the updated progress), not to the Quiz tab.
            onStart={(questions, label) => startOrdered(quizHub, questions, label)}
            onResetWorld={() => resetWorldQuiz(quizHub.order)}
            onExplore={(questions, title) => setQuiz({ world: quizHub, questions, label: `${title} · Explore`, explore: true })}
            onReviewSet={(questions, title) => setQuiz({ world: quizHub, questions, label: `Review · ${title}` })}
            onReview={() => openQuiz(quizHub, true)}
          />
        </View>
      )}
      {helpOpen && (
        <HelpSheet
          p={p}
          current={helpLevel}
          onChoose={(level) => {
            chooseHelpLevel(level);
            setHelpOpen(false);
          }}
          onClose={() => setHelpOpen(false)}
        />
      )}
    </View>
  );
}

export default App;

const styles = StyleSheet.create({
  placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  placeholderText: { fontFamily: FONT.body, fontSize: 14, textAlign: 'center' },
});
