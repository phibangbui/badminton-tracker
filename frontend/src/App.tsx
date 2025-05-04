import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import GamePage from './pages/GamePage';
import SessionPage from './pages/SessionPage';
import ResultsPage from './pages/ResultsPage';
import Layout from './components/Layout';
import PlayersPage from './pages/PlayersPage.tsx';
import NewSessionPage from './pages/NewSessionPage.tsx';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/sessions" replace />} />
        <Route path="/game" element={<Layout><GamePage /></Layout>} />
        <Route path="/sessions" element={<Layout><SessionPage /></Layout>} />
        <Route path="/sessions/new" element={<Layout><NewSessionPage /></Layout>} />
        <Route path="/results/:sessionId" element={<Layout><ResultsPage /></Layout>} />
        <Route path="/players" element={<Layout><PlayersPage /></Layout>} />
      </Routes>
    </Router>
  );
}
