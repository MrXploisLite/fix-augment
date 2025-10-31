/**
 * Custom error classes for the extension
 * @module errors
 */

import { ErrorType, IExtensionError } from '../types';

/**
 * Base extension error class
 */
export class ExtensionError extends Error implements IExtensionError {
  public readonly type: ErrorType;
  public readonly code?: string;
  public readonly details?: any;
  public readonly timestamp: Date;

  constructor(
    message: string,
    type: ErrorType = ErrorType.PROCESSING_ERROR,
    code?: string,
    details?: any
  ) {
    super(message);
    this.name = 'ExtensionError';
    this.type = type;
    this.code = code;
    this.details = details;
    this.timestamp = new Date();

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ExtensionError);
    }
  }

  /**
   * Convert error to JSON for logging
   */
  toJSON(): object {
    return {
      name: this.name,
      message: this.message,
      type: this.type,
      code: this.code,
      details: this.details,
      timestamp: this.timestamp.toISOString(),
      stack: this.stack
    };
  }
}

/**
 * Validation error
 */
export class ValidationError extends ExtensionError {
  constructor(message: string, code?: string, details?: any) {
    super(message, ErrorType.VALIDATION_ERROR, code, details);
    this.name = 'ValidationError';
  }
}

/**
 * Processing error
 */
export class ProcessingError extends ExtensionError {
  constructor(message: string, code?: string, details?: any) {
    super(message, ErrorType.PROCESSING_ERROR, code, details);
    this.name = 'ProcessingError';
  }
}

/**
 * UI error
 */
export class UIError extends ExtensionError {
  constructor(message: string, code?: string, details?: any) {
    super(message, ErrorType.UI_ERROR, code, details);
    this.name = 'UIError';
  }
}

/**
 * Configuration error
 */
export class ConfigurationError extends ExtensionError {
  constructor(message: string, code?: string, details?: any) {
    super(message, ErrorType.CONFIGURATION_ERROR, code, details);
    this.name = 'ConfigurationError';
  }
}

/**
 * Augment API error
 */
export class AugmentAPIError extends ExtensionError {
  constructor(message: string, code?: string, details?: any) {
    super(message, ErrorType.AUGMENT_API_ERROR, code, details);
    this.name = 'AugmentAPIError';
  }
}

/**
 * Error handler utility
 */
export class ErrorHandler {
  /**
   * Handle error and show appropriate message to user
   */
  static handle(error: Error | ExtensionError, context?: string): void {
    const errorMessage = context 
      ? `${context}: ${error.message}`
      : error.message;

    if (error instanceof ExtensionError) {
      console.error(`[${error.type}] ${errorMessage}`, error.toJSON());
    } else {
      console.error(errorMessage, error);
    }
  }

  /**
   * Wrap async function with error handling
   */
  static async wrapAsync<T>(
    fn: () => Promise<T>,
    context?: string
  ): Promise<T | null> {
    try {
      return await fn();
    } catch (error) {
      this.handle(error as Error, context);
      return null;
    }
  }

  /**
   * Wrap sync function with error handling
   */
  static wrapSync<T>(
    fn: () => T,
    context?: string
  ): T | null {
    try {
      return fn();
    } catch (error) {
      this.handle(error as Error, context);
      return null;
    }
  }
}
