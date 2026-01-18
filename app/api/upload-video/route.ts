// app/api/upload-video/route.ts
import { NextRequest, NextResponse } from 'next/server';

const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;

// Increase body size limit for video uploads
export const runtime = 'nodejs';
export const maxDuration = 120; // 90 seconds timeout

export async function POST(request: NextRequest) {
  console.log('=== UPLOAD VIDEO ROUTE CALLED ===');
  console.log('Environment check:', {
    hasAccountId: !!CLOUDFLARE_ACCOUNT_ID,
    hasApiToken: !!CLOUDFLARE_API_TOKEN,
    accountIdLength: CLOUDFLARE_ACCOUNT_ID?.length,
  });

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    console.log('File received:', {
      hasFile: !!file,
      fileName: file?.name,
      fileSize: file?.size,
      fileType: file?.type,
    });

    if (!file) {
      console.error('No file in request');
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_API_TOKEN) {
      console.error('Missing Cloudflare credentials:', {
        hasAccountId: !!CLOUDFLARE_ACCOUNT_ID,
        hasApiToken: !!CLOUDFLARE_API_TOKEN,
      });
      return NextResponse.json(
        { error: 'Cloudflare credentials not configured' },
        { status: 500 }
      );
    }

    console.log('Starting Cloudflare upload...');

    // Upload to Cloudflare Stream
    const cloudflareFormData = new FormData();
    cloudflareFormData.append('file', file);

    const uploadUrl = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/stream`;
    console.log('Upload URL:', uploadUrl);

    const uploadResponse = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
      },
      body: cloudflareFormData,
    });

    const responseText = await uploadResponse.text();
    console.log('Cloudflare response status:', uploadResponse.status);
    console.log('Cloudflare response body:', responseText);

    if (!uploadResponse.ok) {
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch {
        errorData = { message: responseText };
      }
      console.error('Cloudflare upload failed:', errorData);
      return NextResponse.json(
        { 
          error: 'Failed to upload to Cloudflare Stream',
          details: errorData,
          status: uploadResponse.status,
        },
        { status: uploadResponse.status }
      );
    }

    const data = JSON.parse(responseText);
    const video = data.result;

    console.log('Upload successful! Video UID:', video.uid);

    // Return the Cloudflare data
    return NextResponse.json({
      cloudflare_uid: video.uid,
      playback_url: `https://customer-${CLOUDFLARE_ACCOUNT_ID}.cloudflarestream.com/${video.uid}/manifest/video.m3u8`,
      thumbnail_url: `https://customer-${CLOUDFLARE_ACCOUNT_ID}.cloudflarestream.com/${video.uid}/thumbnails/thumbnail.jpg`,
      duration: video.duration || 0,
    });

  } catch (error) {
    console.error('=== UPLOAD ERROR ===');
    console.error('Error type:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('Error message:', error instanceof Error ? error.message : String(error));
    console.error('Full error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}