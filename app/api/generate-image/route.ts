// app/api/generate-image/route.ts
import { NextRequest, NextResponse } from 'next/server';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

export async function POST(request: NextRequest) {
  try {
    if (!OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: 'OpenRouter API key not configured' },
        { status: 500 }
      );
    }

    const { 
      prompt, 
      referenceImages, 
      aspectRatio = '1:1',
      model = 'bytedance-seed/seedream-4.5'
    } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Build the content array
    const content: any[] = [
      {
        type: 'text',
        text: prompt
      }
    ];

    // Add reference images if provided
    if (referenceImages && referenceImages.length > 0) {
      referenceImages.forEach((base64Image: string) => {
        content.push({
          type: 'image_url',
          image_url: {
            url: `data:image/jpeg;base64,${base64Image}`
          }
        });
      });
    }

    console.log(`Generating image with model: ${model}, aspect ratio: ${aspectRatio}`);

    // Build request body based on model
    const requestBody: any = {
      model: model,
      messages: [
        {
          role: 'user',
          content: content
        }
      ]
    };

    // Add model-specific parameters
    if (model.includes('seedream')) {
      // SeeDream uses image_config
      requestBody.image_config = {
        aspect_ratio: aspectRatio
      };
    } else if (model.includes('flux')) {
      // FLUX models
      const dimensions = getFluxDimensions(aspectRatio);
      if (dimensions) {
        requestBody.width = dimensions.width;
        requestBody.height = dimensions.height;
      }
    } else if (model.includes('gemini')) {
      // Google Gemini uses image_config with aspect_ratio
      requestBody.image_config = {
        aspect_ratio: aspectRatio
      };
      // Gemini may need modalities parameter
      requestBody.modalities = ['text', 'image'];
    }

    console.log('Request body:', JSON.stringify(requestBody, null, 2));

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
        'X-Title': 'SEXOTV Image Generator'
      },
      body: JSON.stringify(requestBody)
    });

    const responseText = await response.text();
    console.log('Raw response status:', response.status);
    
    if (!response.ok) {
      console.error('OpenRouter API error:', responseText);
      let errorMessage = 'Failed to generate image';
      try {
        const errorData = JSON.parse(responseText);
        // Check if it's a moderation error for FLUX
        if (errorData.error?.metadata?.raw?.includes('Request Moderated')) {
          errorMessage = 'Content was moderated by the provider. FLUX models have strict content filtering. Try using SeeDream 4.5 for adult content.';
        } else {
          errorMessage = errorData.error?.message || JSON.stringify(errorData);
        }
      } catch (e) {
        errorMessage = responseText;
      }
      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      );
    }

    const data = JSON.parse(responseText);
    const message = data.choices?.[0]?.message;

    // Log full response for debugging
    console.log('Full API response:', JSON.stringify(data, null, 2));

    console.log('Response structure:', JSON.stringify({
      hasImages: !!message?.images,
      hasContent: !!message?.content,
      contentType: typeof message?.content,
      hasAnnotations: !!message?.annotations,
      annotationsLength: message?.annotations?.length || 0
    }));

    // Try different response formats
    // Format 1: SeeDream style - images array
    if (message?.images && message.images.length > 0) {
      const imageUrl = message.images[0].image_url?.url;
      if (imageUrl) {
        console.log('Successfully generated image (images array format)');
        return NextResponse.json({ imageUrl });
      }
    }

    // Format 2: Gemini annotations (new format)
    if (message?.annotations && message.annotations.length > 0) {
      console.log('Found annotations:', JSON.stringify(message.annotations, null, 2));
      
      // Look for image in annotations
      for (const annotation of message.annotations) {
        if (annotation.type === 'image' || annotation.type === 'image_url') {
          const imageUrl = annotation.url || annotation.image_url?.url;
          if (imageUrl) {
            console.log('Successfully generated image (annotations format)');
            return NextResponse.json({ imageUrl });
          }
        }
      }
    }

    // Format 3: Direct URL in content
    if (typeof message?.content === 'string') {
      if (message.content.startsWith('http')) {
        console.log('Successfully generated image (direct URL format)');
        return NextResponse.json({ imageUrl: message.content });
      }
      // Try to extract URL from markdown or text
      const urlMatch = message.content.match(/https?:\/\/[^\s\)]+/);
      if (urlMatch) {
        console.log('Successfully generated image (extracted URL from text)');
        return NextResponse.json({ imageUrl: urlMatch[0] });
      }
    }

    // Format 4: Content array with image_url
    if (Array.isArray(message?.content)) {
      console.log('Content array:', JSON.stringify(message.content, null, 2));
      
      const imageContent = message.content.find((item: any) => 
        item.type === 'image_url' || item.type === 'image'
      );
      if (imageContent) {
        const imageUrl = imageContent.image_url?.url || imageContent.url;
        if (imageUrl) {
          console.log('Successfully generated image (content array format)');
          return NextResponse.json({ imageUrl });
        }
      }
    }

    // Format 5: Check top-level data object
    if (data.data && Array.isArray(data.data)) {
      const imageData = data.data.find((item: any) => item.url || item.image_url);
      if (imageData) {
        const imageUrl = imageData.url || imageData.image_url?.url;
        if (imageUrl) {
          console.log('Successfully generated image (data array format)');
          return NextResponse.json({ imageUrl });
        }
      }
    }

    console.error('Could not find image URL in response. Full data:', JSON.stringify(data, null, 2));
    return NextResponse.json(
      { error: 'No image found in response' },
      { status: 500 }
    );
  } catch (error) {
    console.error('Error in generate-image API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to convert aspect ratios to FLUX dimensions
function getFluxDimensions(aspectRatio: string): { width: number; height: number } | null {
  const ratioMap: Record<string, { width: number; height: number }> = {
    '16:9': { width: 1344, height: 768 },
    '4:3': { width: 1024, height: 768 },
    '2:3': { width: 832, height: 1216 },
    '1:1': { width: 1024, height: 1024 },
    '9:16': { width: 768, height: 1344 }
  };
  
  return ratioMap[aspectRatio] || null;
}