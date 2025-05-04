// src/pages/NewSessionPage.tsx
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

type Player = {
  id: number;
  name: string;
};

const MAX_PLAYERS = 6;

export default function NewSessionPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

   // Fetch all players on mount
   useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const res = await axios.get<{ id: number; name: string }[]>(
          `${import.meta.env.VITE_API_URL}/players`
        );
        setPlayers(res.data);
      } catch (err) {
        console.error('Failed to load players', err);
        setError('Could not load players.');
      }
    };
    fetchPlayers();
  }, []);

  const toggle = (id: number) => {
    setError('');
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : prev.length < MAX_PLAYERS
        ? [...prev, id]
        : prev
    );
  };

  const handleCreate = async () => {
    if (selected.length === 0) {
      setError('Select at least one player.');
      return;
    }
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/session`,
        { playerIds: selected }
      );
      const session = res.data;
      // Navigate to GamePage with sessionId as query
      navigate(`/game?sessionId=${session.id}`);
    } catch (err: any) {
      console.error('Create session failed', err);
      setError(err.response?.data?.error || 'Could not create session.');
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6">
      <Link to="/sessions" className="text-sm text-blue-600 hover:underline">
        ← Back to Sessions
      </Link>

      <h1 className="text-2xl font-bold text-center">
        🎯 Select Players for New Session
      </h1>

      {error && (
        <p className="text-red-600 text-sm text-center">{error}</p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {players.map((p) => {
          const isSelected = selected.includes(p.id);
          const disabled =
            !isSelected && selected.length >= MAX_PLAYERS;
          return (
            <button
              key={p.id}
              onClick={() => toggle(p.id)}
              disabled={disabled}
              className={`
                px-4 py-2 rounded border font-medium
                ${isSelected
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-800 border-gray-300'}
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-500'}
              `}
            >
              {p.name} {isSelected && '✅'}
            </button>
          );
        })}
      </div>

      <button
        onClick={handleCreate}
        disabled={selected.length === 0}
        className={`
          w-full mt-4 p-2 rounded text-white font-semibold
          ${selected.length > 0
            ? 'bg-green-600 hover:bg-green-700'
            : 'bg-gray-400 cursor-not-allowed'}
        `}
      >
        Create Session ({selected.length}/{MAX_PLAYERS})
      </button>
    </div>
  );
}
