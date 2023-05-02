import { type NatsConnection, JSONCodec } from "nats";
import events from "@/events";
import { onAudioUpload } from "@/events/subscribers/audio";
import { onVideoUpload } from "@/events/subscribers/video";
import { closeConnection, newConnection } from "@/services/pubsub/connect";

let nc: NatsConnection;
const jc = JSONCodec();
export const eventConsumers = [
  { event: events.video.uploaded, consumer: onVideoUpload },
  { event: events.video.converted, consumer: onAudioUpload },
];

async function main() {
  try {
    nc = await newConnection();
    console.info(`Connected to ${nc.getServer()}`);
  } catch (err: any) {
    console.error(`Error connecting to NATS server. ${err.message}`);
  }

  try {
    await Promise.all(
      eventConsumers.map((ec) => {
        subscribe(ec);
      })
    );
  } catch (error) {
    console.error(error);
  }
}

main();

type SubsribeParams = {
  event: string;
  consumer: (message: any) => Promise<void>;
};

async function subscribe({ event, consumer }: SubsribeParams) {
  const sub = nc.subscribe(event);

  (async () => {
    for await (const m of sub) {
      const messageData = jc.decode(m.data);

      console.info(
        `${m.subject}: [${sub.getProcessed()}] ${JSON.stringify(
          jc.decode(m.data)
        )}`
      );

      try {
        await consumer(messageData);
      } catch (error: any) {
        console.error(error.message);
      }
    }

    console.info(`Subscription ${event} closed`);
  })();
}

process.on("SIGTERM", () => {
  console.info("SIGTERM signal received.");
  closeConnection();
});

process.on("SIGINT", () => {
  console.info("SIGINT signal received.");
  closeConnection();
});
