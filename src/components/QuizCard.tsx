import React, { useState } from 'react';
import type { Question } from '../types';

interface QuizCardProps {
    question: Question;
    onNext: (isCorrect: boolean) => void;
}

export const QuizCard: React.FC<QuizCardProps> = ({ question, onNext }) => {
    const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
    const [isRevealed, setIsRevealed] = useState(false);

    // Reset state when question changes
    React.useEffect(() => {
        setSelectedIndices([]);
        setIsRevealed(false);
    }, [question.id]);

    const handleOptionClick = (index: number) => {
        if (isRevealed) return; // Prevent changing after reveal

        setSelectedIndices(prev =>
            prev.includes(index)
                ? prev.filter(i => i !== index)
                : [...prev, index]
        );
    };

    const checkMultipleChoice = () => {
        setIsRevealed(true);
    };

    const handleSelfEvaluation = (isCorrect: boolean) => {
        onNext(isCorrect);
    };

    // Multiple Choice Logic
    if (question.type === 'multiple_choice' && question.options.length > 0) {
        const isCorrect = JSON.stringify([...selectedIndices].sort()) === JSON.stringify([...question.correctIndices].sort());

        return (
            <div className="card">
                <h3 className="text-secondary">Question {question.id}</h3>
                <p className="question-text">{question.question}</p>

                <div className="options-list">
                    {question.options.map((option, idx) => {
                        const isSelected = selectedIndices.includes(idx);
                        const isCorrectOption = question.correctIndices.includes(idx);

                        let className = "option-item";
                        if (isRevealed) {
                            if (isCorrectOption) className += " correct";
                            else if (isSelected) className += " wrong"; // Selected but wrong
                        } else {
                            if (isSelected) className += " selected";
                        }

                        return (
                            <div
                                key={idx}
                                className={className}
                                onClick={() => handleOptionClick(idx)}
                            >
                                <span className="option-marker">{String.fromCharCode(97 + idx)}.</span>
                                <span>{option}</span>
                            </div>
                        );
                    })}
                </div>

                {!isRevealed ? (
                    <button className="btn btn-primary btn-block" onClick={checkMultipleChoice} disabled={selectedIndices.length === 0}>
                        Check Answer
                    </button>
                ) : (
                    <div className="answer-reveal">
                        <p className="answer-label">Result</p>
                        <h4 style={{ color: isCorrect ? 'var(--success)' : 'var(--error)' }}>
                            {isCorrect ? 'Correct!' : 'Incorrect'}
                        </h4>
                        <p style={{ marginTop: '0.5rem', opacity: 0.8 }}>
                            {isCorrect ? 'Great job.' : `The correct answer(s): ${question.correctIndices.map(i => String.fromCharCode(97 + i)).join(', ')}`}
                        </p>
                        <div style={{ marginTop: '1rem' }}>
                            <button className="btn btn-primary" onClick={() => onNext(isCorrect)}>
                                Next Question
                            </button>
                        </div>
                        {question.answerText && (
                            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                                <p className="answer-label">Explanation / Full Text</p>
                                <p>{question.answerText}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    }

    // Open Question Logic (or Fallback for parsed glitches)
    return (
        <div className="card">
            <h3 className="text-secondary">Question {question.id}</h3>
            <p className="question-text">{question.question}</p>

            {!isRevealed ? (
                <button className="btn btn-primary" onClick={() => setIsRevealed(true)}>
                    Show Answer
                </button>
            ) : (
                <div className="answer-reveal">
                    <p className="answer-label">Correct Answer</p>
                    <p style={{ marginBottom: '1.5rem', whiteSpace: 'pre-wrap' }}>{question.answerText}</p>

                    <p className="answer-label">Did you get it right?</p>
                    <div className="self-check-buttons">
                        <button
                            className="btn btn-primary"
                            style={{ background: 'var(--success)' }}
                            onClick={() => handleSelfEvaluation(true)}
                        >
                            Yes, Correct
                        </button>
                        <button
                            className="btn btn-primary"
                            style={{ background: 'var(--error)' }}
                            onClick={() => handleSelfEvaluation(false)}
                        >
                            No, Incorrect
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
