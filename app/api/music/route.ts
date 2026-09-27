import { NextRequest, NextResponse } from "next/server";
import { produceMusic, produceTopic } from "@/lib/kafka";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, title } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    await produceMusic({
      url: url.trim(),
      title: typeof title === "string" ? title.trim() : undefined,
    });

    return NextResponse.json({
      success: true,
      topic: produceTopic,
      message: "Music message sent to Kafka",
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to produce Kafka message";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
