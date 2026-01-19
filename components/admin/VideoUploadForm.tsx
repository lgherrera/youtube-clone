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
      // Step 1: Get TUS upload URL from Cloudflare with file size and filename
      const tusResponse = await fetch('/api/get-tus-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileSize: videoFile.size,
          fileName: videoFile.name,
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

      setUploadProgress('Uploading images and saving metadata...');
      setUploadPercentage(0);

      // Step 3: Save video metadata immediately (don't wait for processing)
      // Generate playback URLs using the customer code
      const customerCode = process.env.NEXT_PUBLIC_CLOUDFLARE_CUSTOMER_CODE || 'axuxyg0uf4dira9j';
      const playbackUrl = `https://customer-${customerCode}.cloudflarestream.com/${uid}/manifest/video.m3u8`;
      const thumbnailUrl = `https://customer-${customerCode}.cloudflarestream.com/${uid}/thumbnails/thumbnail.jpg`;

      const metadataFormData = new FormData();
      metadataFormData.append('title', title);
      metadataFormData.append('thumbnail', thumbnailFile);
      metadataFormData.append('slider', sliderFile);
      metadataFormData.append('cloudflare_uid', uid);
      metadataFormData.append('cloudflare_playback_url', playbackUrl);
      metadataFormData.append('cloudflare_thumbnail_url', thumbnailUrl);
      metadataFormData.append('duration_seconds', '0'); // Will be updated when video processes
      metadataFormData.append('categories', JSON.stringify(selectedCategories));

      const createResponse = await fetch('/api/videos/create', {
        method: 'POST',
        body: metadataFormData,
      });

      if (!createResponse.ok) {
        const errorText = await createResponse.text();
        throw new Error(`Failed to create video record: ${errorText}`);
      }

      setUploadProgress('Video uploaded successfully! It may take a few minutes to process.');
      
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
      }, 3000);

    } catch (error) {
      console.error('Upload error:', error);
      alert(`Failed to upload video: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setUploading(false);
      setUploadProgress('');
      setUploadPercentage(0);
    }
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