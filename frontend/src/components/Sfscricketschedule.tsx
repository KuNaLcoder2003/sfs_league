import { useEffect, useRef, useState } from "react";

// Pools sorted by NRR descending
const poolA = [
    { name: "Rana Pratap Panthers", nrr: +4.708 },
    { name: "Azad Strikers", nrr: -0.243 },
    { name: "Samrat Prithviraj Lions", nrr: -2.282 },
    { name: "Bhagat Singh Warriors", nrr: -2.384 },
];
const poolB = [
    { name: "Chatrapati Shivaji Kings", nrr: +1.817 },
    { name: "Royal Rockstar Chava", nrr: +0.649 },
    { name: "Bose Stormers", nrr: -1.048 },
    { name: "Laxmi Bai Legends", nrr: -1.638 },
];

const day1Matches = [
    { id: "M01", t1: "Bhagat Singh Warriors", t2: "Azad Strikers", tag: "Pool A · Opening Clash", icon: "🏏", winner: "Azad Strikers" },
    { id: "M02", t1: "Bose Stormers", t2: "Laxmi Bai Legends", tag: "Pool B · Battle of Legends", icon: "⚡", winner: "Laxmi Bai Legends" },
    { id: "M03", t1: "Samrat Prithviraj Lions", t2: "Rana Pratap Panthers", tag: "Pool A · Rajput Rivalry", icon: "🔥", winner: "Rana Pratap Panthers" },
    { id: "M04", t1: "Royal Rockstar Chava", t2: "Chatrapati Shivaji Kings", tag: "Pool B · Warrior Kings", icon: "🏆", winner: "Chatrapati Shivaji Kings" },
    { id: "M05", t1: "Bhagat Singh Warriors", t2: "Samrat Prithviraj Lions", tag: "Cross Pool · Freedom vs. Courage", icon: "⚔️", winner: "Bhagat Singh Warriors" },
    { id: "M06", t1: "Bose Stormers", t2: "Royal Rockstar Chava", tag: "Cross Pool · Heroes Collide", icon: "💥", winner: "Royal Rockstar Chava" },
];

const day2Matches = [
    { id: "M07", t1: "Azad Strikers", t2: "Rana Pratap Panthers", tag: "Pool A · Revolution vs. Royalty", icon: "🏏", winner: "Rana Pratap Panthers" },
    { id: "M08", t1: "Laxmi Bai Legends", t2: "Chatrapati Shivaji Kings", tag: "Pool B · Rani's Challenge", icon: "⚡", winner: "Laxmi Bai Legends" },
    { id: "M09", t1: "Bhagat Singh Warriors", t2: "Rana Pratap Panthers", tag: "Pool A · Legends Face Off", icon: "🔥", winner: "Rana Pratap Panthers" },
    { id: "M10", t1: "Bose Stormers", t2: "Chatrapati Shivaji Kings", tag: "Pool B · Chhatrapati Shivaji Kings", icon: "🏆", winner: "Chatrapati Shivaji Kings" },
    { id: "M11", t1: "Azad Strikers", t2: "Samrat Prithviraj Lions", tag: "Cross Pool · Warriors United", icon: "⚔️", winner: "Azad Strikers" },
    { id: "M12", t1: "Laxmi Bai Legends", t2: "Royal Rockstar Chava", tag: "Cross Pool · Final Day Thriller", icon: "💥", winner: "Royal Rockstar Chava" },
];

