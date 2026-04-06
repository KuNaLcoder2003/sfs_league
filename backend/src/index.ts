import express from "express";
import cors from "cors";
import playerRoutes from "./routes/player.js";
import teamRoutes from "./routes/teams.js";
import inningsRouter from "./routes/innings.js"
import matchRouter from "./routes/match.js"
import ballRouter from "./routes/ball.js"
import overRouter from "./routes/over.js"

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.use("/api/players", playerRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/innings", inningsRouter)
app.use("/api/balls", ballRouter)
app.use("/api/match", matchRouter)
app.use("/api/over", overRouter)

app.get("/api/health", (_req, res) => {
    res.json({ ok: true, message: "SFS Cricket API running" });
});

app.listen(PORT, () => {
    console.log(`🏏 Server running at http://localhost:${PORT}`);
});