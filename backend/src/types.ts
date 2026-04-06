export type New_Match_Request_Body = {
    team_one_id: string,
    team_two_id: string,
    toss_decision: "Bat" | "Bowl",
    toss_team: string
}

export type Innings_Request_Body = {
    batting_team_id: string,
    bowling_team_id: string,
    match_id: string,
}
export type Second_Innings_Start_Body = {
    batting_team_id: string,
    bowling_team_id: string,
    runs_scored_in_first_innings: string,
    overs_bowled_in_first_innings: string,
    firt_innings_id: string
}

export type New_Over_Request_Body = {
    innings_id: string,
    match_id: string,
    bowler_id: string,
    over_number: number
}