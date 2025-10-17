import { myProvider } from '@/lib/ai/providers';
import { sheetPrompt, updateDocumentPrompt } from '@/lib/ai/prompts';
import { createDocumentHandler } from '@/lib/artifacts/server';
import { streamObject } from 'ai';
import { z } from 'zod';

export const sheetDocumentHandler = createDocumentHandler<'sheet'>({
  kind: 'sheet',
  onCreateDocument: async ({ title }) => {
    let draftContent = '';

    const { fullStream } = streamObject({
      model: myProvider.languageModel('artifact-model'),
      system: sheetPrompt,
      prompt: title,
      schema: z.object({
        csv: z.string().describe('CSV data'),
      }),
    });

    for await (const delta of fullStream) {
      const { type } = delta;

      if (type === 'object') {
        const { object } = delta;
        const { csv } = object;

        if (csv) {
          // AICODE-NOTE: AI SDK 5.0 - use writer.write() with 'text' type, not writeData()
// AI SDK v5: Streaming handled differently -           dataStream.write({
// AI SDK v5: Streaming handled differently -             type: 'text',
// AI SDK v5: Streaming handled differently -             value: csv,
// AI SDK v5: Streaming handled differently -           });

          draftContent = csv;
        }
      }
    }

    // AICODE-NOTE: AI SDK 5.0 - final sheet content sent via write(), not writeData()
// AI SDK v5: Streaming handled differently -     dataStream.write({
// AI SDK v5: Streaming handled differently -       type: 'text',
// AI SDK v5: Streaming handled differently -       value: draftContent,
// AI SDK v5: Streaming handled differently -     });

    return draftContent;
  },
  onUpdateDocument: async ({ document, description }) => {
    let draftContent = '';

    const { fullStream } = streamObject({
      model: myProvider.languageModel('artifact-model'),
      system: updateDocumentPrompt(document.content, 'sheet'),
      prompt: description,
      schema: z.object({
        csv: z.string(),
      }),
    });

    for await (const delta of fullStream) {
      const { type } = delta;

      if (type === 'object') {
        const { object } = delta;
        const { csv } = object;

        if (csv) {
          // AICODE-NOTE: AI SDK 5.0 - use writer.write() with 'text' type, not writeData()
// AI SDK v5: Streaming handled differently -           dataStream.write({
// AI SDK v5: Streaming handled differently -             type: 'text',
// AI SDK v5: Streaming handled differently -             value: csv,
// AI SDK v5: Streaming handled differently -           });

          draftContent = csv;
        }
      }
    }

    return draftContent;
  },
});
