import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../prisma.js';
import { getIO } from '../lib/io.js';

export const startInnings = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { matchId, battingTeamId, bowlingTeamId, inningsNumber, target } = req.body;

        // Mark match as ongoing
        await prisma.match.update({
            where: { id: Number(matchId) },
            data: { status: 'Ongoing' },
        });

        const innings = await prisma.innings.create({
            data: {
                match_id: Number(matchId),
                battingTeamId: Number(battingTeamId),
                bowlingTeamId: Number(bowlingTeamId),
                innings_number: Number(inningsNumber) || 1,
                target: target ? Number(target) : 0,
            },
            include: {
                battingTeam: { include: { players: true } },
                bowlingTeam: { include: { players: true } },
            },
        });

        // Create Score record
        await prisma.score.create({
            data: { innings_id: innings.id },
        });

        try {
            getIO().to(`match_${matchId}`).emit('innings_started', { innings });
        } catch (_) { }

        res.status(201).json({ success: true, data: innings });
    } catch (err) {
        next(err);
    }
};

export const getInningsById = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const innings = await prisma.innings.findUnique({
            where: { id: Number(req.params.id) },
            include: {
                score: true,
                battingTeam: { include: { players: true } },
                bowlingTeam: { include: { players: true } },
                overs: {
                    include: {
                        bowler: true,
                        ball: {
                            include: {
                                batsmen_id_on_strike: true,
                                batsmen_id_on_non_strike: true,
                            },
                            orderBy: { ball_number: 'asc' },
                        },
                    },
                    orderBy: { over_no: 'asc' },
                },
            },
        });

        if (!innings) {
            res.status(404).json({ success: false, message: 'Innings not found' });
            return;
        }

        res.json({ success: true, data: innings });
    } catch (err) {
        next(err);
    }
};

export const completeInnings = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const innings = await prisma.innings.update({
            where: { id: Number(req.params.id) },
            data: { is_complete: true },
            include: { score: true, battingTeam: true },
        });

        try {
            getIO().to(`match_${innings.match_id}`).emit('innings_complete', { innings });
        } catch (_) { }

        res.json({ success: true, data: innings });
    } catch (err) {
        next(err);
    }
};