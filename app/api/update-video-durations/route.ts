// app/api/update-video-durations/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;

export async function POST() {
  console.log('=== UPDATE VIDEO DURATIONS CALLED ===');

  try {
    if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_API_TOKEN) {
      return NextResponse.json(
        { error: 'Cloudflare credentials not configured' },
        { status: 500 }
      );
    }

    // Get all videos with duration_seconds = 0
    const { data: videos, error: fetchError } = await supabase
      .from('videos')
      .select('id, cloudflare_uid, title')
      .eq('duration_seconds', 0);

    if (fetchError) {
      console.error('Error fetching videos:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch videos' },
        { status: 500 }
      );
    }

    if (!videos || videos.length === 0) {
      return NextResponse.json({
        message: 'No videos need duration updates',
        updated: 0,
      });
    }

    console.log(`Found ${videos.length} videos to update`);

    const results = {
      success: [] as string[],
      failed: [] as string[],
      stillProcessing: [] as string[],
    };

    // Update each video
    for (const video of videos) {
      try {
        console.log(`Checking video ${video.cloudflare_uid} (${video.title})`);

        // Fetch video details from Cloudflare
        const response = await fetch(
          `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/stream/${video.cloudflare_uid}`,
          {
            headers: {
              'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
            },
          }
        );

        if (!response.ok) {
          console.error(`Failed to fetch Cloudflare data for ${video.cloudflare_uid}`);
          results.failed.push(video.title);
          continue;
        }

        const data = await response.json();
        const cloudflareVideo = data.result;

        // Check if video is ready and has duration
        if (cloudflareVideo.status?.state !== 'ready') {
          console.log(`Video ${video.cloudflare_uid} is still processing`);
          results.stillProcessing.push(video.title);
          continue;
        }

        const duration = cloudflareVideo.duration || 0;

        if (duration === 0) {
          console.log(`Video ${video.cloudflare_uid} has no duration yet`);
          results.stillProcessing.push(video.title);
          continue;
        }

        // Update duration in database
        const { error: updateError } = await supabase
          .from('videos')
          .update({ duration_seconds: Math.round(duration) })
          .eq('id', video.id);

        if (updateError) {
          console.error(`Failed to update video ${video.id}:`, updateError);
          results.failed.push(video.title);
        } else {
          console.log(`Updated ${video.title} with duration ${duration}s`);
          results.success.push(video.title);
        }

        // Add a small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        console.error(`Error processing video ${video.id}:`, error);
        results.failed.push(video.title);
      }
    }

    return NextResponse.json({
      message: 'Duration update completed',
      total: videos.length,
      updated: results.success.length,
      failed: results.failed.length,
      stillProcessing: results.stillProcessing.length,
      details: results,
    });

  } catch (error) {
    console.error('Update durations error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}