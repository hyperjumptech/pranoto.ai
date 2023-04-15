type VideoStatus = "done" | "transcribing" | "converting" | "queueing";

export type Video = {
  id: string;
  status: VideoStatus;
  title: string;
  videoURL: string;
  text: string;
  createdAt: number;
  updatedAt: number;
};
