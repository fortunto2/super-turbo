import { NextResponse, type NextRequest } from 'next/server';
import { auth } from '@/app/(auth)/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { prompt } = await request.json();
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Missing prompt' }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_AI_API_KEY || '';
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GOOGLE_AI_API_KEY not configured' },
        { status: 500 },
      );
    }

    // Минимальный прямой вызов Vertex AI: Gemini 2.5 Flash Image
    const url = `https://aiplatform.googleapis.com/v1/publishers/google/models/gemini-2.5-flash-image:generateContent?key=${apiKey}`;

    const body = {
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.4,
        topP: 0.8,
        topK: 40,
      },
    } as const;

    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!resp.ok) {
      const errorText = await resp.text();
      return NextResponse.json(
        { error: `Vertex error ${resp.status}`, details: errorText },
        { status: 502 },
      );
    }

    const data: any = await resp.json();

    // Ищем inlineData с изображением
    let imageDataUrl: string | null = null;
    const candidates = data?.candidates || [];
    for (const c of candidates) {
      const parts = c?.content?.parts || [];
      for (const part of parts) {
        const inline = part?.inlineData;
        if (inline?.data && inline?.mimeType?.startsWith('image/')) {
          imageDataUrl = `data:${inline.mimeType};base64,${inline.data}`;
          break;
        }
      }
      if (imageDataUrl) break;
    }

    if (!imageDataUrl) {
      return NextResponse.json(
        { error: 'No image returned by Vertex', raw: data },
        { status: 502 },
      );
    }

    return NextResponse.json({ success: true, url: imageDataUrl });
  } catch (e) {
    return NextResponse.json(
      {
        error: 'Internal error',
        details: e instanceof Error ? e.message : String(e),
      },
      { status: 500 },
    );
  }
}
