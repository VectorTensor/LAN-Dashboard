import { Kafka } from "kafkajs";
import { getSecret } from "@/lib/loadSecrets";

const broker = getSecret("CFG_KAFKA_BROKER") || "localhost:9092";
export const produceTopic =
  getSecret("CFG_KAFKA_PRODUCE_TOPIC") || "anime-op";

export const taskTopic = getSecret("CFG_KAFKA_TASK_TOPIC") || "events-task";

export const kafka = new Kafka({
  clientId: "my-typescript-app",
  brokers: [broker],
});

export const producer = kafka.producer();

let producerConnectPromise: Promise<void> | null = null;

async function ensureProducerConnected(): Promise<void> {
  if (!producerConnectPromise) {
    producerConnectPromise = producer.connect().catch((err) => {
      producerConnectPromise = null;
      throw err;
    });
  }
  await producerConnectPromise;
}

export async function produceUrl(url: string): Promise<void> {
  await ensureProducerConnected();

  await producer.send({
    topic: produceTopic,
    messages: [
      {
        value: JSON.stringify({ url }),
      },
    ],
  });
}

export async function produceMusic(payload: {
  url: string;
  title?: string;
}): Promise<void> {
  await ensureProducerConnected();

  // Each call sends a fresh message — intentional duplicates are allowed.
  await producer.send({
    topic: produceTopic,
    messages: [
      {
        value: JSON.stringify({
          url: payload.url,
        }),
      },
    ],
  });
}


export type generalDownloadPayload = {
  file_url: string;
  downloadType: string;
  name: string;
  mediaType: string;
  additional_info: object;
}


export type animeEventPyload = {
  name: string;

}

export type payloadType = animeEventPyload | generalDownloadPayload;

export type EventPayload = {
  job_type: string;
  event_source: string;
  initiated_by: string;
  payload_id: string;
  payload: payloadType;


}

export async function produceEvent(payload: EventPayload): Promise<void> {
  await ensureProducerConnected();

  await producer.send({
    topic: taskTopic,
    messages: [
      {
        value: JSON.stringify(payload),
      },
    ],
  });


}
