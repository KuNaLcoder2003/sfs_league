import { Router, type Request, type Response } from "express";
import { prisma } from "../prisma.js"
import type { New_Over_Request_Body } from "../types.js";

const router = Router()

router.post('/newOver', async (req: Request, res: Response) => {
    try {
        const { bowler_id, match_id, innings_id, over_number } = req.body as New_Over_Request_Body
        if (!bowler_id || !match_id || !innings_id || !over_number) {
            res.status(400).json({
                message: "Bad request"
            })
            return
        }
    } catch (error) {

    }
})

export default router