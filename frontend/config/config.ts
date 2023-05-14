import dotenv from 'dotenv';

dotenv.config()


export const config = {
    db: {
        uri: process.env.CONNECTION_STRING || 'postgres://pranoto_user:pranoto_password@0.0.0.0:5432/pranoto_db'
    },
    storage: {
        // object storage
        accessKey: process.env.STORAGE_ACCESS_KEY || 'pranoto_access_key',
        secretKey: process.env.STORAGE_SECRET_KEY || 'pranoto_secret_key',
        bucketName: process.env.STORAGE_BUCKET_NAME || 'pranoto-bucket',
        host: process.env.STORAGE_HOST || '0.0.0.0',
        port: process.env.STORAGE_PORT || 9000,
        useSSL: process.env.STORAGE_SSL || false,
    },
    queue: {
        // Redis or natt
        host: '0.0.0.0',
    },
    whisper: {
        modelSize: process.env.MODEL_SIZE || 'tiny', // valid are 'tiny', 'base', 'small', 'medium', 'large';
    }
}


