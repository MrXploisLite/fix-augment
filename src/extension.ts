/**
 * Fix Augment Extension - Entry Point
 * 
 * This is the main entry point for the VSCode extension.
 * It follows Clean Architecture principles with minimal logic here.
 * All business logic is delegated to services and managers.
 * 
 * @module extension
 * @author Romy Rianata (MrXploisLite)
 * @version 2.3.0
 * 
 * cspell:ignore Romy Rianata Xplois
 */

import * as vscode from 'vscode';
import { ExtensionManager } from './core/ExtensionManager';
import { logger, LogLevel } from './utils/Logger';
import { ErrorHandler } from './errors/ExtensionError';
import { COMMANDS, EXTENSION_NAME } from './constants';

// Extension manager instance
let extensionManager: ExtensionManager;

/**
 * Extension activation
 * Called when extension is activated
 */
export async function activate(context: vscode.ExtensionContext): Promise<void> {
  // Set log level based on environment
  const isDevelopment = process.env.NODE_ENV === 'development';
  logger.setLogLevel(isDevelopment ? LogLevel.DEBUG : LogLevel.INFO);

  logger.info(`Activating ${EXTENSION_NAME}...`);

  try {
    // Initialize extension manager
    extensionManager = ExtensionManager.getInstance();
    await extensionManager.initialize(context);

    // Register all commands
    registerCommands(context);

    // Set context for when clauses
    await vscode.commands.executeCommand('setContext', 'fixAugment.enabled', true);

    logger.info(`${EXTENSION_NAME} activated successfully`);
  } catch (error) {
    logger.error('Failed to activate extension', error as Error);
    ErrorHandler.handle(error as Error, 'Extension activation');
    
    // Show error to user
    vscode.window.showErrorMessage(
      `Failed to activate ${EXTENSION_NAME}: ${(error as Error).message}`
    );
  }
}

/**
 * Register all extension commands
 */
function registerCommands(context: vscode.ExtensionContext): void {
  logger.debug('Registering commands...');

  // Import command handlers lazily to improve startup time
  const commandHandlers = {
    [COMMANDS.TOGGLE_ENHANCEMENT]: () => extensionManager.toggleEnhancement(),
    
    // TODO: Import and register other commands
    // [COMMANDS.SHOW_DASHBOARD]: () => import('./commands/UICommands').then(m => m.showDashboard(context)),
    // [COMMANDS.SHOW_WELCOME]: () => import('./commands/UICommands').then(m => m.showWelcome(context)),
    // ... etc
  };

  // Register each command
  for (const [commandId, handler] of Object.entries(commandHandlers)) {
    const disposable = vscode.commands.registerCommand(commandId, async () => {
      await ErrorHandler.wrapAsync(
        async () => await handler(),
        `Command: ${commandId}`
      );
    });
    
    context.subscriptions.push(disposable);
  }

  logger.debug(`Registered ${Object.keys(commandHandlers).length} commands`);
}

/**
 * Extension deactivation
 * Called when extension is deactivated
 */
export function deactivate(): void {
  logger.info(`Deactivating ${EXTENSION_NAME}...`);

  try {
    // Save state and cleanup
    if (extensionManager) {
      extensionManager.dispose();
    }

    logger.info(`${EXTENSION_NAME} deactivated successfully`);
  } catch (error) {
    logger.error('Error during deactivation', error as Error);
    ErrorHandler.handle(error as Error, 'Extension deactivation');
  }
}
