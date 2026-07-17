-- CreateTable
CREATE TABLE "daily_coach_tips" (
    "id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "tip" TEXT NOT NULL,
    "meals_hash" VARCHAR(64) NOT NULL,
    "model" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "daily_coach_tips_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "daily_coach_tips_date_key" ON "daily_coach_tips"("date");

