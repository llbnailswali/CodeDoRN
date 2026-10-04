import React from 'react';
import { AppTheme } from '../../types';
import { QuizAnswer, QuizQuestion } from '../../utils/quizQuestions';
import { recordAnswer } from '../../utils/quizProgress';
import { QuizQuestionScreen, QuizResult } from './QuizQuestionScreen';
import { QuizSessionComplete } from './QuizSessionComplete';

/** TEMPORARY: shows Pass / Fail test buttons on every question. Set to false (or delete the buttons) before release. */
const SHOW_DEV_PASS_FAIL = true;

interface Props {
  theme: AppTheme;
  questions: QuizQuestion[];
  world?: { order: number; title: string };
  /** Called once with the final results when the learner leaves the complete screen. */
  onDone: (results: QuizResult[]) => void;
  /** Replays the questions answered wrong in this session. Offered on the result screen when there are any. */
  onReview?: (failed: QuizQuestion[]) => void;
  /** Leaving mid-session (answers already given are kept). */
  onExit: () => void;
}

/** Plays a list of questions in order, saves every answer to the per-question progress, then shows the result screen. */
export const QuizSession: React.FC<Props> = ({ theme, questions, world, onDone, onReview, onExit }) => {
  const [index, setIndex] = React.useState(0);
  const [results, setResults] = React.useState<QuizResult[]>([]);

  const advance = (correct: boolean, answer?: QuizAnswer) => {
    recordAnswer(questions[index].id, correct, answer);
    setResults((r) => [...r, correct ? 'correct' : 'wrong']);
    setIndex((i) => i + 1);
  };

  if (index >= questions.length) {
    const xp = questions.reduce((sum, q, i) => sum + (results[i] === 'correct' ? q.xp : 0), 0);
    const failed = questions.filter((_, i) => results[i] === 'wrong');
    return (
      <QuizSessionComplete
        theme={theme}
        results={results}
        xpEarned={xp}
        onReview={onReview && failed.length > 0 ? () => onReview(failed) : undefined}
        onDone={() => onDone(results)}
      />
    );
  }
  return (
    <QuizQuestionScreen
      key={questions[index].id}
      theme={theme}
      question={questions[index]}
      step={index + 1}
      total={questions.length}
      world={world}
      onClose={onExit}
      onContinue={advance}
      onDevResult={SHOW_DEV_PASS_FAIL ? advance : undefined}
    />
  );
};
