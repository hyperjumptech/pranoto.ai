import { exec } from "node:child_process";
import fs from "node:fs/promises";
import { promisify } from "node:util";
import { downloadFile, uploadFile } from "@/services/object-storage";
import { update } from "@/services/video/repository";
import { publishVideoConverted } from "../publishers/video";
import { VideoStatus } from "@prisma/client";

const execPromisify = promisify(exec);

type OnVideoUploadParams = {
  id: string;
  objectStorageName: string;
};

export async function onVideoUpload({
  id,
  objectStorageName,
}: OnVideoUploadParams): Promise<void> {
  const VideoFileName = objectStorageName.replace("/videos/", "");
  const videoFileNameWithoutFormat = VideoFileName.split(".")[0];
  const videoFSPath = `/tmp/${VideoFileName}`;

  await update(id, { status: VideoStatus.CONVERTING });

  console.info(`Video ${objectStorageName} downloading to ${videoFSPath}`);
  await downloadFile({
    destinationFSPath: videoFSPath,
    objectStorageName,
  });

  const audioDestinationFSPath = `/tmp/${videoFileNameWithoutFormat}.mp3`;
  console.info(`Video ${videoFSPath} converting to ${audioDestinationFSPath}`);
  await convertVideoToAudio({
    audioDestinationFSPath,
    videoFSPath,
  });

  const audioObjectStorageName = `/audios/${videoFileNameWithoutFormat}.mp3`;
  console.info(
    `Audio ${audioDestinationFSPath} uploading to ${audioObjectStorageName}`
  );
  await uploadFile({
    objectStorageName: audioObjectStorageName,
    targetFSPath: audioDestinationFSPath,
  });

  await update(id, { status: VideoStatus.CONVERTED });

  await publishVideoConverted({
    id,
    objectStorageName,
  });

  // delete temporary file
  console.info(`Deleting temporary file ${videoFSPath}`);
  fs.rm(videoFSPath);
  console.info(`Deleting temporary file ${audioDestinationFSPath}`);
  fs.rm(audioDestinationFSPath);
}

type ConvertVideoToAudio = {
  videoFSPath: string;
  audioDestinationFSPath: string;
};

async function convertVideoToAudio({
  audioDestinationFSPath,
  videoFSPath,
}: ConvertVideoToAudio): Promise<void> {
  const cmd = `ffmpeg -y -i ${videoFSPath} -b:a 192K -vn ${audioDestinationFSPath}`;
  console.info(`Video Run: ${cmd}`);

  await execPromisify(cmd);
}
