import { DEFAULT_ERROR_MESSAGE } from '@/lib/constants/error';
import { getErrorMessage } from '@/lib/utils/error';
import { describe, expect, it } from 'vitest';

describe('getErrorMessage()', () => {
  it("Returns an Error's message", () => {
    const result = getErrorMessage(new Error('This is an error.'));
    expect(result).toBe('This is an error.');
  });

  it('Returns the generic fallback for any other thrown value', () => {
    const result = getErrorMessage({ message: 'fake' });
    expect(result).toBe(DEFAULT_ERROR_MESSAGE);
  });
});
