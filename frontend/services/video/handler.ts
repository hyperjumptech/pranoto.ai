import type { NextApiRequest, NextApiResponse } from "next";
import { type ValidationError, object, string } from "yup";
import mime from "mime-types";
import type { Segment, Video } from "@prisma/client";
import { config } from "@/config";
import { publishVideoUploaded } from "@/events/publishers/video";
import { getObjectStorageNameFrom } from "@/pkg/object-storage";
import { getUnixTimeStamp } from "@/pkg/time";
import { find, getSegmentsBy, getVideos, insert, update } from "./repository";
import { getPresignedURL } from "../object-storage";

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
    await validateCreateVideoInput(body);

    const { type, title } = body;
    const video = await insert({ title, type });
    const second = 1;
    const expiry = 30 * second;
    const presignedURL = await getPresignedURL(
      createObjectName({ id: video.id, videoType: video.type }),
      type,
      expiry
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

async function validateCreateVideoInput(
  video: Pick<Video, "title" | "type">
): Promise<void> {
  const videoSchema = object({
    type: string().required().label("Type"),
    title: string().required().label("Title"),
  }).noUnknown();

  try {
    await videoSchema.validate(video);
  } catch (error) {
    throw new Error((error as ValidationError).errors[0]);
  }
}

export async function edit(
  { body, query }: NextApiRequest,
  res: NextApiResponse
) {
  try {
    await validateEditVideoInput(body);

    const isVideoURLUpdated =
      (await find(query?.id as string))?.url !== body.url;

    await update(query?.id as string, body);

    // publish an event when video url change
    if (isVideoURLUpdated) {
      await publishVideoUploaded({
        id: query?.id as string,
        objectStorageName: getObjectStorageNameFrom({
          bucketName: config.objectStorage.bucketName,
          url: body.url,
        }),
      });
    }

    return res.status(200).json({ message: "Updated" });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({
      message: "Failed to update a video",
      error: error.message,
    });
  }
}

async function validateEditVideoInput(
  video: Pick<Video, "status" | "text" | "title" | "url">
): Promise<void> {
  const videoSchema = object({
    status: string()
      .required()
      .oneOf(["DONE", "TRANSCRIBING", "CONVERTING", "QUEUEING"])
      .label("Status"),
    text: string().label("Text"),
    title: string().required().label("Title"),
    url: string()
      .required()
      // .url()
      .label("Video"),
  }).noUnknown();

  try {
    await videoSchema.validate(video);
  } catch (error) {
    throw new Error((error as ValidationError).errors[0]);
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

type SegmentListResponse = BaseResponse & {
  data?: Segment[];
};

export async function indexSegment(
  { query }: NextApiRequest,
  res: NextApiResponse<SegmentListResponse>
) {
  try {
    const segments = await getSegmentsBy(query?.id as string, {
      search: parseSearchQueryString(query?.q),
    });

    return res.status(200).json({
      message: "OK",
      data: segments,
    });
  } catch (error: any) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to get videos.",
      error: error?.message,
    });
  }
}
