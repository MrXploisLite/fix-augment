/**
 * Type definitions for Fix Augment Extension
 * @module types
 */

import * as vscode from 'vscode';

/**
 * Extension configuration interface
 */
export interface IExtensionConfig {
  enabled: boolean;
  showWelcomeOnUpdate: boolean;
  contextHealthMonitoring: boolean;
  contextRefreshThreshold: number;
  fileContextValidation: boolean;
  processTimeoutWarning: boolean;
  processTimeoutMinutes: number;
  autoFixDoubleQuotes: boolean;
  warnLargeInput: boolean;
  maxSafeInputSize: number;
  suggestTaskBreakdown: boolean;
  outputFormat: OutputFormat;
}

/**
 * Output format types
 */
export type OutputFormat = 'default' | 'enhanced' | 'markdown' | 'html';

/**
 * Status indicator types
 */
export type StatusType = 'green' | 'yellow' | 'red';

/**
 * Status information interface
 */
export interface IStatusInfo {
  status: StatusType;
  text: string;
}

/**
 * Dashboard status data
 */
export interface IDashboardStatus {
  context: IStatusInfo;
  file: IStatusInfo;
  process: IStatusInfo;
  enhancement: IStatusInfo;
}

/**
 * Session metrics interface
 */
export interface ISessionMetrics {
  sessionDuration: string;
  contextExchanges: string;
  filesProcessed: string;
  lastRefresh: string;
}

/**
 * Input validation result
 */
export interface IInputValidation {
  isValid: boolean;
  isLarge: boolean;
  hasDoubleQuotes: boolean;
  needsBreakdown: boolean;
  suggestion?: string;
  warnings: string[];
}

/**
 * Code language detection result
 */
export interface ILanguageDetection {
  language?: string;
  confidence: number;
}

/**
 * Webview message types
 */
export type WebviewMessageCommand =
  | 'refreshDashboard'
  | 'checkContextHealth'
  | 'refreshContext'
  | 'validateFileContext'
  | 'optimizePrompt'
  | 'fixDoubleQuotes'
  | 'checkInputSize'
  | 'suggestBreakdown'
  | 'openSettings'
  | 'openDashboard'
  | 'closeWelcome'
  | 'updateStatus'
  | 'updateMetrics';

/**
 * Webview message interface
 */
export interface IWebviewMessage {
  command: WebviewMessageCommand;
  data?: any;
}

/**
 * Extension state interface
 */
export interface IExtensionState {
  enhancementActive: boolean;
  contextExchangeCount: number;
  sessionStartTime: number;
  lastContextRefresh: number;
  filesProcessed: number;
}

/**
 * Augment extension API interface
 */
export interface IAugmentExtension {
  getAPI?: () => any;
  executeCommand?: (command: string, ...args: any[]) => Promise<any>;
}

/**
 * Text chunk interface
 */
export interface ITextChunk {
  content: string;
  index: number;
  hasContext: boolean;
  contextPrefix?: string;
}

/**
 * Error types
 */
export enum ErrorType {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  PROCESSING_ERROR = 'PROCESSING_ERROR',
  UI_ERROR = 'UI_ERROR',
  CONFIGURATION_ERROR = 'CONFIGURATION_ERROR',
  AUGMENT_API_ERROR = 'AUGMENT_API_ERROR'
}

/**
 * Custom error interface
 */
export interface IExtensionError extends Error {
  type: ErrorType;
  code?: string;
  details?: any;
}

/**
 * Logger interface
 */
export interface ILogger {
  info(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  error(message: string, error?: Error, ...args: any[]): void;
  debug(message: string, ...args: any[]): void;
}

/**
 * Service interfaces
 */
export interface IContextService {
  getExchangeCount(): number;
  incrementExchangeCount(): void;
  resetExchangeCount(): void;
  getContextHealth(): IStatusInfo;
  shouldRefreshContext(): boolean;
}

export interface IValidationService {
  validateInput(text: string): IInputValidation;
  fixDoubleQuotes(text: string): string;
  checkInputSize(text: string): { isLarge: boolean; suggestion?: string };
  suggestTaskBreakdown(text: string): string | null;
}

export interface IFormattingService {
  formatOutput(text: string, format: OutputFormat): Promise<string>;
  detectLanguage(code: string): ILanguageDetection;
  highlightCode(code: string, language: string): string;
  optimizeCodeBlocks(text: string): string;
}

export interface IChunkingService {
  chunkText(text: string, maxSize: number): ITextChunk[];
  smartChunkText(text: string, maxSize: number): ITextChunk[];
  preserveCodeBlocks(text: string, maxSize: number): ITextChunk[];
}

/**
 * UI component interfaces
 */
export interface IWebviewPanel {
  panel: vscode.WebviewPanel | undefined;
  show(context: vscode.ExtensionContext): void;
  hide(): void;
  isVisible(): boolean;
  sendMessage(message: IWebviewMessage): void;
}

/**
 * Command handler type
 */
export type CommandHandler = (...args: any[]) => Promise<void> | void;

/**
 * Command registry interface
 */
export interface ICommandRegistry {
  register(commandId: string, handler: CommandHandler): void;
  execute(commandId: string, ...args: any[]): Promise<void>;
  dispose(): void;
}
