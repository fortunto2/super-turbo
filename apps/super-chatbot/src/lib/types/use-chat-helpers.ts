// AI SDK v5: Custom UseChatHelpers type with our custom UIMessage
import type { UseChatHelpers } from "@ai-sdk/react";
import type { CustomUIMessage } from "./custom-ui-message";

export type CustomUseChatHelpers = UseChatHelpers<CustomUIMessage>;
