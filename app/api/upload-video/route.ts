// app/api/upload-video/route.ts
import { NextRequest, NextResponse } from 'next/server';

const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_API_TOKEN) {
      return NextResponse.json(
        { error: 'Cloudflare credentials not configured' },
        { status: 500 }
      );
    }

    // Upload to Cloudflare Stream
    const cloudflareFormData = new FormData();
    cloudflareFormData.append('file', file);

    const uploadResponse = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/stream`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
        },
        body: cloudflareFormData,
      }
    );

    if (!uploadResponse.ok) {
      const errorData = await uploadResponse.json();
      console.error('Cloudflare upload error:', errorData);
      return NextResponse.json(
        { error: 'Failed to upload to Cloudflare Stream' },
        { status: uploadResponse.status }
      );
    }

    const data = await uploadResponse.json();
    const video = data.result;

    // Return the Cloudflare data
    return NextResponse.json({
      cloudflare_uid: video.uid,
      playback_url: `https://customer-${CLOUDFLARE_ACCOUNT_ID}.cloudflarestream.com/${video.uid}/manifest/video.m3u8`,
      thumbnail_url: `https://customer-${CLOUDFLARE_ACCOUNT_ID}.cloudflarestream.com/${video.uid}/thumbnails/thumbnail.jpg`,
      duration: video.duration || 0,
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}