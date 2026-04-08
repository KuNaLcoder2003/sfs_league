-- AlterTable
ALTER TABLE "Ball" ADD COLUMN     "is_powerplay" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "physical_runs" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "scored_runs" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "wicket_penalty" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "extras" SET DEFAULT 0,
ALTER COLUMN "is_boundary" SET DEFAULT false,
ALTER COLUMN "is_wicket" SET DEFAULT false;

-- AlterTable
ALTER TABLE "Innings" ADD COLUMN     "innings_number" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "is_complete" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "wickets" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Match" ADD COLUMN     "match_type" TEXT NOT NULL DEFAULT 'league',
ADD COLUMN     "powerplay_overs" INTEGER NOT NULL DEFAULT 2,
ADD COLUMN     "total_overs" INTEGER NOT NULL DEFAULT 8;

-- AlterTable
ALTER TABLE "Overs" ADD COLUMN     "is_complete" BOOLEAN NOT NULL DEFAULT false;
