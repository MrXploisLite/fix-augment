/**
 * Main extension manager - orchestrates all services and components
 * @module core/ExtensionManager
 */

import * as vscode from 'vscode';
import { ContextService } from '../services/ContextService';
import { ValidationService } from '../services/ValidationService';
import { FormattingService } from '../services/FormattingService';
import { logger } from '../utils/Logger';
import { ErrorHandler } from '../errors/ExtensionError';
import { 
  COMMANDS, 
  EXTENSION_NAME, 
  STATUS_BAR_MESSAGES,
  NOTIFICATION_MESSAGES,
  AUGMENT_EXTENSION_ID 
} from '../constants';
import { IAugmentExtension } from '../types';

/**
 * Main extension manager class
 * Implements Singleton pattern for centralized management
 */
export class ExtensionManager {
  private static instance: ExtensionManager;
  private readonly log = logger.createChild('ExtensionManager');

  // Services
  private readonly contextService: ContextService;
  private readonly validationService: ValidationService;
  private readonly formattingService: FormattingService;

  // State
  private enhancementActive: boolean = true;
  private statusBarItem: vscode.StatusBarItem | undefined;
  private context: vscode.ExtensionContext | undefined;

  private constructor() {
    this.contextService = ContextService.getInstance();
    this.validationService = ValidationService.getInstance();
    this.formattingService = FormattingService.getInstance();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): ExtensionManager {
    if (!ExtensionManager.instance) {
      ExtensionManager.instance = new ExtensionManager();
    }
    return ExtensionManager.instance;
  }

  /**
   * Initialize extension
   */
  public async initialize(context: vscode.ExtensionContext): Promise<void> {
    this.log.info(`${EXTENSION_NAME} is initializing...`);
    this.context = context;

    try {
      // Create status bar item
      this.createStatusBar(context);

      // Check for Augment extension
      await this.checkAugmentExtension();

      // Set up event listeners
      this.setupEventListeners(context);

      // Load persisted state
      this.loadPersistedState(context);

      this.log.info(`${EXTENSION_NAME} initialized successfully`);
    } catch (error) {
      this.log.error('Initialization failed', error as Error);
      ErrorHandler.handle(error as Error, 'Extension initialization');
    }
  }

