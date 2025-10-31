/**
 * Unit tests for ValidationService
 * @module tests/unit/ValidationService
 */

import * as assert from 'assert';
import { ValidationService } from '../../src/services/ValidationService';

suite('ValidationService Unit Tests', () => {
  let service: ValidationService;

  setup(() => {
    service = ValidationService.getInstance();
  });

  suite('fixDoubleQuotes', () => {
    test('should escape unescaped double quotes', () => {
      const input = 'Hello "world"';
      const expected = 'Hello \\"world\\"';
      const result = service.fixDoubleQuotes(input);
      assert.strictEqual(result, expected);
    });

    test('should not double-escape already escaped quotes', () => {
      const input = 'Hello \\"world\\"';
      const expected = 'Hello \\"world\\"';
      const result = service.fixDoubleQuotes(input);
      assert.strictEqual(result, expected);
    });

    test('should handle empty string', () => {
      const input = '';
      const result = service.fixDoubleQuotes(input);
      assert.strictEqual(result, '');
    });

    test('should handle string without quotes', () => {
      const input = 'Hello world';
      const result = service.fixDoubleQuotes(input);
      assert.strictEqual(result, 'Hello world');
    });

    test('should handle multiple quotes', () => {
      const input = '"Hello" "world" "test"';
      const expected = '\\"Hello\\" \\"world\\" \\"test\\"';
      const result = service.fixDoubleQuotes(input);
      assert.strictEqual(result, expected);
    });
  });

  suite('checkInputSize', () => {
    test('should return isLarge=false for small input', () => {
      const input = 'Small text';
      const result = service.checkInputSize(input);
      assert.strictEqual(result.isLarge, false);
      assert.strictEqual(result.suggestion, undefined);
    });

    test('should return isLarge=true for large input', () => {
      const input = 'x'.repeat(10000);
      const result = service.checkInputSize(input);
      assert.strictEqual(result.isLarge, true);
      assert.ok(result.suggestion);
      assert.ok(result.suggestion!.includes('10000'));
    });

    test('should provide breakdown suggestion for very large input', () => {
      const input = 'x'.repeat(20000);
      const result = service.checkInputSize(input);
      assert.strictEqual(result.isLarge, true);
      assert.ok(result.suggestion!.includes('smaller tasks'));
    });
  });

  suite('suggestTaskBreakdown', () => {
    test('should return null for simple tasks', () => {
      const input = 'Fix this bug';
      const result = service.suggestTaskBreakdown(input);
      assert.strictEqual(result, null);
    });

    test('should suggest breakdown for complex documentation task', () => {
      const input = 'Write complete documentation for all modules with examples and API references';
      const result = service.suggestTaskBreakdown(input);
      assert.ok(result);
      assert.ok(result!.includes('breaking it down'));
    });

    test('should suggest breakdown for large refactoring', () => {
      const input = 'Refactor entire codebase to use TypeScript with full type safety';
      const result = service.suggestTaskBreakdown(input);
      assert.ok(result);
      assert.ok(result!.includes('complex task'));
    });

    test('should not suggest for short complex-sounding text', () => {
      const input = 'Create complete test';
      const result = service.suggestTaskBreakdown(input);
      assert.strictEqual(result, null);
    });
  });

  suite('validateInput', () => {
    test('should validate simple valid input', () => {
      const input = 'Hello world';
      const result = service.validateInput(input);
      assert.strictEqual(result.isValid, true);
      assert.strictEqual(result.warnings.length, 0);
    });

    test('should detect double quotes issue', () => {
      const input = 'Hello "world"';
      const result = service.validateInput(input);
      assert.strictEqual(result.hasDoubleQuotes, true);
      assert.ok(result.warnings.length > 0);
    });

    test('should detect large input', () => {
      const input = 'x'.repeat(10000);
      const result = service.validateInput(input);
      assert.strictEqual(result.isLarge, true);
      assert.ok(result.warnings.length > 0);
    });

    test('should detect complex task', () => {
      const input = 'Create complete documentation with all examples and API references for every module';
      const result = service.validateInput(input);
      assert.strictEqual(result.needsBreakdown, true);
      assert.ok(result.warnings.length > 0);
    });

    test('should throw error for invalid input', () => {
      assert.throws(() => {
        service.validateInput(null as any);
      });
    });
  });

  suite('validateFilePath', () => {
    test('should accept valid file path', () => {
      const path = 'src/services/ValidationService.ts';
      const result = service.validateFilePath(path);
      assert.strictEqual(result, true);
    });

    test('should reject path traversal attempts', () => {
      const path = '../../../etc/passwd';
      const result = service.validateFilePath(path);
      assert.strictEqual(result, false);
    });

    test('should reject home directory shortcuts', () => {
      const path = '~/secret/file.txt';
      const result = service.validateFilePath(path);
      assert.strictEqual(result, false);
    });

    test('should reject empty path', () => {
      const path = '';
      const result = service.validateFilePath(path);
      assert.strictEqual(result, false);
    });
  });

  suite('sanitizeText', () => {
    test('should escape HTML special characters', () => {
      const input = '<script>alert("XSS")</script>';
      const result = service.sanitizeText(input);
      assert.ok(!result.includes('<script>'));
      assert.ok(result.includes('&lt;'));
      assert.ok(result.includes('&gt;'));
    });

    test('should escape quotes', () => {
      const input = 'Hello "world" and \'test\'';
      const result = service.sanitizeText(input);
      assert.ok(result.includes('&quot;'));
      assert.ok(result.includes('&#x27;'));
    });

    test('should handle empty string', () => {
      const input = '';
      const result = service.sanitizeText(input);
      assert.strictEqual(result, '');
    });
  });

  suite('validateWebviewMessage', () => {
    test('should accept valid message', () => {
      const message = { command: 'refreshDashboard' };
      const result = service.validateWebviewMessage(message);
      assert.strictEqual(result, true);
    });

    test('should reject message without command', () => {
      const message = { data: 'test' };
      const result = service.validateWebviewMessage(message);
      assert.strictEqual(result, false);
    });

    test('should reject message with invalid command', () => {
      const message = { command: 'maliciousCommand' };
      const result = service.validateWebviewMessage(message);
      assert.strictEqual(result, false);
    });

    test('should reject non-object message', () => {
      const message = 'string message';
      const result = service.validateWebviewMessage(message);
      assert.strictEqual(result, false);
    });

    test('should reject null message', () => {
      const message = null;
      const result = service.validateWebviewMessage(message);
      assert.strictEqual(result, false);
    });
  });
});
