import { edit } from "@/services/video/handler";
import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case "PUT":
      return edit(req, res);

    default:
      return res.status(404).json({ message: "Endpoint does not exist." });
  }
}
