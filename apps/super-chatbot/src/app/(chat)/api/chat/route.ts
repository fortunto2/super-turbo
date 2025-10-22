import { auth } from "@/app/(auth)/auth";
import { systemPrompt } from "@/lib/ai/prompts";
import { myProvider } from "@/lib/ai/providers";
import {
	getChatById,
	getMessagesByChatId,
	saveMessages,
} from "@/lib/db/queries";
import { withMonitoring } from "@/lib/monitoring/simple-monitor";
import { stepCountIs, streamText } from "ai";
import { NextResponse } from "next/server";
import { postRequestBodySchema } from "./schema";

import {
	ensureChatExists,
	saveUserMessage,
} from "@/lib/ai/chat/chat-management";
import { formatErrorResponse } from "@/lib/ai/chat/error-handler";
// Import utilities
import {
	convertDBMessagesToUIMessages,
	ensureMessageHasUUID,
	normalizeMessageParts,
	normalizeUIMessage,
} from "@/lib/ai/chat/message-utils";

// Import tools (old SuperDuperAI tools - kept for backward compatibility)
import { configureImageGeneration } from "@/lib/ai/tools/configure-image-generation";
import { configureScriptGeneration } from "@/lib/ai/tools/configure-script-generation";
import { configureVideoGeneration } from "@/lib/ai/tools/configure-video-generation";
import { createDocument } from "@/lib/ai/tools/create-document";
import { requestSuggestions } from "@/lib/ai/tools/request-suggestions";
import { updateDocument } from "@/lib/ai/tools/update-document";

// Import new tools (Nano Banana + FAL AI)
import { nanoBananaImageGenerationForChat } from "@/lib/ai/tools/nano-banana-chat-image-generation";
import { falVideoGenerationForChat } from "@/lib/ai/tools/fal-chat-video-generation";

export const maxDuration = 300;
export const dynamic = "force-dynamic";

