/**
 * Constants and configuration values
 * @module constants
 */

/**
 * Extension metadata
 */
export const EXTENSION_ID = 'RomyRianata.fix-augment';
export const EXTENSION_NAME = 'Fix Augment';
export const EXTENSION_VERSION = '2.2.5';

/**
 * Command IDs
 */
export const COMMANDS = {
  SHOW_DASHBOARD: 'fix-augment.showDashboard',
  SHOW_WELCOME: 'fix-augment.showWelcome',
  CONTEXT_HEALTH: 'fix-augment.contextHealth',
  REFRESH_CONTEXT: 'fix-augment.refreshContext',
  VALIDATE_FILE_CONTEXT: 'fix-augment.validateFileContext',
  MONITOR_PROCESS: 'fix-augment.monitorProcess',
  FIX_DOUBLE_QUOTES: 'fix-augment.fixDoubleQuotes',
  CHECK_INPUT_SIZE: 'fix-augment.checkInputSize',
  SUGGEST_BREAKDOWN: 'fix-augment.suggestBreakdown',
  OPTIMIZE_PROMPT: 'fix-augment.optimizePrompt',
  FORMAT_OUTPUT: 'fix-augment.formatOutput',
  TOGGLE_ENHANCEMENT: 'fix-augment.toggleEnhancement',
  REFRESH_DASHBOARD_TREE: 'fix-augment.refreshDashboardTree'
} as const;

/**
 * Configuration keys
 */
export const CONFIG_KEYS = {
  ENABLED: 'fixAugment.enabled',
  SHOW_WELCOME_ON_UPDATE: 'fixAugment.showWelcomeOnUpdate',
  CONTEXT_HEALTH_MONITORING: 'fixAugment.contextHealthMonitoring',
  CONTEXT_REFRESH_THRESHOLD: 'fixAugment.contextRefreshThreshold',
  FILE_CONTEXT_VALIDATION: 'fixAugment.fileContextValidation',
  PROCESS_TIMEOUT_WARNING: 'fixAugment.processTimeoutWarning',
  PROCESS_TIMEOUT_MINUTES: 'fixAugment.processTimeoutMinutes',
  AUTO_FIX_DOUBLE_QUOTES: 'fixAugment.autoFixDoubleQuotes',
  WARN_LARGE_INPUT: 'fixAugment.warnLargeInput',
  MAX_SAFE_INPUT_SIZE: 'fixAugment.maxSafeInputSize',
  SUGGEST_TASK_BREAKDOWN: 'fixAugment.suggestTaskBreakdown',
  OUTPUT_FORMAT: 'fixAugment.outputFormat'
} as const;

/**
 * Default configuration values
 */
export const DEFAULT_CONFIG = {
  ENABLED: true,
  SHOW_WELCOME_ON_UPDATE: true,
  CONTEXT_HEALTH_MONITORING: true,
  CONTEXT_REFRESH_THRESHOLD: 10,
  FILE_CONTEXT_VALIDATION: true,
  PROCESS_TIMEOUT_WARNING: true,
  PROCESS_TIMEOUT_MINUTES: 3,
  AUTO_FIX_DOUBLE_QUOTES: true,
  WARN_LARGE_INPUT: true,
  MAX_SAFE_INPUT_SIZE: 8000,
  SUGGEST_TASK_BREAKDOWN: true,
  OUTPUT_FORMAT: 'enhanced' as const
};

/**
 * Input validation limits
 */
export const VALIDATION_LIMITS = {
  MAX_SAFE_INPUT_SIZE: 8000,
  MIN_CHUNK_SIZE: 1000,
  MAX_CHUNK_SIZE: 10000,
  CONTEXT_OVERLAP_SIZE: 200,
  COMPLEXITY_THRESHOLD: 2000
} as const;

/**
 * Augment issue patterns
 */
export const AUGMENT_ISSUE_PATTERNS = {
  DOUBLE_QUOTE_ERROR: /We encountered an issue sending your message/i,
  TOO_LARGE_INPUT: /too large of an input/i,
  CREDIT_CONSUMED_ERROR: /I'm sorry\. I tried to call a tool, but provided too large of an input/i,
  TASK_BREAKDOWN_NEEDED: /break.*down.*smaller.*tasks/i
} as const;

/**
 * Complexity indicators for task breakdown
 */
