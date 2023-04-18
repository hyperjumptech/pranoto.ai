const BUCKET_NAME = "pranoto-bucket";

export function getObjectStorageNameFrom(url: string) {
  return url.split(BUCKET_NAME)[1];
}
