import { getQuizWorlds, quizProgressStats } from '../src/quizData';
import { CONTENT_STATS } from '../src/contentStats';

test('reports empty quiz progress without inventing an accuracy score', () => {
  const stats = quizProgressStats({});

  expect(stats.answeredQuestions).toBe(0);
  expect(stats.totalAnswers).toBe(0);
  expect(stats.accuracy).toBeNull();
  expect(stats.toReview).toBe(0);
  expect(stats.totalQuestions).toBeGreaterThan(0);
  expect(stats.totalQuestions).toBe(CONTENT_STATS.quizQuestions);
});

test('counts attempts and review state only for questions in the current quiz banks', () => {
  const [correctedQuestion, missedQuestion] = getQuizWorlds()[0].questions;
  const stats = quizProgressStats({
    [correctedQuestion.id]: { correct: 1, wrong: 1, last: 1, lastCorrect: true },
    [missedQuestion.id]: { correct: 0, wrong: 1, last: 2, lastCorrect: false },
    removedQuestion: { correct: 0, wrong: 4, last: 3, lastCorrect: false },
  });

  expect(stats.answeredQuestions).toBe(2);
  expect(stats.correctAnswers).toBe(1);
  expect(stats.wrongAnswers).toBe(2);
  expect(stats.totalAnswers).toBe(3);
  expect(stats.accuracy).toBe(33);
  expect(stats.toReview).toBe(1);
});
