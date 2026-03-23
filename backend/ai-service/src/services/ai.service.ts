import OpenAI from 'openai';
import { Index } from '@upstash/vector';
import pdf from 'pdf-parse';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../config/env';
import { createLogger } from '@shared/logger';

const log = createLogger('ai-service');

// Initialize OpenAI (if key is present)
const openai = env.OPENAI_API_KEY ? new OpenAI({
  apiKey: env.OPENAI_API_KEY,
}) : null;

// Initialize Gemini (if key is present)
const genAI = env.GEMINI_API_KEY ? new GoogleGenerativeAI(env.GEMINI_API_KEY) : null;

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
      if (!openai) throw new Error('OpenAI API key missing for embeddings');

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
  } catch (error: any) {
    log.error({ error: error.message || error }, 'Failed to process PDF');
    throw new Error(error.message || 'PDF processing failed');
  }
}

export async function chat(message: string, mode: 'generic' | 'rag', userId: string): Promise<string> {
  try {
    let context = '';

    if (mode === 'rag') {
      if (!openai) throw new Error('OpenAI API key required for RAG query embeddings');

      // 1. Embed query (using OpenAI for consistency with stored vectors)
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

    // --- PRIORITY 1: Gemini ---
    if (genAI) {
      try {
        log.info('Attempting Gemini completion (Primary)');
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const combinedPrompt = `${systemPrompt}\n\nUser: ${message}`;
        const result = await model.generateContent(combinedPrompt);
        const response = await result.response;
        return response.text();
      } catch (err: any) {
        log.warn({ err: err.message }, 'Gemini failed - checking for fallback to OpenAI');
        if (!openai) throw err; // Re-throw if no OpenAI available
      }
    }

    // --- PRIORITY 2: OpenAI (Fallback) ---
    if (openai) {
      log.info('Attempting OpenAI completion (Fallback)');
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message },
        ],
      });
      return response.choices[0].message.content || 'I could not generate a response.';
    }

    throw new Error('No AI provider available (Gemini or OpenAI)');
  } catch (error: any) {
    log.error({ error: error.message || error }, 'Chat failed');
    throw new Error(error.message || 'AI Chat failed');
  }
}
