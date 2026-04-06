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

export default router