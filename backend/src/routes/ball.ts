import { Router, type Request, type Response } from "express";
import { prisma } from "../prisma.js";
import type { New_Ball_Request_Body } from "../types.js";

const router = Router();

router.post('/newBall', async (req: Request, res: Response) => {
    try {
        const {
            over_id,
            batsmen_on_non_strike,
            batsmen_on_strike,
            ball_number,
            ball_type,
            is_boundary,
            is_wicket,
            match_id,
            innings_id,
            runs,
            extras
        } = req.body as New_Ball_Request_Body;

        if (
            !over_id ||
            !batsmen_on_non_strike ||
            !batsmen_on_strike ||
            !match_id ||
            !innings_id ||
            runs === undefined ||
            extras === undefined
        ) {
            return res.status(400).json({
                message: "Bad request",
                valid: false
            });
        }

        const result = await prisma.$transaction(async (tx) => {

            // 1️⃣ Check over exists
            const over = await tx.overs.findUnique({
                where: { id: Number(over_id) }
            });

            if (!over) {
                throw new Error("Over not found");
            }

            // 2️⃣ Count FAIR balls
            const ballCount = await tx.ball.count({
                where: {
                    over_id: Number(over_id),
                    innings_id: Number(innings_id),
                    ball_type: "FAIR_BALL"
                }
            });

            if (ball_type === "FAIR_BALL" && ballCount >= 6) {
                throw new Error("Over already completed");
            }

            // 3️⃣ Calculate totals
            const total_runs = Number(runs) + Number(extras);

            // 4️⃣ Create ball
            await tx.ball.create({
                data: {
                    match_id: Number(match_id),
                    innings_id: Number(innings_id),
                    over_id: Number(over_id),
                    runs: Number(runs),
                    extras: Number(extras),
                    is_wicket,
                    is_boundary,
                    ball_type,
                    batsmen_on_non_strike: Number(batsmen_on_non_strike),
                    batsmen_on_strike: Number(batsmen_on_strike),
                    ball_number: ballCount + 1
                }
            });

            // 5️⃣ Update over
            await tx.overs.update({
                where: { id: Number(over_id) },
                data: {
                    total_runs: { increment: total_runs },
                    wickets: is_wicket ? { increment: 1 } : 0,
                    extras: { increment: Number(extras) }
                }
            });

            // 6️⃣ Update score (safe)
            const updatedScore = await tx.score.upsert({
                where: { innings_id: Number(innings_id) },
                update: {
                    runs: { increment: total_runs },
                    wickets: is_wicket ? { increment: 1 } : 0,
                    overs: over.over_no
                },
                create: {
                    innings_id: Number(innings_id),
                    runs: total_runs,
                    wickets: is_wicket ? 1 : 0,
                    overs: over.over_no
                }
            });

            return { updatedScore };
        });

        return res.status(200).json({
            message: "Ball added successfully",
            valid: true,
            data: result,
            rotate_strike: ball_type === "FAIR_BALL" && runs % 2 !== 0
        });

    } catch (error) {
        console.error("Ball API error:", error);

        return res.status(500).json({
            message: "Something went wrong",
            valid: false
        });
    }
});

export default router;