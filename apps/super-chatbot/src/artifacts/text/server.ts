import { smoothStream, streamText } from 'ai';
import { myProvider } from '@/lib/ai/providers';
import { createDocumentHandler } from '@/lib/artifacts/server';
import { updateDocumentPrompt } from '@/lib/ai/prompts';

export const textDocumentHandler = createDocumentHandler<'text'>({
  kind: 'text',
  onCreateDocument: async ({ title }) => {
    let draftContent = '';

    const { fullStream } = streamText({
      model: myProvider.languageModel('artifact-model'),
      system:
        'Write about the given topic. Markdown is supported. Use headings wherever appropriate.',
      experimental_transform: smoothStream({ chunking: 'word' }),
      prompt: title,
    });

    for await (const delta of fullStream) {
      const { type } = delta;

      if (type === 'text-delta') {
        const { text: textDelta } = delta; // AI SDK v5: renamed from textDelta to text

        draftContent += textDelta;

        // AICODE-NOTE: AI SDK 5.0 - use writer.write() with 'text' type, not writeData()
// AI SDK v5: Streaming handled differently -         dataStream.write({
// AI SDK v5: Streaming handled differently -           type: 'text',
// AI SDK v5: Streaming handled differently -           value: textDelta,
// AI SDK v5: Streaming handled differently -         });
      }
    }

    return draftContent;
  },
  onUpdateDocument: async ({ document, description }) => {
    let draftContent = '';

    const { fullStream } = streamText({
      model: myProvider.languageModel('artifact-model'),
      system: updateDocumentPrompt(document.content, 'text'),
      experimental_transform: smoothStream({ chunking: 'word' }),
      prompt: description,
      // AI SDK v5: experimental_providerMetadata removed
    });

    for await (const delta of fullStream) {
      const { type } = delta;

      if (type === 'text-delta') {
        const { text: textDelta } = delta; // AI SDK v5: renamed from textDelta to text

        draftContent += textDelta;
// AI SDK v5: Streaming handled differently -         dataStream.write({
// AI SDK v5: Streaming handled differently -           type: 'text',
// AI SDK v5: Streaming handled differently -           value: textDelta,
// AI SDK v5: Streaming handled differently -         });
      }
    }

    return draftContent;
  },
});
