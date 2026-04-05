-- CreateEnum
CREATE TYPE "MatchStatus" AS ENUM ('Upcoming', 'Ongoing', 'Finished');

-- CreateEnum
CREATE TYPE "TossDecision" AS ENUM ('Bat', 'Bowl');

-- CreateEnum
CREATE TYPE "BallType" AS ENUM ('FAIR_BALL', 'WIDE', 'NO_BALL', 'DEAD_BALL');

-- CreateTable
CREATE TABLE "Match" (
    "id" SERIAL NOT NULL,
    "status" "MatchStatus" NOT NULL DEFAULT 'Upcoming',
    "teamOneId" INTEGER NOT NULL,
    "teamTwoId" INTEGER NOT NULL,
    "tossTeamId" INTEGER NOT NULL,
    "tossDecision" "TossDecision" NOT NULL,
    "winnerId" INTEGER,
    "result" TEXT,
    "venue" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "player_of_the_match" INTEGER,

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Innings" (
    "id" SERIAL NOT NULL,
    "match_id" INTEGER NOT NULL,
    "battingTeamId" INTEGER NOT NULL,
    "bowlingTeamId" INTEGER NOT NULL,
    "overs_bowled" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "runs_scored" INTEGER NOT NULL DEFAULT 0,
    "target" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Innings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Overs" (
    "id" SERIAL NOT NULL,
    "match_id" INTEGER NOT NULL,
    "innings_id" INTEGER NOT NULL,
    "bowler_id" INTEGER NOT NULL,
    "over_no" INTEGER NOT NULL,
    "total_runs" INTEGER NOT NULL DEFAULT 0,
    "wickets" INTEGER NOT NULL DEFAULT 0,
    "extras" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Overs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ball" (
    "id" SERIAL NOT NULL,
    "match_id" INTEGER NOT NULL,
    "innings_id" INTEGER NOT NULL,
    "over_id" INTEGER NOT NULL,
    "ball_number" INTEGER NOT NULL,
    "ball_type" "BallType" NOT NULL,
    "batsmen_on_strike" INTEGER NOT NULL,
    "batsmen_on_non_strike" INTEGER NOT NULL,
    "runs" INTEGER NOT NULL,
    "extras" INTEGER NOT NULL,
    "is_boundary" BOOLEAN NOT NULL,
    "is_wicket" BOOLEAN NOT NULL,

    CONSTRAINT "Ball_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_teamOneId_fkey" FOREIGN KEY ("teamOneId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_teamTwoId_fkey" FOREIGN KEY ("teamTwoId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_tossTeamId_fkey" FOREIGN KEY ("tossTeamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_winnerId_fkey" FOREIGN KEY ("winnerId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_player_of_the_match_fkey" FOREIGN KEY ("player_of_the_match") REFERENCES "Player"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Innings" ADD CONSTRAINT "Innings_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "Match"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Innings" ADD CONSTRAINT "Innings_battingTeamId_fkey" FOREIGN KEY ("battingTeamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Innings" ADD CONSTRAINT "Innings_bowlingTeamId_fkey" FOREIGN KEY ("bowlingTeamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Overs" ADD CONSTRAINT "Overs_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "Match"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Overs" ADD CONSTRAINT "Overs_innings_id_fkey" FOREIGN KEY ("innings_id") REFERENCES "Innings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Overs" ADD CONSTRAINT "Overs_bowler_id_fkey" FOREIGN KEY ("bowler_id") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ball" ADD CONSTRAINT "Ball_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "Match"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ball" ADD CONSTRAINT "Ball_innings_id_fkey" FOREIGN KEY ("innings_id") REFERENCES "Innings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ball" ADD CONSTRAINT "Ball_over_id_fkey" FOREIGN KEY ("over_id") REFERENCES "Overs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ball" ADD CONSTRAINT "Ball_batsmen_on_strike_fkey" FOREIGN KEY ("batsmen_on_strike") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ball" ADD CONSTRAINT "Ball_batsmen_on_non_strike_fkey" FOREIGN KEY ("batsmen_on_non_strike") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
