import { describe, expect, it, beforeEach } from 'vitest';

// Helper to wait between tests to avoid rate limiting
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
import { sendEmail } from './resend';

describe('Resend API', () => {
  beforeEach(async () => {
    // Wait 600ms between tests to respect Resend's 2 req/sec rate limit
    await delay(600);
  });
  it('should validate API key by sending a test email', async () => {
    // Send a simple test email to validate the API key
    const result = await sendEmail({
      to: 'test@example.com',
      subject: 'Test Email - API Validation',
      html: '<p>This is a test email to validate the Resend API key.</p>',
      text: 'This is a test email to validate the Resend API key.',
    });

    // The API should accept the request (even if the email address doesn't exist)
    // Resend returns success for valid API keys, even with test addresses
    expect(result.success).toBe(true);
    expect(result.id).toBeDefined();
    expect(typeof result.id).toBe('string');
  }, 10000); // 10s timeout for API call

  it('should return error for invalid email format', async () => {
    const result = await sendEmail({
      to: 'invalid-email',
      subject: 'Test',
      html: '<p>Test</p>',
    });

    // Should fail due to invalid email format
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  }, 10000);

  it('should handle single recipient with text content', async () => {
    const result = await sendEmail({
      to: 'test@example.com',
      subject: 'Test with Text',
      html: '<p>Test email with text content</p>',
      text: 'Test email with text content',
    });

    expect(result.success).toBe(true);
    expect(result.id).toBeDefined();
  }, 10000);

  it('should handle reply-to address', async () => {
    const result = await sendEmail({
      to: 'test@example.com',
      subject: 'Test with Reply-To',
      html: '<p>Test email with reply-to</p>',
      replyTo: 'reply@example.com',
    });

    expect(result.success).toBe(true);
    expect(result.id).toBeDefined();
  }, 10000);
});
