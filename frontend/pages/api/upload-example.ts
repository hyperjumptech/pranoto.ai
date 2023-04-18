import type { NextApiRequest, NextApiResponse } from "next";
import { onVideoUpload } from "@/subsribers/video";
import { onAudioUpload } from "@/subsribers/audio";

type Data = {
  message: string;
  error: any;
};

// http://localhost:9000/pranoto-bucket/videos/dunkirk.mp4

const BUCKET_NAME = "pranoto-bucket";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { query } = req;

  try {
    if (!query.url || typeof query?.url !== "string") {
      throw new Error("String URL query parameter needed");
    }

    const videoPath = query.url;
    const videoObjectName = videoPath.split(BUCKET_NAME)[1];
    const VideoFileName = videoObjectName.replace("/videos/", "");
    const videoFileNameWithoutFormat = VideoFileName.split(".")[0];

    await onVideoUpload(videoObjectName);
    await onAudioUpload(`${videoFileNameWithoutFormat}.mp3`);
    // TODO: insert transcription to database
    // TODO: update status to done

    return res.status(201).json({
      message: "Video has been successfully transcribed",
      error: null,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(400)
      .json({ message: "Failed to transcribe the video", error });
  }
}
