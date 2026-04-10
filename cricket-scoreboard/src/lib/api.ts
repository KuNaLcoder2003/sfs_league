const API_BASE = import.meta.env.VITE_API_BASE_URL || "https://sfs-league.kunalserver.live/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Request failed" }));
    throw new Error(err.message || "Request failed");
  }
  return res.json();
}

// Teams
export const fetchTeams = () => request<any[]>("/teams");
export const fetchTeam = (id: number) => request<any>(`/teams/${id}`);

// Players
export const fetchPlayers = (match_id: string) => {
  return request<any[]>(`/players/matchSquad`, {
    method: 'POST', body: JSON.stringify({
      matchId: match_id
    })
  });
};

// Matches
export const startMatch = (data: {
  team_one_id: string;
  team_two_id: string;
  toss_decision: "Bat" | "Bowl";
  toss_team: string;
}) => request<any>("/match/start", { method: "POST", body: JSON.stringify(data) });

export const fetchMatchDetails = (matchId: number, inningsId: number) =>
  request<any>(`/match/${matchId}/${inningsId}`);

// Innings
export const startInnings = (data: {
  batting_team_id: string;
  bowling_team_id: string;
  match_id: string;
}) => request<any>("/innings/start", { method: "POST", body: JSON.stringify(data) });

export const startSecondInnings = (data: {
  batting_team_id: string;
  bowling_team_id: string;
  runs_scored_in_first_innings: string;
  overs_bowled_in_first_innings: string;
  firt_innings_id: string;
}) => request<any>("/innings/startSecondInnings", { method: "POST", body: JSON.stringify(data) });

// Overs
export const startNewOver = (data: {
  bowler_id: string;
  match_id: string;
  innings_id: string;
}) => request<any>("/over/newOver", { method: "POST", body: JSON.stringify(data) });

// Balls
export const addNewBall = (data: {
  over_id: string;
  batsmen_on_strike: string;
  batsmen_on_non_strike: string;
  ball_number: number;
  ball_type: "FAIR_BALL" | "WIDE" | "NO_BALL" | "DEAD_BALL";
  is_boundary: boolean;
  is_wicket: boolean;
  match_id: string;
  innings_id: string;
  runs: number;
  extras: number;
}) => request<any>("/ball/newBall", { method: "POST", body: JSON.stringify(data) });
