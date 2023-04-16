import type { NextApiRequest, NextApiResponse } from "next";
import { type ValidationError, object, string } from "yup";
import * as Minio from "minio";
import mime from "mime-types";
import type { Video } from "./entity";
import { getVideos, insert, update } from "./repository";
import { getUnixTimeStamp } from "@/pkg/time";

type BaseResponse = {
  message: string;
  error?: Error;
};

type VideoListResponse = BaseResponse & {
  data?: Omit<Video, "text">[];
};

export async function index(
  req: NextApiRequest,
  res: NextApiResponse<VideoListResponse>
) {
  try {
    const videos = await getVideos({
      search: parseSearchQueryString(req.query?.q),
    });

    return res.status(200).json({
      message: "OK",
      data: videos,
    });
  } catch (error: any) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to get videos.",
      error: error?.message,
    });
  }
}

export async function create({ body }: NextApiRequest, res: NextApiResponse) {
  try {
    const videoSchema = object({
      type: string().required().label("Type"),
      title: string().required().label("Title"),
    }).noUnknown();

    await videoSchema.validate(body);
  } catch (error: unknown) {
    return res.status(400).json({
      message: "Failed to add a video",
      error,
    });
  }

  try {
    const { type, title } = body;
    const video = await insert({ title, type });
    // return presigned url
    const presignedURL = await getPresignedURL(
      createObjectName({ id: video.id, videoType: video.type }),
      type
    );

    return res
      .status(201)
      .json({ message: "Created", data: { ...video, presignedURL } });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({
      message: "Failed to add a video",
      error: error?.message,
    });
  }
}

export async function edit(
  { body, query }: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const videoSchema = object({
      status: string()
        .required()
        .oneOf(["done", "transcribing", "converting", "queueing"])
        .label("Status"),
      text: string().label("Text"),
      title: string().required().label("Title"),
      url: string()
        .required()
        // .url()
        .label("Video"),
    }).noUnknown();

    await videoSchema.validate(body);
  } catch (error: unknown) {
    return res.status(400).json({
      message: "Failed to update the video",
      errors: (error as ValidationError).errors,
    });
  }

  try {
    await update(query?.id as string, body);

    // publish an event when video url change
    // subscriber download the video and convert to audio and download to object storage (status: converting)
    // publish an event when audio ready
    // subscriber download the audio, transcribe the audio, and insert the output to database (status: transcribing)
    // publish an event when trancription ready
    // subscriber update status to done (status: done)

    return res.status(200).json({ message: "Updated" });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({
      message: "Failed to update a video",
      error: error.message,
    });
  }
}

function parseSearchQueryString(
  queryString: string | string[] | undefined
): string {
  if (!queryString) {
    return "";
  }

  if (typeof queryString === "string") {
    return queryString;
  }

  return queryString.join(". ");
}

type ObjectNameParams = {
  id: string;
  videoType: string;
};

function createObjectName({ id, videoType }: ObjectNameParams): string {
  const extension = mime.extension(videoType);
  const timeNow = getUnixTimeStamp();

  return `videos/${id}_${timeNow}.${extension}`;
}

async function getPresignedURL(
  objectName: string,
  contentType: string
): Promise<string> {
  const minioClient = new Minio.Client({
    endPoint: "localhost",
    port: 9000,
    useSSL: false,
    accessKey: "pranoto_access_key",
    secretKey: "pranoto_secret_key",
  });

  const BUCKET_NAME = "pranoto-bucket";
  const second = 1;
  const expiry = 30 * second;
  const presignedURL = await minioClient.presignedUrl(
    "PUT",
    BUCKET_NAME,
    objectName,
    expiry,
    { "x-amz-acl": "public-read", "content-type": contentType }
  );

  return presignedURL;
}
