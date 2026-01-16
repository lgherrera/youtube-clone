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
    const cloudflare_uid = formData.get('cloudflare_uid') as string;
    const cloudflare_playback_url = formData.get('cloudflare_playback_url') as string;
    const cloudflare_thumbnail_url = formData.get('cloudflare_thumbnail_url') as string;
    const duration_seconds = parseInt(formData.get('duration_seconds') as string);
    const categories = JSON.parse(formData.get('categories') as string);

    if (!title || !thumbnailFile || !cloudflare_uid) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Upload thumbnail to Supabase Storage
    const fileExt = thumbnailFile.name.split('.').pop();
    const fileName = `${cloudflare_uid}.${fileExt}`;
    const filePath = `thumbnails/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('videos')
      .upload(filePath, thumbnailFile, {
        contentType: thumbnailFile.type,
        upsert: true,
      });

    if (uploadError) {
      console.error('Thumbnail upload error:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload thumbnail' },
        { status: 500 }
      );
    }

    // Get public URL for thumbnail
    const { data: urlData } = supabase.storage
      .from('videos')
      .getPublicUrl(filePath);

    const thumbnail_url = urlData.publicUrl;

    // Insert video into database
    const { data: video, error: insertError } = await supabase
      .from('videos')
      .insert({
        title,
        thumbnail_url,
        video_url: cloudflare_playback_url,
        cloudflare_uid,
        cloudflare_playback_url,
        cloudflare_thumbnail_url,
        duration_seconds,
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