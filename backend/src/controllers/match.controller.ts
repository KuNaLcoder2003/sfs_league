import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../prisma.js';
import { getIO } from '../lib/io.js';

const MATCH_INCLUDE = {
    teamOne: { include: { players: true } },
    teamTwo: { include: { players: true } },
    tossTeam: true,
    winner: true,
    innings: {
        include: {
            score: true,
            battingTeam: true,
            bowlingTeam: true,
            overs: {
                include: {
                    bowler: true,
                    ball: {
                        include: {
                            batsmen_id_on_strike: true,
                            batsmen_id_on_non_strike: true,
                        },
                        orderBy: { ball_number: 'asc' as const },
                    },
                },
                orderBy: { over_no: 'asc' as const },
            },
        },
        orderBy: { innings_number: 'asc' as const },
    },
} as const;

export const getMatches = async (
    _req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const matches = await prisma.match.findMany({
            include: {
                teamOne: true,
                teamTwo: true,
                tossTeam: true,
                winner: true,
                innings: { include: { score: true, battingTeam: true } },
            },
            orderBy: { date: 'desc' },
        });
        res.json({ success: true, data: matches });
    } catch (err) {
        next(err);
    }
};

export const getMatchById = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const match = await prisma.match.findUnique({
            where: { id: Number(req.params.id) },
            include: MATCH_INCLUDE,
        });
        if (!match) {
            res.status(404).json({ success: false, message: 'Match not found' });
            return;
        }
        res.json({ success: true, data: match });
    } catch (err) {
        next(err);
    }
};

export const createMatch = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const {
            teamOneId,
            teamTwoId,
            tossTeamId,
            tossDecision,
            venue,
            date,
            match_type = 'league',
            powerplay_overs = 2,
        } = req.body;

        const total_overs = match_type === 'final' ? 10 : 8;

        const match = await prisma.match.create({
            data: {
                teamOneId: Number(teamOneId),
                teamTwoId: Number(teamTwoId),
                tossTeamId: Number(tossTeamId),
                tossDecision,
                venue,
                date: new Date(date),
                match_type,
                powerplay_overs: Number(powerplay_overs),
                total_overs,
            },
            include: {
                teamOne: { include: { players: true } },
                teamTwo: { include: { players: true } },
                tossTeam: true,
            },
        });

        res.status(201).json({ success: true, data: match });
    } catch (err) {
        next(err);
    }
};

export const getLiveScore = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const match = await prisma.match.findUnique({
            where: { id: Number(req.params.id) },
            include: MATCH_INCLUDE,
        });
        if (!match) {
            res.status(404).json({ success: false, message: 'Match not found' });
            return;
        }
        res.json({ success: true, data: match });
    } catch (err) {
        next(err);
    }
};

export const endMatch = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { winnerId, result, playerOfMatchId } = req.body;
        const match = await prisma.match.update({
            where: { id: Number(req.params.id) },
            data: {
                status: 'Finished',
                winnerId: winnerId ? Number(winnerId) : 0,
                result,
                player_of_the_match: playerOfMatchId ? Number(playerOfMatchId) : 0,
            },
            include: { teamOne: true, teamTwo: true, winner: true },
        });

        try {
            getIO().to(`match_${match.id}`).emit('match_ended', { match });
        } catch (_) { /* socket not critical */ }

        res.json({ success: true, data: match });
    } catch (err) {
        next(err);
    }
};