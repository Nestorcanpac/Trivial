import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { Users, Plus, Play, Trash2 } from 'lucide-react';

const PLAYER_COLORS = [
    'bg-slate-500', 'bg-orange-500', 'bg-pink-500', 'bg-cyan-500',
    'bg-lime-500', 'bg-purple-500', 'bg-teal-500', 'bg-rose-500'
];

export default function SetupScreen() {
    const { players, addPlayer, removePlayer, startGame } = useGameStore();
    const [newPlayerName, setNewPlayerName] = useState('');

    const handleAddPlayer = (e) => {
        e.preventDefault();
        if (newPlayerName.trim() && players.length < 8) {
            // Assign a generic color not used by the 4 main questions to the player piece
            const color = PLAYER_COLORS[players.length % PLAYER_COLORS.length];

            addPlayer({
                id: Date.now().toString(),
                name: newPlayerName.trim(),
                color
            });
            setNewPlayerName('');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-slate-900 text-slate-100">
            <div className="max-w-md w-full bg-slate-800 rounded-xl shadow-2xl overflow-hidden border border-slate-700">

                <div className="p-6 bg-slate-800/50 border-b border-slate-700">
                    <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-red-400 text-center mb-2">
                        Trivial Pursuit
                    </h1>
                    <p className="text-slate-400 text-center text-sm">Añade hasta 8 jugadores para empezar</p>
                </div>

                <div className="p-6 space-y-6">
                    <form onSubmit={handleAddPlayer} className="flex gap-2">
                        <input
                            type="text"
                            value={newPlayerName}
                            onChange={(e) => setNewPlayerName(e.target.value)}
                            placeholder="Nombre del jugador..."
                            disabled={players.length >= 8}
                            className="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                        />
                        <button
                            type="submit"
                            disabled={players.length >= 8 || !newPlayerName.trim()}
                            className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg px-4 py-2 flex items-center justify-center transition-colors"
                        >
                            <Plus size={20} />
                        </button>
                    </form>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm text-slate-400 px-1">
                            <span className="flex items-center gap-1">
                                <Users size={16} /> Jugadores ({players.length}/8)
                            </span>
                        </div>

                        <ul className="space-y-2">
                            {players.length === 0 ? (
                                <li className="text-center p-4 text-slate-500 italic border border-dashed border-slate-700 rounded-lg">
                                    Ningún jugador añadido todavía
                                </li>
                            ) : (
                                players.map((player) => (
                                    <li key={player.id} className="flex items-center justify-between bg-slate-900/50 p-3 rounded-lg border border-slate-700 group hover:border-slate-500 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full shadow-inner ${player.color} flex items-center justify-center text-xs font-bold`}>
                                                {player.name.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="font-medium">{player.name}</span>
                                        </div>
                                        <button
                                            onClick={() => removePlayer(player.id)}
                                            className="text-slate-500 hover:text-red-400 p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </li>
                                ))
                            )}
                        </ul>
                    </div>
                </div>

                <div className="p-6 pt-0">
                    <button
                        onClick={startGame}
                        disabled={players.length < 2}
                        className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-500 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-emerald-500/20"
                    >
                        <Play size={20} />
                        {players.length < 2 ? 'Faltan jugadores' : 'Empezar Partida'}
                    </button>
                </div>
            </div>
        </div>
    );
}
