import { Server, Socket } from 'socket.io';

export function initSocket(io: Server): void {
    io.on('connection', (socket: Socket) => {
        console.log(`🔌 Client connected: ${socket.id}`);

        socket.on('join_match', (matchId: string) => {
            socket.join(`match_${matchId}`);
            console.log(`Socket ${socket.id} → match_${matchId}`);
        });

        socket.on('leave_match', (matchId: string) => {
            socket.leave(`match_${matchId}`);
        });

        socket.on('disconnect', () => {
            console.log(`🔌 Client disconnected: ${socket.id}`);
        });
    });
}