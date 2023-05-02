import { exec } from "node:child_process";
import { promisify } from "node:util";
import { downloadFile, uploadFile } from "@/services/object-storage";
import { updateStatus } from "@/services/video/repository";
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

  await updateStatus(id, VideoStatus.CONVERTING);

  console.info(`Video ${objectStorageName} downloading to ${videoFSPath}`);
  await downloadFile({
    destinationFSPath: videoFSPath,
    objectStorageName,
  });
  console.info(`Video ${objectStorageName} downloaded to ${videoFSPath}`);

  const audioDestinationFSPath = `/tmp/${videoFileNameWithoutFormat}.mp3`;
  console.info(`Video ${videoFSPath} converting to ${audioDestinationFSPath}`);
  await convertVideoToAudio({
    audioDestinationFSPath,
    videoFSPath,
  });
  console.info(`Video ${videoFSPath} converted to ${audioDestinationFSPath}`);

  const audioObjectStorageName = `/audios/${videoFileNameWithoutFormat}.mp3`;
  console.info(
    `Audio ${audioDestinationFSPath} uploading to ${audioObjectStorageName}`
  );
  await uploadFile({
    objectStorageName: audioObjectStorageName,
    targetFSPath: audioDestinationFSPath,
  });
  console.info(
    `Audio ${audioDestinationFSPath} uploaded to ${audioObjectStorageName}`
  );

  await updateStatus(id, VideoStatus.CONVERTED);

  await publishVideoConverted({
    id,
    objectStorageName,
  });

  // TODO: delete all temporary FS data
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
