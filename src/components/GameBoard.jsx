import React, { useMemo } from 'react';
import { useGameStore, CATEGORIES, BOARD_SPACES, RING_SIZE } from '../store/gameStore';
import QuestionCard from './QuestionCard';
import { Star, CircleDot } from 'lucide-react';

export default function GameBoard() {
    const { players, diceRoll, rollDice, currentPlayerIndex, currentQuestion, isMoving, wildcardSpaces } = useGameStore();
    const currentPlayer = players[currentPlayerIndex];

    // Calculate positions for all spaces based on the new graph
    const spacesLayout = useMemo(() => {
        const ringRadius = 260;
        let layout = [];

        // Ring (36 spaces)
        for (let i = 0; i < RING_SIZE; i++) {
            const angle = (i / RING_SIZE) * 2 * Math.PI - Math.PI / 2;
            const x = Math.cos(angle) * ringRadius;
            const y = Math.sin(angle) * ringRadius;
            layout.push({ ...BOARD_SPACES[`ring-${i}`], x, y });
        }

        // Center
        layout.push({ ...BOARD_SPACES['center'], x: 0, y: 0 });

        // Spokes — point to wedge positions 0, 9, 18, 27
        const spokeWedgeIndices = [0, 9, 18, 27];
        const targetsAngles = spokeWedgeIndices.map(
            idx => (idx / RING_SIZE) * 2 * Math.PI - Math.PI / 2
        );

        for (let s = 0; s < 4; s++) {
            const angle = targetsAngles[s];
            for (let i = 0; i < 5; i++) {
                const stepRadius = 50 + (i * 35);
                const x = Math.cos(angle) * stepRadius;
                const y = Math.sin(angle) * stepRadius;
                layout.push({ ...BOARD_SPACES[`spoke-${s}-${i}`], x, y });
            }
        }

        return layout;
    }, []);

    return (
        <div className="flex-1 flex flex-col items-center p-6 w-full max-w-6xl mx-auto overflow-hidden">
            <div className="w-full flex justify-between items-center mb-8 bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 backdrop-blur-sm mt-4">
                <div>
                    <h2 className="text-3xl font-extrabold text-white mb-2 flex items-center gap-3 tracking-tight">
                        Turno de
                        <span className={`px-4 py-1 rounded-full text-slate-900 shadow-md ${currentPlayer?.color} transition-all`}>
                            {currentPlayer?.name}
                        </span>
                    </h2>
                    <p className="text-slate-400 text-lg font-medium">Tira el dado para jugar</p>
                </div>

                <div className="flex flex-col items-center gap-3 z-10">
                    <button
                        onClick={rollDice}
                        disabled={currentQuestion !== null || isMoving}
                        className={`w-20 h-20 rounded-2xl flex items-center justify-center text-4xl font-black shadow-[0_0_30px_rgba(79,70,229,0.3)] transition-all transform ${currentQuestion !== null || isMoving
                            ? 'bg-slate-700 text-slate-500 cursor-not-allowed scale-95 shadow-none'
                            : 'bg-gradient-to-br from-indigo-500 via-purple-500 to-fuchsia-500 hover:from-indigo-400 hover:via-purple-400 hover:to-fuchsia-400 text-white hover:scale-105 hover:-translate-y-1 active:scale-95'
                            }`}
                    >
                        {diceRoll || '?'}
                    </button>
                    <span className="text-sm text-slate-400 font-bold uppercase tracking-widest">{isMoving ? 'Moviendo...' : 'Lanzar'}</span>
                </div>
            </div>

            <div className="flex-1 w-full flex items-center justify-center gap-8 relative min-h-[600px]">
                {/* Logo HEIS al lado del tablero */}
                <div className="flex-shrink-0 hidden lg:block bg-white rounded-2xl p-6 shadow-lg border border-slate-200/80">
                    <img
                        src={`${import.meta.env.BASE_URL}heis.png`}
                        alt="HEIS global - Packaging Healthcare"
                        className="h-52 w-auto max-w-[260px] object-contain object-center opacity-95 hover:opacity-100 transition-opacity"
                    />
                </div>

                {/* Visual Board Layout */}
                <div className={`relative w-[600px] h-[600px] transition-all duration-500 ${currentQuestion ? 'scale-90 opacity-40 blur-[2px] pointer-events-none' : 'scale-100 opacity-100'}`}>

                    {/* Render Spaces (no player tokens here) */}
                    {spacesLayout.map((space) => {
                        const isWildcard = wildcardSpaces && wildcardSpaces.has(space.id);
                        const catColor = isWildcard ? 'bg-slate-600' : CATEGORIES[space.category].color;

                        let spaceClasses = `absolute top-1/2 left-1/2 rounded-lg flex items-center justify-center border-2 border-slate-900 shadow-md transition-all ${catColor}`;

                        if (space.isCenter) {
                            spaceClasses += " w-20 h-20 rounded-full z-10 border-4 shadow-2xl";
                        } else if (space.isWedge) {
                            spaceClasses += " w-14 h-14 ring-4 ring-white/30 z-20 shadow-[0_0_20px_inherit]";
                        } else if (isWildcard) {
                            spaceClasses += " w-10 h-10 ring-2 ring-white/40 z-10 border-slate-500";
                        } else {
                            spaceClasses += " w-10 h-10 opacity-80";
                        }

                        return (
                            <div
                                key={space.id}
                                className={spaceClasses}
                                style={{
                                    transform: `translate(calc(-50% + ${space.x}px), calc(-50% + ${space.y}px))`
                                }}
                            >
                                {space.isCenter && <CircleDot size={40} className="text-white fill-white/20" />}
                                {space.isWedge && <Star size={24} className="text-white fill-white/40" />}
                                {isWildcard && (
                                    <span className="text-white font-black text-base leading-none select-none">?</span>
                                )}
                            </div>
                        );
                    })}

                    {/* Player tokens rendered ABOVE all spaces */}
                    {spacesLayout.map((space) => {
                        const playersHere = players.filter(p => p.position === space.id);
                        if (playersHere.length === 0) return null;

                        const sortedPlayers = [...playersHere].sort((a, b) => {
                            if (a.id === currentPlayer?.id) return 1;
                            if (b.id === currentPlayer?.id) return -1;
                            return 0;
                        });

                        return (
                            <div
                                key={`tokens-${space.id}`}
                                className="absolute top-1/2 left-1/2 pointer-events-none"
                                style={{
                                    transform: `translate(calc(-50% + ${space.x}px), calc(-50% + ${space.y}px))`,
                                    zIndex: 100,
                                }}
                            >
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-wrap justify-center items-center gap-1 w-[50px] pointer-events-none z-50">
                                    {sortedPlayers.map((p, i) => {
                                        const isCurrent = p.id === currentPlayer?.id;
                                        return (
                                            <div
                                                key={p.id}
                                                className={`rounded-full ${p.color} border-2 shadow-xl transition-all duration-300 ${isCurrent
                                                    ? 'w-7 h-7 border-white ring-2 ring-white/50 animate-pulse z-10'
                                                    : 'w-4 h-4 border-slate-900 animate-bounce'
                                                    }`}
                                                style={{ animationDelay: `${i * 0.1}s` }}
                                                title={p.name}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Question Layer overlayed on center when active */}
                {currentQuestion && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl z-50">
                        <QuestionCard />
                    </div>
                )}
            </div>

            {/* Legend */}
            <div className="mt-4 flex flex-wrap justify-center gap-3 text-xs text-slate-400">
                {Object.values(CATEGORIES).map(cat => (
                    <div key={cat.id} className="flex items-center gap-1.5">
                        <span className={`inline-block w-3 h-3 rounded-sm ${cat.color}`}></span>
                        <span>{cat.name}</span>
                    </div>
                ))}
                <div className="flex items-center gap-1.5">
                    <span className="inline-block w-3 h-3 rounded-sm bg-slate-600 border border-white/30 text-white font-black text-[8px] flex items-center justify-center leading-none">?</span>
                    <span>Comodín</span>
                </div>
            </div>
        </div>
    );
}
