-- CreateTable
CREATE TABLE "app_settings" (
    "id" TEXT NOT NULL DEFAULT 'app',
    "calorie_goal_kcal" INTEGER NOT NULL DEFAULT 2000,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "app_settings_pkey" PRIMARY KEY ("id")
);

