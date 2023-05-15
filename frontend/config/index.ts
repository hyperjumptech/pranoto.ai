import dotenv from "dotenv";

dotenv.config();

type DB = {
  uri: string;
};

type Messaging = { host: string };

type ObjectStorage = {
  accessKey: string;
  secretKey: string;
  bucketName: string;
  host: string;
  port: number;
  useSSL: boolean;
};

type ModelSize = "tiny" | "base" | "small" | "medium" | "large";

type Whisper = { modelSize: ModelSize };

type Config = {
  db: DB;
  objectStorage: ObjectStorage;
  messaging: Messaging;
  whisper: Whisper;
};

export const config: Config = {
  db: {
    uri:
      process.env.DATABASE_URL ||
      "postgresql://pranoto_user:pranoto_password@localhost:5432/pranoto_db?schema=public&tcpKeepAlive=true",
  },
  messaging: {
    host: process.env.MESSAGING_HOST || "localhost",
  },
  objectStorage: {
    accessKey: process.env.OBJECT_STORAGE_ACCESS_KEY || "pranoto_access_key",
    secretKey: process.env.OBJECT_STORAGE_SECRET_KEY || "pranoto_secret_key",
    bucketName: process.env.OBJECT_STORAGE_BUCKET_NAME || "pranoto-bucket",
    host: process.env.OBJECT_STORAGE_HOST || "localhost",
    port: Number(process.env.OBJECT_STORAGE_PORT) || 9000,
    useSSL: Boolean(process.env.OBJECT_STORAGE_USE_SSL) || false,
  },
  whisper: {
    modelSize: (process.env.WHISPER_MODEL_SIZE as ModelSize) || "tiny",
  },
};
