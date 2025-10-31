/**
 * Logging utility with different log levels
 * @module utils/Logger
 */

import { ILogger } from '../types';
import { EXTENSION_NAME } from '../constants';

/**
 * Log levels
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4
}

/**
 * Logger class for structured logging
 */
export class Logger implements ILogger {
  private static instance: Logger;
  private logLevel: LogLevel = LogLevel.INFO;
  private readonly prefix: string;

  private constructor(prefix: string = EXTENSION_NAME) {
    this.prefix = prefix;
  }

  /**
   * Get singleton instance
   */
  public static getInstance(prefix?: string): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger(prefix);
    }
    return Logger.instance;
  }

  /**
   * Set log level
   */
  public setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  /**
   * Get current log level
   */
  public getLogLevel(): LogLevel {
    return this.logLevel;
  }

  /**
   * Format log message
   */
  private formatMessage(level: string, message: string): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${this.prefix}] [${level}] ${message}`;
  }

  /**
   * Log debug message
   */
  public debug(message: string, ...args: any[]): void {
    if (this.logLevel <= LogLevel.DEBUG) {
      console.debug(this.formatMessage('DEBUG', message), ...args);
    }
  }

  /**
   * Log info message
   */
  public info(message: string, ...args: any[]): void {
    if (this.logLevel <= LogLevel.INFO) {
      console.info(this.formatMessage('INFO', message), ...args);
    }
  }

  /**
   * Log warning message
   */
  public warn(message: string, ...args: any[]): void {
    if (this.logLevel <= LogLevel.WARN) {
      console.warn(this.formatMessage('WARN', message), ...args);
    }
  }

  /**
   * Log error message
   */
  public error(message: string, error?: Error, ...args: any[]): void {
    if (this.logLevel <= LogLevel.ERROR) {
      const errorDetails = error ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : undefined;

      console.error(
        this.formatMessage('ERROR', message),
        errorDetails,
        ...args
      );
    }
  }

  /**
   * Create child logger with additional prefix
   */
  public createChild(childPrefix: string): Logger {
    const child = new Logger(`${this.prefix}:${childPrefix}`);
    child.setLogLevel(this.logLevel);
    return child;
  }

  /**
   * Log with custom level
   */
  public log(level: LogLevel, message: string, ...args: any[]): void {
    switch (level) {
      case LogLevel.DEBUG:
        this.debug(message, ...args);
        break;
      case LogLevel.INFO:
        this.info(message, ...args);
        break;
      case LogLevel.WARN:
        this.warn(message, ...args);
        break;
      case LogLevel.ERROR:
        this.error(message, undefined, ...args);
        break;
    }
  }

  /**
   * Log performance metric
   */
  public performance(label: string, startTime: number): void {
    const duration = Date.now() - startTime;
    this.debug(`Performance: ${label} took ${duration}ms`);
  }

  /**
   * Create performance timer
   */
  public startTimer(label: string): () => void {
    const startTime = Date.now();
    return () => this.performance(label, startTime);
  }
}

/**
 * Default logger instance
 */
export const logger = Logger.getInstance();