export const POST = withMonitoring(async (request: Request) => {
	try {
		const session = await auth();

		if (!session?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const body = await request.json();

		// Debug: Log raw request to understand what AI SDK v5 sends
		console.log("🔍 REQUEST BODY - messages count:", body.messages?.length || 0);
		if (body.messages) {
			console.log("🔍 REQUEST BODY - message roles:", body.messages.map((m: any) => m.role));
			console.log("🔍 REQUEST BODY - message IDs:", body.messages.map((m: any) => m.id));
		}

		// Validate request body using schema
		const validationResult = postRequestBodySchema.safeParse(body);
		if (!validationResult.success) {
			return NextResponse.json(
				{
					error: "Invalid request format",
					details: validationResult.error.issues,
				},
				{ status: 400 },
			);
		}

		let {
			messages: rawMessages,
			message: singleMessage,
			id: chatId,
			selectedChatModel,
			selectedVisibilityType,
		} = validationResult.data;

		// Convert single message to array format if needed
		if (singleMessage && !rawMessages) {
			rawMessages = [singleMessage];
		}

		// Ensure we have messages
		if (!rawMessages || rawMessages.length === 0) {
			return NextResponse.json(
				{ error: "No messages provided" },
				{ status: 400 },
			);
		}

		// AI SDK v5: Ensure all messages have proper UUID and createdAt
		// Also normalize message parts to convert tool-specific types to generic types
		const normalizedMessages = rawMessages.map((msg: any) => {
			const normalized = normalizeUIMessage(msg);
			const withUUID = ensureMessageHasUUID(normalized);
			return normalizeMessageParts(withUUID);
		});

		// Ensure chat exists (with automatic FK recovery)
		await ensureChatExists({
			chatId,
			userId: session.user.id,
			userEmail: session.user.email || `user-${session.user.id}@example.com`,
			firstMessage: normalizedMessages[normalizedMessages.length - 1],
			visibility: selectedVisibilityType || "private",
		});

		const chat = await getChatById({ id: chatId });
		if (!chat) {
			return formatErrorResponse(
				new Error("Failed to create chat"),
				"Chat API",
			);
		}

		// Get previous messages from database
		const previousMessages = await getMessagesByChatId({ id: chatId });
		console.log(`🔍 Loaded ${previousMessages.length} messages from DB`);

		// Convert to UI format
		const previousUIMessages = convertDBMessagesToUIMessages(previousMessages);
		console.log(`🔍 Converted to ${previousUIMessages.length} UI messages`);
		console.log(`🔍 Previous UI messages content:`, previousUIMessages.map(m => ({
			role: m.role,
			content: typeof m.content === 'string' ? m.content.substring(0, 30) : `[${typeof m.content}]`,
			partsCount: m.parts?.length || 0
		})));

		// CRITICAL FIX: AI SDK v5 sendMessage creates new IDs each time
		// So we can't rely on ID matching alone - need content-based deduplication
		// Create a map of previous messages by content hash for deduplication
		const previousMessageMap = new Map();
		for (const msg of previousUIMessages) {
			// Create a content hash based on role + text content
			// IMPORTANT: Check both content field AND parts array
			let textContent = '';
			if (typeof msg.content === 'string' && msg.content.trim()) {
				textContent = msg.content;
			} else {
				const textPart = msg.parts?.find((p: any) => p.type === 'text') as any;
				textContent = textPart?.text || '';
			}
			const contentHash = `${msg.role}:${textContent}`;
			previousMessageMap.set(contentHash, msg);
		}

		// Filter out messages that already exist by content (not just ID)
		const newMessages = normalizedMessages.filter((msg) => {
			if (msg.role === "system") return false;

			const textContent = typeof msg.content === 'string'
				? msg.content
				: msg.parts?.find((p: any) => p.type === 'text')?.text || '';
			const contentHash = `${msg.role}:${textContent}`;

			const isDuplicate = previousMessageMap.has(contentHash);
			if (isDuplicate) {
				console.log(`🔍 Skipping duplicate message: ${contentHash.substring(0, 50)}...`);
			}
			return !isDuplicate;
		});

		console.log(`🔍 Filtered messages: ${newMessages.length} new out of ${normalizedMessages.length} total`);

		// Combine previous messages with only NEW messages
		const allMessages = [
			...previousUIMessages,
			...newMessages,
		];

		// CRITICAL FIX: Ensure all messages have proper parts array for Gemini API
		// Convert content string to parts if needed AND remove parts without text
		const messagesForAPI = allMessages
			.map((msg) => {
				// If message has no parts but has content string, convert it to parts
				if ((!msg.parts || msg.parts.length === 0) && msg.content && typeof msg.content === 'string') {
					return {
						...msg,
						parts: [
							{
								type: 'text',
								text: msg.content,
							},
						],
					};
				}

				// For messages with parts, filter out non-text parts (like step-start)
				// before sending to Gemini API
				if (msg.parts && msg.parts.length > 0) {
					const textParts = msg.parts.filter((p: any) =>
						p.type === 'text' && p.text && typeof p.text === 'string' && p.text.trim().length > 0
					);

					// If we have valid text parts, return message with only those parts
					if (textParts.length > 0) {
						return {
							...msg,
							parts: textParts,
						};
					}
				}

				return msg;
			})
			.filter((msg) => {
				// For all messages, ensure they have at least one valid text part
				// This is required by Gemini API
				const hasTextPart = msg.parts?.some((p: any) =>
					p.type === 'text' && p.text && typeof p.text === 'string' && p.text.trim().length > 0
				);

				if (!hasTextPart) {
					console.log(`🔍 Filtering out ${msg.role} message without valid text:`, {
						id: msg.id,
						role: msg.role,
						partsCount: msg.parts?.length,
					});
				}

				return hasTextPart;
			});

		console.log(`🔍 Messages for API: ${messagesForAPI.length} out of ${allMessages.length} total`);

		// Debug: Log all messages structure before sending to API
		messagesForAPI.forEach((msg, index) => {
			console.log(`🔍 Message ${index}:`, {
				role: msg.role,
				partsCount: msg.parts?.length,
				partsTypes: msg.parts?.map((p: any) => p.type).join(', '),
				contentLength: typeof msg.content === 'string' ? msg.content.length : 0,
			});
		});

		// Save user messages to database (with automatic FK recovery)
		const userMessages = normalizedMessages.filter(
			(msg) => msg.role === "user",
		);

		// AICODE-FIX: Only save NEW user messages that aren't already in the database
		// Use content-based deduplication (same as above)
		const newUserMessages = userMessages.filter((msg) => {
			const textContent = typeof msg.content === 'string'
				? msg.content
				: msg.parts?.find((p: any) => p.type === 'text')?.text || '';
			const contentHash = `${msg.role}:${textContent}`;
			return !previousMessageMap.has(contentHash);
		});

		console.log(`💾 Saving user messages: ${newUserMessages.length} new out of ${userMessages.length} total`);
		console.log(`💾 Previous messages count:`, previousMessageMap.size);
		console.log(`💾 Previous message hashes:`, Array.from(previousMessageMap.keys()).map(hash => hash.substring(0, 50)));
		console.log(`💾 User message contents:`, userMessages.map(m => {
			const text = typeof m.content === 'string' ? m.content : m.parts?.find((p: any) => p.type === 'text')?.text || '';
			const hash = `${m.role}:${text}`;
			const isDuplicate = previousMessageMap.has(hash);
			return { text: text.substring(0, 30), hash: hash.substring(0, 50), isDuplicate };
		}));

		for (const userMsg of newUserMessages) {
			await saveUserMessage({
				chatId,
				message: userMsg,
			});
		}

		// Generate response using AI SDK v5
		const chatModel = selectedChatModel || "chat-model";

		// Create tools with proper parameters
		const createDocumentTool = createDocument({ session });
		const updateDocumentTool = updateDocument({ session });
		const lastMessage = normalizedMessages[normalizedMessages.length - 1];

		// Old SuperDuperAI tools (kept for backward compatibility)
		const imageGenerationTool = configureImageGeneration({
			createDocument: createDocumentTool,
			session,
			chatId,
			userMessage: lastMessage?.content || "",
			currentAttachments: lastMessage?.experimental_attachments || [],
		});
		const videoGenerationTool = configureVideoGeneration({
			createDocument: createDocumentTool,
			session,
			chatId,
			userMessage: lastMessage?.content || "",
			currentAttachments: lastMessage?.experimental_attachments || [],
		});

		// New tools (Nano Banana + FAL AI)
		const nanoBananaImageTool = nanoBananaImageGenerationForChat({
			createDocument: createDocumentTool,
			session,
			chatId,
			userMessage: lastMessage?.content || "",
			currentAttachments: lastMessage?.experimental_attachments || [],
		});
		const falVideoTool = falVideoGenerationForChat({
			createDocument: createDocumentTool,
			session,
			chatId,
			userMessage: lastMessage?.content || "",
			currentAttachments: lastMessage?.experimental_attachments || [],
		});

		const scriptGenerationTool = configureScriptGeneration({
			createDocument: createDocumentTool,
			session,
		});
		const suggestionsTool = requestSuggestions({ session });

		const result = streamText({
			model: myProvider.languageModel(chatModel),
			system: systemPrompt({
				selectedChatModel: chatModel,
				requestHints: { latitude: "0", longitude: "0", city: "", country: "" },
			}),
			messages: messagesForAPI, // Use filtered messages without empty assistant messages
			temperature: 0.7,
			tools: {
				// Old SuperDuperAI tools (kept for backward compatibility)
				configureImageGeneration: imageGenerationTool,
				configureVideoGeneration: videoGenerationTool,
				// New tools (Nano Banana + FAL AI - primary image/video generation)
				nanoBananaImageGeneration: nanoBananaImageTool,
				falVideoGeneration: falVideoTool,
				// Other tools
				configureScriptGeneration: scriptGenerationTool,
				createDocument: createDocumentTool,
				updateDocument: updateDocumentTool,
				requestSuggestions: suggestionsTool,
			},
			toolChoice: "auto", // Let model decide when to use tools vs generate text
			stopWhen: stepCountIs(10), // AI SDK v5: Enable multi-step execution - model can call tools AND generate text in same response
			onError: (error) => {
				console.error("Stream error:", error);
			},
		});

		// AI SDK v5: CRITICAL FIX - consume stream to ensure onFinish completes even if client disconnects
		// This prevents the race condition where messages aren't saved before page reload
		result.consumeStream();

		// AI SDK v5: Use toUIMessageStreamResponse() WITHOUT originalMessages
		// The client manages its own message state and will receive the response via streaming
		// We don't need to send back messages - client already has them
		return result.toUIMessageStreamResponse({
			onFinish: async ({ messages: finishedMessages, responseMessage }) => {
				try {
					console.log(
						"📝 onFinish called with messages:",
						finishedMessages.length,
					);
					console.log(
						"📝 responseMessage:",
						responseMessage ? "present" : "null",
					);

					if (!responseMessage) {
						console.log("📝 ⚠️ No response message to save");
						return;
					}

					// Debug: Log the raw responseMessage structure
					console.log(
						"📝 🔍 responseMessage keys:",
						Object.keys(responseMessage),
					);
					console.log(
						"📝 🔍 responseMessage.parts:",
						(responseMessage as any).parts ? "present" : "missing",
					);
					if ((responseMessage as any).parts) {
						console.log(
							"📝 🔍 responseMessage.parts length:",
							(responseMessage as any).parts.length,
						);
						console.log(
							"📝 🔍 responseMessage.parts types:",
							(responseMessage as any).parts.map((p: any) => p.type).join(", "),
						);
					}

					// Extract document IDs from tool results in the response message parts
					const toolDocuments: Array<{
						id: string;
						title: string;
						kind: string;
					}> = [];

					// Check responseMessage parts for tool invocations
					if ((responseMessage as any).parts) {
						console.log(
							"📝 🔍 Processing",
							(responseMessage as any).parts.length,
							"parts...",
						);
						for (const part of (responseMessage as any).parts) {
							console.log("📝 🔍 Part type:", part.type);
							console.log("📝 🔍 Part state:", (part as any).state);
							console.log("📝 🔍 Part output:", (part as any).output);
							console.log("📝 🔍 Part keys:", Object.keys(part));

							// AI SDK v5: Tool data is directly in part, not in nested toolInvocation
							// Check for tool parts with completed state and output
							// State can be 'output-available' or 'result'
							if (
								part.type &&
								typeof part.type === "string" &&
								part.type.startsWith("tool-") &&
								((part as any).state === "output-available" ||
									(part as any).state === "result") &&
								(part as any).output
							) {
								const toolName = part.type.replace("tool-", "");
								const toolResult = (part as any).output;

								console.log(
									"📝 🔍 Tool found:",
									toolName,
									"state:",
									(part as any).state,
								);
								console.log("📝 🔍 Tool result:", toolResult);

								// Check for script documents from either configureScriptGeneration OR createDocument
								// Case 1: configureScriptGeneration tool
								if (
									toolName === "configureScriptGeneration" &&
									toolResult.id &&
									toolResult.kind
								) {
									toolDocuments.push({
										id: toolResult.id,
										title: toolResult.title || "Document",
										kind: toolResult.kind,
									});
									console.log(
										"📝 ✅ Found script document from configureScriptGeneration:",
										toolResult.id,
									);
								}
								// Case 2: createDocument tool with kind === "script"
								else if (
									toolName === "createDocument" &&
									toolResult.kind === "script" &&
									toolResult.id
								) {
									toolDocuments.push({
										id: toolResult.id,
										title: toolResult.title || "Document",
										kind: toolResult.kind,
									});
									console.log(
										"📝 ✅ Found script document from createDocument:",
										toolResult.id,
									);
								}
							}
						}
					}

					// Normalize the response message and add attachments for script documents
					const normalized = normalizeUIMessage(responseMessage);
					const withUUID = ensureMessageHasUUID(normalized);

					const attachments = normalized.experimental_attachments || [];

					// Add attachments for script documents created by tools
					for (const doc of toolDocuments) {
						if (doc.kind === "script") {
							attachments.push({
								name:
									doc.title.length > 200
										? `${doc.title.substring(0, 200)}...`
										: doc.title,
								url: `${
									typeof process !== "undefined" &&
									process.env.NEXT_PUBLIC_APP_URL
										? process.env.NEXT_PUBLIC_APP_URL
										: "http://localhost:3001"
								}/api/document?id=${doc.id}`,
								contentType: "text/markdown" as const,
								documentId: doc.id,
							});
							console.log("📝 ✅ Added script attachment to message:", doc.id);
						}
					}

					// Create the assistant message to save
					const assistantMessage = {
						id: withUUID.id,
						chatId,
						role: "assistant" as const,
						parts: normalized.parts,
						attachments: attachments,
						createdAt: new Date(),
					};

					console.log("📝 Saving assistant message to database");
					await saveMessages({ messages: [assistantMessage] });
					console.log("📝 ✅ Assistant message saved successfully");
					console.log("📝 ✅ Message details:", {
						id: assistantMessage.id,
						attachments: attachments.length,
						partsCount: normalized.parts?.length || 0,
					});
				} catch (error) {
					console.error("Failed to save assistant messages:", error);
					// Don't throw - let the stream complete even if save fails
				}
			},
		});
	} catch (error) {
		return formatErrorResponse(error, "Chat API");
	}
});
