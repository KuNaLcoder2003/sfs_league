export type Category = "Dhurandhar" | "Shoorveer" | "Yodha";
export type PlayerStatus = "sold" | "unsold";

export interface Team {
    id: number;
    name: string;
    color: string;
    emoji: string;
    players?: Player[];
}

export interface Player {
    id: number;
    name: string;
    age: number;
    mobile: string;
    category: Category | null;
    status: PlayerStatus;
    bidPrice: number | null;
    teamId: number | null;
    team: Team | null;
}

export interface SellPayload {
    teamId: number;
    bidPrice: number;
}

export interface PatchPayload {
    category?: Category | null;
    bidPrice?: number | null;
    status?: PlayerStatus;
    teamId?: number | null;
}