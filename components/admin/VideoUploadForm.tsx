// components/admin/VideoUploadForm.tsx
'use client';

import { useState } from 'react';
import styles from './VideoUploadForm.module.css';

export default function VideoUploadForm() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUploading(true);
    
    const formData = new FormData(e.currentTarget);
    const file = formData.get('video') as File;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    
    try {
      // Step 1: Upload to Cloudflare
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      uploadFormData.append('title', title);
      
      const uploadResponse = await fetch('/api/upload-video', {
        method: 'POST',
        body: uploadFormData,
      });
      
      const cloudflareData = await uploadResponse.json();
      
      // Step 2: Save metadata to Supabase
      const createResponse = await fetch('/api/videos/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cloudflare_uid: cloudflareData.uid,
          cloudflare_playback_url: cloudflareData.playbackUrl,
          cloudflare_thumbnail_url: cloudflareData.thumbnailUrl,
          title,
          description,
          duration_seconds: cloudflareData.duration,
          category_ids: [], // Add category selection logic
        }),
      });
      
      const result = await createResponse.json();
      
      alert('Video uploaded successfully!');
      
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <input type="file" name="video" accept="video/*" required />
      <input type="text" name="title" placeholder="Video Title" required />
      <textarea name="description" placeholder="Description" />
      <button type="submit" disabled={uploading}>
        {uploading ? 'Uploading...' : 'Upload Video'}
      </button>
    </form>
  );
}