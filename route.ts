import { NextResponse } from 'next/server';
import DigestClient from 'digest-fetch';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ip = searchParams.get('ip');
  const user = searchParams.get('user');
  const pass = searchParams.get('pass');
  const type = searchParams.get('type');

  if (!ip || !user || !pass || !type) {
    return new NextResponse('Missing camera credentials', { status: 400 });
  }

  const client = new DigestClient(user, pass);
  
  // Hikvision requires Sub-stream (102) to be explicitly set to MJPEG in the camera's web UI!
  const streamUrl = type === 'axis' 
    ? `http://${ip}/axis-cgi/mjpg/video.cgi?resolution=640x360&compression=30` 
    : `http://${ip}/ISAPI/Streaming/channels/102/httpPreview`;

  try {
    const res = await client.fetch(streamUrl, { method: 'GET', cache: 'no-store' });

    if (!res.ok) throw new Error(`Camera returned HTTP ${res.status}`);

    return new NextResponse(res.body as any, {
      headers: {
        'Content-Type': res.headers.get('Content-Type') || 'multipart/x-mixed-replace; boundary=--myboundary',
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'Connection': 'keep-alive',
        'Transfer-Encoding': 'chunked'
      },
    });
  } catch (error: any) {
    console.error('Video Stream Error:', error);
    return new NextResponse('Stream Failed', { status: 500 });
  }
}