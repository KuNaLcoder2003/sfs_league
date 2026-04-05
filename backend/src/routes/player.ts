import { Router, type Request, type Response } from "express";
import { prisma } from "../prisma.js"

const router = Router();


// GET all players (with optional filters)
router.get("/", async (req: Request, res: Response) => {
    try {
        const { status, teamId, category } = req.query;

        const players = await prisma.player.findMany({
            where: {
                ...(status ? { status: String(status) } : {}),
                ...(teamId ? { teamId: Number(teamId) } : {}),
                ...(category ? { category: String(category) } : {}),
            },
            include: { team: true },
            orderBy: { name: "asc" },
        });

        res.json(players);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch players" });
    }
});

// GET single player
router.get("/:id", async (req: Request, res: Response) => {
    try {
        const player = await prisma.player.findUnique({
            where: { id: Number(req.params.id) },
            include: { team: true },
        });

        if (!player) return res.status(404).json({ error: "Player not found" });
        res.json(player);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch player" });
    }
});

// PATCH — update category, bidPrice, status, teamId (auction actions)
router.patch("/:id", async (req: Request, res: Response) => {
    try {
        const { category, bidPrice, status, teamId } = req.body;

        const updated = await prisma.player.update({
            where: { id: Number(req.params.id) },
            data: {
                ...(category !== undefined ? { category } : {}),
                ...(bidPrice !== undefined ? { bidPrice: bidPrice === null ? null : Number(bidPrice) } : {}),
                ...(status !== undefined ? { status } : {}),
                ...(teamId !== undefined ? { teamId: teamId === null ? null : Number(teamId) } : {}),
            },
            include: { team: true },
        });

        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: "Failed to update player" });
    }
});

// POST — sell a player to a team at a price
router.post("/:id/sell", async (req: Request, res: Response) => {
    try {
        const { teamId, bidPrice } = req.body;

        if (!teamId || !bidPrice) {
            return res.status(400).json({ error: "teamId and bidPrice are required" });
        }

        const player = await prisma.player.update({
            where: { id: Number(req.params.id) },
            data: {
                status: "sold",
                teamId: Number(teamId),
                bidPrice: Number(bidPrice),
            },
            include: { team: true },
        });

        res.json(player);
    } catch (err) {
        res.status(500).json({ error: "Failed to sell player" });
    }
});

// POST — mark player as unsold (release)
router.post("/:id/release", async (req: Request, res: Response) => {
    try {
        const player = await prisma.player.update({
            where: { id: Number(req.params.id) },
            data: {
                status: "unsold",
                teamId: null,
                bidPrice: null,
            },
            include: { team: true },
        });

        res.json(player);
    } catch (err) {
        res.status(500).json({ error: "Failed to release player" });
    }
});

export default router;