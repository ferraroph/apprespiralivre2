/**
 * Standard error codes for Edge Functions
 */
export const ErrorCodes = {
  UNAUTHORIZED: "UNAUTHORIZED",
  RATE_LIMIT_EXCEEDED: "RATE_LIMIT_EXCEEDED",
  INVALID_INPUT: "INVALID_INPUT",
  EXTERNAL_SERVICE_ERROR: "EXTERNAL_SERVICE_ERROR",
  DATABASE_ERROR: "DATABASE_ERROR",
  NOT_FOUND: "NOT_FOUND",
  FORBIDDEN: "FORBIDDEN",
  INTERNAL_ERROR: "INTERNAL_ERROR",
} as const;

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];

/**
 * Standard error response format
 */
export interface ErrorResponse {
  error: string;
  code: ErrorCode;
  details?: unknown;
}

/**
 * Create a standardized error response
 */
export function createErrorResponse(
  message: string,
  code: ErrorCode,
  status: number,
  details?: unknown,
  corsHeaders?: Record<string, string>
): Response {
  const errorResponse: ErrorResponse = {
    error: message,
    code,
  };
  
  if (details) {
    errorResponse.details = details;
  }

  // Log error to Sentry (if configured)
  logErrorToSentry(message, code, details);

  return new Response(JSON.stringify(errorResponse), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...(corsHeaders || {}),
    },
  });
}

/**
 * Log error to Sentry from Edge Functions
 * Note: This is a placeholder. In production, you would use Sentry's Deno SDK
 * or send errors via HTTP to Sentry's API
 */
function logErrorToSentry(
  message: string,
  code: ErrorCode,
  details?: unknown
) {
  const sentryDsn = Deno.env.get("SENTRY_DSN");
  
  if (!sentryDsn) {
    console.error("Sentry DSN not configured, skipping error logging");
    return;
  }

  // Log to console for now
  // In production, implement Sentry HTTP API integration
  console.error("Error logged:", {
    message,
    code,
    details,
    timestamp: new Date().toISOString(),
  });

  // TODO: Implement Sentry HTTP API integration
  // Example: Send error to Sentry via fetch to their store endpoint
}

/**
 * Handle and format common errors
 */
export function handleError(
  error: unknown,
  corsHeaders?: Record<string, string>
): Response {
  console.error("Unhandled error:", error);

  if (error instanceof Error) {
    // Check for specific error types
    if (error.message.includes("autorizado") || error.message.includes("Unauthorized")) {
      return createErrorResponse(
        error.message,
        ErrorCodes.UNAUTHORIZED,
        401,
        undefined,
        corsHeaders
      );
    }

    if (error.message.includes("not found") || error.message.includes("não encontrado")) {
      return createErrorResponse(
        error.message,
        ErrorCodes.NOT_FOUND,
        404,
        undefined,
        corsHeaders
      );
    }

    // Generic error
    return createErrorResponse(
      error.message,
      ErrorCodes.INTERNAL_ERROR,
      500,
      undefined,
      corsHeaders
    );
  }

  // Unknown error type
  return createErrorResponse(
    "Erro desconhecido",
    ErrorCodes.INTERNAL_ERROR,
    500,
    undefined,
    corsHeaders
  );
}
