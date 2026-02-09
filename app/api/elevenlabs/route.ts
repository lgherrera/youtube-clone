// app/api/elevenlabs/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';

const elevenlabs = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    console.log('ElevenLabs API called');
    
    const { text } = await request.json();
    console.log('Text received:', text?.substring(0, 50) + '...');

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    console.log('Generating audio with ElevenLabs...');
    
    // Correct method for the new SDK
    const audio = await elevenlabs.textToSpeech.convert('IOyj8WtBHdke2FjQgGAr', {
      text,
      model_id: 'eleven_turbo_v2_5',
    });

    // Convert audio stream to base64
    const chunks: Buffer[] = [];
    for await (const chunk of audio) {
      chunks.push(chunk);
    }
    const audioBuffer = Buffer.concat(chunks);
    console.log('Audio buffer size:', audioBuffer.length, 'bytes');
    
    const base64Audio = audioBuffer.toString('base64');
    const audioDataUrl = `data:audio/mpeg;base64,${base64Audio}`;

    console.log('Audio generated successfully');
    return NextResponse.json({ audioUrl: audioDataUrl });

  } catch (error) {
    console.error('ElevenLabs API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate audio' },
      { status: 500 }
    );
  }
}