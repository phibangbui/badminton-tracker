// src/pages/GamePage.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { generateSchedule } from '../components/utils';
import axios from 'axios';

export default function GamePage() {
  const [players, setPlayers] = useState<{ id: number; name: string }[]>([]);
    const [teamA, setTeamA] = useState<string[]>([]);
    const [teamB, setTeamB] = useState<string[]>([]);
    const [scoreA, setScoreA] = useState('');
    const [scoreB, setScoreB] = useState('');
    const [amountBet, setAmountBet] = useState('');
    const [games, setGames] = useState<any[]>([]);
    const [numToSchedule, setNumToSchedule] = useState('');
    const [rawSchedule, setRawSchedule] = useState<[number,number][][]>([]);
    const [schedule, setSchedule] = useState<[string[],string[]][]>([]);
    const [activeSchedIdx, setActiveSchedIdx] = useState<number|null>(null);
    const [activeSessionId, setActiveSessionId] = useState<number | null>(null);
    const [struckGames, setStruckGames] = useState<Record<number, boolean>>({});
    const navigate = useNavigate();

    const handleTeamToggle = (team: 'A' | 'B', id: string) => {
      if (team === 'A') {
        if (teamA.includes(id)) {
          setTeamA((prev) => prev.filter((p) => p !== id));
        } else if (!teamB.includes(id) && teamA.length < 2) {
          setTeamA((prev) => [...prev, id]);
        }
      } else {
        if (teamB.includes(id)) {
          setTeamB((prev) => prev.filter((p) => p !== id));
        } else if (!teamA.includes(id) && teamB.length < 2) {
          setTeamB((prev) => [...prev, id]);
        }
      }
    };

    // When user submits # of games
    const handleSchedule = () => {
      const n = parseInt(numToSchedule, 10);
      if (isNaN(n) || n <= 0) {
        alert('Enter a positive number');
        return;
      }
      // convert selected session players (strings) to numbers:
      const ids = players.map((p) => p.id); // or however you get your active session's players
      const raw = generateSchedule(ids, n);

      // build your lookup first
      const byId = players.reduce<Record<number,string>>(
        (acc, p) => ((acc[p.id] = p.name), acc),
        {}
      );

      // now you can safely map with byId
      setRawSchedule(raw);
      setSchedule(
        raw.map(([a, b]) => [
          a.map((id) => byId[id]),
          b.map((id) => byId[id]),
        ])
      );
    }

    useEffect(() => {
      const sessionIdFromURL = new URLSearchParams(window.location.search).get('sessionId');
    
      const initSession = async () => {
        if (sessionIdFromURL) {
          setActiveSessionId(parseInt(sessionIdFromURL));
        } else {
          try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/session`);
            setActiveSessionId(res.data.id);
          } catch (err) {
            console.error('Failed to create or fetch session:', err);
          }
        }
      };
    
      initSession();
    }, []);
    
    useEffect(() => {
      const fetchPlayers = async () => {
        try {
          const res = await axios.get(`${import.meta.env.VITE_API_URL}/players`);
          setPlayers(res.data);
        } catch (err) {
          console.error('Failed to fetch players:', err);
        }
      };
    
      fetchPlayers();
    }, []);

    useEffect(() => {
      if (!activeSessionId) return;
    
      const fetchGames = async () => {
        try {
          const res = await axios.get(`${import.meta.env.VITE_API_URL}/games?sessionId=${activeSessionId}`);
          setGames(res.data);
        } catch (err) {
          console.error('Failed to fetch games:', err);
        }
      };
    
      fetchGames();
    }, [activeSessionId]);

    const submitGame = async () => {
      if (
        teamA.length !== 2 ||
        teamB.length !== 2 ||
        !scoreA ||
        !scoreB ||
        !amountBet
      ) {
        alert('Please fill out all fields and select exactly 2 players per team.');
        return;
      }
    
      if (!activeSessionId) {
        alert('No active session found. Try refreshing the page.');
        return;
      }    

      try {
        const res = await axios.post(`${import.meta.env.VITE_API_URL}/game`, {
          teamA: teamA.map((id) => parseInt(id)),
          teamB: teamB.map((id) => parseInt(id)),
          scoreA: parseInt(scoreA),
          scoreB: parseInt(scoreB),
          amountBet: parseInt(amountBet),
          sessionId: activeSessionId,
        });
    
        setGames((prev) => [res.data, ...prev]);
    
        // Reset form
        setTeamA([]);
        setTeamB([]);
        setScoreA('');
        setScoreB('');
        setAmountBet('');
      } catch (err) {
        alert('Failed to submit game');
      }
    };
  
    const deleteGame = async (id: number) => {
      const confirmDelete = confirm('Are you sure you want to delete this game?');
      if (!confirmDelete) return;
    
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/game/${id}`);
        setGames((prev) => prev.filter((g) => g.id !== id));
      } catch (err) {
        console.error('Failed to delete game:', err);
        alert('Failed to delete game.');
      }
    };
    
    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-900 px-4 py-10">
        <div className="w-full max-w-xl space-y-10 bg-white p-6 rounded-lg shadow-md text-black mx-auto">
    
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => navigate('/')}
            className="text-sm text-blue-600 hover:underline"
          >
            ← Return to Home
          </button>
          {activeSessionId && (
            <button
              onClick={() => navigate(`/results/${activeSessionId}`)}
              className="text-lg text-blue-600 hover:text-white bg-blue-100 hover:bg-blue-600 rounded-full p-2 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-400"
              title="View Results for This Session"
              aria-label="View Results for This Session"
            >
              👀
            </button>
          )}
        </div>

        <div className="p-4 mb-6 bg-gray-50 rounded divide-y divide-blue-100">
          <h2 className="font-semibold mb-4 text-center text-xl flex items-center justify-center gap-2 !border-none !divide-none">
            <span role="img" aria-label="calendar">📅</span> Generate Schedule
          </h2>
          <div className="flex justify-center items-center gap-4 mb-2">
            <input
              type="number"
              min="1"
              placeholder="Number of games"
              value={numToSchedule}
              onChange={(e) => setNumToSchedule(e.target.value)}
              className="w-32 p-2 border rounded text-center"
            />
            <button
              onClick={handleSchedule}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Generate
            </button>
          </div>

          {schedule.length > 0 && (
            <ul className="mt-4 flex flex-col gap-2 items-start divide-y divide-blue-100 w-full">
              {schedule.map(([namesA, namesB], idx) => {
                const isActive = idx === activeSchedIdx;
                const isStruck = struckGames[idx];
                return (
                  <li
                    key={idx}
                    onClick={() => {
                      setTeamA(rawSchedule[idx][0].map(String));
                      setTeamB(rawSchedule[idx][1].map(String));
                      setActiveSchedIdx(idx);
                      setScoreA('');
                      setScoreB('');
                      setAmountBet('');
                    }}
                    className={`cursor-pointer rounded grid grid-cols-[1fr_auto] gap-4 px-4 py-3 transition-colors duration-150 select-none w-full ${isActive ? 'bg-blue-50' : 'bg-white hover:bg-gray-50'}`}
                  >
                    <div className="grid grid-cols-2 gap-4 items-center">
                      <span className={`flex items-center gap-2 min-w-0 ${isStruck ? 'line-through text-gray-400' : ''}`}> 
                        <span className="text-blue-600 text-lg">🟦</span>
                        <span className="font-medium text-blue-700 truncate">{namesA.join(' & ')}</span>
                      </span>
                      <span className={`flex items-center gap-2 min-w-0 justify-self-end ${isStruck ? 'line-through text-gray-400' : ''}`}> 
                        <span className="text-pink-600 text-lg">🟥</span>
                        <span className="font-medium text-pink-700 truncate">{namesB.join(' & ')}</span>
                      </span>
                    </div>
                    <button
                      type="button"
                      className={`ml-2 text-xl p-1 rounded-full transition-colors duration-150 ${isStruck ? 'bg-green-200' : 'bg-gray-100 hover:bg-green-100'}`}
                      onClick={e => {
                        e.stopPropagation();
                        setStruckGames((prev) => ({ ...prev, [idx]: !prev[idx] }));
                      }}
                      aria-label="Strike out game"
                      title="Strike out game"
                    >
                      🏸
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>


        <h2 className="text-2xl font-bold text-center">🏸 Log a Badminton Game</h2>
    
        {/* Team Selectors */}
        <div className="space-y-6">
            <div className="space-y-2">
            <h2 className="text-lg font-semibold">Select Team A</h2>
            <div className="flex flex-wrap gap-2">
                {players.map((p) => {
                const idStr = String(p.id);
                const isInA = teamA.includes(idStr);
                const isInB = teamB.includes(idStr);
                const isDisabled = isInB || (!isInA && teamA.length >= 2);
    
                return (
                    <button
                    key={p.id}
                    onClick={() => handleTeamToggle('A', idStr)}
                    disabled={isDisabled}
                    className={`px-4 py-2 rounded-full font-semibold border border-gray-400 bg-gray-100 text-gray-900 ${
                        isDisabled ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    >
                    {p.name} {isInA ? '🟦' : isInB ? '🟥' : ''}
                    </button>
                );
                })}
            </div>
            </div>
    
            <div className="space-y-2">
            <h2 className="text-lg font-semibold">Select Team B</h2>
            <div className="flex flex-wrap gap-2">
                {players.map((p) => {
                const idStr = String(p.id);
                const isInA = teamA.includes(idStr);
                const isInB = teamB.includes(idStr);
                const isDisabled = isInA || (!isInB && teamB.length >= 2);
    
                return (
                    <button
                    key={p.id}
                    onClick={() => handleTeamToggle('B', idStr)}
                    disabled={isDisabled}
                    className={`px-4 py-2 rounded-full font-semibold border border-gray-400 bg-gray-100 text-gray-900 ${
                        isDisabled ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    >
                    {p.name} {isInA ? '🟦' : isInB ? '🟥' : ''}
                    </button>
                );
                })}
            </div>
            </div>
        </div>
    
        {/* Game Summary */}
        <div className="p-4 rounded-md bg-gray-50 border border-gray-300">
            <h3 className="text-md font-semibold mb-2">📝 Game Summary</h3>
            <div className="text-sm">
            <p>
                <strong>Team A:</strong>{' '}
                {teamA
                .map((id) => players.find((p) => p.id === Number(id))?.name + ' 🟦')
                .join(', ') || 'None'}
            </p>
            <p>
                <strong>Team B:</strong>{' '}
                {teamB
                .map((id) => players.find((p) => p.id === Number(id))?.name + ' 🟥')
                .join(', ') || 'None'}
            </p>
            </div>
        </div>
    
        {/* Score & Bet Inputs */}
        <div className="grid sm:grid-cols-2 gap-4">
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                🟦 Team A Score
            </label>
            <input
                type="number"
                value={scoreA}
                onChange={(e) => setScoreA(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-200"
                placeholder="e.g. 21"
            />
            </div>
    
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                🟥 Team B Score
            </label>
            <input
                type="number"
                value={scoreB}
                onChange={(e) => setScoreB(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-red-200"
                placeholder="e.g. 18"
            />
            </div>
    
            <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
                💰 Bet Amount
            </label>
            <input
                type="number"
                value={amountBet}
                onChange={(e) => setAmountBet(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-yellow-200"
                placeholder="e.g. 10"
            />
            </div>
        </div>
    
        <button
            onClick={submitGame}
            className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 w-full"
        >
            Submit Game
        </button>

        {/* Recent Games */}
        <div className="mt-10">
          <h2 className="text-xl font-bold mb-4">📜 Recent Games</h2>
          <div className="space-y-4 bg-white/80 rounded-2xl shadow-xl p-4">
            {games.map((game, idx) => {
                const teamAPlayers = game.teamA.map((tp: { player: { name: string } }) => tp.player.name).join(' & ');
                const teamBPlayers = game.teamB.map((tp: { player: { name: string } }) => tp.player.name).join(' & ');         
                const isAWinner = game.winningTeam === 'A';
                const isBWinner = game.winningTeam === 'B';

                return (
                  <div
                    key={game.id}
                    className={`p-4 bg-gradient-to-br from-blue-50 via-white to-gray-100 rounded-xl shadow flex items-center gap-4 hover:shadow-lg transition-all duration-200${idx !== games.length - 1 ? ' border-b border-blue-100' : ''}`}
                  >
                    <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center sm:gap-4">
                      <div className="mb-1 sm:mb-0">
                        <span className={`font-semibold ${isAWinner ? 'text-blue-600' : ''}`}>🟦 {teamAPlayers}</span>{' '}
                        vs{' '}
                        <span className={`font-semibold ${isBWinner ? 'text-red-600' : ''}`}>🟥 {teamBPlayers}</span>
                      </div>
                      <div className="text-sm text-gray-700 flex items-center gap-2">
                        Score: {game.scoreA} - {game.scoreB} | 💰 Bet: ${game.amountBet}
                        <button
                          onClick={() => deleteGame(game.id)}
                          className="ml-2 text-sm text-gray-500 hover:text-white bg-gray-100 hover:bg-red-600 rounded-full p-2 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-red-400"
                          title="Delete game"
                          aria-label="Delete game"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                );
            })}
          </div>
        </div>

        </div>
    </div>
    );
}
