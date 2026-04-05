import * as XLSX from "xlsx";
import type { Player, Team } from "./types";

// ── Helpers ───────────────────────────────────────────────────────────────────

function col(width: number) {
    return { wch: width };
}

function headerStyle() {
    return {
        font: { bold: true, color: { rgb: "FFFFFF" }, name: "Arial", sz: 11 },
        fill: { fgColor: { rgb: "1A3C5E" }, patternType: "solid" },
        alignment: { horizontal: "center", vertical: "center", wrapText: true },
        border: {
            bottom: { style: "medium", color: { rgb: "10B981" } },
        },
    };
}

function soldStyle() {
    return {
        font: { bold: true, color: { rgb: "10B981" }, name: "Arial", sz: 10 },
        fill: { fgColor: { rgb: "0D2B20" }, patternType: "solid" },
        alignment: { horizontal: "center" },
    };
}

function unsoldStyle() {
    return {
        font: { color: { rgb: "94A3B8" }, name: "Arial", sz: 10 },
        fill: { fgColor: { rgb: "1E293B" }, patternType: "solid" },
        alignment: { horizontal: "center" },
    };
}

function currencyStyle(teamColor?: string) {
    return {
        font: { bold: true, color: { rgb: (teamColor ?? "#10B981").replace("#", "") }, name: "Arial", sz: 10 },
        numFmt: '₹#,##0',
        alignment: { horizontal: "right" },
    };
}
//@ts-ignore
function applyStyle(ws: XLSX.WorkSheet, cellAddr: string, style: object) {
    if (!ws[cellAddr]) ws[cellAddr] = { t: "s", v: "" };
    ws[cellAddr].s = style;
}

function makeCell(value: string | number | null, style?: object): XLSX.CellObject {
    if (value === null || value === undefined) {
        return { t: "s", v: "—", s: style };
    }
    const t = typeof value === "number" ? "n" : "s";
    return { t, v: value, s: style } as XLSX.CellObject;
}

// ── Summary Sheet ─────────────────────────────────────────────────────────────

