// app/api/videos/create/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    const title = formData.get('title') as string;
    const thumbnailFile = formData.get('thumbnail') as File;
    const sliderFile = formData.get('slider') as File;
    const cloudflare_uid = formData.get('cloudflare_uid') as string;
    const cloudflare_playback_url = formData.get('cloudflare_playback_url') as string;
    const cloudflare_thumbnail_url = formData.get('cloudflare_thumbnail_url') as string;
    const duration_seconds = parseInt(formData.get('duration_seconds') as string);
    const categories = JSON.parse(formData.get('categories') as string);
    const filename = formData.get('filename') as string; // Add this line

    if (!title || !thumbnailFile || !sliderFile || !cloudflare_uid || !filename) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Upload thumbnail to Supabase Storage
    const thumbnailExt = thumbnailFile.name.split('.').pop();
    const thumbnailFileName = `${cloudflare_uid}.${thumbnailExt}`;
    const thumbnailPath = `thumbnails/${thumbnailFileName}`;

    const { error: thumbnailUploadError } = await supabase.storage
      .from('videos')
      .upload(thumbnailPath, thumbnailFile, {
        contentType: thumbnailFile.type,
        upsert: true,
      });

    if (thumbnailUploadError) {
      console.error('Thumbnail upload error:', thumbnailUploadError);
      return NextResponse.json(
        { error: 'Failed to upload thumbnail' },
        { status: 500 }
      );
    }

    // Upload slider image to Supabase Storage
    const sliderExt = sliderFile.name.split('.').pop();
    const sliderFileName = `${cloudflare_uid}_slider.${sliderExt}`;
    const sliderPath = `sliders/${sliderFileName}`;

    const { error: sliderUploadError } = await supabase.storage
      .from('videos')
      .upload(sliderPath, sliderFile, {
        contentType: sliderFile.type,
        upsert: true,
      });

    if (sliderUploadError) {
      console.error('Slider upload error:', sliderUploadError);
      return NextResponse.json(
        { error: 'Failed to upload slider image' },
        { status: 500 }
      );
    }

    // Get public URLs
    const { data: thumbnailUrlData } = supabase.storage
      .from('videos')
      .getPublicUrl(thumbnailPath);

    const { data: sliderUrlData } = supabase.storage
      .from('videos')
      .getPublicUrl(sliderPath);

    const thumbnail_url = thumbnailUrlData.publicUrl;
    const slider_url = sliderUrlData.publicUrl;

    // Insert video into database
    const { data: video, error: insertError } = await supabase
      .from('videos')
      .insert({
        title,
        thumbnail_url,
        slider_url,
        video_url: cloudflare_playback_url,
        cloudflare_uid,
        cloudflare_playback_url,
        cloudflare_thumbnail_url,
        duration_seconds,
        filename, // Add this line
      })
      .select()
      .single();

    if (insertError) {
      console.error('Video insert error:', insertError);
      return NextResponse.json(
        { error: 'Failed to create video record' },
        { status: 500 }
      );
    }

    // Insert video-category relationships
    const categoryInserts = categories.map((categoryId: string) => ({
      video_id: video.id,
      category_id: categoryId,
    }));

    const { error: categoryError } = await supabase
      .from('video_categories')
      .insert(categoryInserts);

    if (categoryError) {
      console.error('Category insert error:', categoryError);
      // Don't fail the entire operation if categories fail
    }

    return NextResponse.json({
      success: true,
      video,
    });

  } catch (error) {
    console.error('Create video error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}