export interface Question {
    id: number;
    question: string;
    type: 'multiple_choice' | 'open';
    options: string[];
    answerText: string;
    correctIndices: number[];
}

export type QuizState = 'START' | 'QUIZ' | 'RESULT';