function buildSummarySheet(teams: Team[], players: Player[]): XLSX.WorkSheet {
    const ws: XLSX.WorkSheet = {};

    // Title row
    ws["A1"] = {
        t: "s", v: "🏏 SFS Cricket League — Auction Summary", s: {
            font: { bold: true, sz: 14, color: { rgb: "10B981" }, name: "Arial" },
        }
    };

    ws["A2"] = {
        t: "s", v: `Generated: ${new Date().toLocaleString("en-IN")}`, s: {
            font: { sz: 9, color: { rgb: "64748B" }, name: "Arial" },
        }
    };

    // Section gap
    const HEADER_ROW = 4;
    const headers = ["#", "Team", "Emoji", "Players", "Sold", "Unsold", "Total Spend (₹)", "Highest Bid (₹)", "Avg Bid (₹)"];
    const headerCols = ["A", "B", "C", "D", "E", "F", "G", "H", "I"];

    headers.forEach((h, i) => {
        const addr = `${headerCols[i]}${HEADER_ROW}`;
        ws[addr] = { t: "s", v: h, s: headerStyle() };
    });

    let dataRow = HEADER_ROW + 1;
    let grandTotal = 0;
    let grandSold = 0;

    teams.forEach((team, idx) => {
        const teamPlayers = players.filter((p) => p.teamId === team.id);
        const soldPlayers = teamPlayers.filter((p) => p.status === "sold");
        const unsoldPlayers = teamPlayers.filter((p) => p.status === "unsold");
        const totalSpend = soldPlayers.reduce((s, p) => s + (p.bidPrice ?? 0), 0);
        const highestBid = soldPlayers.length > 0 ? Math.max(...soldPlayers.map((p) => p.bidPrice ?? 0)) : 0;
        const avgBid = soldPlayers.length > 0 ? Math.round(totalSpend / soldPlayers.length) : 0;

        grandTotal += totalSpend;
        grandSold += soldPlayers.length;

        const rowBg = idx % 2 === 0 ? "0F172A" : "1E293B";
        const baseCellStyle = {
            font: { name: "Arial", sz: 10, color: { rgb: "E2E8F0" } },
            fill: { fgColor: { rgb: rowBg }, patternType: "solid" },
            alignment: { vertical: "center" },
        };

        ws[`A${dataRow}`] = makeCell(idx + 1, { ...baseCellStyle, alignment: { horizontal: "center" } });
        ws[`B${dataRow}`] = makeCell(team.name, { ...baseCellStyle, font: { ...baseCellStyle.font, bold: true, color: { rgb: team.color.replace("#", "") } } });
        ws[`C${dataRow}`] = makeCell(team.emoji, { ...baseCellStyle, alignment: { horizontal: "center" } });
        ws[`D${dataRow}`] = makeCell(teamPlayers.length, { ...baseCellStyle, alignment: { horizontal: "center" } });
        ws[`E${dataRow}`] = makeCell(soldPlayers.length, { ...baseCellStyle, alignment: { horizontal: "center" }, font: { ...baseCellStyle.font, color: { rgb: "10B981" } } });
        ws[`F${dataRow}`] = makeCell(unsoldPlayers.length, { ...baseCellStyle, alignment: { horizontal: "center" }, font: { ...baseCellStyle.font, color: { rgb: "94A3B8" } } });
        ws[`G${dataRow}`] = makeCell(totalSpend || null, { ...baseCellStyle, alignment: { horizontal: "right" }, font: { ...baseCellStyle.font, bold: true } });
        ws[`H${dataRow}`] = makeCell(highestBid || null, { ...baseCellStyle, alignment: { horizontal: "right" } });
        ws[`I${dataRow}`] = makeCell(avgBid || null, { ...baseCellStyle, alignment: { horizontal: "right" } });

        dataRow++;
    });

    // Grand total row
    ws[`A${dataRow}`] = makeCell("TOTAL", { font: { bold: true, name: "Arial", sz: 10, color: { rgb: "FFFFFF" } }, fill: { fgColor: { rgb: "1A3C5E" }, patternType: "solid" }, alignment: { horizontal: "center" } });
    ws[`B${dataRow}`] = makeCell("All Teams", { font: { bold: true, name: "Arial", sz: 10, color: { rgb: "FFFFFF" } }, fill: { fgColor: { rgb: "1A3C5E" }, patternType: "solid" } });
    ws[`C${dataRow}`] = makeCell("", {});
    ws[`D${dataRow}`] = makeCell(players.length, { font: { bold: true, name: "Arial", sz: 10, color: { rgb: "FFFFFF" } }, fill: { fgColor: { rgb: "1A3C5E" }, patternType: "solid" }, alignment: { horizontal: "center" } });
    ws[`E${dataRow}`] = makeCell(grandSold, { font: { bold: true, name: "Arial", sz: 10, color: { rgb: "10B981" } }, fill: { fgColor: { rgb: "1A3C5E" }, patternType: "solid" }, alignment: { horizontal: "center" } });
    ws[`F${dataRow}`] = makeCell(players.length - grandSold, { font: { bold: true, name: "Arial", sz: 10 }, fill: { fgColor: { rgb: "1A3C5E" }, patternType: "solid" }, alignment: { horizontal: "center" } });
    ws[`G${dataRow}`] = makeCell(grandTotal, { font: { bold: true, name: "Arial", sz: 11, color: { rgb: "F59E0B" } }, fill: { fgColor: { rgb: "1A3C5E" }, patternType: "solid" }, alignment: { horizontal: "right" } });
    ws[`H${dataRow}`] = makeCell("", {});
    ws[`I${dataRow}`] = makeCell("", {});

    ws["!ref"] = `A1:I${dataRow}`;
    ws["!cols"] = [col(4), col(28), col(8), col(10), col(8), col(8), col(18), col(16), col(14)];
    ws["!rows"] = [{ hpt: 24 }, { hpt: 16 }, { hpt: 8 }, { hpt: 20 }];
    ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 8 } }];

    return ws;
}

// ── Per-Team Sheet ────────────────────────────────────────────────────────────

