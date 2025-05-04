import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function PlayersPage() {
  const [players, setPlayers] = useState<{ id: number; name: string }[]>([]);
  const [newPlayer, setNewPlayer] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState<string>('');

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

  const addPlayer = async () => {
    if (!newPlayer.trim()) return alert('Name cannot be empty');

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/players`, {
        name: newPlayer.trim(),
      });
      setPlayers((prev) => [...prev, res.data]);
      setNewPlayer('');
    } catch (err: any) {
      if (err.response?.status === 409) alert('Player already exists');
      else alert('Error adding player');
    }
  };

  const deletePlayer = async (id: number) => {
    const confirmDelete = confirm('Are you sure you want to delete this player?');
    if (!confirmDelete) return;

    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/players/${id}`);
      setPlayers((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      if (err.response?.status === 409) {
        alert('Player has participated in a game and cannot be deleted.');
      } else {
        alert('Failed to delete player');
      }
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6">

        <div className="mb-4">
        <Link to="/sessions" className="text-sm text-blue-600 hover:underline">
            ← Back to Sessions
        </Link>
        </div>


      <h1 className="text-2xl font-bold text-center">👥 Manage Players</h1>

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="New player name"
          className="p-2 border rounded w-full"
          value={newPlayer}
          onChange={(e) => setNewPlayer(e.target.value)}
        />
        <button
          className="bg-green-600 text-white px-4 rounded hover:bg-green-700"
          onClick={addPlayer}
        >
          Add
        </button>
      </div>

      <select
        value={selectedPlayer}
        onChange={(e) => setSelectedPlayer(e.target.value)}
        className="p-2 border rounded w-full"
      >
        <option value="">Select a player to delete</option>
        {players.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>

      <button
        onClick={() => {
          if (selectedPlayer) deletePlayer(parseInt(selectedPlayer));
        }}
        disabled={!selectedPlayer}
        className={`p-2 w-full rounded ${
          selectedPlayer
            ? 'bg-red-600 text-white hover:bg-red-700'
            : 'bg-gray-300 text-gray-600 cursor-not-allowed'
        }`}
      >
        Delete Selected Player
      </button>
    </div>
  );
}
