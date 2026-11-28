import React, { useState } from 'react';
import { z } from 'zod';

import Button from '@/components/ui/Button';
import InputField from '../../ui/InputField';

import { ChangePasswordFormData, ChangePasswordFormErrors } from '@/types/settings';
import { changePasswordSchema } from '@/validations/settings';

interface ChangePasswordFormProps {
  isSubmitting: boolean;
  onSubmit: (data: ChangePasswordFormData) => void;
}

export default function ChangePasswordForm({ isSubmitting, onSubmit }: ChangePasswordFormProps) {
  const [data, setData] = useState<ChangePasswordFormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<ChangePasswordFormErrors>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const canSaveChanges = Boolean(data.currentPassword && data.newPassword && data.confirmPassword);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    const field = name as keyof ChangePasswordFormData;

    setData((prev) => ({ ...prev, [field]: value }));

    // Clear errors when the user edits a field.
    setErrors((prev) => ({
      ...prev,
      [field]: undefined,
    }));
  };

  const handleSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Validate the data.
    const result = changePasswordSchema.safeParse(data);

    // If invalid data, set the errors and return.
    if (!result.success) {
      const fieldErrors = z.flattenError(result.error).fieldErrors;

      setErrors({
        currentPassword: fieldErrors.currentPassword?.[0],
        newPassword: fieldErrors.newPassword?.[0],
        confirmPassword: fieldErrors.confirmPassword?.[0],
      });

      return;
    }

    // Else, submit the data.
    onSubmit(result.data);
  };

  return (
    <form id='change-password-form' noValidate onSubmit={handleSubmit} className='space-y-2'>
      <InputField
        id='current-password'
        name='currentPassword'
        label='Current Password'
        type='password'
        placeholder='Enter current password...'
        value={data.currentPassword}
        onChange={handleChange}
        required
        error={errors.currentPassword}
      />
      <InputField
        id='new-password'
        name='newPassword'
        label='New Password'
        type='password'
        placeholder='Enter a new password...'
        value={data.newPassword}
        onChange={handleChange}
        required
        error={errors.newPassword}
      />
      <InputField
        id='confirm-password'
        name='confirmPassword'
        label='Confirm Password'
        type='password'
        placeholder='Confirm your new password...'
        value={data.confirmPassword}
        onChange={handleChange}
        required
        error={errors.confirmPassword}
      />
      <div className='flex justify-end mt-3'>
        <div className='w-32'>
          <Button
            label={isSubmitting ? 'Saving...' : 'Save Changes'}
            variant='primary'
            type='submit'
            disabled={isSubmitting || !canSaveChanges}
          />
        </div>
      </div>
    </form>
  );
}
