import * as Minio from "minio";

const BUCKET_NAME = "pranoto-bucket";
const minioClient = new Minio.Client({
  endPoint: "localhost",
  port: 9000,
  useSSL: false,
  accessKey: "pranoto_access_key",
  secretKey: "pranoto_secret_key",
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
