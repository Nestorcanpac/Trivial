import React from 'react';
import { useGameStore, CATEGORIES } from '../store/gameStore';

export default function PlayerDashboard() {
    const { players, currentPlayerIndex } = useGameStore();

    return (
        <div className="bg-slate-800 p-4 border-t border-slate-700 w-full overflow-x-auto">
            <div className="flex gap-4 min-w-max">
                {players.map((player, index) => {
                    const isCurrentTurn = index === currentPlayerIndex;

                    return (
                        <div
                            key={player.id}
                            className={`flex flex-col items-center p-3 rounded-lg border-2 transition-all min-w-[120px] ${isCurrentTurn
                                    ? 'border-blue-500 bg-slate-700/80 scale-105 shadow-[0_0_15px_rgba(59,130,246,0.5)]'
                                    : 'border-transparent bg-slate-900/50 opacity-70'
                                }`}
                        >
                            <div className="flex items-center gap-2 mb-2 w-full">
                                <div className={`w-4 h-4 rounded-full ${player.color} shadow-sm shrink-0`} />
                                <span className={`font-bold truncate text-sm ${isCurrentTurn ? 'text-white' : 'text-slate-300'}`}>
                                    {player.name}
                                </span>
                            </div>

                            {/* Wedges indicator */}
                            <div className="grid grid-cols-2 gap-1 w-full mt-1">
                                {Object.values(CATEGORIES).map(cat => {
                                    const hasWedge = player.wedges.includes(cat.id);
                                    return (
                                        <div
                                            key={cat.id}
                                            title={cat.name}
                                            className={`h-3 rounded-sm ${hasWedge ? cat.color + ' shadow-sm' : 'bg-slate-800 border border-slate-700'}`}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
