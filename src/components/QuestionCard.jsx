import React from 'react';
import { useGameStore, CATEGORIES } from '../store/gameStore';

export default function QuestionCard() {
    const { currentQuestion, answerQuestion } = useGameStore();

    if (!currentQuestion) return null;

    const isHEIS = currentQuestion.isFinalCenter;
    const categoryInfo = CATEGORIES[currentQuestion.category];

    const headerClasses = isHEIS
        ? "bg-gradient-to-r from-purple-600 to-pink-600 p-6 flex flex-col items-center justify-center text-center space-y-2"
        : `${categoryInfo.color} p-4 flex items-center justify-between`;

    const headerText = isHEIS ? "⭐ PREGUNTA HEIS ⭐" : categoryInfo.name;

    return (
        <div className={`w-full max-w-2xl mx-auto mt-8 bg-slate-800 rounded-2xl shadow-2xl border ${isHEIS ? 'border-purple-500 shadow-purple-500/30' : 'border-slate-700'} overflow-hidden animate-fade-in-up`}>
            <div className={headerClasses}>
                <h3 className="text-white font-black text-2xl drop-shadow-md tracking-wider uppercase">
                    {headerText}
                </h3>
                {isHEIS && (
                    <p className="text-purple-100 font-bold bg-white/20 px-4 py-1 rounded-full text-sm backdrop-blur-sm border border-white/30 shadow-inner">
                        ¡Adivina para ganar la partida!
                    </p>
                )}
            </div>

            <div className="p-8">
                <p className="text-2xl text-center font-medium text-slate-100 mb-8 leading-snug">
                    {isHEIS ? "Responde a la misteriosa pregunta HEIS final." : "Responde a la pregunta de la tarjeta física."}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <button
                        onClick={() => answerQuestion(true)}
                        className="bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-xl text-xl transition-transform hover:scale-105 active:scale-95 shadow-lg flex items-center justify-center gap-2"
                    >
                        <span className="text-2xl">✅</span> Acertada
                    </button>
                    <button
                        onClick={() => answerQuestion(false)}
                        className="bg-red-600 hover:bg-red-500 text-white font-bold py-4 rounded-xl text-xl transition-transform hover:scale-105 active:scale-95 shadow-lg flex items-center justify-center gap-2"
                    >
                        <span className="text-2xl">❌</span> Fallada
                    </button>
                </div>
            </div>
        </div>
    );
}
