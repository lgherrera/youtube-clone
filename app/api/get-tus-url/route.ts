// app/api/get-tus-url/route.ts
import { NextRequest, NextResponse } from 'next/server';

const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;

export async function POST(request: NextRequest) {
  console.log('=== GET TUS URL CALLED ===');

  try {
    const body = await request.json();
    const { fileSize } = body;

    if (!fileSize || fileSize <= 0) {
      return NextResponse.json(
        { error: 'Invalid file size' },
        { status: 400 }
      );
    }

    if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_API_TOKEN) {
      console.error('Missing Cloudflare credentials');
      return NextResponse.json(
        { error: 'Cloudflare credentials not configured' },
        { status: 500 }
      );
    }

    const uploadUrl = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/stream?direct_user=true`;
    console.log('Requesting TUS URL from:', uploadUrl);
    console.log('File size:', fileSize);

    // Create TUS upload URL with proper Upload-Length header
    const response = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
        'Tus-Resumable': '1.0.0',
        'Upload-Length': fileSize.toString(),
      },
    });

    console.log('Cloudflare TUS response status:', response.status);

    if (!response.ok) {
      const responseText = await response.text();
      console.error('Failed to get TUS URL:', responseText);
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch {
        errorData = { message: responseText };
      }
      return NextResponse.json(
        { error: 'Failed to get upload URL', details: errorData },
        { status: response.status }
      );
    }

    const uploadURL = response.headers.get('location');
    console.log('Upload URL from headers:', uploadURL);

    if (!uploadURL) {
      console.error('No location header in response');
      return NextResponse.json(
        { error: 'No upload URL returned from Cloudflare' },
        { status: 500 }
      );
    }

    const uid = uploadURL.split('/').pop();
    console.log('Extracted UID:', uid);

    return NextResponse.json({ uploadURL, uid });
  } catch (error) {
    console.error('Error getting TUS URL:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}