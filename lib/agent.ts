import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';

export async function agent({
  prompt,
  schema,
  systemPrompt,
}: {
  prompt: string;
  schema: z.ZodSchema;
  systemPrompt?: string;
}) {
  const response = await generateObject({
    model: google('gemini-2.0-flash-001'),
    system: systemPrompt,
    prompt: prompt,
    schema: schema,
  });

  return response.object;
}
