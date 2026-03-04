import React, { useState } from 'react';
import { useGameStore, CATEGORIES } from '../store/gameStore';

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

const OPTION_COLORS = [
    { base: 'bg-blue-700 border-blue-500 hover:bg-blue-600', selected: 'bg-blue-500 border-blue-300 ring-4 ring-blue-300/40' },
    { base: 'bg-orange-700 border-orange-500 hover:bg-orange-600', selected: 'bg-orange-500 border-orange-300 ring-4 ring-orange-300/40' },
    { base: 'bg-emerald-700 border-emerald-500 hover:bg-emerald-600', selected: 'bg-emerald-500 border-emerald-300 ring-4 ring-emerald-300/40' },
    { base: 'bg-pink-700 border-pink-500 hover:bg-pink-600', selected: 'bg-pink-500 border-pink-300 ring-4 ring-pink-300/40' },
];

export default function QuestionCard() {
    const { currentQuestion, answerQuestion } = useGameStore();
    const [selectedOption, setSelectedOption] = useState(null);
    const [revealed, setRevealed] = useState(false);

    if (!currentQuestion) return null;

    const isHEIS = currentQuestion.category === 'heis'; // comodín (?) o pregunta final
    const isRealFinalCenter = currentQuestion.isRealFinalCenter;
    const isWildcard = currentQuestion.isWildcard && !isRealFinalCenter;
    const categoryInfo = CATEGORIES[currentQuestion.category];
    const questionData = currentQuestion.questionData;

    const handleOptionClick = (option) => {
        if (revealed) return;
        setSelectedOption(option);
        setRevealed(true);
    };

    const handleConfirm = () => {
        setSelectedOption(null);
        setRevealed(false);
        answerQuestion(selectedOption);
    };

    const correct = questionData?.correctAnswer;
    const isCorrect = selectedOption === correct;

    // All HEIS (wildcard or real final) use same purple gradient
    const headerClasses = isHEIS
        ? 'bg-gradient-to-r from-purple-600 to-pink-600 p-6 flex flex-col items-center justify-center text-center space-y-2'
        : `${categoryInfo.color} p-4 flex flex-col items-center justify-center text-center`;

    return (
        <div className={`w-full max-w-2xl mx-auto mt-8 bg-slate-800 rounded-2xl shadow-2xl border ${isHEIS ? 'border-purple-500 shadow-purple-500/30' : 'border-slate-700'} overflow-hidden animate-fade-in-up`}>

            {/* Header */}
            <div className={headerClasses}>
                <span className="text-3xl mb-1">{isRealFinalCenter ? '👑' : isWildcard ? '❓' : '⭐'}</span>
                <h3 className="text-white font-black text-xl drop-shadow-md tracking-wider uppercase">
                    {isHEIS ? 'PREGUNTA HEIS' : categoryInfo.name}
                </h3>
                {isRealFinalCenter && (
                    <p className="text-purple-100 font-bold bg-white/20 px-4 py-1 rounded-full text-sm backdrop-blur-sm border border-white/30 shadow-inner">
                        ¡Adivina para ganar la partida! 👑
                    </p>
                )}
                {isWildcard && (
                    <p className="text-purple-200 text-sm bg-white/10 px-3 py-0.5 rounded-full border border-white/20">
                        Casilla comodín — ¡responde para quedarte aquí!
                    </p>
                )}
            </div>

            <div className="p-6">
                {/* Question text */}
                {questionData ? (
                    <p className="text-xl text-center font-semibold text-slate-100 mb-6 leading-snug">
                        {questionData.question}
                    </p>
                ) : (
                    <p className="text-xl text-center font-medium text-slate-400 mb-6 italic">
                        (Sin pregunta disponible)
                    </p>
                )}

                {/* Options grid */}
                {questionData && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                        {questionData.options.map((option, i) => {
                            const colors = OPTION_COLORS[i % OPTION_COLORS.length];
                            const isSelected = selectedOption === option;
                            const isCorrectOption = revealed && option === correct;
                            const isWrongSelected = revealed && isSelected && !isCorrect;

                            let optionClass = `flex items-center gap-3 border-2 text-white font-semibold py-3 px-4 rounded-xl text-base transition-all duration-200 cursor-pointer `;

                            if (revealed) {
                                if (isCorrectOption) {
                                    optionClass += 'bg-green-600 border-green-400 ring-4 ring-green-400/40 scale-[1.02]';
                                } else if (isWrongSelected) {
                                    optionClass += 'bg-red-700 border-red-500 ring-4 ring-red-400/30 opacity-80';
                                } else {
                                    optionClass += `${colors.base} opacity-50 cursor-not-allowed`;
                                }
                            } else {
                                optionClass += `${colors.base} hover:scale-[1.02] active:scale-95`;
                            }

                            return (
                                <button
                                    key={option}
                                    onClick={() => handleOptionClick(option)}
                                    disabled={revealed}
                                    className={optionClass}
                                >
                                    <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-black flex-shrink-0">
                                        {OPTION_LABELS[i]}
                                    </span>
                                    <span className="text-left">{option}</span>
                                    {isCorrectOption && <span className="ml-auto text-xl">✅</span>}
                                    {isWrongSelected && <span className="ml-auto text-xl">❌</span>}
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* Confirm button after answering */}
                {revealed && (
                    <div className="mt-2">
                        <div className={`text-center text-lg font-bold mb-4 py-2 rounded-xl ${isCorrect ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'}`}>
                            {isCorrect ? '🎉 ¡Correcto!' : `😞 Incorrecto. La respuesta era: ${correct}`}
                        </div>
                        <button
                            onClick={handleConfirm}
                            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black py-3 rounded-xl text-lg transition-all hover:scale-[1.02] active:scale-95 shadow-lg"
                        >
                            Continuar →
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
