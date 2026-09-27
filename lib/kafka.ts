import { Kafka } from "kafkajs";
import {getSecret} from "@/lib/loadSecrets";


const broker = getSecret("CFG_KAFKA_BROKER")  || "localhost:9092";
const topic_produce = getSecret("CFG_KAFKA_PRODUCE_TOPIC")  || "anime-op";

export const kafka = new Kafka({
    clientId: "my-typescript-app",
    brokers: [broker],
});

export const producer = kafka.producer();
export const consumer = kafka.consumer({
    groupId: "nextjs-group",
});




export async function produceUrl(url: string): Promise<void> {
    await producer.connect();

    await producer.send({
        topic: topic_produce,
        messages: [
            {
                value: JSON.stringify({ url }),
            },
        ],
    });
}