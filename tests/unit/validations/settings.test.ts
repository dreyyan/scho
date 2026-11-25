import { describe, expect, it } from 'vitest';
import { accountInformationSchema } from '@/validations/settings';
import { validSettingsData, invalidSettingsData } from '../../fixtures/settings';

describe('Account Information Validation', () => {
  it('accepts valid account information update data', () => {
    const result = accountInformationSchema.safeParse(validSettingsData.accountInformation);
    expect(result.success).toBe(true);
  });

  it('rejects an empty name', () => {
    const result = accountInformationSchema.safeParse(
      invalidSettingsData.accountInformation.emptyName,
    );
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path).toEqual(['name']);
  });

  it('rejects a name exceeding 100 characters', () => {
    const result = accountInformationSchema.safeParse(
      invalidSettingsData.accountInformation.overlongName,
    );
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path).toEqual(['name']);
  });

  it('rejects invalid email', () => {
    const result = accountInformationSchema.safeParse(
      invalidSettingsData.accountInformation.invalidEmail,
    );
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path).toEqual(['email']);
  });
});
