import { useEffect, useState } from 'react';
import { Link, useNavigate  } from 'react-router-dom';
import axios from 'axios';

type Session = {
  id: number;
  name: string;
  createdAt: string;
};

export default function SessionPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/sessions`);
        setSessions(res.data);
      } catch (err) {
        console.error('Failed to fetch sessions:', err);
      }
    };
    fetchSessions();
  }, []);

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <button
          onClick={() => navigate('/players')}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          ➕ Add a player
        </button>
        <button
          onClick={() => navigate('/sessions/new')}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          ➕ Create Today’s Session
        </button>
      </div>
      <h1 className="text-2xl font-bold text-center">📅 Game Sessions</h1>
      <div className="space-y-4 bg-white/80 rounded-2xl shadow-xl p-4">
        {sessions.map((s, idx) => (
          <div
            key={s.id}
            className={`p-4 bg-gradient-to-br from-blue-50 via-white to-gray-100 rounded-xl shadow flex items-center gap-4 hover:shadow-lg transition-all duration-200${idx !== sessions.length - 1 ? ' border-b border-blue-100' : ''}`}
          >
            <Link to={`/game?sessionId=${s.id}`} className="flex-1 min-w-0 text-blue-600 hover:underline font-medium truncate">
              📆 {s.name}
            </Link>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate(`/results/${s.id}`)}
                className="text-lg text-blue-600 hover:text-white bg-blue-100 hover:bg-blue-600 rounded-full p-2 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-400"
                title="Review Results"
                aria-label="Review Results"
              >
                👀
              </button>
              <button
                onClick={async () => {
                  if (!confirm(`Delete session ${s.name}? Only empty sessions can be deleted.`)) return;
                  try {
                    await axios.delete(`${import.meta.env.VITE_API_URL}/session/${s.id}`);
                    setSessions((prev) => prev.filter((sess) => sess.id !== s.id));
                  } catch (err: any) {
                    alert(err.response?.data?.error || 'Could not delete session.');
                  }
                }}
                className="text-lg text-gray-500 hover:text-white bg-gray-100 hover:bg-red-600 rounded-full p-2 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-red-400"
                title="Delete session"
                aria-label="Delete session"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
