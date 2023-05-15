import { nanoid } from "nanoid";
import {
  Prisma,
  PrismaClient,
  type Segment,
  VideoStatus,
} from "@prisma/client";
import type { Video } from "@prisma/client";
import { getUnixTimeStamp } from "@/pkg/time";

type GetVideoParams = {
  search?: string;
};

const prisma = new PrismaClient();

export async function getVideos({
  search,
}: GetVideoParams): Promise<Omit<Video, "text">[]> {
  const query: Prisma.VideoFindManyArgs | undefined = search
    ? ({
        where: {
          segments: {
            some: { text: { search: parsewordsToFTSQueryOperator(search) } },
          },
        },
      } as Prisma.VideoFindManyArgs)
    : undefined;

  return await prisma.video.findMany(query);
}

function parsewordsToFTSQueryOperator(words: string): string {
  return words.split(" ").join(" | ");
}

export async function find(id: string) {
  return await prisma.video.findUnique({ where: { id } });
}

export async function insert({
  title,
  type,
}: Pick<Video, "title" | "type">): Promise<Video> {
  const timeNow = getUnixTimeStamp();
  const data: Video = {
    id: nanoid(),
    status: VideoStatus.QUEUEING,
    text: "",
    title,
    url: "",
    type,
    createdAt: timeNow,
    updatedAt: timeNow,
  };

  return await prisma.video.create({
    data,
  });
}

export async function update(
  id: string,
  {
    status,
    text,
    title,
    url,
  }: Partial<Pick<Video, "status" | "title" | "text" | "url">>
): Promise<Video> {
  const video = {
    updatedAt: getUnixTimeStamp(),
    status,
    text,
    title,
    url,
  };

  return await prisma.video.update({
    data: video,
    where: { id },
  });
}

export async function updateWithSegments(
  id: string,
  { status, text }: Partial<Pick<Video, "status" | "text">>,
  segments: Pick<Segment, "end" | "seek" | "start" | "text">[]
): Promise<Video> {
  const video = {
    updatedAt: getUnixTimeStamp(),
    status,
    text,
  };
  const segmentData = segments.map(({ end, seek, start, text }) => ({
    id: nanoid(),
    end,
    seek,
    start,
    text,
    updatedAt: getUnixTimeStamp(),
    createdAt: getUnixTimeStamp(),
  }));

  return await prisma.video.update({
    data: { ...video, segments: { createMany: { data: segmentData } } },
    where: { id },
  });
}

export async function getSegmentsBy(
  videoId: string,
  { search }: GetVideoParams
): Promise<Segment[]> {
  const query: Prisma.SegmentFindManyArgs | undefined = search
    ? {
        where: {
          videoId,
          text: { search: parsewordsToFTSQueryOperator(search) },
        },
        orderBy: { start: "asc" },
      }
    : { where: { videoId }, orderBy: { start: "asc" } };

  return await prisma.segment.findMany(query);
}
