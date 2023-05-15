import { type NatsConnection, connect } from "nats";
import { config } from "../../config";

const connectionOptions = { servers: config.messaging.host };
let nc: NatsConnection;

export async function newConnection() {
  if (!nc) {
    nc = await connect(connectionOptions);
  }

  return nc;
}

export function closeConnection() {
  // this promise indicates the client closed
  const done = nc.closed();
  // drain and close the connection
  nc.drain()
    .then(() => done)
    .then((err) => {
      // // check if the close was OK
      if (err) {
        console.error(`error closing:`, err);
      }
    });
}
