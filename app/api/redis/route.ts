import { NextRequest, NextResponse } from 'next/server';
import { fetchRedisData, setRedisKey, deleteRedisKey } from '@/lib/redisClient';

export async function GET() {
  try {
    const data = await fetchRedisData();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to interact with Redis' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { key, value, ttl } = body;

    if (!key || value === undefined) {
      return NextResponse.json(
        { error: 'Key and value are required' },
        { status: 400 }
      );
    }

    const ttlNum = ttl ? parseInt(ttl, 10) : undefined;
    const result = await setRedisKey(key, value, ttlNum);

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to set Redis key' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (!key) {
      return NextResponse.json(
        { error: 'Key parameter is required' },
        { status: 400 }
      );
    }

    const result = await deleteRedisKey(key);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to delete Redis key' },
      { status: 500 }
    );
  }
}
