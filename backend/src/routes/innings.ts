import { Router, type Request, type Response } from "express";
import { prisma } from "../prisma.js"
import type { Innings_Request_Body, Second_Innings_Start_Body } from "../types.js";

const router = Router()

router.post('/start', async (req: Request, res: Response) => {
    try {
        const { batting_team_id, bowling_team_id, match_id } = req.body as Innings_Request_Body
        if (!bowling_team_id || !batting_team_id || !match_id) {
            res.status(400).json({
                message: "Bad request",
                valid: false
            })
            return
        }
        const match_exists = await prisma.match.findFirst({
            where: {
                id: Number(match_id),
                status: "Ongoing",
            }
        })
        if (!match_exists) {
            res.status(401).json({
                message: "The match has either not stareted or not scheduled",
                valid: false
            })
            return
        }
        const result = await prisma.$transaction(async (tx) => {
            const new_innings = await tx.innings.create({
                data: {
                    match_id: Number(match_id),
                    battingTeamId: Number(batting_team_id),
                    bowlingTeamId: Number(bowling_team_id)
                }
            })
            if (!new_innings) {
                throw new Error("Unable to start a new Inning")
            }
            return { new_innings }
        })
        if (!result || !result.new_innings) {
            res.status(403).json({
                message: "Unable to start a new Inning",
                valid: false
            })
            return
        }
        res.status(200).json({
            message: "Innings started",
            valid: true
        })
    } catch (error) {
        console.log("Innings starting error : ", error)
        res.status(500).json({
            message: "Something went wrong",
            valid: false,
            error: error
        })
    }
})

router.post('/startSecondInnings', async (req: Request, res: Response) => {
    try {
        const { batting_team_id, bowling_team_id, runs_scored_in_first_innings, overs_bowled_in_first_innings, firt_innings_id } = req.body as Second_Innings_Start_Body
        if (!firt_innings_id || !batting_team_id || !bowling_team_id) {
            res.status(400).json({
                message: "Bad request",
                valid: false
            })
            return
        }
        const first_innings = await prisma.innings.findFirst({
            where: {
                id: Number(firt_innings_id)
            }
        })
        if (!first_innings) {
            res.status(400).json({
                message: "Can not start Second innings without first innings",
                valid: false
            })
            return
        }
        const result = await prisma.$transaction(async (tx) => {
            const first_innings_overs = await tx.overs.findMany({
                where: {
                    innings_id: Number(firt_innings_id)
                }
            })
            const total_runs = [...first_innings_overs].reduce((a, b) => a + b.total_runs, 0)
            first_innings.overs_bowled = first_innings_overs.length
            first_innings.runs_scored = total_runs
            first_innings.target = total_runs + 1
            const updated = await tx.innings.update({
                where: {
                    id: first_innings.id
                },
                data: {
                    ...first_innings
                }
            })
            const second_innings = await tx.innings.create({
                data: {
                    match_id: first_innings.match_id,
                    battingTeamId: Number(batting_team_id),
                    bowlingTeamId: Number(bowling_team_id)
                }
            })

            return { second_innings, updated }
        })
        if (!result || !result.second_innings || !result.updated) {
            res.status(403).json({
                message: "Unable to end first innings and Start a new Innings"
            })
            return
        }
    } catch (error) {
        console.log("Second Innings starting error : ", error)
        res.status(500).json({
            message: "Something went wrong",
            valid: false,
            error: error
        })
    }
})

export default router