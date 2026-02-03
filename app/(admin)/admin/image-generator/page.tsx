// app/(main)/admin/image-generator/page.tsx
'use client';

import { useState, useRef } from 'react';
import { Upload, X, Wand2, Download, Loader2 } from 'lucide-react';
import styles from './image-generator.module.css';

interface ReferenceImage {
  id: string;
  file: File;
  preview: string;
}

export default function ImageGeneratorPage() {
  const [referenceImages, setReferenceImages] = useState<ReferenceImage[]>([]);
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [selectedModel, setSelectedModel] = useState('bytedance-seed/seedream-4.5');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const models = [
    { value: 'bytedance-seed/seedream-4.5', label: 'SeeDream 4.5', description: 'High quality, supports aspect ratios' },
    { value: 'black-forest-labs/flux.2-klein-4b', label: 'FLUX Klein 4B', description: 'Fast and efficient (SFW only)' },
    { value: 'black-forest-labs/flux.2-max', label: 'FLUX Max', description: 'Maximum quality (SFW only)' },
    { value: 'google/gemini-3-pro-image-preview', label: 'Gemini 3 Pro Image', description: 'Advanced Google model' }
  ];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    const newImages: ReferenceImage[] = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      preview: URL.createObjectURL(file)
    }));

    setReferenceImages(prev => [...prev, ...newImages]);
  };

  const removeImage = (id: string) => {
    setReferenceImages(prev => {
      const image = prev.find(img => img.id === id);
      if (image) {
        URL.revokeObjectURL(image.preview);
      }
      return prev.filter(img => img.id !== id);
    });
  };

  const convertImageToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        resolve(base64.split(',')[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const generateImage = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const imagePromises = referenceImages.map(img => convertImageToBase64(img.file));
      const base64Images = await Promise.all(imagePromises);

      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          referenceImages: base64Images,
          aspectRatio,
          model: selectedModel
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate image');
      }

      const data = await response.json();
      setGeneratedImage(data.imageUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate image');
      console.error('Error generating image:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = async () => {
    if (!generatedImage) return;

    try {
      const response = await fetch(generatedImage);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `generated-image-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading image:', err);
      setError('Failed to download image');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>AI Image Generator</h1>
        <p>Generate images using multiple AI models</p>
      </div>

      <div className={styles.content}>
        {/* Model Selection */}
        <div className={styles.section}>
          <h2>Model</h2>
          <p className={styles.sectionDescription}>
            Select the AI model to generate your image
          </p>
          
          <div className={styles.modelGrid}>
            {models.map(model => (
              <button
                key={model.value}
                onClick={() => setSelectedModel(model.value)}
                className={`${styles.modelButton} ${
                  selectedModel === model.value ? styles.modelButtonActive : ''
                }`}
              >
                <div className={styles.modelLabel}>{model.label}</div>
                <div className={styles.modelDescription}>{model.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Reference Images Upload */}
        <div className={styles.section}>
          <h2>Reference Images (Optional)</h2>
          <p className={styles.sectionDescription}>
            Upload one or more reference images to guide the generation style
          </p>

          <div className={styles.uploadArea}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className={styles.fileInput}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className={styles.uploadButton}
            >
              <Upload size={20} />
              <span>Upload Reference Images</span>
            </button>
          </div>

          {referenceImages.length > 0 && (
            <div className={styles.imageGrid}>
              {referenceImages.map(image => (
                <div key={image.id} className={styles.imagePreview}>
                  <img src={image.preview} alt="Reference" />
                  <button
                    onClick={() => removeImage(image.id)}
                    className={styles.removeButton}
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Aspect Ratio Selection */}
        <div className={styles.section}>
          <h2>Aspect Ratio</h2>
          <p className={styles.sectionDescription}>
            Select the aspect ratio for the generated image
          </p>
          
          <div className={styles.aspectRatioGrid}>
            {[
              { value: '16:9', label: '16:9', description: 'Widescreen' },
              { value: '4:3', label: '4:3', description: 'Standard' },
              { value: '2:3', label: '2:3', description: 'Portrait' },
              { value: '1:1', label: '1:1', description: 'Square' },
              { value: '9:16', label: '9:16', description: 'Vertical' }
            ].map(option => (
              <button
                key={option.value}
                onClick={() => setAspectRatio(option.value)}
                className={`${styles.aspectRatioButton} ${
                  aspectRatio === option.value ? styles.aspectRatioButtonActive : ''
                }`}
              >
                <div className={styles.aspectRatioLabel}>{option.label}</div>
                <div className={styles.aspectRatioDescription}>{option.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Prompt Input */}
        <div className={styles.section}>
          <h2>Prompt</h2>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the image you want to generate..."
            className={styles.promptInput}
            rows={6}
          />
        </div>

        {/* Generate Button */}
        <button
          onClick={generateImage}
          disabled={isGenerating || !prompt.trim()}
          className={styles.generateButton}
        >
          {isGenerating ? (
            <>
              <Loader2 size={20} className={styles.spinner} />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <Wand2 size={20} />
              <span>Generate Image</span>
            </>
          )}
        </button>

        {/* Error Message */}
        {error && (
          <div className={styles.error}>
            {error}
          </div>
        )}

        {/* Generated Image */}
        {generatedImage && (
          <div className={styles.section}>
            <div className={styles.resultHeader}>
              <h2>Generated Image</h2>
              <button onClick={downloadImage} className={styles.downloadButton}>
                <Download size={20} />
                <span>Download</span>
              </button>
            </div>
            <div className={styles.generatedImageContainer}>
              <img src={generatedImage} alt="Generated" className={styles.generatedImage} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}