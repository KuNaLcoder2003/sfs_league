import { Router, type Request, type Response } from "express";
import { prisma } from "../prisma.js"
import type { New_Over_Request_Body } from "../types.js";

const router = Router()

const MAX_OVERS: number = 2;

router.post('/newOver', async (req: Request, res: Response) => {
    try {
        const { bowler_id, match_id, innings_id } = req.body as New_Over_Request_Body
        if (!bowler_id || !match_id || !innings_id) {
            res.status(400).json({
                message: "Bad request",
                valid: false
            })
            return
        }
        const result = await prisma.$transaction(async (tx) => {
            let task_success: boolean = false
            const overs = await tx.overs.findMany({
                where: {
                    innings_id: Number(innings_id)
                }
            })

            if (overs.length == MAX_OVERS) {
                const runs = ([...overs].reduce((a, b) => a + b.total_runs, 0)) * 2
                const wickets = [...overs].reduce((a, b) => a + b.wickets, 0)
                let final_runs: number = runs - (wickets * 2)
                await tx.score.update({
                    where: {
                        innings_id: Number(innings_id)
                    },
                    data: {
                        wickets: wickets,
                        runs: final_runs,
                        overs: overs.length
                    }
                })
            }
            const new_over = await tx.overs.create({
                data: {
                    bowler_id: Number(bowler_id),
                    innings_id: Number(innings_id),
                    match_id: Number(match_id),
                    over_no: overs.length + 1
                }
            })
            if (!new_over) {
                task_success = false
            }
            else {
                task_success = true
            }
            return { task_success }
        })
        if (!result.task_success) {
            res.status(403).json({
                message: "Unable to start new over",
                valid: false
            })
            return
        }
        res.status(200).json({
            message: "New Over started",
            valid: true
        })
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