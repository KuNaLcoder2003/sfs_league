import express from "express";
import cors from "cors";
import playerRoutes from "./routes/player.js";
import teamRoutes from "./routes/teams.js";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.use("/api/players", playerRoutes);
app.use("/api/teams", teamRoutes);

app.get("/api/health", (_req, res) => {
    res.json({ ok: true, message: "SFS Cricket API running" });
});

app.listen(PORT, () => {
    console.log(`🏏 Server running at http://localhost:${PORT}`);
});