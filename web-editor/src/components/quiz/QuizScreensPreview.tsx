import React from 'react';
import { AppTheme } from '../../types';
import { QuizQuestion, SAMPLE_QUIZ_QUESTIONS } from '../../utils/quizQuestions';
import { QuizWorldFlow } from './QuizWorldFlow';

interface Props {
  theme: AppTheme;
  onBack: () => void;
}

const WORLD = { id: 'preview-world', order: 1, title: 'Kotlin Awakening' };

/** Placeholder content only: the 7 sample questions, one of each type. */
const PLACEHOLDER: QuizQuestion[] = SAMPLE_QUIZ_QUESTIONS;

/** Preview of the quiz flow: plays the sample questions in one go, then the result screen. */
export const QuizScreensPreview: React.FC<Props> = ({ theme, onBack }) => {
  const isDark = theme === 'dark';
  return (
    <div className={`min-h-[100dvh] flex flex-col ${isDark ? 'bg-[#070a12]' : 'bg-slate-100'}`}>
      <div className="flex-1 flex justify-center px-2 py-2">
        <div className={`w-full max-w-[420px] rounded-3xl border overflow-hidden ${isDark ? 'border-white/10' : 'border-slate-300'}`}>
          <QuizWorldFlow theme={theme} world={WORLD} questions={PLACEHOLDER} onBack={onBack} onEarnXp={() => {}} />
        </div>
      </div>
    </div>
  );
};