/* ── Particle canvas ── */
function ParticleCanvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
        const canvas = canvasRef.current!;
        const ctx = canvas.getContext("2d")!;
        let raf: number;
        const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
        resize();
        window.addEventListener("resize", resize);
        type P = { x: number; y: number; r: number; vx: number; vy: number; alpha: number; color: string };
        const rand = (a: number, b: number) => a + Math.random() * (b - a);
        const make = (): P => ({
            x: rand(0, canvas.width), y: rand(0, canvas.height),
            r: rand(0.5, 1.8), vy: rand(-0.3, -0.08), vx: rand(-0.08, 0.08),
            alpha: rand(0.1, 0.5), color: Math.random() < 0.5 ? "255,92,0" : "0,212,255",
        });
        const particles: P[] = Array.from({ length: 90 }, make);
        const loop = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (const p of particles) {
                p.y += p.vy; p.x += p.vx; p.alpha -= 0.0008;
                if (p.y < -10 || p.alpha <= 0) Object.assign(p, make());
                ctx.save();
                ctx.globalAlpha = p.alpha;
                ctx.fillStyle = `rgba(${p.color},1)`;
                ctx.shadowBlur = 6; ctx.shadowColor = `rgba(${p.color},0.8)`;
                ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
                ctx.restore();
            }
            raf = requestAnimationFrame(loop);
        };
        loop();
        return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
    }, []);
    return <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" />;
}

/* ── Cursor glow ── */
function CursorGlow() {
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const move = (e: MouseEvent) => { if (ref.current) { ref.current.style.left = e.clientX + "px"; ref.current.style.top = e.clientY + "px"; } };
        window.addEventListener("mousemove", move);
        return () => window.removeEventListener("mousemove", move);
    }, []);
    return (
        <div ref={ref} className="fixed z-10 pointer-events-none -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full"
            style={{ background: "radial-gradient(circle, rgba(255,92,0,0.07) 0%, transparent 70%)", transition: "left 0.08s, top 0.08s" }} />
    );
}

/* ── Scroll fade-in hook ── */
function useFadeIn() {
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const el = ref.current; if (!el) return;
        const obs = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) { el.style.opacity = "1"; el.style.transform = "none"; } },
            { threshold: 0.1 }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, []);
    return ref;
}

