import type { Player, Team, SellPayload, PatchPayload } from "./types";

const BASE = "http://localhost:4000/api";

// ── Players ──────────────────────────────────────────────────────────────────

export async function fetchPlayers(params?: {
    status?: string;
    teamId?: number;
    category?: string;
}): Promise<Player[]> {
    const query = new URLSearchParams();
    if (params?.status) query.set("status", params.status);
    if (params?.teamId) query.set("teamId", String(params.teamId));
    if (params?.category) query.set("category", params.category);
    const res = await fetch(`${BASE}/players?${query}`);
    if (!res.ok) throw new Error("Failed to fetch players");
    return res.json();
}

export async function patchPlayer(id: number, data: PatchPayload): Promise<Player> {
    const res = await fetch(`${BASE}/players/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update player");
    return res.json();
}

export async function sellPlayer(id: number, payload: SellPayload): Promise<Player> {
    const res = await fetch(`${BASE}/players/${id}/sell`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Failed to sell player");
    return res.json();
}

export async function releasePlayer(id: number): Promise<Player> {
    const res = await fetch(`${BASE}/players/${id}/release`, { method: "POST" });
    if (!res.ok) throw new Error("Failed to release player");
    return res.json();
}

// ── Teams ─────────────────────────────────────────────────────────────────────

export async function fetchTeams(): Promise<Team[]> {
    const res = await fetch(`${BASE}/teams`);
    if (!res.ok) throw new Error("Failed to fetch teams");
    return res.json();
}