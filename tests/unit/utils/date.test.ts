import { formatDeadline, toDateTimeLocal } from '@/lib/utils/date';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  invalidDeadline,
  ISODateCST,
  ISODateCDT,
  prevDayISODate,
  ISODate,
  NOW,
} from '../../fixtures/date';
import { MINUTE, HOUR, DAY, SECOND } from '@/lib/constants/date';

describe('formatDeadline()', () => {
  // Create deadlines based on the date.
  const deadlineIn = (ms: number): string => new Date(NOW.getTime() + ms).toISOString();

  // Mock the system clock before each test.
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  // Restore the real system clock after each test.
  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Missing or invalid deadlines', () => {
    it("returns 'No deadline.' when deadline is null", () => {
      const result = formatDeadline(null);
      expect(result).toBe('No deadline.');
    });
    it("returns 'Invalid deadline.' when deadline is not a number", () => {
      const result = formatDeadline(invalidDeadline);
      expect(result).toBe('Invalid deadline.');
    });
  });

  describe('Upcoming deadlines', () => {
    it("returns 'Due now' when seconds remain", () => {
      const deadline = deadlineIn(SECOND);
      expect(formatDeadline(deadline)).toBe('Due now');
    });
    it("returns '1 min left' when 1 minute remains", () => {
      const deadline = deadlineIn(MINUTE);
      expect(formatDeadline(deadline)).toBe('1 min left');
    });
    it("returns '30 mins left' when 30 minutes remain", () => {
      const deadline = deadlineIn(30 * MINUTE);
      expect(formatDeadline(deadline)).toBe('30 mins left');
    });
    it("returns '1 hour left' when 1 hour remains", () => {
      const deadline = deadlineIn(HOUR);
      expect(formatDeadline(deadline)).toBe('1 hour left');
    });
    it("returns '12 hours left' when 12 hours remain", () => {
      const deadline = deadlineIn(12 * HOUR);
      expect(formatDeadline(deadline)).toBe('12 hours left');
    });
    it("returns '1 day left' when 1 day remains", () => {
      const deadline = deadlineIn(DAY);
      expect(formatDeadline(deadline)).toBe('1 day left');
    });
    it("returns '3 days left' when 3 days remain", () => {
      const deadline = deadlineIn(3 * DAY);
      expect(formatDeadline(deadline)).toBe('3 days left');
    });
  });

  describe('Overdue deadlines', () => {
    it("returns 'Just overdue' when seconds have passed", () => {
      const deadline = deadlineIn(-SECOND);
      expect(formatDeadline(deadline)).toBe('Just overdue');
    });
    it("returns 'Overdue by 1 min' when 1 minute remains", () => {
      const deadline = deadlineIn(-MINUTE);
      expect(formatDeadline(deadline)).toBe('Overdue by 1 min');
    });
    it("returns 'Overdue by 30 mins' when 30 minutes remain", () => {
      const deadline = deadlineIn(30 * -MINUTE);
      expect(formatDeadline(deadline)).toBe('Overdue by 30 mins');
    });
    it("returns 'Overdue by 1 hour' when 1 hour remains", () => {
      const deadline = deadlineIn(-HOUR);
      expect(formatDeadline(deadline)).toBe('Overdue by 1 hour');
    });
    it("returns 'Overdue by 12 hours' when 12 hours remain", () => {
      const deadline = deadlineIn(12 * -HOUR);
      expect(formatDeadline(deadline)).toBe('Overdue by 12 hours');
    });
    it("returns 'Overdue by 1 day' when 1 day remains", () => {
      const deadline = deadlineIn(-DAY);
      expect(formatDeadline(deadline)).toBe('Overdue by 1 day');
    });
    it("returns 'Overdue by 3 days' when 3 days remain", () => {
      const deadline = deadlineIn(3 * -DAY);
      expect(formatDeadline(deadline)).toBe('Overdue by 3 days');
    });
  });

  describe('Full date formatting', () => {
    it('returns the full date and time for deadlines past 3 days', () => {
      const deadline = deadlineIn(7 * DAY);
      const expected = new Date(deadline).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
      expect(formatDeadline(deadline)).toBe(expected);
    });
  });
});

describe('toDateTimeLocal()', () => {
  describe('UTC to local time conversion', () => {
    it('converts UTC to CST (UTC-6)', () => {
      const result = toDateTimeLocal(ISODateCST);
      expect(result).toBe('2026-11-10T12:00');
    });
    it('converts UTC to CDT (UTC-5)', () => {
      const result = toDateTimeLocal(ISODateCDT);
      expect(result).toBe('2026-07-10T13:00');
    });
  });

  describe('Date Boundaries', () => {
    it('handles conversion to the previous day', () => {
      const result = toDateTimeLocal(prevDayISODate);
      expect(result).toBe('2026-11-09T20:00');
    });
  });

  describe('Output Format', () => {
    it('returns YYYY-MM-DDTHH:mm', () => {
      const result = toDateTimeLocal(ISODate);
      expect(result).toBe('2026-11-09T20:00');
    });
  });
});
