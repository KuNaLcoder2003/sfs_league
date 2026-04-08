import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000';

type EventMap = Record<string, (data: unknown) => void>;

export function useSocket(matchId: number | null, events: EventMap) {
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        if (!matchId) return;

        socketRef.current = io(SOCKET_URL, { transports: ['websocket'] });

        socketRef.current.emit('join_match', String(matchId));

        Object.entries(events).forEach(([evt, handler]) => {
            socketRef.current?.on(evt, handler as (...args: unknown[]) => void);
        });

        return () => {
            socketRef.current?.emit('leave_match', String(matchId));
            socketRef.current?.disconnect();
        };
    }, [matchId]); // eslint-disable-line

    return socketRef.current;
}