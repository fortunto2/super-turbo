import { saveDocument } from "@/lib/db/queries";
import { createDocumentHandler } from "@/lib/artifacts/server";

export const scriptDocumentHandler = createDocumentHandler<"script">({
  kind: "script",
  onCreateDocument: async ({ id, title, content, session }) => {
    console.log(
      "📄 SCRIPT DOCUMENT CREATED with content:",
      content ? "Yes" : "No"
    );
    console.log("📄 Content length:", content?.length || 0);

    const scriptContent = content || title;

    console.log("📄 Saving script document to database. ID:", id);

    await saveDocument({
      id,
      title,
      kind: "script",
      content: scriptContent,
      userId: session.user.id,
      visibility: "public", // Scripts are public by default
    });

    console.log("📄 Returning script content length:", scriptContent.length);
    return scriptContent;
  },
  onUpdateDocument: async ({ document, description }) => {
    console.log("📄 SCRIPT DOCUMENT UPDATED with description:", description);

    // For updates, description should contain the new script content
    return description;
  },
});
