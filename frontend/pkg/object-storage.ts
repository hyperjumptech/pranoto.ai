import { config } from '../config/config'

const BUCKET_NAME = config.storage.bucketName;

export function getObjectStorageNameFrom(url: string) {
  return url.split(BUCKET_NAME)[1];
}
