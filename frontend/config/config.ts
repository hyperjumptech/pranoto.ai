import dotenv from 'dotenv';

dotenv.config()


export const config = {
    db: {
        host: process.env.DB_HOST || '0.0.0.0',
        port: process.env.DB_PORT || '5432',
        user: process.env.DB_USER || 'pranoto_user',
        password: process.env.DB_PASWORD || 'pranoto_password',
        dbname: process.env.DB_NAME || 'pranoto_db',
        uri: process.env.CONNECTION_STRING || ''
    },
    storage: {
        // object storage
        accessKey: process.env.STORAGE_ACCESS_KEY || 'pranoto_access_key',
        secretKey: process.env.STORAGE_SECRET_KEY || 'pranoto_secret_key',
        bucketName: process.env.STORAGE_BUCKET_NAME || 'pranoto-bucket',
        host:process.env.STORAGE_HOST || '0.0.0.0',
        port: process.env.STORAGE_PORT || 9000,
    },
    queue: {
        // Redis or natt
        host: process.env.QUEUE_HOST || '0.0.0.0',
        port: process.env.QUEUE_PORT || '',
        uri: process.env.QUEUE_URI || ''
    },
    language: {
        default: process.env.DEFAULT_LANGUAGE || "auto" // english, french, etc..
    }
    
}