export const COMPLEXITY_INDICATORS = [
  /write.*documentation/i,
  /create.*complete/i,
  /implement.*entire/i,
  /build.*full/i,
  /generate.*all/i,
  /refactor.*everything/i,
  /migrate.*all/i
] as const;

/**
 * Language detection patterns
 */
export const LANGUAGE_PATTERNS = {
  javascript: /function|const|let|var|=>|import.*from/,
  typescript: /interface|type|enum|namespace|import.*from.*['"].*\.ts/,
  python: /def\s+\w+\s*\(|import\s+\w+|from\s+\w+\s+import|class\s+\w+:/,
  java: /public\s+class|private\s+void|import\s+java\./,
  csharp: /using\s+System|namespace\s+\w+|public\s+class/,
  go: /package\s+\w+|func\s+\w+|import\s+\(/,
  rust: /fn\s+\w+|let\s+mut|use\s+std::/,
  cpp: /#include\s*<|std::|cout|cin/,
  c: /#include\s*<stdio\.h>|printf|scanf/,
  html: /<html|<!DOCTYPE|<div|<span/,
  css: /\{[^}]*:[^}]*\}|@media|@import/,
  json: /^\s*\{[\s\S]*\}\s*$/,
  yaml: /^[\w-]+:\s*[\w-]/m,
  markdown: /^#{1,6}\s+|\[.*\]\(.*\)|```/m,
  sql: /SELECT\s+.*\s+FROM|INSERT\s+INTO|UPDATE\s+.*\s+SET/i,
  shell: /^#!\/bin\/(bash|sh)|echo\s+|export\s+/
} as const;

/**
 * UI constants
 */
export const UI_CONSTANTS = {
  DASHBOARD_REFRESH_INTERVAL: 30000, // 30 seconds
  WELCOME_AUTO_CLOSE_DELAY: 40000, // 40 seconds
  DEBOUNCE_DELAY: 300, // 300ms
  ANIMATION_DURATION: 200 // 200ms
} as const;

/**
 * Status bar messages
 */
export const STATUS_BAR_MESSAGES = {
  ACTIVE: '$(megaphone) Augment Fix: ON',
  INACTIVE: '$(megaphone) Augment Fix: OFF',
  PROCESSING: '$(sync~spin) Processing...',
  ERROR: '$(error) Error occurred'
} as const;

/**
 * Notification messages
 */
export const NOTIFICATION_MESSAGES = {
  ENHANCEMENT_ACTIVATED: 'Fix Augment: Enhancement layer activated for Augment workflows!',
  AUGMENT_NOT_FOUND: 'Augment extension not found. Fix Augment will work in standalone mode.',
  CONTEXT_REFRESHED: 'Context refreshed! Consider starting a new conversation with Augment for better results.',
  INPUT_OPTIMIZED: 'Input optimized for Augment',
  OUTPUT_FORMATTED: 'Output formatted',
  DOUBLE_QUOTES_FIXED: 'Fixed double quotes to prevent Augment errors',
  NO_DOUBLE_QUOTES: 'No double quote issues found',
  FILE_CONTEXT_COPIED: 'File context copied to clipboard',
  PROCESS_MONITORING_ACTIVE: 'Process monitoring is active. You will be notified if any process takes too long.'
} as const;

/**
 * Error messages
 */
export const ERROR_MESSAGES = {
  NO_ACTIVE_EDITOR: 'No active editor found',
  NO_TEXT_SELECTED: 'No text selected',
  NO_ACTIVE_FILE: 'No active file to validate',
  PROCESSING_ERROR: 'Error processing input',
  FORMATTING_ERROR: 'Error formatting output',
  VALIDATION_ERROR: 'Error validating input',
  UI_ERROR: 'Error displaying UI component'
} as const;

/**
 * Webview paths
 */
export const WEBVIEW_PATHS = {
  DASHBOARD: 'dashboard.html',
  WELCOME: 'welcome.html'
} as const;

/**
 * Context keys for when clauses
 */
export const CONTEXT_KEYS = {
  ENABLED: 'fixAugment.enabled',
  HAS_SELECTION: 'editorHasSelection'
} as const;

/**
 * Augment extension ID
 */
export const AUGMENT_EXTENSION_ID = 'augment.vscode-augment';

/**
 * Global state keys
 */
export const STATE_KEYS = {
  LAST_VERSION: 'lastVersion',
  SESSION_START: 'sessionStart',
  TOTAL_FILES_PROCESSED: 'totalFilesProcessed'
} as const;
