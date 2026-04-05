import { Router, type Request, type Response } from "express";
import { prisma } from "../prisma.js"

const router = Router();


// GET all teams with their players
router.get("/", async (_req: Request, res: Response) => {
    try {
        const teams = await prisma.team.findMany({
            include: {
                players: { orderBy: { name: "asc" } },
            },
            orderBy: { id: "asc" },
        });
        res.json(teams);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch teams" });
    }
});

// GET single team
router.get("/:id", async (req: Request, res: Response) => {
    try {
        const team = await prisma.team.findUnique({
            where: { id: Number(req.params.id) },
            include: {
                players: { orderBy: { name: "asc" } },
            },
        });

        if (!team) return res.status(404).json({ error: "Team not found" });
        res.json(team);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch team" });
    }
});

// POST — create team
router.post("/", async (req: Request, res: Response) => {
    try {
        const { name, color, emoji } = req.body;
        const team = await prisma.team.create({ data: { name, color, emoji } });
        res.status(201).json(team);
    } catch (err) {
        res.status(500).json({ error: "Failed to create team" });
    }
});

export default router;