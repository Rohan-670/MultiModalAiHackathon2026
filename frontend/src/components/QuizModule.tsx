import React from 'react';
import { MarksQuizModule } from './MarksQuizModule';
import type { Citation } from '../types';

interface QuizModuleProps {
  onCitationClick: (cit: Citation) => void;
  onNavigateToReport: () => void;
  onUpdateLearnerProfile?: () => void;
  initialTopic?: string;
}

/**
 * MARKS-Style Quiz & Custom Test Module
 * Features custom test generation based on student requirements,
 * NTA CBT test simulator, chapter PYQ bank, and smart notebook.
 */
export const QuizModule: React.FC<QuizModuleProps> = (props) => {
  return <MarksQuizModule {...props} />;
};

export { MarksQuizModule };
