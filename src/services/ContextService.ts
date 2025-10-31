/**
 * Context management service
 * @module services/ContextService
 */

import * as vscode from 'vscode';
import { IContextService, IStatusInfo } from '../types';
import { DEFAULT_CONFIG } from '../constants';
import { logger } from '../utils/Logger';

/**
 * Service for managing conversation context and health
 */
export class ContextService implements IContextService {
  private static instance: ContextService;
  private readonly log = logger.createChild('ContextService');

  private contextExchangeCount: number = 0;
  private sessionStartTime: number = Date.now();
  private lastContextRefresh: number = Date.now();
  private filesProcessed: number = 0;

  private constructor() {}

  /**
   * Get singleton instance
   */
  public static getInstance(): ContextService {
    if (!ContextService.instance) {
      ContextService.instance = new ContextService();
    }
    return ContextService.instance;
  }

  /**
   * Get current exchange count
   */
  public getExchangeCount(): number {
    return this.contextExchangeCount;
  }

  /**
   * Increment exchange count
   */
  public incrementExchangeCount(): void {
    this.contextExchangeCount++;
    this.log.debug(`Context exchange count: ${this.contextExchangeCount}`);
  }

  /**
   * Reset exchange count
   */
  public resetExchangeCount(): void {
    this.contextExchangeCount = 0;
    this.lastContextRefresh = Date.now();
    this.log.info('Context exchange count reset');
  }

  /**
   * Get context health status
   */
  public getContextHealth(): IStatusInfo {
    const config = vscode.workspace.getConfiguration();
    const threshold = config.get<number>(
      'fixAugment.contextRefreshThreshold',
      DEFAULT_CONFIG.CONTEXT_REFRESH_THRESHOLD
    );

    const count = this.contextExchangeCount;
    const warningThreshold = Math.floor(threshold * 0.7);

    if (count >= threshold) {
      return {
        status: 'red',
        text: `Context refresh needed (${count} exchanges)`
      };
    } else if (count >= warningThreshold) {
      return {
        status: 'yellow',
        text: `Context getting long (${count} exchanges)`
      };
    } else {
      return {
        status: 'green',
        text: `Context healthy (${count} exchanges)`
      };
    }
  }

  /**
   * Check if context should be refreshed
   */
  public shouldRefreshContext(): boolean {
    const config = vscode.workspace.getConfiguration();
    const threshold = config.get<number>(
      'fixAugment.contextRefreshThreshold',
      DEFAULT_CONFIG.CONTEXT_REFRESH_THRESHOLD
    );

    return this.contextExchangeCount >= threshold;
  }

  /**
   * Get session start time
   */
  public getSessionStartTime(): number {
    return this.sessionStartTime;
  }

  /**
   * Get last context refresh time
   */
  public getLastContextRefresh(): number {
    return this.lastContextRefresh;
  }

  /**
   * Get files processed count
   */
  public getFilesProcessed(): number {
    return this.filesProcessed;
  }

  /**
   * Increment files processed
   */
  public incrementFilesProcessed(): void {
    this.filesProcessed++;
    this.log.debug(`Files processed: ${this.filesProcessed}`);
  }

  /**
   * Get session duration in milliseconds
   */
  public getSessionDuration(): number {
    return Date.now() - this.sessionStartTime;
  }

  /**
   * Get time since last refresh in milliseconds
   */
  public getTimeSinceRefresh(): number {
    return Date.now() - this.lastContextRefresh;
  }

  /**
   * Format duration for display
   */
  public formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days}d ${hours % 24}h`;
    } else if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m`;
    } else {
      return `${seconds}s`;
    }
  }

  /**
   * Format time ago for display
   */
  public formatTimeAgo(timestamp: number): string {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) {
      return 'Just now';
    } else if (minutes < 60) {
      return `${minutes}m ago`;
    } else {
      const hours = Math.floor(minutes / 60);
      if (hours < 24) {
        return `${hours}h ago`;
      } else {
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
      }
    }
  }

  /**
   * Get session statistics
   */
  public getSessionStats(): {
    duration: string;
    exchanges: number;
    filesProcessed: number;
    lastRefresh: string;
  } {
    return {
      duration: this.formatDuration(this.getSessionDuration()),
      exchanges: this.contextExchangeCount,
      filesProcessed: this.filesProcessed,
      lastRefresh: this.formatTimeAgo(this.lastContextRefresh)
    };
  }

  /**
   * Reset session
   */
  public resetSession(): void {
    this.contextExchangeCount = 0;
    this.sessionStartTime = Date.now();
    this.lastContextRefresh = Date.now();
    this.filesProcessed = 0;
    this.log.info('Session reset');
  }

  /**
   * Export session data for persistence
   */
  public exportSessionData(): {
    contextExchangeCount: number;
    sessionStartTime: number;
    lastContextRefresh: number;
    filesProcessed: number;
  } {
    return {
      contextExchangeCount: this.contextExchangeCount,
      sessionStartTime: this.sessionStartTime,
      lastContextRefresh: this.lastContextRefresh,
      filesProcessed: this.filesProcessed
    };
  }

  /**
   * Import session data from persistence
   */
  public importSessionData(data: {
    contextExchangeCount?: number;
    sessionStartTime?: number;
    lastContextRefresh?: number;
    filesProcessed?: number;
  }): void {
    if (data.contextExchangeCount !== undefined) {
      this.contextExchangeCount = data.contextExchangeCount;
    }
    if (data.sessionStartTime !== undefined) {
      this.sessionStartTime = data.sessionStartTime;
    }
    if (data.lastContextRefresh !== undefined) {
      this.lastContextRefresh = data.lastContextRefresh;
    }
    if (data.filesProcessed !== undefined) {
      this.filesProcessed = data.filesProcessed;
    }
    this.log.info('Session data imported');
  }
}
