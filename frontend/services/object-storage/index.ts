import * as Minio from "minio";
import { config } from '../../config/config'

const BUCKET_NAME = config.storage.bucketName;
const minioClient = new Minio.Client({
  endPoint: config.storage.host,
  port: Number(config.storage.port), 
  accessKey: config.storage.accessKey,
  secretKey: config.storage.secretKey
});

type DownloadFileParams = {
  objectStorageName: string;
  destinationFSPath: string;
};

export async function downloadFile({
  destinationFSPath,
  objectStorageName,
}: DownloadFileParams) {
  await minioClient.fGetObject(
    BUCKET_NAME,
    objectStorageName,
    destinationFSPath
  );
}

type UploadFileParams = { targetFSPath: string; objectStorageName: string };

export async function uploadFile({
  targetFSPath,
  objectStorageName,
}: UploadFileParams) {
  await minioClient.fPutObject(BUCKET_NAME, objectStorageName, targetFSPath);
}
