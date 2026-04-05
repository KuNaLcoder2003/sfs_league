import { useState } from "react";
import type { Player, Team, Category } from "../types";
import { sellPlayer, releasePlayer, patchPlayer } from "../api";

// ── Helpers ───────────────────────────────────────────────────────────────────

const AVATAR_PALETTE = [
    "#f59e0b", "#ef4444", "#10b981", "#8b5cf6",
    "#ec4899", "#06b6d4", "#f97316",
];

const CATEGORY_META: Record<Category, { label: string; color: string; bg: string }> = {
    Dhurandhar: { label: "Dhurandhar", color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
    Shoorveer: { label: "Shoorveer", color: "#10b981", bg: "rgba(16,185,129,0.12)" },
    Yodha: { label: "Yodha", color: "#38bdf8", bg: "rgba(56,189,248,0.12)" },
};

const CATEGORIES: Category[] = ["Dhurandhar", "Shoorveer", "Yodha"];

function getInitials(name: string): string {
    return name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
}

function avatarColor(name: string): string {
    return AVATAR_PALETTE[name.charCodeAt(0) % AVATAR_PALETTE.length];
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface PlayerCardProps {
    player: Player;
    teams: Team[];
    onUpdate: (updated: Player) => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function PlayerCard({ player, teams, onUpdate }: PlayerCardProps) {
    const [bidInput, setBidInput] = useState<string>(
        player.bidPrice ? String(player.bidPrice) : ""
    );
    const [selectedTeam, setSelectedTeam] = useState<string>(
        player.teamId ? String(player.teamId) : ""
    );
    const [loading, setLoading] = useState(false);

    const isSold = player.status === "sold";
    //@ts-ignore
    const catMeta = player.category ? CATEGORY_META[player.category] : null;

    async function handleCategoryToggle(cat: Category) {
        const next = player.category === cat ? null : cat;
        setLoading(true);
        try {
            const updated = await patchPlayer(player.id, { category: next });
            onUpdate(updated);
        } finally {
            setLoading(false);
        }
    }

    async function handleSell() {
        if (!selectedTeam || !bidInput) return;
        setLoading(true);
        try {
            const updated = await sellPlayer(player.id, {
                teamId: Number(selectedTeam),
                bidPrice: Number(bidInput),
            });
            onUpdate(updated);
        } finally {
            setLoading(false);
        }
    }

    async function handleRelease() {
        setLoading(true);
        try {
            const updated = await releasePlayer(player.id);
            onUpdate(updated);
            setBidInput("");
            setSelectedTeam("");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div
            style={{
                background: "linear-gradient(145deg, #1a1a2e 0%, #16213e 100%)",
                border: isSold
                    ? `1.5px solid ${player.team?.color ?? "#10b981"}60`
                    : "1.5px solid #2a2a3e",
                borderRadius: 16,
                overflow: "hidden",
                opacity: loading ? 0.7 : 1,
                transition: "all 0.2s ease",
                position: "relative",
            }}
        >
            {/* Sold glow strip */}
            {isSold && (
                <div
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 3,
                        background: player.team?.color ?? "#10b981",
                    }}
                />
            )}

            {/* Header */}
            <div style={{ padding: "16px 16px 12px", display: "flex", gap: 12, alignItems: "flex-start" }}>
                {/* Avatar */}
                <div
                    style={{
                        width: 44,
                        height: 44,
                        borderRadius: "50%",
                        background: avatarColor(player.name),
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 700,
                        fontSize: 14,
                        color: "#fff",
                        flexShrink: 0,
                        fontFamily: "Georgia, serif",
                    }}
                >
                    {getInitials(player.name)}
                </div>

                {/* Name + meta */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                        style={{
                            margin: 0,
                            fontFamily: "Georgia, serif",
                            fontWeight: 700,
                            fontSize: 14,
                            color: "#f1f5f9",
                            lineHeight: 1.3,
                        }}
                    >
                        {player.name}
                    </p>
                    <p style={{ margin: "2px 0 0", fontFamily: "sans-serif", fontSize: 11, color: "#64748b" }}>
                        Age {player.age} · {player.mobile}
                    </p>
                </div>

                {/* Status badge */}
                <span
                    style={{
                        fontFamily: "sans-serif",
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: "0.08em",
                        padding: "3px 8px",
                        borderRadius: 20,
                        background: isSold ? "rgba(16,185,129,0.15)" : "rgba(100,116,139,0.15)",
                        color: isSold ? "#10b981" : "#94a3b8",
                        border: `1px solid ${isSold ? "#10b98140" : "#334155"}`,
                        textTransform: "uppercase",
                        flexShrink: 0,
                    }}
                >
                    {isSold ? "✓ SOLD" : "UNSOLD"}
                </span>
            </div>

            {/* Category buttons */}
            <div style={{ padding: "0 16px 12px", display: "flex", gap: 6 }}>
                {CATEGORIES.map((cat) => {
                    const m = CATEGORY_META[cat];
                    const active = player.category === cat;
                    return (
                        <button
                            key={cat}
                            onClick={() => handleCategoryToggle(cat)}
                            disabled={loading}
                            style={{
                                flex: 1,
                                padding: "5px 0",
                                borderRadius: 8,
                                border: `1px solid ${active ? m.color + "80" : "#334155"}`,
                                background: active ? m.bg : "transparent",
                                color: active ? m.color : "#475569",
                                fontFamily: "sans-serif",
                                fontSize: 10,
                                fontWeight: 600,
                                cursor: "pointer",
                                transition: "all 0.15s",
                            }}
                        >
                            {m.label}
                        </button>
                    );
                })}
            </div>

            {/* Sold info OR auction controls */}
            {isSold ? (
                <div
                    style={{
                        margin: "0 16px 16px",
                        padding: "10px 12px",
                        borderRadius: 10,
                        background: `${player.team?.color ?? "#10b981"}12`,
                        border: `1px solid ${player.team?.color ?? "#10b981"}30`,
                    }}
                >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                            <p style={{ margin: 0, fontFamily: "sans-serif", fontSize: 10, color: "#64748b" }}>
                                SOLD TO
                            </p>
                            <p
                                style={{
                                    margin: "2px 0 0",
                                    fontFamily: "Georgia, serif",
                                    fontSize: 13,
                                    fontWeight: 700,
                                    color: player.team?.color ?? "#10b981",
                                }}
                            >
                                {player.team?.emoji} {player.team?.name}
                            </p>
                        </div>
                        <div style={{ textAlign: "right" }}>
                            <p style={{ margin: 0, fontFamily: "sans-serif", fontSize: 10, color: "#64748b" }}>
                                BID PRICE
                            </p>
                            <p
                                style={{
                                    margin: "2px 0 0",
                                    fontFamily: "Georgia, serif",
                                    fontSize: 16,
                                    fontWeight: 700,
                                    color: "#f1f5f9",
                                }}
                            >
                                ₹{player.bidPrice?.toLocaleString()}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleRelease}
                        disabled={loading}
                        style={{
                            marginTop: 10,
                            width: "100%",
                            padding: "6px 0",
                            borderRadius: 8,
                            border: "1px solid #334155",
                            background: "transparent",
                            color: "#94a3b8",
                            fontFamily: "sans-serif",
                            fontSize: 11,
                            cursor: "pointer",
                        }}
                    >
                        Release Player
                    </button>
                </div>
            ) : (
                <div style={{ padding: "0 16px 16px", display: "flex", gap: 6 }}>
                    <select
                        value={selectedTeam}
                        onChange={(e) => setSelectedTeam(e.target.value)}
                        disabled={loading}
                        style={{
                            flex: 2,
                            background: "#0f172a",
                            border: "1px solid #334155",
                            borderRadius: 8,
                            color: "#cbd5e1",
                            padding: "6px 8px",
                            fontFamily: "sans-serif",
                            fontSize: 11,
                            outline: "none",
                        }}
                    >
                        <option value="">— Team —</option>
                        {teams.map((t) => (
                            <option key={t.id} value={t.id}>
                                {t.emoji} {t.name}
                            </option>
                        ))}
                    </select>

                    <input
                        type="number"
                        placeholder="₹ Bid"
                        value={bidInput}
                        onChange={(e) => setBidInput(e.target.value)}
                        disabled={loading}
                        style={{
                            flex: 1,
                            background: "#0f172a",
                            border: "1px solid #334155",
                            borderRadius: 8,
                            color: "#cbd5e1",
                            padding: "6px 8px",
                            fontFamily: "sans-serif",
                            fontSize: 11,
                            outline: "none",
                            minWidth: 0,
                        }}
                    />

                    <button
                        onClick={handleSell}
                        disabled={loading || !selectedTeam || !bidInput}
                        style={{
                            background:
                                selectedTeam && bidInput
                                    ? "linear-gradient(135deg, #10b981, #059669)"
                                    : "#1e293b",
                            border: "none",
                            borderRadius: 8,
                            color: selectedTeam && bidInput ? "#fff" : "#475569",
                            padding: "6px 12px",
                            fontFamily: "sans-serif",
                            fontSize: 11,
                            fontWeight: 700,
                            cursor: selectedTeam && bidInput ? "pointer" : "not-allowed",
                            transition: "all 0.15s",
                        }}
                    >
                        SELL
                    </button>
                </div>
            )}
        </div>
    );
}