// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";

type Data = {
  name: string;
};

const ffmpeg = createFFmpeg({ log: true });

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const videoPath = `./public/videos/video.mov`;
  const audioPath = `./public/audios/audio.mp3`;

  async function convertVideoToAudio() {
    await ffmpeg.load();
    ffmpeg.FS("writeFile", "temp.mov", await fetchFile(videoPath));
    await ffmpeg.run("-i", "temp.mov", "-b:a", "192K", "-vn", "temp.mp3");
    await fs.promises.writeFile(audioPath, ffmpeg.FS("readFile", "temp.mp3"));
  }

  async function transcribeAudio() {
    // TODO: use whisper
  }

  try {
    convertVideoToAudio();
    transcribeAudio()
  } catch (error) {
    console.error(error);
    res.status(400).json({ name: "Failed converting video to audio" });
  }

  res.status(200).json({ name: "Success converting video to audio" });
}
