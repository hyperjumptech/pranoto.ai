type ObjectStorage = {
  bucketName: string;
  url: string;
};

export function getObjectStorageNameFrom({ bucketName, url }: ObjectStorage) {
  return url.split(bucketName)[1];
}
