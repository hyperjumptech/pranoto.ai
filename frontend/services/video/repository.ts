import { nanoid } from "nanoid";
import type { Video } from "./entity";
import { getUnixTimeStamp } from "@/pkg/time";

type GetVideoParams = {
  search?: string;
};

let VIDEOS: Video[] = [
  {
    id: "1",
    createdAt: 1680356615,
    updatedAt: 1680356615,
    status: "done",
    title: "Oppenheimer",
    url: "/oppenheimer.mp4",
    type: "video/mp4",
    text: "",
  },
  {
    id: "2",
    createdAt: 1680443015,
    updatedAt: 1680356615,
    status: "transcribing",
    title: "Dunkirk",
    url: "/dunkirk.mp4",
    type: "video/mp4",
    text: "",
  },
  {
    id: "3",
    createdAt: 1680529415,
    updatedAt: 1680356615,
    status: "converting",
    title: "Oppenheimer",
    url: "/oppenheimer.mp4",
    type: "video/mp4",
    text: "",
  },
  {
    id: "4",
    createdAt: 1680615815,
    updatedAt: 1680356615,
    status: "queueing",
    title: "Dunkirk",
    url: "/dunkirk.mp4",
    type: "video/mp4",
    text: "",
  },
];

export async function getVideos({
  search,
}: GetVideoParams): Promise<Omit<Video, "text">[]> {
  return VIDEOS;
}

export async function find(id: string) {
  return VIDEOS.find((v) => v.id === id);
}

export async function insert({
  title,
  type,
}: Pick<Video, "title" | "type">): Promise<Video> {
  const timeNow = getUnixTimeStamp();
  const video: Video = {
    id: nanoid(),
    status: "queueing",
    text: "",
    title,
    url: "",
    type,
    createdAt: timeNow,
    updatedAt: timeNow,
  };

  VIDEOS.push(video);

  return video;
}

export async function update(
  id: string,
  { status, text, title, url }: Pick<Video, "status" | "title" | "text" | "url">
) {
  const video = {
    updatedAt: getUnixTimeStamp(),
    status,
    text,
    title,
    url,
  };

  const selectedVideo = await find(id);

  if (!selectedVideo) {
    throw new Error("Video is not found");
  }

  const updatedVideo = { ...selectedVideo, ...video };

  VIDEOS = [...VIDEOS.filter((video) => video.id !== id), updatedVideo];
}
