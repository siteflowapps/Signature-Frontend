export const getFriendlyErrorMessage = (error: unknown): string => {
  const err = error as Record<string, unknown>;
  if (err?.response) {
    const resp = err.response as Record<string, unknown>;
    const status = resp.status as number;
    const data = resp.data as Record<string, unknown> | undefined;

    // Check if backend already provided a friendly message
    if (data?.error && typeof data.error === 'string') {
      return data.error;
    }

    switch (status) {
      case 400:
        return 'Invalid request. Please check your input.';
      case 401:
        return 'Invalid email or password. Please try again.';
      case 403:
        return "You don't have permission to perform this action.";
      case 404:
        return 'The requested resource was not found.';
      case 500:
        return 'Server error. Please try again later.';
      default:
        return `Request failed (${status}). Please try again.`;
    }
  }

  if (err?.request) {
    return 'Network error. Please check your internet connection.';
  }

  return (err?.message as string) || 'An unexpected error occurred.';
};

/**
 * Extract a human-readable error message from an unknown catch value.
 * Use this in every `catch (err: unknown)` block.
 */
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'An unexpected error occurred.';
};
