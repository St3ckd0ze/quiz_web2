import React, { useState, useEffect } from 'react';
import type { Question, UserAnswer } from '../types';

interface QuizCardProps {
    question: Question;
    savedAnswer?: UserAnswer;
    onAnswer: (answer: UserAnswer) => void;
    onNext: () => void;
    onPrevious: () => void;
    showPrevious: boolean;
    isLast: boolean;
}

export const QuizCard: React.FC<QuizCardProps> = ({
    question,
    savedAnswer,
    onAnswer,
    onNext,
    onPrevious,
    showPrevious,
    isLast
}) => {
    const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
    const [isRevealed, setIsRevealed] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);

    // Initialize from saved state or reset
    useEffect(() => {
        if (savedAnswer) {
            setSelectedIndices(savedAnswer.selectedIndices);
            setIsRevealed(savedAnswer.isRevealed);
            setIsCorrect(savedAnswer.isCorrect);
        } else {
            setSelectedIndices([]);
            setIsRevealed(false);
            setIsCorrect(false);
        }
    }, [question.id, savedAnswer]);

    const handleOptionClick = (index: number) => {
        if (isRevealed) return;
        setSelectedIndices(prev =>
            prev.includes(index)
                ? prev.filter(i => i !== index)
                : [...prev, index]
        );
    };

    const saveState = (revealed: boolean, correct: boolean) => {
        onAnswer({
            questionId: question.id,
            selectedIndices: selectedIndices,
            isCorrect: correct,
            isRevealed: revealed
        });
    };

    const checkMultipleChoice = () => {
        const selectedSorted = [...selectedIndices].sort((a, b) => a - b);
        const correctSorted = [...question.correctIndices].sort((a, b) => a - b);
        const correct = JSON.stringify(selectedSorted) === JSON.stringify(correctSorted);

        setIsRevealed(true);
        setIsCorrect(correct);
        saveState(true, correct);
    };

    const handleSelfEvaluation = (correct: boolean) => {
        setIsCorrect(correct);
        setIsRevealed(true); // Should already be true if we see buttons, but good for sanity
        saveState(true, correct);
        // Auto-advance or let user click next? 
        // Requirement said "confirm". Let's update state and let them click next.
    };

    // Render Logic
    return (
        <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h3 className="text-secondary">Question {question.id}</h3>
                {isRevealed && (
                    <span style={{
                        color: isCorrect ? 'var(--success)' : 'var(--error)',
                        fontWeight: 'bold'
                    }}>
                        {isCorrect ? '✓ Correct' : '✗ Incorrect'}
                    </span>
                )}
            </div>

            <p className="question-text">{question.question}</p>

            {/* Multiple Choice Options */}
            {question.type === 'multiple_choice' && (
                <div className="options-list">
                    {question.options.map((option, idx) => {
                        const isSelected = selectedIndices.includes(idx);
                        const isCorrectOption = question.correctIndices.includes(idx);

                        let className = "option-item";
                        if (isRevealed) {
                            if (isCorrectOption) className += " correct";
                            else if (isSelected) className += " wrong";
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
            )}

            {/* Actions Area */}
            {!isRevealed ? (
                <div style={{ marginTop: '2rem' }}>
                    {question.type === 'multiple_choice' ? (
                        <button
                            className="btn btn-primary btn-block"
                            onClick={checkMultipleChoice}
                            disabled={selectedIndices.length === 0}
                        >
                            Check Answer
                        </button>
                    ) : (
                        <button
                            className="btn btn-primary"
                            onClick={() => setIsRevealed(true)}
                        >
                            Show Answer
                        </button>
                    )}
                </div>
            ) : (
                <div className="answer-reveal">
                    {question.type === 'multiple_choice' ? (
                        <div>
                            <p className="answer-label">Result</p>
                            <p style={{ marginBottom: '1rem' }}>
                                {isCorrect ? 'You got it right!' : `Correct answer(s): ${question.correctIndices.map(i => String.fromCharCode(97 + i)).join(', ')}`}
                            </p>
                        </div>
                    ) : (
                        <div>
                            <p className="answer-label">Correct Answer</p>
                            <p style={{ marginBottom: '1.5rem', whiteSpace: 'pre-wrap' }}>{question.answerText}</p>

                            {/* Only show evaluation buttons if we haven't graded this yet? 
                   Actually, user might want to change their self-grade. 
                   But usually history is immutable. 
                   Let's check if 'savedAnswer' exists. If so, show what they picked.
               */}
                            {!savedAnswer ? (
                                <div className="self-check-buttons">
                                    <button
                                        className="btn btn-primary"
                                        style={{ background: 'var(--success)' }}
                                        onClick={() => handleSelfEvaluation(true)}
                                    >
                                        Yes, I knew it
                                    </button>
                                    <button
                                        className="btn btn-primary"
                                        style={{ background: 'var(--error)' }}
                                        onClick={() => handleSelfEvaluation(false)}
                                    >
                                        No, missed it
                                    </button>
                                </div>
                            ) : (
                                <p style={{ fontStyle: 'italic', opacity: 0.8 }}>
                                    You marked this as: <strong>{savedAnswer.isCorrect ? 'Correct' : 'Incorrect'}</strong>
                                </p>
                            )}
                        </div>
                    )}

                    {/* Detailed Explanation / Full Text always shown after reveal */}
                    {question.type === 'multiple_choice' && question.answerText && (
                        <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                            <p className="answer-label">Explanation / Full Text</p>
                            <p>{question.answerText}</p>
                        </div>
                    )}
                </div>
            )}

            {/* Navigation Footer */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)' }}>
                <button
                    className="btn btn-secondary"
                    onClick={onPrevious}
                    disabled={!showPrevious}
                    style={{ visibility: showPrevious ? 'visible' : 'hidden' }}
                >
                    ← Previous
                </button>

                {/* Show Next only if revealed (answered) OR if we are reviewing history (savedAnswer exists)
            Actually user wants to skip? Probably not. Enforce answering.
         */}
                {(isRevealed || savedAnswer) && (
                    <button className="btn btn-primary" onClick={onNext}>
                        {isLast ? 'Finish Quiz' : 'Next →'}
                    </button>
                )}
            </div>
        </div>
    );
};