/* ── Pool card with NRR ── */
function PoolCard({ letter, label, teams, accent }: {
    letter: string; label: string;
    teams: { name: string; nrr: number }[];
    accent: "orange" | "cyan";
}) {
    const isOrange = accent === "orange";
    const topBar = isOrange ? "linear-gradient(90deg,#FF5C00,#FFB800)" : "linear-gradient(90deg,#00D4FF,#00FF94)";
    const letterColor = isOrange ? "#FF5C00" : "#00D4FF";
    const pipBg = isOrange ? "#FF5C00" : "#00D4FF";
    const glowBg = isOrange ? "rgba(255,92,0,0.15)" : "rgba(0,212,255,0.15)";
    const hoverBorder = isOrange ? "rgba(255,92,0,0.4)" : "rgba(0,212,255,0.4)";
    const posGreen = "#4ADE80";
    const negRed = "#F87171";

    return (
        <div
            className="relative rounded-2xl p-4 overflow-hidden transition-transform duration-300 hover:-translate-y-1 hover:scale-[1.01]"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = hoverBorder)}
            onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")}
        >
            <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl" style={{ background: topBar }} />
            <div className="absolute -top-8 -right-5 w-20 h-20 rounded-full blur-2xl" style={{ background: glowBg }} />

            {/* Pool header */}
            <div className="flex items-center gap-2 mb-3">
                <span className="font-extrabold text-2xl" style={{ fontFamily: "Syne, sans-serif", color: letterColor }}>{letter}</span>
                <span className="text-[10px] tracking-[2px] uppercase font-semibold" style={{ color: "rgba(255,255,255,0.4)" }}>{label}</span>
            </div>

            {/* Column labels */}
            <div className="flex items-center gap-2 mb-[6px] px-1">
                <span className="text-[9px] font-bold w-4" style={{ color: "rgba(255,255,255,0.2)" }}>#</span>
                <div className="w-[5px] flex-shrink-0" />
                <span className="flex-1 text-[9px] tracking-[1.5px] uppercase font-bold" style={{ color: "rgba(255,255,255,0.2)" }}>Team</span>
                <span className="text-[9px] tracking-[1.5px] uppercase font-bold w-[72px] text-right" style={{ color: "rgba(255,255,255,0.2)" }}>NRR</span>
            </div>

            {/* Team rows sorted by NRR */}
            {[...teams].sort((a, b) => b.nrr - a.nrr).map((t, i) => {
                const isFirst = i === 0;
                const nrrStr = (t.nrr >= 0 ? "+" : "") + t.nrr.toFixed(3);
                const nrrColor = t.nrr >= 0 ? posGreen : negRed;
                const nrrBg = t.nrr >= 0 ? "rgba(74,222,128,0.12)" : "rgba(248,113,113,0.12)";
                const nrrBorder = t.nrr >= 0 ? "rgba(74,222,128,0.3)" : "rgba(248,113,113,0.3)";
                return (
                    <div
                        key={t.name}
                        className="flex items-center gap-2 py-[6px] text-[12px] font-medium transition-colors duration-200 hover:text-yellow-300"
                        style={{ borderBottom: i < teams.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none" }}
                    >
                        <span className="text-[10px] font-bold w-4" style={{ color: isFirst ? letterColor : "rgba(255,255,255,0.3)" }}>
                            {isFirst ? "▲" : i + 1}
                        </span>
                        <div className="w-[5px] h-[5px] rounded-full flex-shrink-0" style={{ background: isFirst ? pipBg : "rgba(255,255,255,0.2)" }} />
                        <span className="flex-1 leading-tight text-[clamp(9px,2.2vw,12px)]">{t.name}</span>
                        <span
                            className="tabular-nums text-right flex-shrink-0 inline-flex items-center justify-center rounded-md px-[6px] py-[2px]"
                            style={{
                                fontFamily: "Syne, sans-serif",
                                fontSize: "clamp(11px,2.8vw,14px)",
                                fontWeight: 800,
                                letterSpacing: "0.02em",
                                color: nrrColor,
                                background: nrrBg,
                                border: `1px solid ${nrrBorder}`,
                                textShadow: `0 0 10px ${nrrColor}88`,
                                minWidth: "68px",
                            }}
                        >
                            {nrrStr}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}

/* ── Match card with winner ── */
function MatchCard({ match, accent, delay }: { match: typeof day1Matches[0]; accent: "orange" | "cyan"; delay: number }) {
    const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
    const isOrange = accent === "orange";
    const barGrad = isOrange ? "linear-gradient(180deg,#FF5C00,#FFB800)" : "linear-gradient(180deg,#00D4FF,#00FF94)";
    const hoverBorder = isOrange ? "rgba(255,92,0,0.35)" : "rgba(0,212,255,0.35)";

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left; const y = e.clientY - rect.top;
        const id = Date.now();
        setRipples(r => [...r, { id, x, y }]);
        setTimeout(() => setRipples(r => r.filter(rp => rp.id !== id)), 600);
    };

    const isT1Winner = match.winner === match.t1;
    const isT2Winner = match.winner === match.t2;
    const winnerAccent = isOrange ? "#FFB800" : "#00FF94";

    return (
        <div
            onClick={handleClick}
            onMouseEnter={e => (e.currentTarget.style.borderColor = hoverBorder)}
            onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")}
            className="relative rounded-2xl overflow-hidden cursor-pointer select-none"
            style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                padding: "14px 16px",
                marginBottom: "8px",
                display: "grid",
                gridTemplateColumns: "36px 1fr auto",
                alignItems: "center",
                gap: "12px",
                opacity: 0,
                transform: "translateX(-24px)",
                animation: `cardIn 0.5s cubic-bezier(0.22,1,0.36,1) ${delay}s both`,
                transition: "transform 0.25s cubic-bezier(0.34,1.56,0.64,1), border-color 0.25s, background 0.25s",
            }}
            onMouseOver={e => { e.currentTarget.style.transform = "translateX(6px) scale(1.01)"; e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
            onMouseOut={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
        >
            {/* Left accent bar */}
            <div className="absolute left-0 top-2 bottom-2 w-[2.5px] rounded-sm" style={{ background: barGrad }} />

            {/* Ripples */}
            {ripples.map(rp => (
                <span key={rp.id} className="absolute rounded-full pointer-events-none"
                    style={{ left: rp.x, top: rp.y, transform: "translate(-50%,-50%)", background: "rgba(255,255,255,0.07)", animation: "rippleAnim 0.6s ease-out forwards" }} />
            ))}

            {/* Match number */}
            <div className="text-center">
                <span className="block text-[10px] font-bold" style={{ color: "rgba(255,255,255,0.25)", fontFamily: "Syne, sans-serif" }}>M</span>
                <span className="text-lg font-extrabold leading-none" style={{ color: "rgba(255,255,255,0.12)", fontFamily: "Syne, sans-serif" }}>
                    {match.id.slice(1)}
                </span>
            </div>

            {/* Teams + winner */}
            <div>
                <div className="flex items-center gap-2 flex-wrap">
                    {/* Team 1 */}
                    <span
                        className="font-extrabold text-[clamp(12px,3.5vw,16px)] tracking-tight"
                        style={{
                            fontFamily: "Syne, sans-serif",
                            color: isT1Winner ? winnerAccent : "rgba(255,255,255,0.45)",
                            textShadow: isT1Winner ? `0 0 12px ${winnerAccent}66` : "none",
                        }}
                    >
                        {match.t1}
                    </span>

                    {/* VS */}
                    <span className="text-[9px] font-bold tracking-widest px-[6px] py-[2px] rounded"
                        style={{ color: "rgba(255,255,255,0.25)", border: "1px solid rgba(255,255,255,0.1)" }}>
                        VS
                    </span>

                    {/* Team 2 */}
                    <span
                        className="font-extrabold text-[clamp(12px,3.5vw,16px)] tracking-tight"
                        style={{
                            fontFamily: "Syne, sans-serif",
                            color: isT2Winner ? winnerAccent : "rgba(255,255,255,0.45)",
                            textShadow: isT2Winner ? `0 0 12px ${winnerAccent}66` : "none",
                        }}
                    >
                        {match.t2}
                    </span>
                </div>

                {/* Tag row + winner badge */}
                <div className="flex items-center gap-2 mt-[5px] flex-wrap">
                    <div className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.3)" }}>{match.tag}</div>
                    <div
                        className="flex items-center gap-1 px-[6px] py-[2px] rounded-full text-[9px] font-bold tracking-wider"
                        style={{
                            background: isOrange ? "rgba(255,184,0,0.12)" : "rgba(0,255,148,0.1)",
                            border: `1px solid ${isOrange ? "rgba(255,184,0,0.3)" : "rgba(0,255,148,0.25)"}`,
                            color: winnerAccent,
                        }}
                    >
                        <span style={{ fontSize: "8px" }}>🏆</span>
                        <span>{match.winner}</span>
                    </div>
                </div>
            </div>

            {/* Icon */}
            <span className="text-2xl leading-none transition-transform duration-300" style={{ display: "block" }}
                onMouseEnter={e => (e.currentTarget.style.transform = "rotate(-15deg) scale(1.25)")}
                onMouseLeave={e => (e.currentTarget.style.transform = "none")}>
                {match.icon}
            </span>
        </div>
    );
}

/* ── Day section ── */
function DaySection({ day, date, matches, accent }: { day: string; date: string; matches: typeof day1Matches; accent: "orange" | "cyan" }) {
    const ref = useFadeIn();
    const isOrange = accent === "orange";
    const labelColor = isOrange ? "#FF5C00" : "#00D4FF";

    return (
        <div ref={ref} className="mb-8"
            style={{ opacity: 0, transform: "translateY(24px)", transition: "opacity 0.6s ease, transform 0.6s cubic-bezier(0.22,1,0.36,1)" }}>
            <div className="relative flex items-end gap-3 mb-4">
                <div>
                    <div className="text-[10px] tracking-[3px] uppercase font-bold mb-1" style={{ color: labelColor }}>{day}</div>
                    <div className="font-extrabold text-2xl leading-tight" style={{ fontFamily: "Syne, sans-serif" }}>{date}</div>
                    <div className="text-xs mt-1 font-medium" style={{ color: "rgba(255,255,255,0.35)" }}>6 Matches · Pool Stage</div>
                </div>
                <div className="absolute right-0 bottom-0 font-extrabold leading-none select-none pointer-events-none"
                    style={{ fontFamily: "Syne, sans-serif", fontSize: "clamp(48px,12vw,72px)", color: "rgba(255,255,255,0.04)", letterSpacing: "-4px" }}>
                    {day.includes("One") ? "01" : "02"}
                </div>
            </div>
            {isOrange && (
                <div className="flex items-center gap-2 mb-4 w-fit px-3 py-1 rounded-full"
                    style={{ background: "rgba(255,92,0,0.1)", border: "1px solid rgba(255,92,0,0.25)" }}>
                    <div className="w-[5px] h-[5px] rounded-full bg-orange-500 animate-pulse" />
                    <span className="text-[11px] font-bold tracking-wider" style={{ color: "#FF5C00" }}>4:00 PM Onwards</span>
                </div>
            )}
            {matches.map((m, i) => (
                <MatchCard key={m.id} match={m} accent={accent} delay={i * 0.07 + 0.1} />
            ))}
        </div>
    );
}

/* ── Root ── */
export default function Schedule() {
    const poolsRef = useFadeIn();

    return (
        <div className="min-h-screen" style={{ background: "#04050A", color: "#F5F5F5", fontFamily: "'DM Sans', sans-serif" }}>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
        @keyframes badgePop { from { opacity:0; transform:scale(0.8) translateY(10px);} to { opacity:1; transform:none;} }
        @keyframes blink { 0%,100%{opacity:1;} 50%{opacity:0.2;} }
        @keyframes titleSlide { from{transform:translateY(100%);opacity:0;} to{transform:none;opacity:1;} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px);} to{opacity:1;transform:none;} }
        @keyframes cardIn { from{opacity:0;transform:translateX(-24px);} to{opacity:1;transform:none;} }
        @keyframes rippleAnim { from{width:10px;height:10px;opacity:1;} to{width:400px;height:400px;opacity:0;} }
      `}</style>

            <ParticleCanvas />
            <CursorGlow />

            {/* Noise overlay */}
            <div className="fixed inset-0 z-[1] pointer-events-none"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
                    opacity: 0.4, mixBlendMode: "overlay",
                }} />

            <div className="relative z-[2] max-w-2xl mx-auto px-4 pb-16">

                {/* ── HEADER ── */}
                <div className="text-center py-14">
                    <div className="inline-flex items-center gap-2 px-4 py-[5px] rounded-full mb-6 text-[11px] font-semibold tracking-[2px]"
                        style={{ background: "rgba(255,92,0,0.12)", border: "1px solid rgba(255,92,0,0.3)", color: "#FF5C00", animation: "badgePop 0.6s cubic-bezier(0.34,1.56,0.64,1) both" }}>
                        <span className="w-[6px] h-[6px] rounded-full bg-orange-500" style={{ animation: "blink 1.4s ease infinite" }} />
                        LIVE SCHEDULE — S2
                    </div>
                    <div className="overflow-hidden mb-1">
                        <h1 className="font-extrabold leading-[0.95] tracking-tight"
                            style={{ fontFamily: "Syne, sans-serif", fontSize: "clamp(36px,10vw,72px)", animation: "titleSlide 0.8s cubic-bezier(0.22,1,0.36,1) 0.1s both" }}>
                            <span className="block" style={{ background: "linear-gradient(135deg,#fff 0%,rgba(255,255,255,0.7) 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                                SFS CRICKET
                            </span>
                            <span className="block" style={{ background: "linear-gradient(135deg,#FF5C00 0%,#FFB800 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                                LEAGUE JUNIORS
                            </span>
                        </h1>
                    </div>
                    <p className="text-[clamp(11px,3vw,14px)] tracking-[6px] uppercase"
                        style={{ color: "rgba(255,255,255,0.4)", animation: "fadeUp 0.8s ease 0.4s both" }}>
                        ⚡ Season 2 · April 2026 · Pool Stage ⚡
                    </p>
                    <div className="flex items-center gap-3 mt-8" style={{ animation: "fadeUp 0.6s ease 0.5s both" }}>
                        <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.08),transparent)" }} />
                        <span className="text-xl" style={{ filter: "drop-shadow(0 0 6px rgba(255,184,0,0.8))" }}>🏟️</span>
                        <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.08),transparent)" }} />
                    </div>
                </div>

                {/* ── POOLS ── */}
                <div ref={poolsRef} style={{ opacity: 0, transform: "translateY(24px)", transition: "opacity 0.6s ease, transform 0.6s cubic-bezier(0.22,1,0.36,1)" }}>
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-[11px] tracking-[3px] uppercase font-semibold" style={{ color: "rgba(255,255,255,0.4)" }}>
                            🏏 Group Stage Pools
                        </p>
                        <p className="text-[9px] tracking-[1px] uppercase font-semibold" style={{ color: "rgba(255,255,255,0.2)" }}>
                            Sorted by NRR
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-10">
                        <PoolCard letter="A" label="Pool Alpha" teams={poolA} accent="orange" />
                        <PoolCard letter="B" label="Pool Beta" teams={poolB} accent="cyan" />
                    </div>
                </div>

                {/* ── DAY 1 ── */}
                <DaySection day="Match Day One" date="Friday, 10 April" matches={day1Matches} accent="orange" />

                {/* ── DAY 2 ── */}
                <DaySection day="Match Day Two" date="Saturday, 11 April" matches={day2Matches} accent="cyan" />

                {/* ── FOOTER ── */}
                <div className="text-center pt-8 mt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                    <p className="font-extrabold text-sm tracking-wide mb-1" style={{ color: "rgba(255,255,255,0.25)", fontFamily: "Syne, sans-serif" }}>
                        SFS Cricket League Juniors
                    </p>
                    <p className="text-[11px] tracking-[2px] uppercase font-semibold" style={{ color: "rgba(255,255,255,0.15)" }}>
                        Season 2 · April 2026 · Pool Stage
                    </p>
                    <div className="mt-4 flex flex-col items-center gap-2">
                        <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 text-[10px] tracking-[1.5px] uppercase font-semibold" style={{ color: "rgba(255,255,255,0.2)" }}>
                            <span>Organised by</span>
                            {["KD Singhal", "Ravinder Singh", "Nikhil Bhatia"].map((name, i, arr) => (
                                <span key={name} className="flex items-center gap-3">
                                    <span className="transition-colors duration-200 hover:text-yellow-400 cursor-default" style={{ color: "rgba(255,255,255,0.35)" }}>{name}</span>
                                    {i < arr.length - 1 && <span style={{ color: "rgba(255,255,255,0.1)" }}>·</span>}
                                </span>
                            ))}
                        </div>
                        <div
                            className="inline-flex items-center gap-2 px-4 py-[6px] rounded-full text-[10px] font-bold tracking-[1.5px] uppercase transition-all duration-300 hover:scale-105 cursor-default"
                            style={{ background: "rgba(255,92,0,0.08)", border: "1px solid rgba(255,92,0,0.2)", color: "rgba(255,255,255,0.3)" }}
                            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,92,0,0.15)"; e.currentTarget.style.borderColor = "rgba(255,92,0,0.4)"; e.currentTarget.style.color = "#FF5C00"; }}
                            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,92,0,0.08)"; e.currentTarget.style.borderColor = "rgba(255,92,0,0.2)"; e.currentTarget.style.color = "rgba(255,255,255,0.3)"; }}
                        >
                            <span style={{ opacity: 0.5 }}>⚡</span>
                            <span>Dev</span>
                            <span style={{ color: "rgba(255,255,255,0.5)" }}>Kunal Singh</span>
                            <span style={{ color: "rgba(255,255,255,0.15)" }}>·</span>
                            <span>+91-8302696878</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}