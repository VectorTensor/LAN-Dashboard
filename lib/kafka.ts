import { Kafka, type Consumer } from "kafkajs";
import { getSecret } from "@/lib/loadSecrets";

const broker = getSecret("CFG_KAFKA_BROKER") || "localhost:9092";
export const produceTopic =
  getSecret("CFG_KAFKA_PRODUCE_TOPIC") || "anime-op";
export const consumeTopic =
  getSecret("CFG_KAFKA_CONSUME_TOPIC") || produceTopic;

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

export function createLogConsumer(groupId?: string): Consumer {
  return kafka.consumer({
    groupId: groupId || `music-log-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  });
}
