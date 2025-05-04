import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function ResultsPage() {
  const { sessionId } = useParams();
  const [stats, setStats] = useState<{
    games: any[];
    playerEarnings: Record<string, number>;
    playerWins: Record<string, number>;
    playerLosses: Record<string, number>;
    pairingStats: Record<string, { games: number; wins: number; losses: number }>;
  } | null>(null);

  console.log('Loaded stats:', stats);
  console.log('Viewing results for session:', sessionId);

  useEffect(() => {
    const fetchStats = async () => {
      if (!sessionId) {
        console.error('No sessionId in URL');
        return;
      }
  
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/session/${sessionId}/stats`);
        console.log('Fetched stats:', res.data);
        setStats({
          games: res.data.games ?? [],
          playerEarnings: res.data.playerEarnings ?? {},
          playerWins: res.data.playerWins ?? {},
          playerLosses: res.data.playerLosses ?? {},
          pairingStats: res.data.pairingStats ?? {},
        });
      } catch (err: any) {
        console.error('Failed to load stats:', err.response?.data || err.message || err);
        setStats({ games: [], playerEarnings: {}, playerWins: {}, playerLosses: {}, pairingStats: {} }); // fallback instead of null
      }
    };
  
    fetchStats();
  }, [sessionId]);
  
  if (!stats) {
    return <div className="p-6 text-center text-gray-500">Loading session results...</div>;
  }

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-center">📊 Results for Session #{sessionId}</h1>

      <div>
        <h2 className="text-lg font-semibold mb-2">Player Stats</h2>
        {Object.keys(stats.playerEarnings).length === 0 ? (
          <p className="text-sm text-gray-500">No stats available — no games logged.</p>
        ) : (
          <ul className="space-y-2">
            {Object.entries(stats.playerEarnings).map(([name, amount]) => {
              const wins = stats.playerWins[name] || 0;
              const losses = stats.playerLosses[name] || 0;
              const isPositive = amount >= 0;

              return (
                <li
                  key={name}
                  className={`p-3 rounded-md border ${
                    isPositive ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-800">{name}</span>
                    <span
                      className={`text-sm font-bold ${
                        isPositive ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      💵 {isPositive ? `+$${amount}` : `-$${Math.abs(amount)}`}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    🏆 {wins}W / {losses}L
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div>
        <h2 className="text-lg font-semibold mt-4 mb-2">Team Pairing Stats</h2>
        {Object.keys(stats.pairingStats).length === 0 ? (
          <p className="text-sm text-gray-500">No pairings recorded.</p>
        ) : (
          <ul className="bg-white rounded border p-3 space-y-1 text-sm">
            {Object.entries(stats.pairingStats).map(([pair, data]) => (
              <li key={pair} className="flex justify-between">
                <span>{pair}</span>
                <span>
                  🏆 {data.wins}W / {data.losses}L
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h2 className="text-lg font-semibold mt-4 mb-2">Games</h2>
        {stats.games.length === 0 ? (
          <p className="text-sm text-gray-500">No games recorded for this session.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {stats.games.map((game: any) => {
              const teamA = Array.isArray(game.teamA)
                ? game.teamA.map((tp: any) => tp.player.name).join(' & ')
                : 'Unknown Team A';
              
              const teamB = Array.isArray(game.teamB)
                ? game.teamB.map((tp: any) => tp.player.name).join(' & ')
                : 'Unknown Team B';
                const isAWinner = game.winningTeam === 'A';

              return (
                <li key={game.id} className="bg-white p-3 border rounded">
                  <div>
                    <span className={`font-semibold ${isAWinner ? 'text-blue-600' : ''}`}>🟦 {teamA}</span>
                    {' vs '}
                    <span className={`font-semibold ${!isAWinner ? 'text-red-600' : ''}`}>🟥 {teamB}</span>
                  </div>
                  <div className="text-xs text-gray-600">
                    Score: {game.scoreA}–{game.scoreB} | 💰 ${game.amountBet}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="text-center pt-4">
        <Link to="/sessions" className="text-blue-600 hover:underline">
          ← Back to Sessions
        </Link>
      </div>
    </div>
  );
}
