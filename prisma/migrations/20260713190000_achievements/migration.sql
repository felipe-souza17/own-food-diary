-- CreateTable
CREATE TABLE "achievements" (
    "id" UUID NOT NULL,
    "key" VARCHAR(64) NOT NULL,
    "unlocked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "achievements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "achievements_key_key" ON "achievements"("key");

