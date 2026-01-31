import { useState } from 'react';
import './App.css';
import rawData from './data/quiz.json';
import type { Question, QuizState } from './types';
import { QuizCard } from './components/QuizCard';

// Cast raw data to Question[] because imports from JSON are sometimes inferred loosely
const quizData = rawData as Question[];

function App() {
  const [gameState, setGameState] = useState<QuizState>('START');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [shuffledQuestions, setShuffledQuestions] = useState<Question[]>([]);

  const startQuiz = () => {
    // Shuffle questions
    const shuffled = [...quizData].sort(() => 0.5 - Math.random());
    setShuffledQuestions(shuffled);
    setCurrentQuestionIndex(0);
    setScore(0);
    setGameState('QUIZ');
  };

  const handleNext = (isCorrect: boolean) => {
    if (isCorrect) setScore(s => s + 1);

    if (currentQuestionIndex < shuffledQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setGameState('RESULT');
    }
  };

  const restart = () => {
    setGameState('START');
  };

  return (
    <div className="container">
      {gameState === 'START' && (
        <div className="card" style={{ textAlign: 'center' }}>
          <h1>Web Engineering II Quiz</h1>
          <p style={{ margin: '2rem 0', opacity: 0.8 }}>
            Prepare for your exam with {quizData.length} interactive questions.
            <br />
            Includes Multiple Choice and Open Questions.
          </p>
          <button className="btn btn-primary" onClick={startQuiz} style={{ fontSize: '1.2rem', padding: '1rem 2rem' }}>
            Start Quiz
          </button>
        </div>
      )}

      {gameState === 'QUIZ' && shuffledQuestions.length > 0 && (
        <div>
          <div className="progress-container">
            <div
              className="progress-fill"
              style={{ width: `${((currentQuestionIndex) / shuffledQuestions.length) * 100}%` }}
            />
          </div>
          {/* Key forces remount on question change to reset internal state */}
          <QuizCard
            key={shuffledQuestions[currentQuestionIndex].id}
            question={shuffledQuestions[currentQuestionIndex]}
            onNext={handleNext}
          />
          <div style={{ textAlign: 'center', marginTop: '1rem', opacity: 0.6, fontSize: '0.9rem' }}>
            Question {currentQuestionIndex + 1} of {shuffledQuestions.length}
          </div>
        </div>
      )}

      {gameState === 'RESULT' && (
        <div className="card" style={{ textAlign: 'center' }}>
          <h1>Quiz Completed!</h1>
          <div style={{ margin: '3rem 0' }}>
            <p className="answer-label">Your Score</p>
            <div style={{ fontSize: '4rem', fontWeight: 'bold', color: 'var(--primary)' }}>
              {score} <span style={{ fontSize: '2rem', color: 'var(--text-color)' }}>/ {shuffledQuestions.length}</span>
            </div>
            <p style={{ fontSize: '1.5rem', marginTop: '1rem' }}>
              {Math.round((score / shuffledQuestions.length) * 100)}% Correct
            </p>
          </div>

          <button className="btn btn-primary" onClick={restart}>
            Back to Home
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
