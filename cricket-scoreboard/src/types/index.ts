export interface Player {
    id: number;
    name: string;
    age: number;
    mobile: string;
    category?: string;
    status: string;
    teamId?: number;
}

export interface Team {
    id: number;
    name: string;
    color: string;
    emoji: string;
    players: Player[];
}

export type MatchStatus = 'Upcoming' | 'Ongoing' | 'Finished';
export type TossDecision = 'Bat' | 'Bowl';
export type BallType = 'FAIR_BALL' | 'WIDE' | 'NO_BALL' | 'DEAD_BALL';
export type MatchType = 'league' | 'semifinal' | 'final';

export interface Score {
    id: number;
    innings_id: number;
    runs: number;
    overs: number;
    wickets: number;
}

export interface Ball {
    id: number;
    ball_number: number;
    ball_type: BallType;
    batsmen_id_on_strike: Player;
    batsmen_id_on_non_strike: Player;
    physical_runs: number;
    scored_runs: number;
    runs: number;        // net runs added to score
    extras: number;
    is_boundary: boolean;
    is_wicket: boolean;
    is_powerplay: boolean;
    wicket_penalty: number;
}

export interface Over {
    id: number;
    over_no: number;
    bowler: Player;
    total_runs: number;
    wickets: number;
    extras: number;
    is_complete: boolean;
    ball: Ball[];
}

export interface Innings {
    id: number;
    match_id: number;
    innings_number: number;
    battingTeam: Team;
    bowlingTeam: Team;
    overs_bowled: number;
    runs_scored: number;
    wickets: number;
    target: number;
    is_complete: boolean;
    score?: Score;
    overs: Over[];
}

export interface Match {
    id: number;
    status: MatchStatus;
    teamOne: Team;
    teamTwo: Team;
    tossTeam: Team;
    tossDecision: TossDecision;
    winner?: Team;
    result?: string;
    venue: string;
    date: string;
    match_type: MatchType;
    powerplay_overs: number;
    total_overs: number;
    innings: Innings[];
}

// ─── Scoring UI local state ───────────────────────────────────────────────────
export type ScoringPhase =
    | 'MATCH_SELECT'
    | 'INNINGS_SETUP'
    | 'OPENERS_SELECT'
    | 'BOWLER_SELECT'
    | 'SCORING'
    | 'WICKET_NEW_BATTER'
    | 'OVER_COMPLETE'
    | 'INNINGS_COMPLETE'
    | 'MATCH_COMPLETE';

export interface LocalScore {
    runs: number;
    wickets: number;
    totalFairBalls: number;  // actual fair-ball count
    oversDisplay: string;    // e.g. "3.4"
}

// Ball display pill
export type BallPill =
    | { type: 'runs'; value: number; boundary: boolean; powerplay: boolean }
    | { type: 'wicket'; penalty: boolean }
    | { type: 'wide' }
    | { type: 'no_ball'; runs: number }
    | { type: 'dead' };