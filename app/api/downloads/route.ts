import { NextRequest, NextResponse } from 'next/server';
import { fetchDownloadsFromGrpc, createDownloadViaGrpc } from '@/lib/grpcClient';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || '';
    
    // Perform server-side gRPC client call
    const response = await fetchDownloadsFromGrpc(filter);
    
    return NextResponse.json(response);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch downloads via gRPC' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { filename, url } = body;

    if (!filename || !url) {
      return NextResponse.json(
        { error: 'Filename and URL are required' },
        { status: 400 }
      );
    }

    // Perform server-side gRPC client call
    const result = await createDownloadViaGrpc(filename, url);

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to create download via gRPC' },
      { status: 500 }
    );
  }
}
