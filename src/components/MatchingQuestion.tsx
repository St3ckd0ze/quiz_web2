import React, { useState, useEffect } from 'react';
import type { Question } from '../types';

interface MatchingQuestionProps {
    question: Question;
    onAnswer: (isCorrect: boolean, answers: Record<string, string>) => void;
    onInterimChange?: (answers: Record<string, string>) => void;
    initialAnswers?: Record<string, string>;
    isRevealed: boolean;
}

export function MatchingQuestion({
    question,
    onAnswer,
    onInterimChange,
    initialAnswers = {},
    isRevealed
}: MatchingQuestionProps) {
    const [answers, setAnswers] = useState<Record<string, string>>(initialAnswers);

    useEffect(() => {
        setAnswers(initialAnswers || {});
    }, [question.id, initialAnswers]);

    const handleChange = (leftId: string, value: string) => {
        if (isRevealed) return;
        const newAnswers = { ...answers, [leftId]: value };
        setAnswers(newAnswers);
        onInterimChange?.(newAnswers);
    };
    // We just propagate state? Actually parent expects "onAnswer" to be final check?
    // Wait, QuizCard logic usually calls onAnswer when "Check" is clicked.
    // But here we need to store interim state too? 
    // For simplicity, let's just update local state and let QuizCard trigger check?
    // Ah, QuizCard needs to know if "Check" button should be enabled (all filled?).
    // Current QuizCard architecture is a bit rigid.
    // Let's defer "onAnswer" call until a "Check" button INSIDE here is clicked?
    // Or better: Let QuizCard handle the "Check" button as usual, but we need to hoist state?
    // But QuizCard doesn't hoist state for CodeQuestion either.
    // Let's use the CodeQuestion pattern: Contain everything here, including the "Check" button if needed.

    const handleCheck = () => {
        // Compare answers with question.answerPairs
        let allCorrect = true;
        if (!question.answerPairs) return; // Should not happen

        for (const leftId in question.answerPairs) {
            if (answers[leftId] !== question.answerPairs[leftId]) {
                allCorrect = false;
                break;
            }
        }
        onAnswer(allCorrect, answers);
    };

    // If we want to reuse QuizCard's "Check" button, we need to lift state. 
    // But QuizCard is generic.
    // Let's implement our own controls here like CodeQuestion.

    return (
        <div className="matching-question-container">
            <p className="question-text">{question.question}</p>

            <div className="matching-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
                {question.leftItems?.map(item => {
                    const selectedValue = answers[item.id] || '';
                    const correctValue = question.answerPairs?.[item.id];
                    const isCorrect = isRevealed && selectedValue === correctValue;
                    const isWrong = isRevealed && selectedValue !== correctValue;

                    return (
                        <React.Fragment key={item.id}>
                            <div className="left-item" style={{ padding: '0.5rem', background: '#333', borderRadius: '4px' }}>
                                {item.text}
                            </div>
                            <div className="right-item">
                                <select
                                    className="form-select" // Bootstrap-ish or custom
                                    value={selectedValue}
                                    onChange={(e) => handleChange(item.id, e.target.value)}
                                    disabled={isRevealed}
                                    style={{
                                        width: '100%',
                                        padding: '0.5rem',
                                        borderRadius: '4px',
                                        backgroundColor: isCorrect ? 'var(--success)' : isWrong ? 'var(--error)' : '#2a2a2a',
                                        color: 'white',
                                        borderColor: isCorrect ? 'green' : isWrong ? 'red' : '#555'
                                    }}
                                >
                                    <option value="" disabled>Bitte wählen...</option>
                                    {question.options.map(opt => (
                                        <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                </select>
                                {isRevealed && isWrong && (
                                    <div style={{ fontSize: '0.8rem', color: 'lightgreen', marginTop: '0.2rem' }}>
                                        Richtig: {correctValue}
                                    </div>
                                )}
                            </div>
                        </React.Fragment>
                    );
                })}
            </div>

            {!isRevealed && (
                <button
                    className="btn btn-primary"
                    onClick={handleCheck}
                    disabled={Object.keys(answers).length < (question.leftItems?.length || 0)}
                >
                    Überprüfen
                </button>
            )}

            {isRevealed && (
                <div className="result-feedback">
                    {/* Feedback handled inline */}
                </div>
            )}

        </div>
    );
}
