import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';

import { setIO } from './lib/io.js';
import { initSocket } from './socket/socket.js';
import { errorHandler } from './middleware/error.js';

import teamRoutes from './routes/teams.routes.js';
import matchRoutes from './routes/match.routes.js';
import inningsRoutes from './routes/innings.routes.js';
import ballRoutes from './routes/ball.routes.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        methods: ['GET', 'POST', 'PUT'],
    },
});

setIO(io);
initSocket(io);

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json());

app.use('/api/teams', teamRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/innings', inningsRoutes);
app.use('/api/balls', ballRoutes);

app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'SFS Cricket League API' });
});

app.use(errorHandler);

const PORT = Number(process.env.PORT) || 4000;
httpServer.listen(PORT, () => {
    console.log(`🏏 SFS Cricket League API → http://localhost:${PORT}`);
});