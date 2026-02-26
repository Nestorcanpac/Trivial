import React from 'react';
import { useGameStore } from './store/gameStore';
import SetupScreen from './components/SetupScreen';
import GameBoard from './components/GameBoard';
import PlayerDashboard from './components/PlayerDashboard';

function App() {
  const { status, winner, resetGame } = useGameStore();

  if (status === 'setup') {
    return <SetupScreen />;
  }

  if (status === 'gameover') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-slate-100 p-6 text-center">
        <div className="bg-slate-800 p-12 rounded-3xl border border-slate-700 shadow-2xl animate-fade-in-up">
          <div className="w-32 h-32 mx-auto rounded-full bg-slate-700 flex items-center justify-center mb-6 shadow-inner relative overflow-hidden">
            <div className={`absolute inset-0 opacity-40 ${winner?.color}`} />
            <div className={`w-20 h-20 rounded-full ${winner?.color} shadow-[0_0_30px_inherit] relative z-10 animate-bounce`} />
          </div>
          <h1 className="text-5xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500">
            ¡Ganador!
          </h1>
          <p className="text-3xl text-white font-bold mb-8">
            {winner?.name} ha censeguido los 4 quesitos
          </p>
          <button
            onClick={resetGame}
            className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl text-xl font-bold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-blue-500/30"
          >
            Nueva Partida
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-900 text-slate-100">
      <PlayerDashboard />
      <GameBoard />
    </div>
  );
}

export default App;