function buildTeamSheet(team: Team, teamPlayers: Player[]): XLSX.WorkSheet {
    const ws: XLSX.WorkSheet = {};

    // Team banner
    ws["A1"] = {
        t: "s", v: `${team.emoji}  ${team.name}`, s: {
            font: { bold: true, sz: 14, color: { rgb: team.color.replace("#", "") }, name: "Arial" },
        }
    };

    const soldPlayers = teamPlayers.filter((p) => p.status === "sold");
    const totalSpend = soldPlayers.reduce((s, p) => s + (p.bidPrice ?? 0), 0);

    ws["A2"] = {
        t: "s", v: `${soldPlayers.length} players · Total spend: ₹${totalSpend.toLocaleString("en-IN")}`, s: {
            font: { sz: 10, color: { rgb: "94A3B8" }, name: "Arial" },
        }
    };

    const HEADER_ROW = 4;
    const headers = ["#", "Player Name", "Age", "Age Group", "Mobile", "Category", "Status", "Bid Price (₹)", "Team"];
    const headerCols = ["A", "B", "C", "D", "E", "F", "G", "H", "I"];

    headers.forEach((h, i) => {
        ws[`${headerCols[i]}${HEADER_ROW}`] = { t: "s", v: h, s: headerStyle() };
    });

    // Sort: sold first, then by bid price desc
    const sorted = [...teamPlayers].sort((a, b) => {
        if (a.status === "sold" && b.status !== "sold") return -1;
        if (a.status !== "sold" && b.status === "sold") return 1;
        return (b.bidPrice ?? 0) - (a.bidPrice ?? 0);
    });

    let row = HEADER_ROW + 1;

    sorted.forEach((p, idx) => {
        const isSold = p.status === "sold";
        const rowBg = idx % 2 === 0 ? "0F172A" : "1E293B";
        const baseStyle = {
            font: { name: "Arial", sz: 10, color: { rgb: "CBD5E1" } },
            fill: { fgColor: { rgb: rowBg }, patternType: "solid" },
            alignment: { vertical: "center" },
        };

        const ageGroup = p.age >= 9 && p.age <= 11 ? "U-12 (9-11)" : "U-17 (12-16)";

        ws[`A${row}`] = makeCell(idx + 1, { ...baseStyle, alignment: { horizontal: "center" } });
        ws[`B${row}`] = makeCell(p.name, { ...baseStyle, font: { ...baseStyle.font, bold: true, color: { rgb: "F1F5F9" } } });
        ws[`C${row}`] = makeCell(p.age, { ...baseStyle, alignment: { horizontal: "center" } });
        ws[`D${row}`] = makeCell(ageGroup, { ...baseStyle, alignment: { horizontal: "center" }, font: { ...baseStyle.font, color: { rgb: "38BDF8" } } });
        ws[`E${row}`] = makeCell(p.mobile, { ...baseStyle, font: { ...baseStyle.font, color: { rgb: "64748B" } } });
        ws[`F${row}`] = makeCell(p.category ?? "—", {
            ...baseStyle,
            alignment: { horizontal: "center" },
            font: { ...baseStyle.font, bold: !!p.category, color: { rgb: p.category === "Dhurandhar" ? "F59E0B" : p.category === "Shoorveer" ? "10B981" : p.category === "Yodha" ? "38BDF8" : "64748B" } },
        });
        ws[`G${row}`] = makeCell(p.status.toUpperCase(), isSold ? soldStyle() : unsoldStyle());
        ws[`H${row}`] = isSold
            ? makeCell(p.bidPrice, currencyStyle(team.color))
            : makeCell("—", { ...baseStyle, alignment: { horizontal: "right" }, font: { ...baseStyle.font, color: { rgb: "475569" } } });
        ws[`I${row}`] = makeCell(team.name, { ...baseStyle, font: { ...baseStyle.font, color: { rgb: team.color.replace("#", "") } } });

        row++;
    });

    // Total row
    if (soldPlayers.length > 0) {
        const totalStyle = { font: { bold: true, name: "Arial", sz: 10, color: { rgb: "F59E0B" } }, fill: { fgColor: { rgb: "1A3C5E" }, patternType: "solid" }, alignment: { horizontal: "right" } };
        ws[`A${row}`] = makeCell("", {});
        ws[`B${row}`] = makeCell("TEAM TOTAL", { ...totalStyle, alignment: { horizontal: "left" } });
        ws[`C${row}`] = makeCell("", {});
        ws[`D${row}`] = makeCell("", {});
        ws[`E${row}`] = makeCell("", {});
        ws[`F${row}`] = makeCell("", {});
        ws[`G${row}`] = makeCell(`${soldPlayers.length} SOLD`, { ...totalStyle, alignment: { horizontal: "center" } });
        ws[`H${row}`] = makeCell(totalSpend, totalStyle);
        ws[`I${row}`] = makeCell("", {});
    }

    ws["!ref"] = `A1:I${row}`;
    ws["!cols"] = [col(4), col(24), col(6), col(14), col(14), col(14), col(10), col(16), col(28)];
    ws["!merges"] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 8 } },
        { s: { r: 1, c: 0 }, e: { r: 1, c: 8 } },
    ];

    return ws;
}

// ── All Players Sheet ─────────────────────────────────────────────────────────

