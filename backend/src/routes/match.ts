import { Router, type Request, type Response } from "express";
import { prisma } from "../prisma.js"
import type { New_Match_Request_Body } from "../types.js";

const router = Router()

router.post('/start', async (req: Request, res: Response) => {
    try {
        const { team_one_id, team_two_id, toss_decision, toss_team } = req.body as New_Match_Request_Body
        if (!team_one_id || !team_two_id) {
            res.status(400).json({
                message: "Bad request, Need two teams to start a mtach",
                valid: false
            })
            return
        }
        const result = await prisma.$transaction(async (tx) => {
            const new_match = await tx.match.create({
                data: {
                    teamOneId: Number(team_one_id),
                    teamTwoId: Number(team_two_id),
                    tossDecision: toss_decision,
                    tossTeamId: Number(toss_team),
                    venue: "Community Center , SFS",
                    date: new Date(),
                    status: "Ongoing"
                }
            })
            if (!new_match) {
                throw new Error("Unable to start a match")
            }
            return { new_match }
        })
        if (!result || !result.new_match) {
            res.status(403).json({
                message: "Unable to start a match",
                valid: false
            })
            return
        }
        res.status(200).json({
            message: "Match started",
            valid: true
        })
    } catch (error) {
        console.log('Match start error : ', error)
        res.status(500).json({
            message: "Something went wrong",
            valid: false
        })
    }
})

router.get('/:id/:inningsId', async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id)
        const innings_id = Number(req.params.inningsId)
        if (isNaN(id) || isNaN(innings_id)) {
            return res.status(400).json({ message: "Invalid IDs", valid: false });
        }
        const match = await prisma.match.findUnique({
            where: {
                id: Number(id)
            }
        })
        if (!match) {
            res.status(404).json({
                message: "No match exists",
                valid: false
            })
            return
        }
        const total_innings = await prisma.innings.findMany({
            where: {
                match_id: Number(id)
            }
        })

        const innings = await prisma.innings.findUnique({
            where: {
                id: Number(innings_id)
            }
        })
        if (!innings) {
            res.status(404).json({
                message: "No inning exists",
                valid: false
            })
            return
        }
        if (match.status == "Upcoming") {
            res.status(200).json({
                message: "Match yet to start",
                valid: false
            })
            return
        }
        const result = await prisma.$transaction(async (tx) => {
            const score = await tx.score.findFirst({
                where: {
                    innings_id: Number(innings_id)
                }
            })

            if (!score) {
                throw new Error("Score not found");
            }

            const ongoing_over = await tx.overs.findFirst({
                where: {
                    match_id: Number(id),
                    innings_id: Number(innings_id)
                },
                select: {
                    id: true,
                    over_no: true,
                    bowler_id: true,
                    bowler: {
                        select: {
                            name: true,
                            id: true,
                            teamId: true
                        }
                    }
                },
                orderBy: {
                    over_no: "desc"
                },

            });
            if (!ongoing_over) {
                throw new Error("No ongoing over found");
            }

            const ball = await tx.ball.findFirst({
                where: {
                    over_id: Number(ongoing_over.id),
                    innings_id: Number(innings_id)
                },
                orderBy: {
                    ball_number: "desc"
                },
                select: {
                    ball_number: true,
                    ball_type: true,
                    extras: true,
                    runs: true,
                    batsmen_id_on_non_strike: {
                        select: {
                            id: true,
                            name: true,
                            teamId: true
                        }
                    },
                    batsmen_id_on_strike: {
                        select: {
                            id: true,
                            name: true,
                            teamId: true
                        }
                    }
                }
            })
            const overBalls = await tx.ball.findMany({
                where: {
                    over_id: ongoing_over.id,
                    innings_id: Number(innings_id)
                },
                orderBy: {
                    ball_number: "asc"
                },
                select: {
                    runs: true,
                    is_wicket: true,
                    extras: true,
                    ball_type: true
                }
            });


            const overCompleted = overBalls.filter(
                b => b.ball_type === "FAIR_BALL"
            ).length === 6;


            return { ball, ongoing_over, score, overBalls, overCompleted };
        })
        if (!result.ball || !result.score || !result.ongoing_over) {
            res.status(403).json({
                message: "Unable to get match details",
                valid: false
            })
            return
        }

        const isMatchOver: boolean = false;
        const ballsInOver = result.overBalls.filter(
            b => b.ball_type === "FAIR_BALL"
        ).length;

        const overDisplay = `${result.ongoing_over.over_no}.${ballsInOver}`;
        const totalBalls =
            (result.score.overs * 6) + ballsInOver;

        const runRate =
            totalBalls > 0
                ? (result.score.runs / totalBalls) * 6
                : 0;
        res.status(200).json({
            valid: true,
            score: result.score,
            over: overDisplay,
            balls: result.overBalls,
            balls_in_over: ballsInOver,
            over_completed: result.overCompleted,
            striker: result.ball?.batsmen_id_on_strike,
            nonStriker: result.ball?.batsmen_id_on_non_strike,
            next_action: result.overCompleted ? "NEW_OVER" : "NEXT_BALL",
            current_innings: total_innings.length == 2 ? "Second Innings" : "First Innings",
            run_rate: runRate,
            match: {
                id,
                status: match.status,
                venue: match.venue,
                teamOneId: match.teamOneId,
                teamTwoId: match.teamTwoId
            },
            innings: {
                id: innings_id,
                target: innings.target,
                runs_scored: innings.runs_scored,
                batting_team_id: innings.battingTeamId,
                bowling_team_id: innings.bowlingTeamId
            },
            is_match_over: isMatchOver
        });
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Something went wrong",
            valid: false,
            error: error
        })
    }
})

export default router