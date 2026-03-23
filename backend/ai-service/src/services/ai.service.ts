import OpenAI from 'openai';
import { Index } from '@upstash/vector';
import pdf from 'pdf-parse';
import { env } from '../config/env';
import { createLogger } from '@shared/logger';

const log = createLogger('ai-service');

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

const vectorIndex = new Index({
  url: env.UPSTASH_VECTOR_REST_URL,
  token: env.UPSTASH_VECTOR_REST_TOKEN,
});

export async function processPdf(fileBuffer: Buffer, userId: string): Promise<void> {
  try {
    log.info({ userId }, 'Starting PDF processing');
    const data = await pdf(fileBuffer);
    const text = data.text;

    // Chunking: 1000 characters with 100 char overlap
    const chunks: string[] = [];
    const chunkSize = 1000;
    const overlap = 100;

    for (let i = 0; i < text.length; i += chunkSize - overlap) {
      const chunk = text.slice(i, i + chunkSize);
      if (chunk.trim()) chunks.push(chunk);
    }

    log.info({ chunkCount: chunks.length }, 'Text chunked');

    for (const [index, chunk] of chunks.entries()) {
      // Generate Embedding
      const embeddingRes = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: chunk,
      });

      const vector = embeddingRes.data[0].embedding;

      // Store in Upstash Vector
      await vectorIndex.upsert({
        id: `${userId}_${Date.now()}_${index}`,
        vector,
        metadata: {
          userId,
          text: chunk,
        },
      });
    }

    log.info('PDF successfully processed and stored');
  } catch (error) {
    log.error({ error }, 'Failed to process PDF');
    throw new Error('PDF processing failed');
  }
}

export async function chat(message: string, mode: 'generic' | 'rag', userId: string): Promise<string> {
  try {
    let context = '';

    if (mode === 'rag') {
      // 1. Embed query
      const embeddingRes = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: message,
      });
      const queryVector = embeddingRes.data[0].embedding;

      // 2. Search Top 3
      const results = await vectorIndex.query({
        vector: queryVector,
        topK: 3,
        includeMetadata: true,
        filter: `userId = '${userId}'`,
      });

      context = results
        .map((r) => r.metadata?.text)
        .filter(Boolean)
        .join('\n\n');
    }

    const systemPrompt = mode === 'rag' 
      ? `You are a helpful AI assistant. Use the provided context to answer the user's question. If you don't know based on the context, say so.\n\nContext:\n${context}`
      : 'You are a helpful AI assistant.';

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message },
      ],
    });

    return response.choices[0].message.content || 'I could not generate a response.';
  } catch (error: any) {
    log.error({ error: error.message || error }, 'Chat failed');
    throw new Error(error.message || 'AI Chat failed');
  }
}
