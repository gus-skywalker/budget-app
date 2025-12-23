/**
 * Error handling utilities for standardized API error parsing
 */

export interface ApiError {
  error: string
  message: string
  details?: any
}

/**
 * Parse API error response following the B2B contract format
 * Expected format: { error: string, message: string, details?: any }
 */
export function parseApiError(error: any): string {
  // If error is already a string, return it
  if (typeof error === 'string') {
    return error
  }

  // Check for axios error response
  if (error.response?.data) {
    const data = error.response.data
    
    // If data is a string, return it
    if (typeof data === 'string') {
      return data
    }
    
    // If data follows the standard format
    if (data.message) {
      return data.message
    }
    
    // If data has error field
    if (data.error) {
      return typeof data.error === 'string' ? data.error : 'An error occurred'
    }
  }

  // Check for error message property
  if (error.message) {
    return error.message
  }

  // Default fallback
  return 'An unexpected error occurred. Please try again.'
}

/**
 * Get user-friendly error message based on HTTP status code
 */
export function getStatusMessage(status: number): string {
  const messages: Record<number, string> = {
    400: 'Invalid request. Please check your input.',
    401: 'Authentication required. Please log in.',
    403: 'You do not have permission to perform this action.',
    404: 'The requested resource was not found.',
    409: 'This action conflicts with existing data.',
    429: 'Too many requests. Please try again later.',
    500: 'Server error. Please try again later.',
    502: 'Service temporarily unavailable.',
    503: 'Service temporarily unavailable.'
  }
  
  return messages[status] || `Request failed with status ${status}`
}

/**
 * Extract detailed error information from API response
 */
export function getErrorDetails(error: any): ApiError {
  const defaultError: ApiError = {
    error: 'unknown_error',
    message: 'An unexpected error occurred'
  }

  if (!error) return defaultError

  // Check for axios response
  if (error.response?.data) {
    const data = error.response.data
    
    if (typeof data === 'object' && data.error) {
      return {
        error: data.error,
        message: data.message || getStatusMessage(error.response.status),
        details: data.details
      }
    }
    
    if (typeof data === 'string') {
      return {
        error: 'api_error',
        message: data
      }
    }
  }

  // Check for network errors
  if (error.code === 'ECONNABORTED' || error.message === 'Network Error') {
    return {
      error: 'network_error',
      message: 'Network error. Please check your connection.'
    }
  }

  // Default case
  return {
    error: error.code || 'unknown_error',
    message: error.message || defaultError.message,
    details: error.details
  }
}

/**
 * Log error for debugging (can be extended to send to error tracking service)
 */
export function logError(error: any, context?: string) {
  const errorDetails = getErrorDetails(error)
  console.error(`[Error${context ? ` - ${context}` : ''}]:`, {
    ...errorDetails,
    originalError: error
  })
}

/**
 * Check if error is authentication related
 */
export function isAuthError(error: any): boolean {
  return error?.response?.status === 401 || error?.response?.status === 403
}

/**
 * Check if error is validation related
 */
export function isValidationError(error: any): boolean {
  return error?.response?.status === 400 || error?.response?.data?.error === 'validation_error'
}
