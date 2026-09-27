import { consumeTopic, createLogConsumer } from "@/lib/kafka";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const encoder = new TextEncoder();
  let closed = false;
  let heartbeat: ReturnType<typeof setInterval> | undefined;

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        if (closed) return;
        try {
          controller.enqueue(
            encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
          );
        } catch {
          closed = true;
        }
      };

      send("status", { connected: true, topic: consumeTopic });

      const consumer = createLogConsumer();

      const cleanup = async () => {
        if (closed) return;
        closed = true;
        if (heartbeat) clearInterval(heartbeat);
        try {
          await consumer.disconnect();
        } catch {
          // ignore disconnect errors on teardown
        }
        try {
          controller.close();
        } catch {
          // already closed
        }
      };

      request.signal.addEventListener("abort", () => {
        void cleanup();
      });

      heartbeat = setInterval(() => {
        send("ping", { t: Date.now() });
      }, 15000);

      try {
        await consumer.connect();
        await consumer.subscribe({ topic: consumeTopic, fromBeginning: false });

        await consumer.run({
          eachMessage: async ({ topic, partition, message }) => {
            const value = message.value?.toString() ?? "";
            send("message", {
              topic,
              partition,
              offset: message.offset,
              key: message.key?.toString() ?? null,
              value,
              timestamp: message.timestamp,
              receivedAt: new Date().toISOString(),
            });
          },
        });
      } catch (error: unknown) {
        const errMsg =
          error instanceof Error ? error.message : "Kafka consumer failed";
        send("error", { error: errMsg });
        await cleanup();
      }
    },
    cancel() {
      closed = true;
      if (heartbeat) clearInterval(heartbeat);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
