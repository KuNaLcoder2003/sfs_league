import type { Request, Response, NextFunction } from 'express';
import { prisma } from "../prisma.js"

export const getTeams = async (
    _req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const teams = await prisma.team.findMany({
            include: {
                players: { orderBy: { name: 'asc' } },
                ranking: true,
            },
            orderBy: { name: 'asc' },
        });
        res.json({ success: true, data: teams });
    } catch (err) {
        next(err);
    }
};

export const getTeamById = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const team = await prisma.team.findUnique({
            where: { id: Number(req.params.id) },
            include: {
                players: { orderBy: { name: 'asc' } },
                ranking: true,
            },
        });
        if (!team) {
            res.status(404).json({ success: false, message: 'Team not found' });
            return;
        }
        res.json({ success: true, data: team });
    } catch (err) {
        next(err);
    }
};