import { useState, useMemo, type FC, type JSX } from "react";

// ─── Types & Interfaces ──────────────────────────────────────────────────────

interface Player {
    id: number;
    name: string;
    age: number;
    mobile: string;
}

type Category = "Dhurandhar" | "Shoorveer" | "Yodha";
type TeamId = "royals" | "strikers" | "blazers" | "thunders";
type AgeGroup = "9-11" | "12-16";
type ViewMode = "players" | "teams";

interface Team {
    id: TeamId;
    name: string;
    color: string;
    emoji: string;
}

interface TeamWithPlayers extends Team {
    players: Player[];
}

interface Assignment {
    category?: Category | null;
    team?: TeamId | null;
}

type AssignmentsMap = Record<number, Assignment>;

interface CategoryStyle {
    bg: string;
    text: string;
    border: string;
    dot: string;
}

interface AvatarCircleProps {
    name: string;
    size?: "sm" | "md";
}

interface StatCardProps {
    label: string;
    value: number;
    icon: string;
    color: string;
}

interface CategoryBreakdownItem {
    cat: Category;
    count: number;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const PLAYERS_DATA: Player[] = [
    { id: 1, name: "Vaasu Agarwal", age: 13, mobile: "9376020486" },
    { id: 2, name: "Yash Goyal", age: 15, mobile: "9314066512" },
    { id: 3, name: "Shobhit Agrawal", age: 13, mobile: "9982451416" },
    { id: 4, name: "Yashasvi Rai", age: 10, mobile: "7073909064" },
    { id: 5, name: "Divit Singhvi", age: 11, mobile: "9784873553" },
    { id: 6, name: "Kartik Mirchandani", age: 13, mobile: "7878753650" },
    { id: 7, name: "Rick Sarkar", age: 14, mobile: "7300436450" },
    { id: 8, name: "Yuvaan Gupta", age: 10, mobile: "9166147220" },
    { id: 9, name: "Mohit Khatri", age: 16, mobile: "8905893281" },
    { id: 10, name: "Trivid Goyal", age: 11, mobile: "9352432499" },
    { id: 11, name: "Rahul Saini", age: 12, mobile: "7728043553" },
    { id: 12, name: "Abhishek Saini", age: 16, mobile: "9649776204" },
    { id: 13, name: "Jeetu Saini", age: 13, mobile: "9001435369" },
    { id: 14, name: "Uday Raj Saini", age: 15, mobile: "7296909574" },
    { id: 15, name: "Kshitij Sharma", age: 11, mobile: "9214315003" },
    { id: 16, name: "Jatin Saini", age: 12, mobile: "9887606044" },
    { id: 17, name: "Yuvraj Saini", age: 16, mobile: "8949457026" },
    { id: 18, name: "Uday Raj Bhatia", age: 11, mobile: "7568087637" },
    { id: 19, name: "Samarth Sangtani", age: 14, mobile: "9509437647" },
    { id: 20, name: "Vivaan Kulshreshtha", age: 11, mobile: "9302373220" },
    { id: 21, name: "Ahhaan Hargun", age: 10, mobile: "8107008851" },
    { id: 22, name: "Atharv Dixit", age: 14, mobile: "9829224008" },
    { id: 23, name: "Gatiz Sethi", age: 13, mobile: "8824133347" },
    { id: 24, name: "Sourish Sharma", age: 9, mobile: "9314963438" },
    { id: 25, name: "Jayaditya Jadeja", age: 14, mobile: "7580866400" },
    { id: 26, name: "Gaurav Panchal", age: 15, mobile: "7877512127" },
    { id: 27, name: "Shaurya Singh", age: 11, mobile: "7233890256" },
    { id: 28, name: "Aryan Khatri", age: 13, mobile: "9829090788" },
    { id: 29, name: "Harshit Arora", age: 12, mobile: "9818701064" },
    { id: 30, name: "Vaibhav Sharma", age: 13, mobile: "9582216207" },
    { id: 31, name: "Parag Saraiya", age: 10, mobile: "9672299201" },
    { id: 32, name: "Liyan Jain", age: 10, mobile: "8890300909" },
    { id: 33, name: "Vihaan Khatri", age: 12, mobile: "6375577957" },
    { id: 34, name: "Shaanvi", age: 13, mobile: "7017557583" },
    { id: 35, name: "Haardik Arora", age: 12, mobile: "9818701064" },
    { id: 36, name: "Jiaansh Khatri", age: 11, mobile: "9983333996" },
    { id: 37, name: "Ekaansh Khatri", age: 13, mobile: "9983333778" },
    { id: 38, name: "Bhavini Sharma", age: 9, mobile: "9929732656" },
    { id: 39, name: "Arav Mittal", age: 12, mobile: "9983331733" },
    { id: 40, name: "Bhavya Pratap Singh", age: 11, mobile: "8209183373" },
    { id: 41, name: "Jeenendra Pratap Singh", age: 11, mobile: "8811841752" },
    { id: 42, name: "Nishtha Singh", age: 13, mobile: "8811841752" },
    { id: 43, name: "Hemani", age: 13, mobile: "9680303983" },
    { id: 44, name: "Diyan Aggarwal", age: 11, mobile: "9929999487" },
    { id: 45, name: "Tushar Kumawat", age: 15, mobile: "9414323283" },
    { id: 46, name: "Ravi Sain", age: 14, mobile: "9610688429" },
    { id: 47, name: "Neerver", age: 10, mobile: "9829284412" },
    { id: 48, name: "Anmol Singh", age: 12, mobile: "9829284412" },
    { id: 49, name: "Lavesh Khatri", age: 9, mobile: "8852967317" },
    { id: 50, name: "Priyansh", age: 13, mobile: "9782966829" },
    { id: 51, name: "Dhananjay Khatri", age: 14, mobile: "9214507743" },
    { id: 52, name: "Arnav Jain", age: 13, mobile: "9460068619" },
    { id: 53, name: "Somya Swami", age: 12, mobile: "8769686010" },
    { id: 54, name: "Vikas Saini", age: 15, mobile: "7374849456" },
    { id: 55, name: "Rohit Trevedi", age: 15, mobile: "9799781299" },
    { id: 56, name: "Aabhas Soni", age: 13, mobile: "7206630025" },
    { id: 57, name: "Ranvijay Singh Naruka", age: 14, mobile: "8562057323" },
    { id: 58, name: "Krishna Khatri", age: 15, mobile: "9352855769" },
    { id: 59, name: "Jatin Khatri", age: 12, mobile: "8696593536" },
    { id: 60, name: "Divyansh Sahewal", age: 15, mobile: "9784011370" },
    { id: 61, name: "Yuvraj Madhu", age: 14, mobile: "8078607118" },
    { id: 62, name: "Kavya Ailani", age: 14, mobile: "9636727758" },
    { id: 63, name: "Yohaan Sharma", age: 12, mobile: "9929004415" },
    { id: 64, name: "Pradeep Singh", age: 11, mobile: "9829999268" },
    { id: 65, name: "Krishna Tanwar", age: 13, mobile: "8302313283" },
    { id: 66, name: "Priyanshu Tanwar", age: 12, mobile: "8854030454" },
    { id: 67, name: "Lakshya Sharma", age: 10, mobile: "8949321724" },
    { id: 68, name: "Kavish Jain", age: 12, mobile: "9509834272" },
    { id: 69, name: "Ayaan Agarwal", age: 13, mobile: "8696972012" },
    { id: 70, name: "Bhavyansh Jhamtani", age: 13, mobile: "9784000408" },
    { id: 71, name: "Rajveer Singh Rathore", age: 10, mobile: "7976917290" },
    { id: 72, name: "Anand Kharol", age: 14, mobile: "6378848310" },
    { id: 73, name: "Yashwant Saini", age: 12, mobile: "9660184514" },
    { id: 74, name: "Vivan Saini", age: 11, mobile: "8387002512" },
    { id: 75, name: "Gautam Saini", age: 15, mobile: "9050196819" },
    { id: 76, name: "Ojas Sharma", age: 10, mobile: "9001065000" },
    { id: 77, name: "Ajisth Jain", age: 14, mobile: "9928009111" },
    { id: 78, name: "Varun Sewani", age: 13, mobile: "9784000408" },
    { id: 79, name: "Poorvang Khatri", age: 11, mobile: "9602437474" },
];

const CATEGORIES: Category[] = ["Dhurandhar", "Shoorveer", "Yodha"];

const TEAMS: Team[] = [
    { id: "royals", name: "Jaipur Royals", color: "#f59e0b", emoji: "👑" },
    { id: "strikers", name: "Rajputana Strikers", color: "#ef4444", emoji: "⚔️" },
    { id: "blazers", name: "Pink City Blazers", color: "#ec4899", emoji: "🔥" },
    { id: "thunders", name: "Desert Thunders", color: "#8b5cf6", emoji: "⚡" },
];

const CATEGORY_STYLES: Record<Category, CategoryStyle> = {
    Dhurandhar: { bg: "bg-amber-500/20", text: "text-amber-300", border: "border-amber-500/40", dot: "bg-amber-400" },
    Shoorveer: { bg: "bg-emerald-500/20", text: "text-emerald-300", border: "border-emerald-500/40", dot: "bg-emerald-400" },
    Yodha: { bg: "bg-sky-500/20", text: "text-sky-300", border: "border-sky-500/40", dot: "bg-sky-400" },
};

const AVATAR_COLORS: string[] = [
    "bg-amber-600", "bg-emerald-600", "bg-sky-600",
    "bg-rose-600", "bg-violet-600", "bg-teal-600",
];

// ─── Utility Functions ────────────────────────────────────────────────────────

function getInitials(name: string): string {
    return name
        .split(" ")
        .slice(0, 2)
        .map((n: string) => n[0])
        .join("")
        .toUpperCase();
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const AvatarCircle: FC<AvatarCircleProps> = ({ name, size = "md" }) => {
    const colorIdx: number = name.charCodeAt(0) % AVATAR_COLORS.length;
    const sizeClass: string = size === "sm" ? "w-7 h-7 text-xs" : "w-9 h-9 text-sm";
    return (
        <div
            className={`${sizeClass} ${AVATAR_COLORS[colorIdx]} rounded-full flex items-center justify-center font-bold text-white flex-shrink-0`}
        >
            {getInitials(name)}
        </div>
    );
};

const StatCard: FC<StatCardProps> = ({ label, value, icon, color }) => (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <div className="text-xl mb-1">{icon}</div>
        <div className={`text-2xl font-bold ${color}`}>{value}</div>
        <div className="text-xs text-gray-500 font-sans mt-0.5">{label}</div>
    </div>
);

// ─── Main App Component ───────────────────────────────────────────────────────

export default function League(): JSX.Element {
    const [ageFilter, setAgeFilter] = useState<AgeGroup>("9-11");
    const [view, setView] = useState<ViewMode>("players");
    const [assignments, setAssignments] = useState<AssignmentsMap>({});
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [categoryFilter, setCategoryFilter] = useState<Category | "All">("All");
    const [teamFilter, setTeamFilter] = useState<TeamId | "All">("All");

    // Toggle a category or team assignment; deselects if same value is clicked again
    const updateAssignment = (
        playerId: number,
        field: keyof Assignment,
        value: Category | TeamId | null
    ): void => {
        setAssignments((prev: AssignmentsMap) => {
            const current = prev[playerId] ?? {};
            const isSame = current[field] === value;
            return {
                ...prev,
                [playerId]: { ...current, [field]: isSame ? null : value },
            };
        });
    };

    const filteredPlayers: Player[] = useMemo(() => {
        return PLAYERS_DATA.filter((p: Player) => {
            const inAgeGroup: boolean =
                ageFilter === "9-11"
                    ? p.age >= 9 && p.age <= 11
                    : p.age >= 12 && p.age <= 16;
            const matchesSearch: boolean = p.name
                .toLowerCase()
                .includes(searchQuery.toLowerCase());
            const matchesCategory: boolean =
                categoryFilter === "All" ||
                assignments[p.id]?.category === categoryFilter;
            const matchesTeam: boolean =
                teamFilter === "All" || assignments[p.id]?.team === teamFilter;
            return inAgeGroup && matchesSearch && matchesCategory && matchesTeam;
        });
    }, [ageFilter, searchQuery, categoryFilter, teamFilter, assignments]);

    const teamGroups: TeamWithPlayers[] = useMemo(() => {
        return TEAMS.map((team: Team): TeamWithPlayers => ({
            ...team,
            players: PLAYERS_DATA.filter(
                (p: Player) => assignments[p.id]?.team === team.id
            ),
        }));
    }, [assignments]);

    const stats = useMemo(() => {
        const assigned: number = PLAYERS_DATA.filter(
            (p: Player) => assignments[p.id]?.category
        ).length;
        const inTeams: number = PLAYERS_DATA.filter(
            (p: Player) => assignments[p.id]?.team
        ).length;
        const group1: number = PLAYERS_DATA.filter(
            (p: Player) => p.age >= 9 && p.age <= 11
        ).length;
        const group2: number = PLAYERS_DATA.filter(
            (p: Player) => p.age >= 12 && p.age <= 16
        ).length;
        return { assigned, inTeams, group1, group2 };
    }, [assignments]);

    const unassignedPlayers: Player[] = useMemo(
        () => PLAYERS_DATA.filter((p: Player) => !assignments[p.id]?.team),
        [assignments]
    );

    // ── Render ──────────────────────────────────────────────────────────────────
    return (
        <div
            className="min-h-screen bg-gray-950 text-gray-100"
            style={{ fontFamily: "'Georgia', serif" }}
        >
            {/* Ambient background */}
            <div
                className="fixed inset-0 pointer-events-none"
                style={{
                    backgroundImage:
                        "radial-gradient(ellipse at 20% 20%, rgba(16,185,129,0.06) 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(245,158,11,0.06) 0%, transparent 60%)",
                }}
            />

            {/* ── HEADER ────────────────────────────────────────────────────────── */}
            <header className="relative border-b border-gray-800 bg-gray-950/90 backdrop-blur sticky top-0 z-30">
                <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="text-2xl">🏏</div>
                        <div>
                            <p className="text-xs tracking-[0.3em] text-emerald-400 uppercase font-sans font-medium">
                                Official Tournament
                            </p>
                            <h1
                                className="text-xl font-bold tracking-widest text-white uppercase"
                                style={{ letterSpacing: "0.15em" }}
                            >
                                SFS Cricket League
                            </h1>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex gap-1 bg-gray-900 rounded-lg p-1 border border-gray-800">
                        {(
                            [
                                ["players", "🏏 Players"],
                                ["teams", "🛡️ Teams"],
                            ] as [ViewMode, string][]
                        ).map(([key, label]: [ViewMode, string]) => (
                            <button
                                key={key}
                                onClick={() => setView(key)}
                                className={`px-4 py-1.5 rounded-md text-sm font-sans font-medium transition-all duration-200 ${view === key
                                    ? "bg-emerald-600 text-white shadow"
                                    : "text-gray-400 hover:text-gray-200"
                                    }`}
                            >
                                {label}
                            </button>
                        ))}
                    </nav>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 py-6 space-y-5 relative">

                {/* ── STAT CARDS ───────────────────────────────────────────────────── */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <StatCard label="Total Players" value={PLAYERS_DATA.length} icon="👥" color="text-white" />
                    <StatCard label="Age 9–11" value={stats.group1} icon="🌱" color="text-emerald-400" />
                    <StatCard label="Age 12–16" value={stats.group2} icon="🔥" color="text-amber-400" />
                    <StatCard label="Categorised" value={stats.assigned} icon="✅" color="text-sky-400" />
                </div>

                {/* ══════════════════ PLAYERS VIEW ═══════════════════════════════════ */}
                {view === "players" && (
                    <div className="space-y-4">

                        {/* Filter Row */}
                        <div className="flex flex-wrap gap-3 items-center">

                            {/* Age group toggle */}
                            <div className="flex bg-gray-900 border border-gray-800 rounded-lg p-1 gap-1">
                                {(["9-11", "12-16"] as AgeGroup[]).map((g: AgeGroup) => (
                                    <button
                                        key={g}
                                        onClick={() => setAgeFilter(g)}
                                        className={`px-4 py-1.5 rounded-md text-sm font-sans font-semibold transition-all duration-200 ${ageFilter === g
                                            ? "bg-emerald-600 text-white shadow-lg"
                                            : "text-gray-400 hover:text-white"
                                            }`}
                                    >
                                        Age {g}
                                    </button>
                                ))}
                            </div>

                            {/* Search */}
                            <div className="relative flex-1 min-w-48">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                                    🔍
                                </span>
                                <input
                                    type="text"
                                    placeholder="Search player…"
                                    value={searchQuery}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    className="w-full bg-gray-900 border border-gray-800 rounded-lg pl-8 pr-3 py-2 text-sm text-gray-200 font-sans placeholder-gray-600 focus:outline-none focus:border-emerald-600 transition"
                                />
                            </div>

                            {/* Category filter */}
                            <select
                                value={categoryFilter}
                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                                    setCategoryFilter(e.target.value as Category | "All")
                                }
                                className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm text-gray-300 font-sans focus:outline-none focus:border-emerald-600"
                            >
                                <option value="All">All Categories</option>
                                {CATEGORIES.map((c: Category) => (
                                    <option key={c}>{c}</option>
                                ))}
                            </select>

                            {/* Team filter */}
                            <select
                                value={teamFilter}
                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                                    setTeamFilter(e.target.value as TeamId | "All")
                                }
                                className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm text-gray-300 font-sans focus:outline-none focus:border-emerald-600"
                            >
                                <option value="All">All Teams</option>
                                {TEAMS.map((t: Team) => (
                                    <option key={t.id} value={t.id}>
                                        {t.emoji} {t.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Row count */}
                        <p className="text-xs font-sans text-gray-500">
                            Showing{" "}
                            <span className="text-emerald-400 font-semibold">
                                {filteredPlayers.length}
                            </span>{" "}
                            players
                            {ageFilter === "9-11"
                                ? " · Under-12 Category"
                                : " · Under-17 Category"}
                        </p>

                        {/* Player Table */}
                        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">

                            {/* Table Header */}
                            <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-gray-800/60 border-b border-gray-800 text-xs font-sans font-semibold text-gray-400 uppercase tracking-wider">
                                <div className="col-span-1">#</div>
                                <div className="col-span-3">Player</div>
                                <div className="col-span-1 text-center">Age</div>
                                <div className="col-span-3 text-center">Category</div>
                                <div className="col-span-4 text-center">Franchise Team</div>
                            </div>

                            {/* Player Rows */}
                            <div className="divide-y divide-gray-800/70">
                                {filteredPlayers.length === 0 ? (
                                    <div className="py-12 text-center text-gray-500 font-sans text-sm">
                                        No players found
                                    </div>
                                ) : (
                                    filteredPlayers.map((player: Player, idx: number) => {
                                        const ass: Assignment = assignments[player.id] ?? {};
                                        //@ts-ignore
                                        const catStyle: CategoryStyle | null = ass.category
                                            ? CATEGORY_STYLES[ass.category]
                                            : null;
                                        const assignedTeam: Team | undefined = TEAMS.find(
                                            (t: Team) => t.id === ass.team
                                        );

                                        return (
                                            <div
                                                key={player.id}
                                                className="grid grid-cols-12 gap-2 px-4 py-3 items-center hover:bg-gray-800/40 transition-colors"
                                            >
                                                {/* Serial */}
                                                <div className="col-span-1 text-xs text-gray-500 font-sans">
                                                    {idx + 1}
                                                </div>

                                                {/* Name + Mobile */}
                                                <div className="col-span-3 flex items-center gap-2.5 min-w-0">
                                                    <AvatarCircle name={player.name} />
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-semibold text-gray-100 truncate">
                                                            {player.name}
                                                        </p>
                                                        <p className="text-xs text-gray-500 font-sans">
                                                            {player.mobile}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Age */}
                                                <div className="col-span-1 text-center">
                                                    <span className="text-sm font-bold text-gray-300">
                                                        {player.age}
                                                    </span>
                                                </div>

                                                {/* Category Buttons */}
                                                <div className="col-span-3 flex gap-1 justify-center flex-wrap">
                                                    {CATEGORIES.map((cat: Category) => {
                                                        const s: CategoryStyle = CATEGORY_STYLES[cat];
                                                        const active: boolean = ass.category === cat;
                                                        return (
                                                            <button
                                                                key={cat}
                                                                onClick={() =>
                                                                    updateAssignment(player.id, "category", cat)
                                                                }
                                                                title={cat}
                                                                className={`px-2 py-0.5 rounded-full text-xs font-sans font-semibold border transition-all duration-150 whitespace-nowrap ${active
                                                                    ? `${s.bg} ${s.text} ${s.border} shadow-sm`
                                                                    : "bg-transparent border-gray-700 text-gray-500 hover:border-gray-500 hover:text-gray-300"
                                                                    }`}
                                                            >
                                                                {active && (
                                                                    <span
                                                                        className={`inline-block w-1.5 h-1.5 rounded-full ${s.dot} mr-1`}
                                                                    />
                                                                )}
                                                                {cat}
                                                            </button>
                                                        );
                                                    })}
                                                </div>

                                                {/* Franchise Team Dropdown */}
                                                <div className="col-span-4 flex justify-center">
                                                    <select
                                                        value={ass.team ?? ""}
                                                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                                                            updateAssignment(
                                                                player.id,
                                                                "team",
                                                                (e.target.value as TeamId) || null
                                                            )
                                                        }
                                                        className="w-full max-w-xs bg-gray-800 border border-gray-700 rounded-lg px-2.5 py-1.5 text-xs font-sans text-gray-300 focus:outline-none focus:border-emerald-600 transition cursor-pointer"
                                                        style={
                                                            assignedTeam
                                                                ? {
                                                                    borderColor: assignedTeam.color + "80",
                                                                    color: assignedTeam.color,
                                                                }
                                                                : {}
                                                        }
                                                    >
                                                        <option value="">— No Team —</option>
                                                        {TEAMS.map((t: Team) => (
                                                            <option key={t.id} value={t.id}>
                                                                {t.emoji} {t.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* ══════════════════ TEAMS VIEW ══════════════════════════════════════ */}
                {view === "teams" && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold tracking-wide">
                                Franchise Teams
                            </h2>
                            <p className="text-xs font-sans text-gray-500">
                                <span className="text-amber-400 font-semibold">
                                    {stats.inTeams}
                                </span>{" "}
                                / {PLAYERS_DATA.length} players assigned
                            </p>
                        </div>

                        {/* Unassigned Players Panel */}
                        {unassignedPlayers.length > 0 && (
                            <div className="bg-gray-900 border border-dashed border-gray-700 rounded-2xl p-5">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-lg">⏳</span>
                                    <h3 className="font-semibold text-gray-300 font-sans text-sm">
                                        Unassigned Players{" "}
                                        <span className="text-gray-500">
                                            ({unassignedPlayers.length})
                                        </span>
                                    </h3>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {unassignedPlayers.map((p: Player) => {
                                        const ass: Assignment = assignments[p.id] ?? {};
                                        const catStyle: CategoryStyle | null = ass.category
                                            ? CATEGORY_STYLES[ass.category]
                                            : null;
                                        return (
                                            <div
                                                key={p.id}
                                                className="flex items-center gap-1.5 bg-gray-800 border border-gray-700 rounded-lg px-2.5 py-1.5"
                                            >
                                                <AvatarCircle name={p.name} size="sm" />
                                                <div>
                                                    <p className="text-xs font-semibold text-gray-200">
                                                        {p.name}
                                                    </p>
                                                    <p className="text-xs text-gray-500 font-sans">
                                                        Age {p.age}
                                                    </p>
                                                </div>
                                                {ass.category && catStyle && (
                                                    <span
                                                        className={`text-xs px-1.5 py-0.5 rounded-full font-sans ${catStyle.bg} ${catStyle.text} border ${catStyle.border} ml-1`}
                                                    >
                                                        {ass.category}
                                                    </span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Team Cards Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {teamGroups.map((team: TeamWithPlayers) => {
                                const breakdown: CategoryBreakdownItem[] = CATEGORIES.map(
                                    (cat: Category): CategoryBreakdownItem => ({
                                        cat,
                                        count: team.players.filter(
                                            (p: Player) => assignments[p.id]?.category === cat
                                        ).length,
                                    })
                                ).filter((b: CategoryBreakdownItem) => b.count > 0);

                                return (
                                    <div
                                        key={team.id}
                                        className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden"
                                        style={{
                                            borderTopColor: team.color,
                                            borderTopWidth: "3px",
                                        }}
                                    >
                                        {/* Team Header */}
                                        <div
                                            className="px-5 py-4 flex items-center justify-between"
                                            style={{ background: `${team.color}12` }}
                                        >
                                            <div className="flex items-center gap-2">
                                                <span className="text-2xl">{team.emoji}</span>
                                                <div>
                                                    <h3 className="font-bold tracking-wide text-white text-base">
                                                        {team.name}
                                                    </h3>
                                                    <p
                                                        className="text-xs font-sans"
                                                        style={{ color: team.color }}
                                                    >
                                                        {team.players.length} player
                                                        {team.players.length !== 1 ? "s" : ""}
                                                    </p>
                                                </div>
                                            </div>
                                            <div
                                                className="text-3xl font-black opacity-20"
                                                style={{ color: team.color }}
                                            >
                                                {team.players.length}
                                            </div>
                                        </div>

                                        {/* Category Breakdown */}
                                        {breakdown.length > 0 && (
                                            <div className="px-5 py-2 flex gap-2 flex-wrap border-b border-gray-800">
                                                {breakdown.map((b: CategoryBreakdownItem) => {
                                                    const s: CategoryStyle = CATEGORY_STYLES[b.cat];
                                                    return (
                                                        <span
                                                            key={b.cat}
                                                            className={`text-xs px-2 py-0.5 rounded-full font-sans ${s.bg} ${s.text} border ${s.border}`}
                                                        >
                                                            {b.cat}: {b.count}
                                                        </span>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        {/* Player List */}
                                        <div className="p-4">
                                            {team.players.length === 0 ? (
                                                <p className="text-xs text-gray-600 font-sans text-center py-4">
                                                    No players assigned yet
                                                </p>
                                            ) : (
                                                <div className="space-y-2">
                                                    {team.players.map((player: Player, i: number) => {
                                                        const ass: Assignment =
                                                            assignments[player.id] ?? {};
                                                        const catStyle: CategoryStyle | null = ass.category
                                                            ? CATEGORY_STYLES[ass.category]
                                                            : null;
                                                        return (
                                                            <div
                                                                key={player.id}
                                                                className="flex items-center gap-2.5 bg-gray-800/50 rounded-lg px-3 py-2"
                                                            >
                                                                <span className="text-xs text-gray-500 font-sans w-4">
                                                                    {i + 1}
                                                                </span>
                                                                <AvatarCircle name={player.name} size="sm" />
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-sm font-semibold text-gray-100 truncate">
                                                                        {player.name}
                                                                    </p>
                                                                </div>
                                                                <span className="text-xs font-sans text-gray-500 flex-shrink-0">
                                                                    Age {player.age}
                                                                </span>
                                                                {ass.category && catStyle && (
                                                                    <span
                                                                        className={`text-xs px-2 py-0.5 rounded-full font-sans flex-shrink-0 ${catStyle.bg} ${catStyle.text} border ${catStyle.border}`}
                                                                    >
                                                                        {ass.category}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="border-t border-gray-800 mt-10 py-5 text-center">
                <p className="text-xs font-sans text-gray-600 tracking-widest uppercase">
                    SFS Cricket League · Official Player Registry
                </p>
            </footer>
        </div>
    );
}