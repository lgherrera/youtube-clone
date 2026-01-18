// components/admin/VideoUploadForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import styles from './VideoUploadForm.module.css';
import * as tus from 'tus-js-client';

interface Category {
  id: string;
  name: string;
}

interface VideoUploadFormProps {
  onSuccess?: () => void;
}

export default function VideoUploadForm({ onSuccess }: VideoUploadFormProps) {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [sliderFile, setSliderFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [uploadPercentage, setUploadPercentage] = useState(0);

  // Fetch categories from database
  useEffect(() => {
    async function fetchCategories() {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name')
        .order('name');

      if (error) {
        console.error('Error fetching categories:', error);
      } else if (data) {
        setCategories(data);
      }
    }

    fetchCategories();
  }, []);

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setVideoFile(e.target.files[0]);
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setThumbnailFile(e.target.files[0]);
    }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSliderFile(e.target.files[0]);
    }
  };

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!videoFile || !thumbnailFile || !sliderFile || !title || selectedCategories.length === 0) {
      alert('Please fill in all fields');
      return;
    }

    setUploading(true);
    setUploadProgress('Getting upload URL from Cloudflare...');
    setUploadPercentage(0);

    try {
      // Step 1: Get TUS upload URL from Cloudflare with file size
      const tusResponse = await fetch('/api/get-tus-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileSize: videoFile.size,
        }),
      });

      if (!tusResponse.ok) {
        const errorData = await tusResponse.json();
        console.error('TUS URL error:', errorData);
        throw new Error('Failed to get upload URL from Cloudflare');
      }

      const { uploadURL, uid } = await tusResponse.json();
      
      setUploadProgress('Uploading video to Cloudflare Stream...');

      // Step 2: Upload video using TUS protocol
      await new Promise<void>((resolve, reject) => {
        const upload = new tus.Upload(videoFile, {
          endpoint: uploadURL,
          uploadUrl: uploadURL,
          chunkSize: 50 * 1024 * 1024, // 50MB chunks
          retryDelays: [0, 3000, 5000, 10000, 20000],
          metadata: {
            filename: videoFile.name,
            filetype: videoFile.type,
          },
          onError: (error) => {
            console.error('TUS upload error:', error);
            reject(error);
          },
          onProgress: (bytesUploaded, bytesTotal) => {
            const percentage = Math.round((bytesUploaded / bytesTotal) * 100);
            setUploadPercentage(percentage);
            setUploadProgress(`Uploading video: ${percentage}%`);
          },
          onSuccess: () => {
            console.log('TUS upload complete');
            resolve();
          },
        });

        upload.start();
      });

      setUploadProgress('Processing video... This may take a few minutes.');
      setUploadPercentage(0);

      // Step 3: Wait for Cloudflare to process the video and get playback URLs
      const cloudflareData = await waitForCloudflareProcessing(uid);

      setUploadProgress('Uploading images and saving metadata...');

      // Step 4: Create video record in Supabase with metadata
      const metadataFormData = new FormData();
      metadataFormData.append('title', title);
      metadataFormData.append('thumbnail', thumbnailFile);
      metadataFormData.append('slider', sliderFile);
      metadataFormData.append('cloudflare_uid', uid);
      metadataFormData.append('cloudflare_playback_url', cloudflareData.playback_url);
      metadataFormData.append('cloudflare_thumbnail_url', cloudflareData.thumbnail_url);
      metadataFormData.append('duration_seconds', cloudflareData.duration.toString());
      metadataFormData.append('categories', JSON.stringify(selectedCategories));

      const createResponse = await fetch('/api/videos/create', {
        method: 'POST',
        body: metadataFormData,
      });

      if (!createResponse.ok) {
        const errorText = await createResponse.text();
        throw new Error(`Failed to create video record: ${errorText}`);
      }

      setUploadProgress('Video uploaded successfully!');
      
      // Reset form
      setVideoFile(null);
      setThumbnailFile(null);
      setSliderFile(null);
      setTitle('');
      setSelectedCategories([]);
      
      if (onSuccess) {
        onSuccess();
      }

      setTimeout(() => {
        setUploadProgress('');
        setUploadPercentage(0);
        setUploading(false);
      }, 2000);

    } catch (error) {
      console.error('Upload error:', error);
      alert(`Failed to upload video: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setUploading(false);
      setUploadProgress('');
      setUploadPercentage(0);
    }
  };

  const waitForCloudflareProcessing = async (uid: string): Promise<any> => {
    const maxAttempts = 60; // Increased from 30 to 60
    const delayMs = 5000; // Increased from 2000 to 5000 (5 seconds between checks)

    for (let i = 0; i < maxAttempts; i++) {
      try {
        setUploadProgress(`Processing video... (${i + 1}/${maxAttempts})`);
        
        const response = await fetch(`/api/check-video-status/${uid}`);
        
        if (response.ok) {
          const data = await response.json();
          if (data.ready) {
            return data;
          }
        }
        
        await new Promise(resolve => setTimeout(resolve, delayMs));
      } catch (error) {
        console.error('Error checking video status:', error);
      }
    }

    throw new Error('Video processing timeout - video may still be processing in background');
  };

  return (
    <form onSubmit={handleSubmit} className={styles.container}>
      <h2 className={styles.title}>Upload Video</h2>

      {/* Video File Input */}
      <div className={styles.formSection}>
        <label className={styles.label}>Video File</label>
        <div className={styles.fileInputWrapper}>
          <label className={styles.uploadButton}>
            <Upload size={20} />
            Choose Video
            <input
              type="file"
              accept="video/*"
              onChange={handleVideoChange}
              className={styles.hiddenInput}
              disabled={uploading}
            />
          </label>
          {videoFile && (
            <span className={styles.fileName}>{videoFile.name}</span>
          )}
        </div>
      </div>

      {/* Thumbnail File Input */}
      <div className={styles.formSection}>
        <label className={styles.label}>Thumbnail Image</label>
        <div className={styles.fileInputWrapper}>
          <label className={styles.uploadButton}>
            <Upload size={20} />
            Choose Thumbnail
            <input
              type="file"
              accept="image/*"
              onChange={handleThumbnailChange}
              className={styles.hiddenInput}
              disabled={uploading}
            />
          </label>
          {thumbnailFile && (
            <span className={styles.fileName}>{thumbnailFile.name}</span>
          )}
        </div>
      </div>

      {/* Slider Image File Input */}
      <div className={styles.formSection}>
        <label className={styles.label}>Slider Image</label>
        <div className={styles.fileInputWrapper}>
          <label className={styles.uploadButton}>
            <Upload size={20} />
            Choose Slider Image
            <input
              type="file"
              accept="image/*"
              onChange={handleSliderChange}
              className={styles.hiddenInput}
              disabled={uploading}
            />
          </label>
          {sliderFile && (
            <span className={styles.fileName}>{sliderFile.name}</span>
          )}
        </div>
      </div>

      {/* Title Input */}
      <div className={styles.formSection}>
        <label className={styles.label}>Video Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={styles.textInput}
          placeholder="Enter video title"
          disabled={uploading}
        />
      </div>

      {/* Categories Selection */}
      <div className={styles.formSection}>
        <label className={styles.label}>Categories</label>
        <div className={styles.categoriesGrid}>
          {categories.map((category) => (
            <label key={category.id} className={styles.categoryLabel}>
              <input
                type="checkbox"
                checked={selectedCategories.includes(category.id)}
                onChange={() => toggleCategory(category.id)}
                className={styles.categoryCheckbox}
                disabled={uploading}
              />
              <span className={styles.categoryName}>{category.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Upload Progress */}
      {uploadProgress && (
        <div className={styles.progressContainer}>
          <Loader2 className="animate-spin mx-auto mb-2" />
          <p className={styles.progressText}>{uploadProgress}</p>
          {uploadPercentage > 0 && (
            <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
              <div 
                className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadPercentage}%` }}
              />
            </div>
          )}
        </div>
      )}

      {/* Submit Button */}
      <button type="submit" disabled={uploading} className={styles.submitButton}>
        {uploading ? (
          <>
            <Loader2 className="animate-spin" size={20} />
            Uploading...
          </>
        ) : (
          'Upload Video'
        )}
      </button>
    </form>
  );
}