# Pranoto.ai

## About
Pranoto.ai is an open source product, which allow users to upload, transcribe, and index their videos. The product is useful for those who want to have a knowledge management platform in video format with index/search capabilities.

## Prerequisities

The following components must be installed prior to usage of Pranoto.ai.

- [Docker](https://www.docker.com/) v20.x.x
- [Docker compose](https://docs.docker.com/compose/) v2
- [Node.js](https://nodejs.org/en) v16.x.x
- [FFmpeg](https://ffmpeg.org/) v6.0
- [Python](https://www.python.org/) v3.9.9
- [Whisper](https://github.com/openai/whisper) v20230314

## Getting Started

### Development

1. Run the system dependencies

```sh
cd .dev && docker compose up -d && cd ..
```

Please note, if you have local database with 5432 port, you need to edit docker-compose.yaml to expose pranoto-postgres port to other than 5432. For example 5442, thus, "- 5442:5432".

2. Run the frontend dependencies

```sh
cd frontend
npm ci
```

3. Copy the environment variable

```sh
cp .env.example .env
```

4. Migrate the database

```sh
npm run prisma:migrate-dev
```

5. Run the worker

```sh
npm run worker
```

6. Run the development server

```sh
npm run dev
```

## How to Use It

1. Open [http://localhost:3000](http://localhost:3000) with your browser to see UI.

2. Press Upload button

3. Select your video and Upload

4. Upon upload completion, video will be queued to be process (transcribed and indexed)

5. Upon processed (status of video is updated), video will be available to searches. Try to search any word or expression by typing any word and press search.

6. Result will be shown in the page result. Try to click to go into the point of time where word is mentioned in Video.
