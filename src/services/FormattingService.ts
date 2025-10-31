/**
 * Code formatting and syntax highlighting service
 * @module services/FormattingService
 */

import hljs from 'highlight.js';
import { IFormattingService, ILanguageDetection, OutputFormat } from '../types';
import { LANGUAGE_PATTERNS } from '../constants';
import { ProcessingError } from '../errors/ExtensionError';
import { logger } from '../utils/Logger';

// Use require for marked to ensure compatibility
const { marked } = require('marked');

/**
 * Service for formatting code and text output
 */
export class FormattingService implements IFormattingService {
  private static instance: FormattingService;
  private readonly log = logger.createChild('FormattingService');

  private constructor() {
    this.configureMarked();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): FormattingService {
    if (!FormattingService.instance) {
      FormattingService.instance = new FormattingService();
    }
    return FormattingService.instance;
  }

  /**
   * Configure marked options
   */
  private configureMarked(): void {
    marked.setOptions({
      highlight: (code: string, lang: string) => {
        return this.highlightCode(code, lang);
      },
      breaks: true,
      gfm: true
    });
  }

  /**
   * Format output based on specified format
   */
  public async formatOutput(text: string, format: OutputFormat): Promise<string> {
    const endTimer = this.log.startTimer('formatOutput');

    try {
      if (!text) {
        return text;
      }

      switch (format) {
        case 'default':
          return text;
        case 'enhanced':
          return this.enhanceOutput(text);
        case 'markdown':
          return this.formatMarkdown(text);
        case 'html':
          return await this.formatHTML(text);
        default:
          return text;
      }
    } catch (error) {
      this.log.error('Format output failed', error as Error);
      throw new ProcessingError('Failed to format output', 'FORMAT_ERROR', { format });
    } finally {
      endTimer();
    }
  }

  /**
   * Enhance output with better formatting
   */
  private enhanceOutput(text: string): string {
    let enhanced = text;

    // Improve code block formatting
    enhanced = enhanced.replace(/```(\w+)?\s*([\s\S]*?)```/g, (_, language, code) => {
      const detectedLang = language || this.detectLanguage(code).language || '';
      return `\`\`\`${detectedLang}\n${code.trim()}\n\`\`\``;
    });

    // Improve function call formatting
    enhanced = enhanced.replace(
      /<function_results>([\s\S]*?)<\/function_results>/g,
      (_, content) => {
        return `<details>\n<summary>Function Results</summary>\n\n\`\`\`\n${content.trim()}\n\`\`\`\n</details>\n`;
      }
    );

    // Format augment code snippets
    enhanced = enhanced.replace(
      /<augment_code_snippet([^>]*)>([\s\S]*?)<\/augment_code_snippet>/g,
      (_, attrs, content) => {
        const pathMatch = attrs.match(/path="([^"]*)"/i);
        const modeMatch = attrs.match(/mode="([^"]*)"/i);
        const path = pathMatch ? pathMatch[1] : 'unknown';
        const mode = modeMatch ? modeMatch[1] : 'EXCERPT';
        return `<augment_code_snippet path="${path}" mode="${mode}">\n${content.trim()}\n</augment_code_snippet>`;
      }
    );

    return enhanced;
  }

  /**
   * Format as markdown
   */
  private formatMarkdown(text: string): string {
    return this.enhanceOutput(text);
  }

  /**
   * Format as HTML
   */
  private async formatHTML(text: string): Promise<string> {
    try {
      let html = marked.parse(text) as string;

      // Add syntax highlighting to code blocks
      html = html.replace(
        /<pre><code class="language-(\w+)">([\s\S]*?)<\/code><\/pre>/g,
        (match, language, code) => {
          try {
            const highlighted = this.highlightCode(code, language);
            return `<pre><code class="language-${language} hljs">${highlighted}</code></pre>`;
          } catch (e) {
            this.log.warn('Highlight failed for language', { language });
            return match;
          }
        }
      );

      return html;
    } catch (error) {
      this.log.error('HTML formatting failed', error as Error);
      return text;
    }
  }

  /**
   * Detect programming language from code
   */
  public detectLanguage(code: string): ILanguageDetection {
    if (!code || code.trim().length === 0) {
      return { confidence: 0 };
    }

    const detections: Array<{ language: string; confidence: number }> = [];

    // Check each language pattern
    for (const [language, pattern] of Object.entries(LANGUAGE_PATTERNS)) {
      if (pattern.test(code)) {
        // Calculate confidence based on pattern matches
        const matches = code.match(pattern);
        const confidence = matches ? Math.min(matches.length * 0.2, 1.0) : 0;
        detections.push({ language, confidence });
      }
    }

    // Sort by confidence and return best match
    detections.sort((a, b) => b.confidence - a.confidence);

    if (detections.length > 0 && detections[0].confidence > 0.3) {
      return detections[0];
    }

    return { confidence: 0 };
  }

  /**
   * Highlight code with syntax highlighting
   */
  public highlightCode(code: string, language: string): string {
    try {
      // Validate language
      if (language && hljs.getLanguage(language)) {
        const result = hljs.highlight(code, { language });
        return result.value;
      }

      // Auto-detect if language not specified or invalid
      const result = hljs.highlightAuto(code);
      return result.value;
    } catch (error) {
      this.log.warn('Highlight failed, returning plain code', { language });
      // Return escaped code if highlighting fails
      return this.escapeHtml(code);
    }
  }

  /**
   * Optimize code blocks in text
   */
  public optimizeCodeBlocks(text: string): string {
    return text.replace(/```(\w+)?\s*([\s\S]*?)```/g, (_, language, code) => {
      // Add proper language tag if missing
      if (!language) {
        const detected = this.detectLanguage(code);
        language = detected.language || '';
      }

      // Format the code block
      const formattedCode = code
        .trim()
        .replace(/^\s+/gm, (spaces: string) => spaces.replace(/\t/g, '  ')) // Replace tabs with spaces
        .replace(/\n{3,}/g, '\n\n'); // Remove excessive blank lines

      return `\`\`\`${language}\n${formattedCode}\n\`\`\``;
    });
  }

  /**
   * Escape HTML special characters
   */
  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * Strip HTML tags from text
   */
  public stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '');
  }

  /**
   * Format file size for display
   */
  public formatFileSize(bytes: number): string {
    if (bytes === 0) {return '0 Bytes';}

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }
}