function buildAllPlayersSheet(players: Player[], teams: Team[]): XLSX.WorkSheet {
    const ws: XLSX.WorkSheet = {};

    ws["A1"] = {
        t: "s", v: "All Players — Complete Registry", s: {
            font: { bold: true, sz: 13, color: { rgb: "10B981" }, name: "Arial" },
        }
    };

    const HEADER_ROW = 3;
    const headers = ["#", "Player Name", "Age", "Age Group", "Mobile", "Category", "Status", "Team", "Bid Price (₹)"];
    const headerCols = ["A", "B", "C", "D", "E", "F", "G", "H", "I"];

    headers.forEach((h, i) => {
        ws[`${headerCols[i]}${HEADER_ROW}`] = { t: "s", v: h, s: headerStyle() };
    });

    const sorted = [...players].sort((a, b) => {
        if (a.status === "sold" && b.status !== "sold") return -1;
        if (a.status !== "sold" && b.status === "sold") return 1;
        return a.name.localeCompare(b.name);
    });

    sorted.forEach((p, idx) => {
        const row = HEADER_ROW + 1 + idx;
        const isSold = p.status === "sold";
        const rowBg = idx % 2 === 0 ? "0F172A" : "1E293B";
        const baseStyle = {
            font: { name: "Arial", sz: 10, color: { rgb: "CBD5E1" } },
            fill: { fgColor: { rgb: rowBg }, patternType: "solid" },
            alignment: { vertical: "center" },
        };
        const assignedTeam = teams.find((t) => t.id === p.teamId);
        const ageGroup = p.age >= 9 && p.age <= 11 ? "U-12 (9-11)" : "U-17 (12-16)";

        ws[`A${row}`] = makeCell(idx + 1, { ...baseStyle, alignment: { horizontal: "center" } });
        ws[`B${row}`] = makeCell(p.name, { ...baseStyle, font: { ...baseStyle.font, bold: true, color: { rgb: "F1F5F9" } } });
        ws[`C${row}`] = makeCell(p.age, { ...baseStyle, alignment: { horizontal: "center" } });
        ws[`D${row}`] = makeCell(ageGroup, { ...baseStyle, alignment: { horizontal: "center" }, font: { ...baseStyle.font, color: { rgb: "38BDF8" } } });
        ws[`E${row}`] = makeCell(p.mobile, { ...baseStyle, font: { ...baseStyle.font, color: { rgb: "64748B" } } });
        ws[`F${row}`] = makeCell(p.category ?? "—", {
            ...baseStyle,
            alignment: { horizontal: "center" },
            font: { ...baseStyle.font, bold: !!p.category, color: { rgb: p.category === "Dhurandhar" ? "F59E0B" : p.category === "Shoorveer" ? "10B981" : p.category === "Yodha" ? "38BDF8" : "64748B" } },
        });
        ws[`G${row}`] = makeCell(p.status.toUpperCase(), isSold ? soldStyle() : unsoldStyle());
        ws[`H${row}`] = makeCell(assignedTeam ? `${assignedTeam.emoji} ${assignedTeam.name}` : "—", {
            ...baseStyle,
            font: { ...baseStyle.font, color: { rgb: assignedTeam ? assignedTeam.color.replace("#", "") : "475569" } },
        });
        ws[`I${row}`] = isSold
            ? makeCell(p.bidPrice, currencyStyle(assignedTeam?.color))
            : makeCell("—", { ...baseStyle, alignment: { horizontal: "right" }, font: { ...baseStyle.font, color: { rgb: "475569" } } });
    });

    ws["!ref"] = `A1:I${HEADER_ROW + players.length}`;
    ws["!cols"] = [col(4), col(24), col(6), col(14), col(14), col(14), col(10), col(28), col(16)];
    ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 8 } }];

    return ws;
}

// ── Main Export Function ──────────────────────────────────────────────────────

export function exportAuctionToExcel(teams: Team[], players: Player[]): void {
    const wb = XLSX.utils.book_new();

    // Sheet ordering: Summary → All Players → each team
    XLSX.utils.book_append_sheet(wb, buildSummarySheet(teams, players), "📊 Summary");
    XLSX.utils.book_append_sheet(wb, buildAllPlayersSheet(players, teams), "👥 All Players");

    teams.forEach((team) => {
        const teamPlayers = players.filter((p) => p.teamId === team.id);
        // Sanitize sheet name (Excel limit: 31 chars, no special chars)
        const sheetName = team.name.replace(/[\\/*?:[\]]/g, "").slice(0, 28);
        XLSX.utils.book_append_sheet(wb, buildTeamSheet(team, teamPlayers), sheetName);
    });

    const filename = `SFS_Cricket_League_Auction_${new Date()
        .toISOString()
        .slice(0, 10)}.xlsx`;

    XLSX.writeFile(wb, filename, { bookSST: false, cellStyles: true });
}