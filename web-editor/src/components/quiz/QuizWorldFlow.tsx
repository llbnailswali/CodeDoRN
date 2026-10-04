import React from 'react';
import { AppTheme } from '../../types';
import { QuizQuestion, shuffleChoices } from '../../utils/quizQuestions';
import { isMissed, loadQuestionProgress } from '../../utils/quizProgress';
import { buildSession } from '../../utils/quizSessions';
import { QuizReviewScreen } from './QuizReviewScreen';
import { QuizSession } from './QuizSession';

interface Props {
  theme: AppTheme;
  world: { id: string; order: number; title: string };
  questions: QuizQuestion[];
  /** Open on the Review screen (questions currently missed) instead of starting the quiz. */
  startInReview?: boolean;
  /** Leaves the quiz (finished or closed). Answers already given are saved. */
  onBack: () => void;
  /** XP earned by a finished quiz. */
  onEarnXp: (xp: number) => void;
}

type Run =
  | { kind: 'quiz'; id: number; questions: QuizQuestion[] }
  | { kind: 'retry'; id: number; questions: QuizQuestion[] }
  | { kind: 'review'; id: number; questions: QuizQuestion[] };

/**
 * A World's quiz, in one go: tapping the World plays every question of its bank straight away, with no screen in between.
 * Order: questions not mastered yet come first (unseen, missed, learning), then mastered ones, spread across the World's lessons
 * and ordered easy to hard. Each answer is saved as it is given, so closing the quiz halfway keeps the progress.
 *
 * Mistakes: the result screen offers "Review mistakes". The Review screen explains each missed question, then "Try these again"
 * replays them with shuffled choices (no XP). A retry that still has misses leads back to the Review screen with the rest.
 */
export const QuizWorldFlow: React.FC<Props> = ({ theme, world, questions, startInReview, onBack, onEarnXp }) => {
  const [run, setRun] = React.useState<Run>(() => {
    const progress = loadQuestionProgress();
    if (startInReview) return { kind: 'review', id: 0, questions: questions.filter((q) => isMissed(progress[q.id])) };
    return { kind: 'quiz', id: 0, questions: buildSession(questions, progress, questions.length) };
  });

  const next = (kind: Run['kind'], qs: QuizQuestion[]) => setRun((r) => ({ kind, id: r.id + 1, questions: qs }));

  if (run.kind === 'review') {
    return (
      <QuizReviewScreen
        key={run.id}
        theme={theme}
        world={world}
        questions={run.questions}
        onTryAgain={(qs) => next('retry', qs.map(shuffleChoices))}
        onDone={onBack}
      />
    );
  }
  return (
    <QuizSession
      key={run.id}
      theme={theme}
      world={world}
      questions={run.questions}
      onExit={onBack}
      onReview={(failed) => next('review', failed)}
      onDone={(results) => {
        // Reviewing mistakes saves progress but gives no XP, so a question cannot be farmed by failing it on purpose.
        if (run.kind === 'quiz') onEarnXp(run.questions.reduce((sum, q, i) => sum + (results[i] === 'correct' ? q.xp : 0), 0));
        onBack();
      }}
    />
  );
};
