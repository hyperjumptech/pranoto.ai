-- CreateEnum
CREATE TYPE "VideoStatus" AS ENUM ('DONE', 'TRANSCRIBING', 'CONVERTING', 'QUEUEING');

-- CreateTable
CREATE TABLE "Video" (
    "id" TEXT NOT NULL,
    "status" "VideoStatus" NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" INTEGER NOT NULL,
    "updatedAt" INTEGER NOT NULL,

    CONSTRAINT "Video_pkey" PRIMARY KEY ("id")
);
