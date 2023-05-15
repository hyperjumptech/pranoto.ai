import { exec } from "node:child_process";
import fs from "node:fs/promises";
import { promisify } from "node:util";
import { downloadFile, uploadFile } from "@/services/object-storage";
import { update, updateWithSegments } from "@/services/video/repository";
import { VideoStatus } from "@prisma/client";

const execPromisify = promisify(exec);

type OnAudioUploadParams = {
  id: string;
  objectStorageName: string;
};

export async function onAudioUpload({
  id,
  objectStorageName,
}: OnAudioUploadParams): Promise<void> {
  const fileName =
    objectStorageName.split("/")[objectStorageName.split("/").length - 1];
  const fileNameWithoutFormat = fileName.split(".")[0];
  const destinationFSPath = `/tmp/${fileName}`;

  await update(id, { status: VideoStatus.TRANSCRIBING });

  console.info(
    `Audio ${objectStorageName} downloading to ${destinationFSPath}`
  );
  await downloadFile({
    destinationFSPath,
    objectStorageName,
  });

  const outputFSPath = `/tmp/${fileNameWithoutFormat}.json`;
  console.info(`Audio ${destinationFSPath} transcribing to ${outputFSPath}`);
  await transcribeAudio({
    audioFSPath: destinationFSPath,
  });

  const transcriptionObjectStorageName = `/texts/${fileNameWithoutFormat}.json`;
  console.info(
    `Text ${outputFSPath} uploading to ${transcriptionObjectStorageName}`
  );
  await uploadFile({
    objectStorageName: transcriptionObjectStorageName,
    targetFSPath: outputFSPath,
  });

  console.info(`Insert transcription from ${outputFSPath} to database`);
  await storeTranscription({ id, transcriptionFSPath: outputFSPath });

  // delete temporary file
  console.info(`Deleting temporary file ${destinationFSPath}`);
  fs.rm(destinationFSPath);
  console.info(`Deleting temporary file ${outputFSPath}`);
  fs.rm(outputFSPath);
}

type TranscribeAudioParams = {
  audioFSPath: string;
  modelSize?: "tiny" | "base" | "small" | "medium" | "large";
};

async function transcribeAudio({
  audioFSPath,
  modelSize = "tiny",
}: TranscribeAudioParams): Promise<void> {
  const cmd = `whisper ${audioFSPath} --model ${modelSize} --output_format json --output_dir /tmp`;
  console.info(`Audio Run: ${cmd}`);

  await execPromisify(cmd);
}

export type WhisperSegment = {
  id: number;
  seek: number;
  start: number;
  end: number;
  text: string;
  tokens: number[];
  temperature: number;
  avg_logprob: number;
  compression_ratio: number;
  no_speech_prob: number;
};

type StoreTranscription = {
  id: string;
  transcriptionFSPath: string;
};

async function storeTranscription({
  id,
  transcriptionFSPath,
}: StoreTranscription) {
  const transcription = await fs.readFile(transcriptionFSPath, "utf8");
  const { segments, text }: { segments: WhisperSegment[]; text: string } =
    JSON.parse(transcription);
  await updateWithSegments(
    id,
    {
      status: VideoStatus.TRANSCRIBED,
      text,
    },
    segments.map(({ seek, start, end, text }) => ({
      seek,
      start,
      end,
      text,
    }))
  );
}
