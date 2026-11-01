-- CreateEnum
CREATE TYPE "LessonKind" AS ENUM ('LESSON', 'CHEST', 'TEST');

-- AlterTable
ALTER TABLE "user_profiles" ADD COLUMN "xp" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "gems" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "courses" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "order" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "units" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "blurb" TEXT NOT NULL DEFAULT '',
    CONSTRAINT "units_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "lessons" (
    "id" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "icon" TEXT NOT NULL DEFAULT 'book',
    "kind" "LessonKind" NOT NULL DEFAULT 'LESSON',
    "xp" INTEGER NOT NULL DEFAULT 10,
    CONSTRAINT "lessons_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "user_lesson_progress" (
    "id" TEXT NOT NULL,
    "clerkUserId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "user_lesson_progress_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "user_activity_days" (
    "id" TEXT NOT NULL,
    "clerkUserId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "lessons" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "user_activity_days_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "courses_slug_key" ON "courses"("slug");
CREATE UNIQUE INDEX "units_courseId_order_key" ON "units"("courseId", "order");
CREATE UNIQUE INDEX "lessons_unitId_order_key" ON "lessons"("unitId", "order");
CREATE INDEX "user_lesson_progress_clerkUserId_idx" ON "user_lesson_progress"("clerkUserId");
CREATE UNIQUE INDEX "user_lesson_progress_clerkUserId_lessonId_key" ON "user_lesson_progress"("clerkUserId", "lessonId");
CREATE INDEX "user_activity_days_date_idx" ON "user_activity_days"("date");
CREATE UNIQUE INDEX "user_activity_days_clerkUserId_date_key" ON "user_activity_days"("clerkUserId", "date");

-- AddForeignKey
ALTER TABLE "units" ADD CONSTRAINT "units_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "units"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_lesson_progress" ADD CONSTRAINT "user_lesson_progress_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;
