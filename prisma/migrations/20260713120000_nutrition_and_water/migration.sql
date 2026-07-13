-- CreateEnum
CREATE TYPE "nutrition_status" AS ENUM ('PENDING', 'DONE', 'FAILED', 'FREE_MEAL');

-- CreateTable
CREATE TABLE "meal_nutrition" (
    "id" UUID NOT NULL,
    "meal_id" UUID NOT NULL,
    "status" "nutrition_status" NOT NULL DEFAULT 'PENDING',
    "calories" DOUBLE PRECISION,
    "protein" DOUBLE PRECISION,
    "carbs" DOUBLE PRECISION,
    "fat" DOUBLE PRECISION,
    "fiber" DOUBLE PRECISION,
    "items" JSONB,
    "is_manual" BOOLEAN NOT NULL DEFAULT false,
    "model" TEXT,
    "analyzed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "meal_nutrition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_logs" (
    "id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "water_ml" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "daily_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "meal_nutrition_meal_id_key" ON "meal_nutrition"("meal_id");

-- CreateIndex
CREATE UNIQUE INDEX "daily_logs_date_key" ON "daily_logs"("date");

-- AddForeignKey
ALTER TABLE "meal_nutrition" ADD CONSTRAINT "meal_nutrition_meal_id_fkey" FOREIGN KEY ("meal_id") REFERENCES "meals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

