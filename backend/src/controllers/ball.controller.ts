import type { Request, Response, NextFunction } from 'express';
import { BallType } from '@prisma/client';
import { prisma } from '../prisma.js';
import { getIO } from '../lib/io.js';
import { calculateBall, parseCricketOvers } from '../services/scoring.service.js';

export const startOver = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { matchId, inningsId, bowlerId, overNo } = req.body;

        // Close previous over if exists
        const prevOver = await prisma.overs.findFirst({
            where: { innings_id: Number(inningsId), is_complete: false },
        });
        if (prevOver) {
            await prisma.overs.update({
                where: { id: prevOver.id },
                data: { is_complete: true },
            });
        }

        const over = await prisma.overs.create({
            data: {
                match_id: Number(matchId),
                innings_id: Number(inningsId),
                bowler_id: Number(bowlerId),
                over_no: Number(overNo),
            },
            include: { bowler: true },
        });

        try {
            getIO().to(`match_${matchId}`).emit('over_started', { over });
        } catch (_) { }

        res.status(201).json({ success: true, data: over });
    } catch (err) {
        next(err);
    }
};

export const recordBall = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const {
            matchId,
            inningsId,
            overId,
            overNumber,
            ballNumberInOver, // count of fair balls in this over (before this ball)
            ballType,
            strikerBatsmanId,
            nonStrikerBatsmanId,
            physicalRuns,
            isBoundary = false,
            isWicket = false,
            powerplayOvers = 2,
        } = req.body;

        // Scoring calculation 
        const calc = calculateBall(
            ballType as BallType,
            Number(physicalRuns),
            Boolean(isWicket),
            Number(overNumber),
            Number(powerplayOvers)
        );

        // Create Ball record 
        const ball = await prisma.ball.create({
            data: {
                match_id: Number(matchId),
                innings_id: Number(inningsId),
                over_id: Number(overId),
                ball_number: Number(ballNumberInOver),
                ball_type: ballType as BallType,
                batsmen_on_strike: Number(strikerBatsmanId),
                batsmen_on_non_strike: Number(nonStrikerBatsmanId),
                physical_runs: calc.physicalRuns,
                scored_runs: calc.scoredRuns,
                runs: calc.netRuns,
                extras: calc.extras,
                is_boundary: Boolean(isBoundary),
                is_wicket: Boolean(isWicket),
                is_powerplay: calc.isPowerplay,
                wicket_penalty: calc.wicketPenalty,
            },
            include: {
                batsmen_id_on_strike: true,
                batsmen_id_on_non_strike: true,
            },
        });

        // Update Over totals 
        await prisma.overs.update({
            where: { id: Number(overId) },
            data: {
                total_runs: { increment: calc.netRuns },
                ...(isWicket && { wickets: { increment: 1 } }),
                ...(calc.extras > 0 && { extras: { increment: calc.extras } }),
            },
        });

        // Count total fair balls in innings 
        const totalFairBalls = await prisma.ball.count({
            where: {
                innings_id: Number(inningsId),
                ball_type: 'FAIR_BALL',
            },
        });

        const oversDisplay = parseCricketOvers(totalFairBalls);

        // Update Innings 
        await prisma.innings.update({
            where: { id: Number(inningsId) },
            data: {
                runs_scored: { increment: calc.netRuns },
                overs_bowled: oversDisplay,
                ...(isWicket && { wickets: { increment: 1 } }),
            },
        });

        // Update Score 
        const updatedScore = await prisma.score.update({
            where: { innings_id: Number(inningsId) },
            data: {
                runs: { increment: calc.netRuns },
                overs: oversDisplay,
                ...(isWicket && { wickets: { increment: 1 } }),
            },
        });

        // Emit to all viewers
        const payload = {
            ball,
            score: updatedScore,
            calc,
            totalFairBalls,
            oversDisplay,
        };

        try {
            getIO().to(`match_${matchId}`).emit('ball_recorded', payload);
        } catch (_) { }

        res.status(201).json({ success: true, data: payload });
    } catch (err) {
        next(err);
    }
};