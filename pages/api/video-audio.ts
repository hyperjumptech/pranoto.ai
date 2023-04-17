// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs';
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';

type Data = {
  name: string
}

const ffmpeg = createFFmpeg({ log: true });

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const fileName = req.query.filename
  const videoPath = `./public/videos/${fileName}`
  const audioPath = './public/audios/audio.mp3';
  
  try {
    (async () => {
      await ffmpeg.load();
      ffmpeg.FS('writeFile', 'temp.mov', await fetchFile(videoPath));
      await ffmpeg.run('-i', 'temp.mov', '-b:a', '192K', '-vn', 'temp.mp3');
      await fs.promises.writeFile(audioPath, ffmpeg.FS('readFile', 'temp.mp3'));
      
      ffmpeg.exit();
      process.exit(0);
    })();
  } catch (error) {
    console.log(error)
    res.status(400).json({ name: 'Failed converting video to audio' })
  }

  res.status(200).json({ name: 'Success converting video to audio' })
}
