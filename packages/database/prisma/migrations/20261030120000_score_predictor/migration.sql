-- CreateEnum
CREATE TYPE "AssessmentSource" AS ENUM ('NBME', 'UWSA', 'FREE_120', 'OTHER');

-- CreateTable
CREATE TABLE "practice_assessments" (
    "id" TEXT NOT NULL,
    "clerkUserId" TEXT NOT NULL,
    "examType" "ExamType" NOT NULL,
    "source" "AssessmentSource" NOT NULL,
    "label" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "takenAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "practice_assessments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_outcomes" (
    "id" TEXT NOT NULL,
    "clerkUserId" TEXT NOT NULL,
    "examType" "ExamType" NOT NULL,
    "score" INTEGER,
    "passed" BOOLEAN NOT NULL,
    "takenAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exam_outcomes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "practice_assessments_clerkUserId_examType_takenAt_idx" ON "practice_assessments"("clerkUserId", "examType", "takenAt");

-- CreateIndex
CREATE INDEX "exam_outcomes_clerkUserId_examType_idx" ON "exam_outcomes"("clerkUserId", "examType");
