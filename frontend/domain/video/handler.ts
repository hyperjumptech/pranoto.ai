import type { NextApiRequest, NextApiResponse } from "next";
import { type ValidationError, object, string } from "yup";
import type { Video } from "./entity";
import { getVideos, insert, update } from "./repository";

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
    await insert({ title: body.title });

    return res.status(201).json({ message: "Created" });
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
      videoURL: string()
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
