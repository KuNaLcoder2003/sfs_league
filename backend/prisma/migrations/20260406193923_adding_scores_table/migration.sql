-- CreateTable
CREATE TABLE "Score" (
    "id" SERIAL NOT NULL,
    "innings_id" INTEGER NOT NULL,
    "runs" INTEGER NOT NULL DEFAULT 0,
    "overs" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "wickets" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Score_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Score_innings_id_key" ON "Score"("innings_id");

-- AddForeignKey
ALTER TABLE "Score" ADD CONSTRAINT "Score_innings_id_fkey" FOREIGN KEY ("innings_id") REFERENCES "Innings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
