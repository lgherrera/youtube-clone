// app/api/get-tus-url/route.ts
import { NextResponse } from 'next/server';

const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;

export async function POST() {
  try {
    if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_API_TOKEN) {
      return NextResponse.json(
        { error: 'Cloudflare credentials not configured' },
        { status: 500 }
      );
    }

    // Create TUS upload URL
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/stream?direct_user=true`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
          'Tus-Resumable': '1.0.0',
          'Upload-Length': '0',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to get TUS URL:', errorText);
      return NextResponse.json(
        { error: 'Failed to get upload URL' },
        { status: response.status }
      );
    }

    const uploadURL = response.headers.get('location');
    const uid = uploadURL?.split('/').pop();

    return NextResponse.json({ uploadURL, uid });
  } catch (error) {
    console.error('Error getting TUS URL:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}