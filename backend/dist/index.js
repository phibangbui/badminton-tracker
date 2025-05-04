"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const cors_1 = __importDefault(require("cors"));
const socket_io_1 = require("socket.io");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, { cors: { origin: '*' } });
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const path = require('path');
// Serve static frontend assets
const frontendPath = path.join(__dirname, '../../frontend/dist');
app.use(express_1.default.static(frontendPath));
const frontendRoutes = ['/', '/game', '/sessions', /^\/results\/.+$/];
frontendRoutes.forEach((route) => {
    app.get(route, (req, res) => {
        res.sendFile(path.join(frontendPath, 'index.html'));
    });
});
app.post('/api/game', async (req, res) => {
    const { teamA, teamB, scoreA, scoreB, amountBet, sessionId } = req.body;
    if (!Array.isArray(teamA) || teamA.length !== 2 ||
        !Array.isArray(teamB) || teamB.length !== 2 ||
        typeof scoreA !== 'number' || typeof scoreB !== 'number' ||
        typeof amountBet !== 'number' || typeof sessionId !== 'number') {
        res.status(400).json({ error: 'Invalid game data.' });
        return;
    }
    const winningTeam = scoreA > scoreB ? 'A' : scoreB > scoreA ? 'B' : null;
    if (!winningTeam) {
        res.status(400).json({ error: 'Ties are not supported.' });
        return;
    }
    try {
        const game = await prisma.game.create({
            data: {
                scoreA,
                scoreB,
                amountBet,
                winningTeam,
                sessionId,
                teamA: {
                    create: teamA.map((playerId) => ({
                        player: { connect: { id: playerId } },
                    })),
                },
                teamB: {
                    create: teamB.map((playerId) => ({
                        player: { connect: { id: playerId } },
                    })),
                },
            },
            include: {
                teamA: { include: { player: true } },
                teamB: { include: { player: true } },
            },
        });
        io.emit('newGame', game);
        res.status(201).json(game);
    }
    catch (err) {
        console.error('[POST /game]', err);
        res.status(500).json({ error: 'Failed to submit game' });
    }
});
app.post('/api/players', async (req, res) => {
    const name = req.body.name;
    if (!name || name.trim() === '') {
        res.status(400).json({ error: 'Name is required' });
        return;
    }
    // Prevent duplicates
    const existing = await prisma.player.findFirst({ where: { name } });
    if (existing) {
        res.status(409).json({ error: 'Player already exists' });
        return;
    }
    const newPlayer = await prisma.player.create({ data: { name: name.trim() } });
    res.json(newPlayer);
});
app.post('/api/session', async (req, res) => {
    const baseDate = new Date().toISOString().split('T')[0]; // e.g. '2025-05-03'
    try {
        // Find all sessions starting with the baseDate
        const existingSessions = await prisma.session.findMany({
            where: {
                name: {
                    startsWith: baseDate,
                },
            },
            orderBy: {
                name: 'desc',
            },
        });
        let name = baseDate;
        if (existingSessions.length > 0) {
            // Determine the next suffix
            const lastName = existingSessions[0].name; // e.g., '2025-05-03-2'
            const match = lastName.match(/-(\d+)$/);
            const nextSuffix = match ? parseInt(match[1]) + 1 : 2;
            name = `${baseDate}-${nextSuffix}`;
        }
        const session = await prisma.session.create({
            data: { name },
        });
        res.status(201).json(session);
    }
    catch (err) {
        console.error('[POST /session]', err);
        res.status(500).json({ error: 'Failed to create session' });
    }
});
app.get('/api/players', async (req, res) => {
    const players = await prisma.player.findMany();
    res.json(players);
});
app.get('/api/games', async (req, res) => {
    const sessionId = req.query.sessionId ? parseInt(req.query.sessionId) : null;
    try {
        const games = await prisma.game.findMany({
            where: sessionId ? { sessionId } : {},
            orderBy: { id: 'desc' },
            include: {
                teamA: { include: { player: true } },
                teamB: { include: { player: true } },
            },
        });
        res.json(games);
    }
    catch (err) {
        console.error('[GET /games]', err);
        res.status(500).json({ error: 'Failed to fetch games' });
    }
});
app.get('/api/sessions', async (req, res) => {
    const sessions = await prisma.session.findMany({
        orderBy: { createdAt: 'desc' },
    });
    res.json(sessions);
});
app.get('/api/session/:id/stats', async (req, res) => {
    const sessionId = parseInt(req.params.id);
    if (isNaN(sessionId)) {
        res.status(400).json({ error: 'Invalid session ID' });
        return;
    }
    try {
        const games = await prisma.game.findMany({
            where: { sessionId },
            orderBy: { id: 'asc' },
            include: {
                teamA: { include: { player: true } },
                teamB: { include: { player: true } },
            },
        });
        const playerEarnings = {};
        const playerWins = {};
        const playerLosses = {};
        const pairingStats = {};
        for (const game of games) {
            const winners = game.winningTeam === 'A' ? game.teamA : game.teamB;
            const losers = game.winningTeam === 'A' ? game.teamB : game.teamA;
            const getPairKey = (team) => [team[0].player.name, team[1].player.name].sort().join(' & ');
            const winnerPair = getPairKey(winners);
            const loserPair = getPairKey(losers);
            pairingStats[winnerPair] = {
                wins: (pairingStats[winnerPair]?.wins || 0) + 1,
                losses: pairingStats[winnerPair]?.losses || 0,
            };
            pairingStats[loserPair] = {
                wins: pairingStats[loserPair]?.wins || 0,
                losses: (pairingStats[loserPair]?.losses || 0) + 1,
            };
            for (const { player } of winners) {
                playerEarnings[player.name] = (playerEarnings[player.name] || 0) + game.amountBet;
                playerWins[player.name] = (playerWins[player.name] || 0) + 1;
            }
            for (const { player } of losers) {
                playerEarnings[player.name] = (playerEarnings[player.name] || 0) - game.amountBet;
                playerLosses[player.name] = (playerLosses[player.name] || 0) + 1;
            }
        }
        res.json({
            sessionId,
            games,
            playerEarnings,
            playerWins,
            playerLosses,
            pairingStats,
        });
    }
    catch (err) {
        console.error('[GET /session/:id/stats]', err);
        res.status(500).json({ error: 'Failed to get session stats' });
    }
});
app.delete('/api/players/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid ID' });
        return;
    }
    // Check if player has participated in any game
    const participated = await prisma.$transaction([
        prisma.teamPlayerA.findFirst({ where: { playerId: id } }),
        prisma.teamPlayerB.findFirst({ where: { playerId: id } }),
    ]);
    if (participated[0] || participated[1]) {
        res.status(409).json({ error: 'Player has participated in a game and cannot be deleted.' });
        return;
    }
    try {
        await prisma.player.delete({ where: { id } });
        res.status(204).send();
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to delete player' });
    }
});
app.delete('/api/game/:id', async (req, res) => {
    const gameId = parseInt(req.params.id);
    if (isNaN(gameId)) {
        res.status(400).json({ error: 'Invalid game ID' });
        return;
    }
    try {
        // Delete related team entries first
        await prisma.teamPlayerA.deleteMany({ where: { gameId } });
        await prisma.teamPlayerB.deleteMany({ where: { gameId } });
        // Delete the game
        await prisma.game.delete({ where: { id: gameId } });
        res.status(204).send(); // success, no content
    }
    catch (err) {
        console.error('[DELETE /game/:id] Error:', err);
        res.status(500).json({ error: 'Failed to delete game' });
    }
});
app.delete('/api/session/:id', async (req, res) => {
    const sessionId = parseInt(req.params.id);
    if (isNaN(sessionId)) {
        res.status(400).json({ error: 'Invalid session ID' });
        return;
    }
    try {
        const gameCount = await prisma.game.count({ where: { sessionId } });
        if (gameCount > 0) {
            res.status(400).json({ error: 'Cannot delete session with games.' });
            return;
        }
        await prisma.session.delete({ where: { id: sessionId } });
        res.status(204).send();
    }
    catch (err) {
        console.error('[DELETE /session/:id]', err);
        res.status(500).json({ error: 'Failed to delete session' });
    }
});
server.listen(3001, () => console.log('Server running on http://localhost:3001'));
