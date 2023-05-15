-- CreateTable
CREATE TABLE "Segment" (
    "id" TEXT NOT NULL,
    "seek" INTEGER NOT NULL,
    "start" DOUBLE PRECISION NOT NULL,
    "end" DOUBLE PRECISION NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" INTEGER NOT NULL,
    "updatedAt" INTEGER NOT NULL,
    "videoId" TEXT NOT NULL,

    CONSTRAINT "Segment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Segment_text_idx" ON "Segment"("text");

-- AddForeignKey
ALTER TABLE "Segment" ADD CONSTRAINT "Segment_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
