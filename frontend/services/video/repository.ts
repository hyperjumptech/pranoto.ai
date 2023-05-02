import { nanoid } from "nanoid";
import { PrismaClient, VideoStatus } from "@prisma/client";
import type { Video } from "@prisma/client";
import { getUnixTimeStamp } from "@/pkg/time";

type GetVideoParams = {
  search?: string;
};

const prisma = new PrismaClient();

export async function getVideos({
  search,
}: GetVideoParams): Promise<Omit<Video, "text">[]> {
  return await prisma.video.findMany();
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
  { status, text, title, url }: Pick<Video, "status" | "title" | "text" | "url">
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

export async function updateStatus(
  id: string,
  status: VideoStatus
): Promise<Video> {
  const video = {
    updatedAt: getUnixTimeStamp(),
    status,
  };

  return await prisma.video.update({
    data: video,
    where: { id },
  });
}
