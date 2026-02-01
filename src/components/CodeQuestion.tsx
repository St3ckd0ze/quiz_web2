import { useState, useEffect } from 'react';
import type { Question } from '../types';
import { compareCode } from '../utils/codeComparison';
import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface CodeQuestionProps {
    question: Question;
    onAnswer: (isCorrect: boolean, code: string) => void;
    initialAnswer?: string;
}

export function CodeQuestion({ question, onAnswer, initialAnswer = '' }: CodeQuestionProps) {
    const [userCode, setUserCode] = useState(initialAnswer);
    const [feedback, setFeedback] = useState<'idle' | 'correct' | 'incorrect'>('idle');
    const [showSolution, setShowSolution] = useState(false);

    // Reset state when question changes
    useEffect(() => {
        setUserCode(initialAnswer);
        setFeedback('idle');
        setShowSolution(false);
    }, [question.id]);

    const handleCheck = () => {
        const isCorrect = compareCode(userCode, question.answerText);
        setFeedback(isCorrect ? 'correct' : 'incorrect');
        onAnswer(isCorrect, userCode);
    };

    return (
        <div className="code-question-container">
            <div className="question-text">
                <ReactMarkdown
                    remarkPlugins={[remarkBreaks]}
                    components={{
                        code({ className, children, ...props }) {
                            const match = /language-(\w+)/.exec(className || '');
                            // Extract ref to avoid TS error
                            const { ref, ...rest } = props as any;

                            return match ? (
                                <SyntaxHighlighter
                                    style={vscDarkPlus as any}
                                    language={match[1]}
                                    PreTag="div"
                                    {...rest}
                                >
                                    {String(children).replace(/\n$/, '')}
                                </SyntaxHighlighter>
                            ) : (
                                <code className={className} {...props}>
                                    {children}
                                </code>
                            );
                        }
                    }}
                >
                    {question.question}
                </ReactMarkdown>
            </div>

            <div className="editor-area" style={{ marginTop: '1rem' }}>
                <textarea
                    value={userCode}
                    onChange={(e) => setUserCode(e.target.value)}
                    placeholder="// Dein Code hier..."
                    style={{
                        width: '100%',
                        minHeight: '200px',
                        fontFamily: 'monospace',
                        padding: '10px',
                        backgroundColor: '#1e1e1e',
                        color: '#d4d4d4',
                        border: feedback === 'correct' ? '2px solid green' : feedback === 'incorrect' ? '2px solid red' : '1px solid #444',
                        borderRadius: '4px'
                    }}
                    spellCheck={false}
                />
            </div>

            <div className="controls" style={{ marginTop: '1rem', display: 'flex', gap: '10px' }}>
                <button onClick={handleCheck} className="check-btn">
                    Überprüfen
                </button>
                <button onClick={() => setShowSolution(!showSolution)} className="solution-btn">
                    {showSolution ? 'Lösung verbergen' : 'Lösung anzeigen'}
                </button>
            </div>

            {feedback === 'correct' && (
                <div style={{ color: 'lightgreen', marginTop: '10px' }}>
                    <strong>✅ Richtig!</strong> Gut gemacht.
                </div>
            )}

            {feedback === 'incorrect' && (
                <div style={{ color: 'salmon', marginTop: '10px' }}>
                    <strong>❌ Leider nicht ganz.</strong> Versuche es noch einmal oder schau dir die Lösung an.
                </div>
            )}

            {showSolution && (
                <div className="solution-display" style={{ marginTop: '20px', background: '#333', padding: '10px', borderRadius: '4px' }}>
                    <h4>Musterlösung:</h4>
                    <pre style={{
                        backgroundColor: '#1e1e1e',
                        padding: '10px',
                        overflowX: 'auto',
                        border: '1px solid #555'
                    }}>
                        <code>{question.answerText}</code>
                    </pre>
                </div>
            )}
        </div>
    );
}
