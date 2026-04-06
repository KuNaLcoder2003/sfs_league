-- CreateEnum
CREATE TYPE "Group" AS ENUM ('GROUP_A', 'GROUP_B');

-- CreateTable
CREATE TABLE "TeamRankings" (
    "id" SERIAL NOT NULL,
    "team_id" INTEGER NOT NULL,
    "group" "Group" NOT NULL,
    "matches" INTEGER NOT NULL DEFAULT 0,
    "lost" INTEGER NOT NULL DEFAULT 0,
    "won" INTEGER NOT NULL DEFAULT 0,
    "net_run_rate" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "TeamRankings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TeamRankings_team_id_key" ON "TeamRankings"("team_id");

-- AddForeignKey
ALTER TABLE "TeamRankings" ADD CONSTRAINT "TeamRankings_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
