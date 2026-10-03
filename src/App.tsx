import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BackHandler, LayoutAnimation, Platform, StatusBar, StyleSheet, Text, UIManager, View } from 'react-native';
import { CurriculumScreen } from './CurriculumScreen';
import { HomeContent } from './HomeScreen';
import { LessonScreen } from './LessonScreen';
import { LessonScreenPersistent } from './LessonScreenPersistent';
import { HelpLevel, HelpSheet } from './HelpSheet';
import { PracticeContent } from './PracticeScreen';
import { QuizContent } from './QuizScreen';
import { QuizSessionScreen } from './QuizSessionScreen';
import { QuizLessonWiseScreen } from './QuizLessonWiseScreen';
import { QuizModeSheet } from './QuizModeSheet';
import { TaskListScreen } from './TaskListScreen';
import { BottomNav, Header, TabId } from './shell';
import { DARK, FONT, LIGHT } from './theme';
import { ProfileScreen } from './ProfileScreen';
import { QuizProgress, buildSession, getQuizWorlds } from './quizData';

// The React Native app: ONE shell (top bar + bottom tab bar) that every tab shares, with each tab's content inside it. Tapping a tab
// swaps the content; the shell, the theme and the Learn tab's GAP setting stay put. UI only, with sample data.

const BADGES: Record<TabId, string> = { learn: 'LEARN', quiz: 'QUIZ', practice: 'PRACTICE', profile: 'PROFILE' };
const THEME_STORAGE_KEY = 'codedo_theme';
// Experimental lesson implementation. Keep false until the persistent-stage
// version has been validated on-device; switching back is one line.
const USE_PERSISTENT_LESSON = true;
// Keep the current direct quiz flow available; switch to true to test the lesson-wise variant.
const USE_LESSON_WISE_QUIZ = true;

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
  const [helpLevel, setHelpLevel] = React.useState<HelpLevel>('beginner');
  const [helpOpen, setHelpOpen] = React.useState(false);
  // The World whose task list is open (it is a full screen over the shell, like the web's separate route).
  const [taskWorld, setTaskWorld] = React.useState<number | null>(null);
  // A quiz being played (full screen over the shell). `world` is absent for the Quick quiz.
  const [quiz, setQuiz] = React.useState<{ world?: { order: number; title: string }; questions: import('./quizQuestions').QuizQuestion[] } | null>(null);
  const [lessonWiseQuiz, setLessonWiseQuiz] = React.useState<{ order: number; title: string } | null>(null);
  const [quizModeWorld, setQuizModeWorld] = React.useState<{ order: number; title: string } | null>(null);
  const [quizProgress, setQuizProgress] = React.useState<QuizProgress>({});
  // The World whose lessons are listed (the Curriculum screen).
  const [curriculumWorld, setCurriculumWorld] = React.useState<number | null>(null);
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
      if (lessonWiseQuiz !== null) {
        setLessonWiseQuiz(null);
        return true;
      }
      if (quizModeWorld !== null) {
        setQuizModeWorld(null);
        return true;
      }
      if (quiz !== null) {
        setQuiz(null);
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
  }, [helpOpen, lessonWiseQuiz, quizModeWorld, taskWorld, quiz, curriculumWorld]);

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
  const openTaskWorld = React.useCallback((order: number) => setTaskWorld(order), []);
  const openCurriculumWorld = React.useCallback((order: number) => setCurriculumWorld(order), []);
  const resetQuizProgress = React.useCallback(() => setQuizProgress({}), []);
  const openQuiz = React.useCallback((world?: { order: number; title: string }, review?: boolean) => {
    const questions = buildSession(getQuizWorlds(), world?.order, quizProgress, review);
    if (questions.length) setQuiz({ world, questions });
  }, [quizProgress]);
  const openQuizCard = React.useCallback((world?: { order: number; title: string }, review?: boolean) => {
    if (world && !review && USE_LESSON_WISE_QUIZ) {
      setQuizModeWorld(world);
      return;
    }
    else openQuiz(world, review);
  }, [openQuiz]);
  const show = (id: TabId) => visitedTabs.has(id)
    ? { ...StyleSheet.absoluteFillObject, opacity: tab === id ? 1 : 0, zIndex: tab === id ? 1 : 0 }
    : { ...StyleSheet.absoluteFillObject, opacity: 0, zIndex: -1 };

  return (
    <View style={{ flex: 1, backgroundColor: p.page }}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor="transparent" translucent />
      <Header
        p={p}
        badge={BADGES[tab]}
        showGap={false}
        gap={gap}
        onGap={setGap}
        onToggleTheme={toggleTheme}
        topInset={topInset}
      />
      <View style={{ flex: 1 }}>
        <View pointerEvents={tab === 'learn' ? 'auto' : 'none'} style={show('learn')}>
          <HomeContent p={p} gap={gap} onOpenWorld={openCurriculumWorld} />
        </View>
        <View pointerEvents={tab === 'quiz' ? 'auto' : 'none'} style={show('quiz')}>
          <QuizContent p={p} progress={quizProgress} onOpenQuiz={openQuizCard} />
        </View>
        <View pointerEvents={tab === 'practice' ? 'auto' : 'none'} style={show('practice')}>
          <PracticeContent p={p} helpLevel={helpLevel} onOpenHelp={openHelp} onOpenWorld={openTaskWorld} />
        </View>
        <View pointerEvents={tab === 'profile' ? 'auto' : 'none'} style={show('profile')}>
          <ProfileScreen p={p} completedWorlds={0} quizAnswered={Object.keys(quizProgress).length} onToggleTheme={toggleTheme} onReset={resetQuizProgress} />
        </View>
      </View>
      <BottomNav p={p} active={tab} onSelect={selectTab} />
      {curriculumWorld !== null && (
        <View style={[StyleSheet.absoluteFill, { zIndex: 100, backgroundColor: p.page }]}>
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
            p={p}
            worldOrder={taskWorld}
            mode="writeRun"
            helpLevel={helpLevel}
            topInset={topInset}
            onBack={() => setTaskWorld(null)}
            onToggleTheme={toggleTheme}
          />
        </View>
      )}
      {quiz !== null && (
        <View style={[StyleSheet.absoluteFill, { zIndex: 100, backgroundColor: p.page }]}>
          <QuizSessionScreen p={p} world={quiz.world} questions={quiz.questions} topInset={topInset} onExit={() => setQuiz(null)} onComplete={(questions, results) => {
            setQuizProgress((previous) => {
              const next = { ...previous };
              questions.forEach((question, index) => {
                const old = next[question.id] ?? { correct: 0, wrong: 0, last: 0 };
                const correct = results[index] === 'correct';
                next[question.id] = { correct: old.correct + (correct ? 1 : 0), wrong: old.wrong + (correct ? 0 : 1), last: Date.now() };
              });
              return next;
            });
          }} />
        </View>
      )}
      {lessonWiseQuiz !== null && (
        <View style={[StyleSheet.absoluteFill, { zIndex: 100, backgroundColor: p.page }]}> 
          <QuizLessonWiseScreen
            p={p}
            world={lessonWiseQuiz}
            questions={getQuizWorlds().find((w) => w.order === lessonWiseQuiz.order)?.questions ?? []}
            topInset={topInset}
            onBack={() => setLessonWiseQuiz(null)}
            onStart={(questions) => { setLessonWiseQuiz(null); setQuiz({ world: lessonWiseQuiz, questions }); }}
          />
        </View>
      )}
      {quizModeWorld !== null && (
        <QuizModeSheet
          p={p}
          world={quizModeWorld}
          total={getQuizWorlds().find((w) => w.order === quizModeWorld.order)?.questions.length ?? 0}
          onLessonWise={() => { const world = quizModeWorld; setQuizModeWorld(null); setLessonWiseQuiz(world); }}
          onAllInOne={() => { const world = quizModeWorld; setQuizModeWorld(null); openQuiz(world); }}
          onClose={() => setQuizModeWorld(null)}
        />
      )}
      {helpOpen && (
        <HelpSheet
          p={p}
          current={helpLevel}
          onChoose={(level) => {
            setHelpLevel(level);
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
