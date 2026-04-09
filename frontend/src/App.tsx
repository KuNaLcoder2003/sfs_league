import { useEffect, useState, useMemo } from "react";
import type { Player, Team, Category } from "./types";
import { fetchPlayers, fetchTeams } from "./api";
import PlayerCard from "./components/PlayerCard";
import TeamView from "./components/TeamView";
import Schedule from "./components/SfsCricketschedule"
import { Route, Routes } from "react-router-dom";

type AgeGroup = "9-11" | "12-16";
type ViewMode = "players" | "teams";

const CATEGORIES: Category[] = ["Dhurandhar", "Shoorveer", "Yodha"];

export default function App() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ViewMode>("players");
  const [ageFilter, setAgeFilter] = useState<AgeGroup>("9-11");
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState<Category | "All">("All");
  const [statusFilter, setStatusFilter] = useState<"all" | "sold" | "unsold">("all");

  // Initial load
  useEffect(() => {
    Promise.all([fetchPlayers(), fetchTeams()])
      .then(([p, t]) => { setPlayers(p); setTeams(t); })
      .finally(() => setLoading(false));
  }, []);

  // Update a single player in local state
  function handlePlayerUpdate(updated: Player) {
    setPlayers((prev) =>
      prev.map((p) => (p.id === updated.id ? updated : p))
    );
  }

  const filteredPlayers = useMemo(() => {
    return players.filter((p) => {
      const inAge =
        ageFilter === "9-11" ? p.age >= 9 && p.age <= 11 : p.age >= 12 && p.age <= 16;
      const inSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const inCat = catFilter === "All" || p.category === catFilter;
      const inStatus = statusFilter === "all" || p.status === statusFilter;
      return inAge && inSearch && inCat && inStatus;
    });
  }, [players, ageFilter, search, catFilter, statusFilter]);

  const stats = useMemo(() => ({
    total: players.length,
    sold: players.filter((p) => p.status === "sold").length,
    unsold: players.filter((p) => p.status === "unsold").length,
    age911: players.filter((p) => p.age >= 9 && p.age <= 11).length,
  }), [players]);

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#030712",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Georgia, serif",
          color: "#10b981",
          fontSize: 18,
        }}
      >
        🏏 Loading SFS Cricket League...
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Schedule />} />
      <Route path="/auction" element={<div
        style={{
          minHeight: "100vh",
          background: "#030712",
          color: "#f1f5f9",
          fontFamily: "Georgia, serif",
        }}
      >
        {/* Header */}
        <header
          style={{
            position: "sticky",
            top: 0,
            zIndex: 30,
            background: "rgba(3,7,18,0.92)",
            backdropFilter: "blur(12px)",
            borderBottom: "1px solid #1e293b",
            padding: "14px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 26 }}>🏏</span>
            <div>
              <p
                style={{
                  margin: 0,
                  fontFamily: "sans-serif",
                  fontSize: 10,
                  letterSpacing: "0.25em",
                  color: "#10b981",
                  textTransform: "uppercase",
                }}
              >
                Official Tournament
              </p>
              <h1
                style={{
                  margin: 0,
                  fontSize: 18,
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  color: "#f8fafc",
                  textTransform: "uppercase",
                }}
              >
                SFS Cricket League
              </h1>
            </div>
          </div>

          {/* Nav */}
          <div
            style={{
              display: "flex",
              gap: 4,
              background: "#0f172a",
              border: "1px solid #1e293b",
              borderRadius: 10,
              padding: 4,
            }}
          >
            {(["players", "teams"] as ViewMode[]).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                style={{
                  padding: "7px 18px",
                  borderRadius: 7,
                  border: "none",
                  background: view === v ? "#10b981" : "transparent",
                  color: view === v ? "#fff" : "#64748b",
                  fontFamily: "sans-serif",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.15s",
                  textTransform: "capitalize",
                }}
              >
                {v === "players" ? "🏏 Players" : "🛡️ Teams"}
              </button>
            ))}
          </div>
        </header>

        <main style={{ maxWidth: 1280, margin: "0 auto", padding: "24px 20px" }}>

          {/* Stat strip */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 12,
              marginBottom: 24,
            }}
          >
            {[
              { label: "Total Players", value: stats.total, color: "#f1f5f9", icon: "👥" },
              { label: "Sold", value: stats.sold, color: "#10b981", icon: "✅" },
              { label: "Unsold", value: stats.unsold, color: "#f59e0b", icon: "⏳" },
              { label: "U-12 Group", value: stats.age911, color: "#38bdf8", icon: "🌱" },
            ].map((s) => (
              <div
                key={s.label}
                style={{
                  background: "#0f172a",
                  border: "1px solid #1e293b",
                  borderRadius: 14,
                  padding: "16px 18px",
                }}
              >
                <div style={{ fontSize: 20, marginBottom: 4 }}>{s.icon}</div>
                <div
                  style={{
                    fontFamily: "Georgia, serif",
                    fontSize: 28,
                    fontWeight: 700,
                    color: s.color,
                    lineHeight: 1,
                  }}
                >
                  {s.value}
                </div>
                <div
                  style={{
                    fontFamily: "sans-serif",
                    fontSize: 11,
                    color: "#475569",
                    marginTop: 4,
                  }}
                >
                  {s.label}
                </div>
              </div>
            ))}
          </div>


          {view === "players" && (
            <div>
              {/* Filters */}
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  flexWrap: "wrap",
                  alignItems: "center",
                  marginBottom: 20,
                }}
              >
                {/* Age toggle */}
                <div
                  style={{
                    display: "flex",
                    gap: 4,
                    background: "#0f172a",
                    border: "1px solid #1e293b",
                    borderRadius: 10,
                    padding: 4,
                  }}
                >
                  {(["9-11", "12-16"] as AgeGroup[]).map((g) => (
                    <button
                      key={g}
                      onClick={() => setAgeFilter(g)}
                      style={{
                        padding: "6px 16px",
                        borderRadius: 7,
                        border: "none",
                        background: ageFilter === g ? "#10b981" : "transparent",
                        color: ageFilter === g ? "#fff" : "#64748b",
                        fontFamily: "sans-serif",
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Age {g}
                    </button>
                  ))}
                </div>

                {/* Search */}
                <input
                  type="text"
                  placeholder="🔍  Search player…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{
                    flex: 1,
                    minWidth: 180,
                    background: "#0f172a",
                    border: "1px solid #1e293b",
                    borderRadius: 10,
                    padding: "8px 14px",
                    color: "#e2e8f0",
                    fontFamily: "sans-serif",
                    fontSize: 13,
                    outline: "none",
                  }}
                />

                {/* Category filter */}
                <select
                  value={catFilter}
                  onChange={(e) => setCatFilter(e.target.value as Category | "All")}
                  style={{
                    background: "#0f172a",
                    border: "1px solid #1e293b",
                    borderRadius: 10,
                    padding: "8px 12px",
                    color: "#cbd5e1",
                    fontFamily: "sans-serif",
                    fontSize: 12,
                    outline: "none",
                  }}
                >
                  <option value="All">All Categories</option>
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>

                {/* Status filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as "all" | "sold" | "unsold")}
                  style={{
                    background: "#0f172a",
                    border: "1px solid #1e293b",
                    borderRadius: 10,
                    padding: "8px 12px",
                    color: "#cbd5e1",
                    fontFamily: "sans-serif",
                    fontSize: 12,
                    outline: "none",
                  }}
                >
                  <option value="all">All Status</option>
                  <option value="sold">✅ Sold</option>
                  <option value="unsold">⏳ Unsold</option>
                </select>
              </div>

              <p
                style={{
                  fontFamily: "sans-serif",
                  fontSize: 12,
                  color: "#475569",
                  marginBottom: 16,
                }}
              >
                Showing{" "}
                <span style={{ color: "#10b981", fontWeight: 700 }}>
                  {filteredPlayers.length}
                </span>{" "}
                players · {ageFilter === "9-11" ? "Under-12" : "Under-17"} Group
              </p>

              {/* Cards grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                  gap: 14,
                }}
              >
                {filteredPlayers.map((p) => (
                  <PlayerCard
                    key={p.id}
                    player={p}
                    teams={teams}
                    onUpdate={handlePlayerUpdate}
                  />
                ))}
                {filteredPlayers.length === 0 && (
                  <p
                    style={{
                      gridColumn: "1 / -1",
                      textAlign: "center",
                      color: "#334155",
                      fontFamily: "sans-serif",
                      padding: "48px 0",
                    }}
                  >
                    No players found
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ── TEAMS VIEW ────────────────────────────────────────────────────── */}
          {view === "teams" && (
            <TeamView teams={teams} players={players} />
          )}
        </main>

        <footer
          style={{
            borderTop: "1px solid #1e293b",
            padding: "20px 0",
            textAlign: "center",
            fontFamily: "sans-serif",
            fontSize: 11,
            color: "#334155",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            marginTop: 40,
          }}
        >
          SFS Cricket League · Official Player Registry
        </footer>
      </div>} />
    </Routes>
  );
}