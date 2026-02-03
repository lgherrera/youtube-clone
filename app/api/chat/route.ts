// app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { buildSystemPrompt, getModelConfig, GirlfriendData } from '@/lib/prompts';

// Check for required environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const openrouterKey = process.env.OPENROUTER_API_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
}

if (!openrouterKey) {
  console.error('Missing OPENROUTER_API_KEY environment variable');
}

// Use service role for server-side API routes (bypasses RLS)
const supabaseAdmin = createClient(
  supabaseUrl || '',
  supabaseServiceKey || ''
);

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatRequest {
  girlfriendId: string;
  messages: ChatMessage[];
}

export async function POST(request: NextRequest) {
  try {
    // Check API key first
    if (!openrouterKey) {
      return NextResponse.json(
        { error: 'OpenRouter API key not configured' },
        { status: 500 }
      );
    }

    const body: ChatRequest = await request.json();
    const { girlfriendId, messages } = body;

    console.log('Chat request received:', { girlfriendId, messageCount: messages?.length });

    if (!girlfriendId) {
      return NextResponse.json(
        { error: 'girlfriendId is required' },
        { status: 400 }
      );
    }

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'messages array is required' },
        { status: 400 }
      );
    }

    // Fetch girlfriend data from Supabase
    const { data: girlfriend, error: dbError } = await supabaseAdmin
      .from('girlfriends')
      .select('*')
      .eq('id', girlfriendId)
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: `Database error: ${dbError.message}` },
        { status: 500 }
      );
    }

    if (!girlfriend) {
      return NextResponse.json(
        { error: 'Girlfriend not found' },
        { status: 404 }
      );
    }

    console.log('Girlfriend found:', girlfriend.name);

    // Build system prompt from girlfriend data
    const systemPrompt = buildSystemPrompt(girlfriend as GirlfriendData);
    const modelConfig = getModelConfig(girlfriend as GirlfriendData);

    console.log('Using model:', modelConfig.model);

    // Prepare messages for OpenRouter
    const openRouterMessages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...messages.filter(m => m.role !== 'system')
    ];

    // Call OpenRouter API
    const openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openrouterKey}`,
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
        'X-Title': 'GF Chat App',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: modelConfig.model,
        messages: openRouterMessages,
        temperature: modelConfig.temperature,
        max_tokens: modelConfig.max_tokens,
      }),
    });

    if (!openRouterResponse.ok) {
      const errorText = await openRouterResponse.text();
      console.error('OpenRouter error:', openRouterResponse.status, errorText);
      return NextResponse.json(
        { error: `OpenRouter error: ${openRouterResponse.status} - ${errorText}` },
        { status: 500 }
      );
    }

    const aiResponse = await openRouterResponse.json();
    
    const assistantMessage = aiResponse.choices?.[0]?.message?.content;

    if (!assistantMessage) {
      console.error('No message in AI response:', aiResponse);
      return NextResponse.json(
        { error: 'No response from AI' },
        { status: 500 }
      );
    }

    console.log('AI response received successfully');

    return NextResponse.json({
      message: assistantMessage,
      model: modelConfig.model,
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}