  /**
   * Create status bar item
   */
  private createStatusBar(context: vscode.ExtensionContext): void {
    this.statusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Right,
      100
    );
    this.statusBarItem.text = STATUS_BAR_MESSAGES.ACTIVE;
    this.statusBarItem.tooltip = 'Fix Augment is active. Click to toggle.';
    this.statusBarItem.command = COMMANDS.TOGGLE_ENHANCEMENT;
    this.statusBarItem.show();
    context.subscriptions.push(this.statusBarItem);
  }

  /**
   * Check for Augment extension
   */
  private async checkAugmentExtension(): Promise<IAugmentExtension | undefined> {
    const augmentExtension = vscode.extensions.getExtension(AUGMENT_EXTENSION_ID);

    if (augmentExtension) {
      this.log.info('Augment extension found, setting up enhancements...');
      const augmentAPI = augmentExtension.exports as IAugmentExtension;
      
      vscode.window.showInformationMessage(
        NOTIFICATION_MESSAGES.ENHANCEMENT_ACTIVATED
      );
      
      return augmentAPI;
    } else {
      this.log.warn('Augment extension not found');
      vscode.window.showWarningMessage(
        NOTIFICATION_MESSAGES.AUGMENT_NOT_FOUND
      );
      return undefined;
    }
  }

  /**
   * Set up event listeners
   */
  private setupEventListeners(context: vscode.ExtensionContext): void {
    // Listen for text document changes
    context.subscriptions.push(
      vscode.workspace.onDidChangeTextDocument(
        this.handleTextDocumentChange.bind(this)
      )
    );

    // Listen for active editor changes
    context.subscriptions.push(
      vscode.window.onDidChangeActiveTextEditor(
        this.handleActiveEditorChange.bind(this)
      )
    );

    // Listen for configuration changes
    context.subscriptions.push(
      vscode.workspace.onDidChangeConfiguration(
        this.handleConfigurationChange.bind(this)
      )
    );
  }

  /**
   * Handle text document changes
   */
  private async handleTextDocumentChange(
    event: vscode.TextDocumentChangeEvent
  ): Promise<void> {
    if (!this.enhancementActive || event.contentChanges.length === 0) {
      return;
    }

    // Debounce to avoid excessive processing
    await ErrorHandler.wrapAsync(async () => {
      const text = event.contentChanges[0].text;
      
      // Check if this looks like Augment output
      if (this.isAugmentOutput(text)) {
        this.contextService.incrementExchangeCount();
        
        // Check context health
        if (this.contextService.shouldRefreshContext()) {
          this.showContextRefreshSuggestion();
        }
      }
    }, 'Handle text document change');
  }

  /**
   * Check if text is Augment output
   */
  private isAugmentOutput(text: string): boolean {
    return (
      text.includes('```') ||
      text.includes('function_results') ||
      text.includes('<augment_code_snippet') ||
      text.includes('Agent:') ||
      text.includes('Next Edit:') ||
      text.includes('Instructions:') ||
      text.includes('Chat:')
    );
  }

  /**
   * Show context refresh suggestion
   */
  private async showContextRefreshSuggestion(): Promise<void> {
    const action = await vscode.window.showWarningMessage(
      'Context is getting long. Consider refreshing for better results.',
      'Refresh Now',
      'Remind Later',
      'Don\'t Show Again'
    );

    if (action === 'Refresh Now') {
      this.contextService.resetExchangeCount();
      vscode.window.showInformationMessage(
        NOTIFICATION_MESSAGES.CONTEXT_REFRESHED
      );
    }
  }

  /**
   * Handle active editor change
   */
  private handleActiveEditorChange(
    editor: vscode.TextEditor | undefined
  ): void {
    if (editor) {
      this.log.debug('Active editor changed', { 
        fileName: editor.document.fileName 
      });
    }
  }

  /**
   * Handle configuration change
   */
  private handleConfigurationChange(
    event: vscode.ConfigurationChangeEvent
  ): void {
    if (event.affectsConfiguration('fixAugment')) {
      this.log.info('Configuration changed, reloading...');
      // Reload configuration-dependent components
    }
  }

  /**
   * Toggle enhancement on/off
   */
  public toggleEnhancement(): void {
    this.enhancementActive = !this.enhancementActive;

    if (this.statusBarItem) {
      if (this.enhancementActive) {
        this.statusBarItem.text = STATUS_BAR_MESSAGES.ACTIVE;
        this.statusBarItem.tooltip = 'Fix Augment is active. Click to toggle.';
        vscode.commands.executeCommand('setContext', 'fixAugment.enabled', true);
        vscode.window.showInformationMessage('Fix Augment is now active');
      } else {
        this.statusBarItem.text = STATUS_BAR_MESSAGES.INACTIVE;
        this.statusBarItem.tooltip = 'Fix Augment is inactive. Click to toggle.';
        vscode.commands.executeCommand('setContext', 'fixAugment.enabled', false);
        vscode.window.showInformationMessage('Fix Augment is now inactive');
      }
    }

    this.log.info(`Enhancement ${this.enhancementActive ? 'activated' : 'deactivated'}`);
  }

  /**
   * Check if enhancement is active
   */
  public isEnhancementActive(): boolean {
    return this.enhancementActive;
  }

  /**
   * Get services
   */
  public getContextService(): ContextService {
    return this.contextService;
  }

  public getValidationService(): ValidationService {
    return this.validationService;
  }

  public getFormattingService(): FormattingService {
    return this.formattingService;
  }

  /**
   * Load persisted state
   */
  private loadPersistedState(context: vscode.ExtensionContext): void {
    const sessionData = context.globalState.get('sessionData');
    if (sessionData) {
      this.contextService.importSessionData(sessionData as any);
      this.log.info('Persisted state loaded');
    }
  }

  /**
   * Save state for persistence
   */
  public async saveState(): Promise<void> {
    if (this.context) {
      const sessionData = this.contextService.exportSessionData();
      await this.context.globalState.update('sessionData', sessionData);
      this.log.info('State saved');
    }
  }

  /**
   * Dispose resources
   */
  public dispose(): void {
    this.log.info('Disposing extension manager...');
    
    // Save state before disposing
    this.saveState();

    // Dispose status bar
    if (this.statusBarItem) {
      this.statusBarItem.dispose();
    }

    this.log.info('Extension manager disposed');
  }
}
