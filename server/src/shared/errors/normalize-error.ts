/**
 * normalize-error.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * TypeScript catch blocks receive `unknown` (since TS 4.0 useUnknownInCatchVariables).
 * This utility converts any thrown value into a proper Error instance so the
 * rest of the codebase can safely call `.message`, `.stack`, etc.
 *
 * Usage:
 *   catch (raw) {
 *     const err = toError(raw);
 *     next(err);              // pass to global ErrorMiddleware
 *     logger.error(err.message);
 *   }
 */

/**
 * Type guard — returns true when `value` is already an Error instance.
 */
export function isError(value: unknown): value is Error {
  return value instanceof Error;
}

/**
 * Converts any thrown value (`unknown`) to a proper `Error`.
 *  - If it is already an Error  → returned as-is (no copy, preserves instanceof chain)
 *  - If it is a non-empty string → wrapped in `new Error(string)`
 *  - If it is a plain object with a `message` string field → wrapped
 *  - Anything else               → wrapped with a JSON-serialised representation
 */
export function toError(value: unknown): Error {
  if (isError(value)) return value;

  if (typeof value === 'string' && value.trim().length > 0) {
    return new Error(value);
  }

  if (
    typeof value === 'object' &&
    value !== null &&
    'message' in value &&
    typeof (value as Record<string, unknown>).message === 'string'
  ) {
    const msg = (value as Record<string, unknown>).message as string;
    const wrapped = new Error(msg);
    // Preserve a stack if available
    if ('stack' in value && typeof (value as Record<string, unknown>).stack === 'string') {
      wrapped.stack = (value as Record<string, unknown>).stack as string;
    }
    return wrapped;
  }

  try {
    return new Error(`Unknown error: ${JSON.stringify(value)}`);
  } catch {
    return new Error('Unknown error (not serialisable)');
  }
}
