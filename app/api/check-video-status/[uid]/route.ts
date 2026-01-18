// app/api/check-video-status/[uid]/route.ts
import { NextRequest, NextResponse } from 'next/server';

const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const CLOUDFLARE_CUSTOMER_CODE = process.env.CLOUDFLARE_CUSTOMER_CODE;
const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ uid: string }> }
) {
  try {
    const { uid } = await params;

    if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_API_TOKEN || !CLOUDFLARE_CUSTOMER_CODE) {
      return NextResponse.json(
        { error: 'Cloudflare credentials not configured' },
        { status: 500 }
      );
    }

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/stream/${uid}`,
      {
        headers: {
          'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to check video status' },
        { status: response.status }
      );
    }

    const data = await response.json();
    const video = data.result;

    console.log('Video data from Cloudflare:', video);

    // Check if video is ready
    const ready = video.status?.state === 'ready';

    // Use customer subdomain for playback URLs
    return NextResponse.json({
      ready,
      playback_url: `https://customer-${CLOUDFLARE_CUSTOMER_CODE}.cloudflarestream.com/${uid}/manifest/video.m3u8`,
      thumbnail_url: `https://customer-${CLOUDFLARE_CUSTOMER_CODE}.cloudflarestream.com/${uid}/thumbnails/thumbnail.jpg`,
      duration: video.duration || 0,
    });
  } catch (error) {
    console.error('Error checking video status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}