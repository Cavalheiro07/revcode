-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "Category" AS ENUM ('nome_generico', 'comentario_ruim', 'codigo_morto', 'condicional_confusa', 'magic_values', 'retorno_inconsistente', 'efeito_colateral', 'erro_vago', 'duplicacao', 'multiplas_responsabilidades');

-- CreateEnum
CREATE TYPE "ChallengeFormat" AS ENUM ('FUNCAO', 'SCRIPT', 'CLASSE');

-- CreateEnum
CREATE TYPE "ChallengeStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ChallengeOrigin" AS ENUM ('SEED', 'MANUAL', 'IA');

-- CreateEnum
CREATE TYPE "MarkResult" AS ENUM ('HIT', 'WRONG');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Challenge" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "context" TEXT NOT NULL,
    "format" "ChallengeFormat" NOT NULL,
    "difficulty" INTEGER NOT NULL,
    "fileName" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "cleanCode" TEXT NOT NULL,
    "status" "ChallengeStatus" NOT NULL DEFAULT 'DRAFT',
    "origin" "ChallengeOrigin" NOT NULL DEFAULT 'MANUAL',
    "source" TEXT,
    "sourceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Challenge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChallengeAnswer" (
    "id" TEXT NOT NULL,
    "challengeId" TEXT NOT NULL,
    "line" INTEGER NOT NULL,
    "category" "Category" NOT NULL,
    "rule" TEXT NOT NULL,
    "explanation" TEXT NOT NULL,

    CONSTRAINT "ChallengeAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyChallenge" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "position" INTEGER NOT NULL,
    "challengeId" TEXT NOT NULL,

    CONSTRAINT "DailyChallenge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Submission" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "challengeId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "hits" INTEGER NOT NULL,
    "wrong" INTEGER NOT NULL,
    "missed" INTEGER NOT NULL,
    "total" INTEGER NOT NULL,
    "points" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Submission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubmissionMark" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "line" INTEGER NOT NULL,
    "category" "Category" NOT NULL,
    "result" "MarkResult" NOT NULL,

    CONSTRAINT "SubmissionMark_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Challenge_status_createdAt_idx" ON "Challenge"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ChallengeAnswer_challengeId_line_key" ON "ChallengeAnswer"("challengeId", "line");

-- CreateIndex
CREATE UNIQUE INDEX "DailyChallenge_date_position_key" ON "DailyChallenge"("date", "position");

-- CreateIndex
CREATE UNIQUE INDEX "DailyChallenge_date_challengeId_key" ON "DailyChallenge"("date", "challengeId");

-- CreateIndex
CREATE INDEX "Submission_userId_date_idx" ON "Submission"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "Submission_userId_challengeId_key" ON "Submission"("userId", "challengeId");

-- CreateIndex
CREATE UNIQUE INDEX "SubmissionMark_submissionId_line_key" ON "SubmissionMark"("submissionId", "line");

-- AddForeignKey
ALTER TABLE "ChallengeAnswer" ADD CONSTRAINT "ChallengeAnswer_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "Challenge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyChallenge" ADD CONSTRAINT "DailyChallenge_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "Challenge"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "Challenge"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubmissionMark" ADD CONSTRAINT "SubmissionMark_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

