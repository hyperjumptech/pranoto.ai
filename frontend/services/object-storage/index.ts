import * as Minio from "minio";
import { config } from "../../config";

const { accessKey, bucketName, host, port, secretKey } = config.objectStorage;
const minioClient = new Minio.Client({
  endPoint: host,
  port: Number(port),
  accessKey: accessKey,
  secretKey: secretKey,
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
    bucketName,
    objectStorageName,
    destinationFSPath
  );
}

type UploadFileParams = { targetFSPath: string; objectStorageName: string };

export async function uploadFile({
  targetFSPath,
  objectStorageName,
}: UploadFileParams) {
  await minioClient.fPutObject(bucketName, objectStorageName, targetFSPath);
}
