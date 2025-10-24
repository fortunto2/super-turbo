import { createDocumentHandler } from '@/lib/artifacts/server';

export const scriptDocumentHandler = createDocumentHandler<'script'>({
  kind: 'script',
  onCreateDocument: async ({ id, title, content, session }) => {
    console.log(
      '📄 SCRIPT DOCUMENT CREATED with content:',
      content ? 'Yes' : 'No',
    );
    console.log('📄 Content length:', content?.length || 0);

    const scriptContent = content || title;

    console.log(
      '📄 Script content will be saved by createDocumentHandler. ID:',
      id,
    );

    // AICODE-FIX: Don't save here - let createDocumentHandler save it
    // This prevents double-saving and ensures consistent behavior with other artifact types

    console.log('📄 Returning script content length:', scriptContent.length);
    return scriptContent;
  },
  onUpdateDocument: async ({ document, description }) => {
    console.log('📄 SCRIPT DOCUMENT UPDATED with description:', description);

    // For updates, description should contain the new script content
    return description;
  },
});
