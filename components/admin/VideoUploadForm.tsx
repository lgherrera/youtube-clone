// components/admin/VideoUploadForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import styles from './VideoUploadForm.module.css';

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
    setUploadProgress('Uploading video to Cloudflare Stream...');

    try {
      // Step 1: Upload video to Cloudflare Stream
      const videoFormData = new FormData();
      videoFormData.append('file', videoFile);

      const cloudflareResponse = await fetch('/api/upload-video', {
        method: 'POST',
        body: videoFormData,
      });

      if (!cloudflareResponse.ok) {
        throw new Error('Failed to upload video to Cloudflare');
      }

      const cloudflareData = await cloudflareResponse.json();
      
      setUploadProgress('Uploading images and saving metadata...');

      // Step 2: Create video record in Supabase with metadata
      const metadataFormData = new FormData();
      metadataFormData.append('title', title);
      metadataFormData.append('thumbnail', thumbnailFile);
      metadataFormData.append('slider', sliderFile);
      metadataFormData.append('cloudflare_uid', cloudflareData.cloudflare_uid);
      metadataFormData.append('cloudflare_playback_url', cloudflareData.playback_url);
      metadataFormData.append('cloudflare_thumbnail_url', cloudflareData.thumbnail_url);
      metadataFormData.append('duration_seconds', cloudflareData.duration.toString());
      metadataFormData.append('categories', JSON.stringify(selectedCategories));

      const createResponse = await fetch('/api/videos/create', {
        method: 'POST',
        body: metadataFormData,
      });

      if (!createResponse.ok) {
        throw new Error('Failed to create video record');
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
        setUploading(false);
      }, 2000);

    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload video. Please try again.');
      setUploading(false);
      setUploadProgress('');
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