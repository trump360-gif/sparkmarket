/**
 * API Error Types and Utilities
 *
 * Provides type-safe error handling for API requests
 */

import { AxiosError } from 'axios';

/**
 * API Error Response Structure
 */
export interface ApiErrorResponse {
  message?: string;
  statusCode?: number;
  error?: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

/**
 * Type guard to check if an error is an Axios error
 */
export function isAxiosError(error: unknown): error is AxiosError<ApiErrorResponse> {
  return (
    typeof error === 'object' &&
    error !== null &&
    'isAxiosError' in error &&
    error.isAxiosError === true
  );
}

/**
 * Type guard to check if an error is an API error with response
 */
export function isApiError(error: unknown): error is AxiosError<ApiErrorResponse> {
  return isAxiosError(error) && error.response !== undefined;
}

/**
 * Extract error message from unknown error
 *
 * @param error - Any error object
 * @param fallbackMessage - Default message if none found
 * @returns Human-readable error message
 */
export function getErrorMessage(
  error: unknown,
  fallbackMessage: string = '오류가 발생했습니다.'
): string {
  // Axios error with response
  if (isApiError(error) && error.response) {
    const data = error.response.data;

    // Validation errors (array of field errors)
    if (data?.errors && Array.isArray(data.errors) && data.errors.length > 0) {
      return data.errors.map(e => e.message).join(', ');
    }

    // Single error message
    if (data?.message) {
      return data.message;
    }

    // Error type string
    if (data?.error) {
      return data.error;
    }
  }

  // Axios error without response (network error)
  if (isAxiosError(error)) {
    if (error.code === 'ECONNABORTED') {
      return '요청 시간이 초과되었습니다.';
    }
    if (error.code === 'ERR_NETWORK') {
      return '네트워크 연결을 확인해주세요.';
    }
    if (error.message) {
      return error.message;
    }
  }

  // Standard Error object
  if (error instanceof Error) {
    return error.message;
  }

  // String error
  if (typeof error === 'string') {
    return error;
  }

  // Unknown error
  return fallbackMessage;
}

/**
 * Get HTTP status code from error
 *
 * @param error - Any error object
 * @returns HTTP status code or null
 */
export function getErrorStatus(error: unknown): number | null {
  if (isApiError(error) && error.response) {
    return error.response.status;
  }
  return null;
}

/**
 * Handle API error with optional options
 *
 * @param error - Error to handle
 * @param options - Handling options
 * @param options.ignore401 - Don't throw on 401 errors (handled by axios interceptor)
 * @param options.ignore403 - Don't throw on 403 errors
 * @param options.onError - Custom error handler
 * @throws Error if not ignored
 */
export interface HandleApiErrorOptions {
  ignore401?: boolean;
  ignore403?: boolean;
  onError?: (message: string, status: number | null) => void;
}

export function handleApiError(
  error: unknown,
  options: HandleApiErrorOptions = {}
): void {
  const { ignore401 = true, ignore403 = false, onError } = options;

  const status = getErrorStatus(error);
  const message = getErrorMessage(error);

  // Ignore 401 errors by default (handled by axios interceptor)
  if (ignore401 && status === 401) {
    return;
  }

  // Optionally ignore 403 errors
  if (ignore403 && status === 403) {
    return;
  }

  // Call custom error handler if provided
  if (onError) {
    onError(message, status);
    return;
  }

  // Log error in development
  if (process.env.NODE_ENV === 'development') {
    console.error('[API Error]', {
      status,
      message,
      error,
    });
  }

  // Throw error for caller to handle
  throw new Error(message);
}

/**
 * Format validation errors for display
 *
 * @param error - API error
 * @returns Object with field names as keys and error messages as values
 */
export function getValidationErrors(error: unknown): Record<string, string> {
  if (!isApiError(error) || !error.response) {
    return {};
  }

  const errors = error.response.data?.errors;
  if (!errors || !Array.isArray(errors)) {
    return {};
  }

  return errors.reduce((acc, err) => {
    acc[err.field] = err.message;
    return acc;
  }, {} as Record<string, string>);
}

/**
 * Check if error is a specific status code
 *
 * @param error - Error to check
 * @param status - Status code to match
 * @returns True if error has the specified status
 */
export function isErrorStatus(error: unknown, status: number): boolean {
  return getErrorStatus(error) === status;
}

/**
 * Check if error is a network error (no response)
 *
 * @param error - Error to check
 * @returns True if error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  return (
    isAxiosError(error) &&
    !error.response &&
    (error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED')
  );
}

/**
 * Create a user-friendly error message based on status code
 *
 * @param status - HTTP status code
 * @param defaultMessage - Fallback message
 * @returns User-friendly error message
 */
export function getStatusMessage(
  status: number | null,
  defaultMessage?: string
): string {
  if (!status) {
    return defaultMessage || '오류가 발생했습니다.';
  }

  const statusMessages: Record<number, string> = {
    400: '잘못된 요청입니다.',
    401: '로그인이 필요합니다.',
    403: '권한이 없습니다.',
    404: '요청한 리소스를 찾을 수 없습니다.',
    409: '이미 존재하는 데이터입니다.',
    422: '입력값을 확인해주세요.',
    429: '너무 많은 요청을 보냈습니다. 잠시 후 다시 시도해주세요.',
    500: '서버 오류가 발생했습니다.',
    502: '서버에 연결할 수 없습니다.',
    503: '서비스를 일시적으로 사용할 수 없습니다.',
  };

  return statusMessages[status] || defaultMessage || '오류가 발생했습니다.';
}
