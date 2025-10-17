

export type ErrorContext = string;
export type ForeignKeyErrorType = 'Chat' | 'Message' | 'Stream';

interface ForeignKeyConstraintMap {
  Chat: string[];
  Message: string[];
  Stream: string[];
}

const FOREIGN_KEY_CONSTRAINTS: ForeignKeyConstraintMap = {
  Chat: ['Chat_userId_User_id_fk', 'Key (userId)'],
  Message: ['Message_v2_chatId_Chat_id_fk', 'Key (chatId)'],
  Stream: ['Stream_chatId_Chat_id_fk', 'Key (chatId)'],
};

/**
 * Formats error response based on environment
 * Development: detailed error information with stack traces
 * Production: generic user-friendly message
 */
export function formatErrorResponse(
  error: unknown,
  context = 'API',
): Response {
  console.error(`Error in ${context}:`, error);

  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const errorMessage =
      error instanceof Error
        ? `${error.message}\n\n${error.stack}`
        : 'Unknown error';

    return new Response(
      JSON.stringify(
        {
          error: `Error in ${context}`,
          details: errorMessage,
          timestamp: new Date().toISOString(),
        },
        null,
        2,
      ),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
  }

  return new Response('An error occurred while processing your request!', {
    status: 500,
  });
}

/**
 * Detects if error is a foreign key constraint violation
 * Supports Chat, Message, and Stream entity types
 */
export function handleForeignKeyError(
  error: Error,
  entityType: ForeignKeyErrorType,
): boolean {
  if (!(error instanceof Error) || !error.message) {
    return false;
  }

  const message = error.message;

  if (!message.includes('foreign key constraint')) {
    return false;
  }

  const constraints = FOREIGN_KEY_CONSTRAINTS[entityType];

  return constraints.some((constraint) => message.includes(constraint));
}

/**
 * Creates formatted error context string with optional metadata
 * Useful for structured logging and debugging
 */
export function createErrorContext(
  context: string,
  metadata?: Record<string, any>,
): ErrorContext {
  if (!metadata || Object.keys(metadata).length === 0) {
    return `[${context}]${metadata !== undefined ? ' {}' : ''}`;
  }

  try {
    const metadataStr = JSON.stringify(metadata, null, 2);
    return `[${context}] ${metadataStr}`;
  } catch (error) {
    return `[${context}] [Circular reference in metadata]`;
  }
}
