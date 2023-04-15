import { nanoid } from "nanoid";
import type { Video } from "./entity";

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
    videoURL: "/oppenheimer.mp4",
    text: "",
  },
  {
    id: "2",
    createdAt: 1680443015,
    updatedAt: 1680356615,
    status: "transcribing",
    title: "Dunkirk",
    videoURL: "/dunkirk.mp4",
    text: "",
  },
  {
    id: "3",
    createdAt: 1680529415,
    updatedAt: 1680356615,
    status: "converting",
    title: "Oppenheimer",
    videoURL: "/oppenheimer.mp4",
    text: "",
  },
  {
    id: "4",
    createdAt: 1680615815,
    updatedAt: 1680356615,
    status: "queueing",
    title: "Dunkirk",
    videoURL: "/dunkirk.mp4",
    text: "",
  },
  {
    id: "5",
    createdAt: 1680615815,
    updatedAt: 1680356615,
    status: "queueing",
    title: "Oppenheimer",
    videoURL: "/oppenheimer.mp4",
    text: "",
  },
  {
    id: "6",
    createdAt: 1680615815,
    updatedAt: 1680356615,
    status: "queueing",
    title: "Oppenheimer",
    videoURL: "/oppenheimer.mp4",
    text: "",
  },
];

export async function getVideos({
  search,
}: GetVideoParams): Promise<Omit<Video, "text">[]> {
  return VIDEOS;
}

export async function insert({ title }: Pick<Video, "title">) {
  const video: Video = {
    id: nanoid(),
    status: "queueing",
    text: "",
    title,
    videoURL: "",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  VIDEOS.push(video);
}

export async function update(
  id: string,
  {
    status,
    text,
    title,
    videoURL,
  }: Pick<Video, "status" | "title" | "text" | "videoURL">
) {
  const video = {
    updatedAt: Date.now(),
    status,
    text,
    title,
    videoURL,
  };

  const selectedVideo = VIDEOS.find((video) => video.id === id);

  if (!selectedVideo) {
    throw new Error("Video is not found");
  }

  const updatedVideo = { ...selectedVideo, ...video };

  VIDEOS = [...VIDEOS.filter((video) => video.id !== id), updatedVideo];
}
