import * as Minio from "minio";
import { config } from "../../config";

const { accessKey, bucketName, host, port, secretKey, useSSL } =
  config.objectStorage;
const minioClient = new Minio.Client({
  endPoint: host,
  port: port,
  accessKey: accessKey,
  secretKey: secretKey,
  useSSL,
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

export async function getPresignedURL(
  objectName: string,
  contentType: string,
  expiry: number
): Promise<string> {
  const presignedURL = await minioClient.presignedUrl(
    "PUT",
    bucketName,
    objectName,
    expiry,
    { "x-amz-acl": "public-read", "content-type": contentType }
  );

  return presignedURL;
}
