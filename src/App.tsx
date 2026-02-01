import { useState, useEffect } from 'react';
import './App.css';
import rawData from './data/quiz.json';
import type { Question, QuizState, UserAnswer } from './types';
import { QuizCard } from './components/QuizCard';

// Cast raw data to Question[] because imports from JSON are sometimes inferred loosely
const quizData = rawData as Question[];
const STORAGE_KEY = 'quiz_app_state_v1';

interface SavedState {
  gameState: QuizState;
  currentQuestionIndex: number;
  shuffledQuestions: Question[];
  userAnswers: Record<number, UserAnswer>;
}

function App() {
  const [gameState, setGameState] = useState<QuizState>('START');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [shuffledQuestions, setShuffledQuestions] = useState<Question[]>([]);
  const [userAnswers, setUserAnswers] = useState<Record<number, UserAnswer>>({});

  // Load state on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed: SavedState = JSON.parse(saved);
        setGameState(parsed.gameState);
        setCurrentQuestionIndex(parsed.currentQuestionIndex);
        setShuffledQuestions(parsed.shuffledQuestions);
        setUserAnswers(parsed.userAnswers);
      } catch (e) {
        console.error("Failed to load saved state", e);
      }
    }
  }, []);

  // Save state on change
  useEffect(() => {
    if (gameState === 'START') return; // Don't save initial empty state if just starting fresh
    const state: SavedState = {
      gameState,
      currentQuestionIndex,
      shuffledQuestions,
      userAnswers
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [gameState, currentQuestionIndex, shuffledQuestions, userAnswers]);

  const startQuiz = (mode: 'standard' | 'code') => {
    // 1. Filter questions based on mode
    let initialQuestions = quizData;
    if (mode === 'standard') {
      initialQuestions = quizData.filter(q => q.type !== 'code');
    } else if (mode === 'code') {
      initialQuestions = quizData.filter(q => q.type === 'code');
    }

    // 2. Parse and deep copy raw data
    const deepCopiedQuestions: Question[] = JSON.parse(JSON.stringify(initialQuestions));

    // 3. Shuffle Options within each question if it's multiple choice
    const processedQuestions = deepCopiedQuestions.map(q => {
      if (q.type !== 'multiple_choice' || !q.options || q.options.length === 0) {
        return q;
      }

      // Create pairs of [option, originalIndex]
      const pairs = q.options.map((opt, i) => ({ opt, originalIndex: i }));

      // Shuffle the options
      pairs.sort(() => 0.5 - Math.random());

      // Extract shuffled options
      const newOptions = pairs.map(p => p.opt);

      // Remap correct indices
      // We essentially want to know: "Where did the correct answers go?"
      const newCorrectIndices = pairs
        .map((p, newIndex) => ({ originalIndex: p.originalIndex, newIndex }))
        .filter(p => q.correctIndices.includes(p.originalIndex))
        .map(p => p.newIndex)
        .sort((a, b) => a - b); // Keep indices sorted for easier comparison later

      return {
        ...q,
        options: newOptions,
        correctIndices: newCorrectIndices
      };
    });

    // 4. Shuffle the order of questions themselves
    const shuffled = processedQuestions.sort(() => 0.5 - Math.random());

    setShuffledQuestions(shuffled);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setGameState('QUIZ');
  };

  const clearStorageAndRestart = () => {
    localStorage.removeItem(STORAGE_KEY);
    setGameState('START');
    setShuffledQuestions([]);
    setUserAnswers({});
    setCurrentQuestionIndex(0);
  };

  const handleAnswerSubmit = (answer: UserAnswer) => {
    setUserAnswers(prev => ({
      ...prev,
      [answer.questionId]: answer
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < shuffledQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setGameState('RESULT');
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const calculateScore = () => {
    return Object.values(userAnswers).filter(a => a.isCorrect).length;
  };

  return (
    <div className="container">
      {gameState === 'START' && (
        <div className="card" style={{ textAlign: 'center' }}>
          <h1>Web Engineering II Quiz</h1>
          <p style={{ margin: '2rem 0', opacity: 0.8 }}>
            Wähle einen Modus für die Prüfungsvorbereitung:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
            <button
              className="btn btn-primary"
              onClick={() => startQuiz('standard')}
              style={{ fontSize: '1.2rem', padding: '1rem 2rem', minWidth: '300px' }}
            >
              Standard Quiz
            </button>

            <button
              className="btn btn-secondary"
              onClick={() => startQuiz('code')}
              style={{ fontSize: '1.2rem', padding: '1rem 2rem', minWidth: '300px' }}
            >
              Coding Challenges
            </button>
          </div>

          <p style={{ marginTop: '2rem', fontSize: '0.9rem', opacity: 0.5 }}>
            {quizData.length} Fragen insgesamt verfügbar.
          </p>
        </div>
      )}

      {gameState === 'QUIZ' && shuffledQuestions.length > 0 && (
        <div>
          <div className="progress-container">
            <div
              className="progress-fill"
              style={{ width: `${((currentQuestionIndex + 1) / shuffledQuestions.length) * 100}%` }}
            />
          </div>

          <QuizCard
            key={shuffledQuestions[currentQuestionIndex].id}
            question={shuffledQuestions[currentQuestionIndex]}
            savedAnswer={userAnswers[shuffledQuestions[currentQuestionIndex].id]}
            onAnswer={handleAnswerSubmit}
            onNext={handleNext}
            onPrevious={handlePrevious}
            showPrevious={currentQuestionIndex > 0}
            isLast={currentQuestionIndex === shuffledQuestions.length - 1}
          />

          <div style={{ textAlign: 'center', marginTop: '1rem', opacity: 0.6, fontSize: '0.9rem' }}>
            Question {currentQuestionIndex + 1} of {shuffledQuestions.length}
          </div>

          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <button className="btn btn-secondary" style={{ fontSize: '0.8rem' }} onClick={clearStorageAndRestart}>
              Restart Quiz (Reset Progress)
            </button>
          </div>
        </div>
      )}

      {gameState === 'RESULT' && (
        <div className="card" style={{ textAlign: 'center' }}>
          <h1>Quiz Completed!</h1>
          <div style={{ margin: '3rem 0' }}>
            <p className="answer-label">Your Score</p>
            <div style={{ fontSize: '4rem', fontWeight: 'bold', color: 'var(--primary)' }}>
              {calculateScore()} <span style={{ fontSize: '2rem', color: 'var(--text-color)' }}>/ {shuffledQuestions.length}</span>
            </div>
            <p style={{ fontSize: '1.5rem', marginTop: '1rem' }}>
              {Math.round((calculateScore() / shuffledQuestions.length) * 100)}% Correct
            </p>
          </div>

          <button className="btn btn-primary" onClick={clearStorageAndRestart}>
            Back to Home
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
