import { publish } from "@/services/pubsub/publisher";
import { events } from "../";

type PublishVideoEventParams = {
  id: string;
  objectStorageName: string;
};

export async function publishVideoConverted({
  id,
  objectStorageName,
}: PublishVideoEventParams) {
  await publish(events.video.converted, {
    id,
    objectStorageName,
  });
}

export async function publishVideoUploaded({
  id,
  objectStorageName,
}: PublishVideoEventParams) {
  await publish(events.video.uploaded, {
    id,
    objectStorageName,
  });
}
