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
        <h1 className="text-2xl font-bold">📅 Game Sessions</h1>
        {/* Navigate to the new session page */}
        <button
          onClick={() => navigate('/sessions/new')}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          ➕ Create Today’s Session
        </button>
      </div>

      <div className="space-y-3">
        {sessions.map((s) => (
          <div
            key={s.id}
            className="p-4 border rounded shadow-sm bg-white flex justify-between items-center"
          >
            <Link to={`/game?sessionId=${s.id}`} className="text-blue-600 hover:underline">
              📆 {s.name} <span className="text-sm text-gray-500 ml-2"></span>
            </Link>
              
              <br>
              </br>

            <Link to={`/results/${s.id}`} className="text-sm text-blue-600 hover:underline">
              View Results →
            </Link>

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
              className="text-sm text-red-600 hover:underline"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
