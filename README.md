# Pranoto.ai

## Prerequisities

- [Docker](https://www.docker.com/) v20.x.x
- [Docker compose](https://docs.docker.com/compose/) v2
- [Python](https://www.python.org/) v3.9.9
- [FFmpeg](https://ffmpeg.org/) v5.x

## Getting Started

1. Run the system dependencies

```sh
cd .dev && docker compose up -d && cd ..
```

2. Run the frontend dependencies

```sh
cd frontend
npm ci
```

3. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## API Demo Usage

Use CURL or run the API url in browser:

[http://localhost:3000/api/upload-example](http://localhost:3000/api/upload-example)

Then see the result file in `public/audios/audio.mp3` and `public/texts/text.json`
