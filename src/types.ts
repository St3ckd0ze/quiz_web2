export interface Question {
    id: number;
    question: string;
    type: 'multiple_choice' | 'open' | 'code' | 'matching';
    options: string[];
    answerText: string;
    correctIndices: number[];
    leftItems?: { id: string; text: string }[];
    answerPairs?: Record<string, string>;
}

export type QuizState = 'START' | 'QUIZ' | 'RESULT';

export interface UserAnswer {
    questionId: number;
    selectedIndices: number[]; // For MC
    isCorrect: boolean;
    isRevealed: boolean; // Is the answer currently revealed/checked?
    userResponse?: string; // For Code/Open questions
    matchingAnswers?: Record<string, string>; // For Matching questions: leftId -> rightValue
}
