import { NextRequest, NextResponse } from "next/server";
import { pauseDownloadViaGrpc } from "@/lib/grpcClient";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { filename } = body;

    if (!filename) {
      return NextResponse.json(
        { error: "Filename is required" },
        { status: 400 }
      );
    }

    const result = await pauseDownloadViaGrpc(filename);

    if (!result.success) {
      return NextResponse.json(result, { status: 502 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to pause download via gRPC" },
      { status: 500 }
    );
  }
}
