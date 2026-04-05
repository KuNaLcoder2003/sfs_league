import { exportAuctionToExcel } from "../utils";
import type { Team, Player, Category } from "../types";

// ── Helpers ───────────────────────────────────────────────────────────────────

const AVATAR_PALETTE = [
    "#f59e0b", "#ef4444", "#10b981", "#8b5cf6",
    "#ec4899", "#06b6d4", "#f97316",
];

const CAT_COLOR: Record<Category, string> = {
    Dhurandhar: "#f59e0b",
    Shoorveer: "#10b981",
    Yodha: "#38bdf8",
};

function getInitials(name: string) {
    return name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
}

function avatarColor(name: string) {
    return AVATAR_PALETTE[name.charCodeAt(0) % AVATAR_PALETTE.length];
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface TeamViewProps {
    teams: Team[];
    players: Player[];
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function TeamView({ teams, players }: TeamViewProps) {
    const getTeamPlayers = (teamId: number) =>
        players.filter((p) => p.teamId === teamId && p.status === "sold");

    const totalSpend = (teamPlayers: Player[]) =>
        teamPlayers.reduce((sum, p) => sum + (p.bidPrice ?? 0), 0);

    const unassigned = players.filter((p) => p.status === "unsold");
    const totalSold = players.filter((p) => p.status === "sold").length;

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

            {/* ── Export bar ──────────────────────────────────────────────────────── */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: "#0f172a",
                    border: "1px solid #1e293b",
                    borderRadius: 14,
                    padding: "14px 20px",
                }}
            >
                <div>
                    <p
                        style={{
                            margin: 0,
                            fontFamily: "Georgia, serif",
                            fontSize: 15,
                            fontWeight: 700,
                            color: "#f1f5f9",
                        }}
                    >
                        Franchise Teams
                    </p>
                    <p
                        style={{
                            margin: "3px 0 0",
                            fontFamily: "sans-serif",
                            fontSize: 12,
                            color: "#64748b",
                        }}
                    >
                        <span style={{ color: "#f59e0b", fontWeight: 700 }}>{totalSold}</span>
                        {" "}/ {players.length} players sold across {teams.length} teams
                    </p>
                </div>

                <button
                    onClick={() => exportAuctionToExcel(teams, players)}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        background: "linear-gradient(135deg, #059669, #10b981)",
                        border: "none",
                        borderRadius: 10,
                        padding: "10px 20px",
                        color: "#fff",
                        fontFamily: "sans-serif",
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: "pointer",
                        letterSpacing: "0.04em",
                        boxShadow: "0 4px 14px rgba(16,185,129,0.3)",
                        transition: "all 0.15s",
                    }}
                    onMouseEnter={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
                        (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 6px 20px rgba(16,185,129,0.4)";
                    }}
                    onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
                        (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 14px rgba(16,185,129,0.3)";
                    }}
                >
                    <span style={{ fontSize: 16 }}>⬇️</span>
                    Export to Excel
                </button>
            </div>

            {/* ── Unassigned pool ─────────────────────────────────────────────────── */}
            {unassigned.length > 0 && (
                <div
                    style={{
                        background: "#0f172a",
                        border: "1.5px dashed #334155",
                        borderRadius: 16,
                        padding: 20,
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            marginBottom: 14,
                        }}
                    >
                        <span style={{ fontSize: 18 }}>⏳</span>
                        <h3
                            style={{
                                margin: 0,
                                fontFamily: "Georgia, serif",
                                fontSize: 15,
                                color: "#94a3b8",
                            }}
                        >
                            Unsold Pool
                            <span
                                style={{
                                    marginLeft: 8,
                                    fontFamily: "sans-serif",
                                    fontSize: 12,
                                    color: "#475569",
                                }}
                            >
                                ({unassigned.length} players)
                            </span>
                        </h3>
                    </div>

                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {unassigned.map((p) => (
                            <div
                                key={p.id}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8,
                                    background: "#1e293b",
                                    border: "1px solid #334155",
                                    borderRadius: 10,
                                    padding: "7px 10px",
                                }}
                            >
                                <div
                                    style={{
                                        width: 28,
                                        height: 28,
                                        borderRadius: "50%",
                                        background: avatarColor(p.name),
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: 10,
                                        fontWeight: 700,
                                        color: "#fff",
                                        flexShrink: 0,
                                    }}
                                >
                                    {getInitials(p.name)}
                                </div>
                                <div>
                                    <p
                                        style={{
                                            margin: 0,
                                            fontFamily: "Georgia, serif",
                                            fontSize: 12,
                                            fontWeight: 700,
                                            color: "#e2e8f0",
                                        }}
                                    >
                                        {p.name}
                                    </p>
                                    <p
                                        style={{
                                            margin: 0,
                                            fontFamily: "sans-serif",
                                            fontSize: 10,
                                            color: "#64748b",
                                        }}
                                    >
                                        Age {p.age}
                                        {p.category && (
                                            <span
                                                style={{
                                                    marginLeft: 6,
                                                    color: CAT_COLOR[p.category as Category],
                                                    fontWeight: 600,
                                                }}
                                            >
                                                · {p.category}
                                            </span>
                                        )}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Team cards grid ──────────────────────────────────────────────────── */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                    gap: 20,
                }}
            >
                {teams.map((team) => {
                    const teamPlayers = getTeamPlayers(team.id);
                    const spend = totalSpend(teamPlayers);

                    return (
                        <div
                            key={team.id}
                            style={{
                                background: "linear-gradient(145deg, #1a1a2e 0%, #16213e 100%)",
                                border: "1.5px solid #2a2a3e",
                                borderTop: `3px solid ${team.color}`,
                                borderRadius: 16,
                                overflow: "hidden",
                            }}
                        >
                            {/* Team header */}
                            <div
                                style={{
                                    background: `${team.color}0d`,
                                    padding: "16px 20px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    borderBottom: "1px solid #1e293b",
                                }}
                            >
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                    <span style={{ fontSize: 24 }}>{team.emoji}</span>
                                    <div>
                                        <p
                                            style={{
                                                margin: 0,
                                                fontFamily: "Georgia, serif",
                                                fontWeight: 700,
                                                fontSize: 14,
                                                color: "#f1f5f9",
                                            }}
                                        >
                                            {team.name}
                                        </p>
                                        <p
                                            style={{
                                                margin: "2px 0 0",
                                                fontFamily: "sans-serif",
                                                fontSize: 11,
                                                color: team.color,
                                                fontWeight: 600,
                                            }}
                                        >
                                            {teamPlayers.length} player{teamPlayers.length !== 1 ? "s" : ""}
                                        </p>
                                    </div>
                                </div>

                                {/* Total spend */}
                                {spend > 0 && (
                                    <div style={{ textAlign: "right" }}>
                                        <p
                                            style={{
                                                margin: 0,
                                                fontFamily: "sans-serif",
                                                fontSize: 10,
                                                color: "#64748b",
                                                letterSpacing: "0.05em",
                                            }}
                                        >
                                            TOTAL SPEND
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
                                            ₹{spend.toLocaleString()}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Player list */}
                            <div
                                style={{
                                    padding: 14,
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 8,
                                }}
                            >
                                {teamPlayers.length === 0 ? (
                                    <p
                                        style={{
                                            textAlign: "center",
                                            fontFamily: "sans-serif",
                                            fontSize: 12,
                                            color: "#334155",
                                            padding: "20px 0",
                                        }}
                                    >
                                        No players assigned
                                    </p>
                                ) : (
                                    teamPlayers.map((p, i) => (
                                        <div
                                            key={p.id}
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 10,
                                                background: "#0f172a",
                                                borderRadius: 10,
                                                padding: "9px 12px",
                                                border: "1px solid #1e293b",
                                            }}
                                        >
                                            <span
                                                style={{
                                                    fontFamily: "sans-serif",
                                                    fontSize: 10,
                                                    color: "#475569",
                                                    width: 16,
                                                    flexShrink: 0,
                                                }}
                                            >
                                                {i + 1}
                                            </span>

                                            <div
                                                style={{
                                                    width: 30,
                                                    height: 30,
                                                    borderRadius: "50%",
                                                    background: avatarColor(p.name),
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    fontSize: 10,
                                                    fontWeight: 700,
                                                    color: "#fff",
                                                    flexShrink: 0,
                                                }}
                                            >
                                                {getInitials(p.name)}
                                            </div>

                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <p
                                                    style={{
                                                        margin: 0,
                                                        fontFamily: "Georgia, serif",
                                                        fontSize: 13,
                                                        fontWeight: 700,
                                                        color: "#e2e8f0",
                                                        whiteSpace: "nowrap",
                                                        overflow: "hidden",
                                                        textOverflow: "ellipsis",
                                                    }}
                                                >
                                                    {p.name}
                                                </p>
                                                <p
                                                    style={{
                                                        margin: 0,
                                                        fontFamily: "sans-serif",
                                                        fontSize: 10,
                                                        color: "#64748b",
                                                    }}
                                                >
                                                    Age {p.age}
                                                    {p.category && (
                                                        <span
                                                            style={{
                                                                marginLeft: 6,
                                                                color: CAT_COLOR[p.category as Category],
                                                                fontWeight: 600,
                                                            }}
                                                        >
                                                            · {p.category}
                                                        </span>
                                                    )}
                                                </p>
                                            </div>

                                            {/* Bid price */}
                                            <div style={{ textAlign: "right", flexShrink: 0 }}>
                                                <p
                                                    style={{
                                                        margin: 0,
                                                        fontFamily: "Georgia, serif",
                                                        fontSize: 13,
                                                        fontWeight: 700,
                                                        color: team.color,
                                                    }}
                                                >
                                                    ₹{p.bidPrice?.toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}