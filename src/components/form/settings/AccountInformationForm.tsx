import React, { useState } from 'react';
import InputField from '../../ui/InputField';
import {
  AccountInformationFormData,
  AccountInformationFormErrors,
  AccountInformationResponse,
} from '@/types/settings';
import { accountInformationSchema } from '@/validations/settings';
import { z } from 'zod';
import Button from '@/components/ui/Button';

interface AccountInformationFormProps {
  initialValues: AccountInformationResponse;
  onSubmit: (data: AccountInformationFormData) => void;
}

export default function AccountInformationForm({
  initialValues,
  onSubmit,
}: AccountInformationFormProps) {
  const [data, setData] = useState<AccountInformationFormData>({
    name: initialValues.name || '',
    email: initialValues.email || '',
  });

  const [errors, setErrors] = useState<AccountInformationFormErrors>({
    name: '',
    email: '',
  });

  const hasChanges =
    data.name !== (initialValues.name || '') || data.email !== (initialValues.email || '');

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    const field = name as keyof AccountInformationFormData;

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
    const result = accountInformationSchema.safeParse(data);

    // If invalid data, set the errors and return.
    if (!result.success) {
      const fieldErrors = z.flattenError(result.error).fieldErrors;

      setErrors({
        name: fieldErrors.name?.[0],
        email: fieldErrors.email?.[0],
      });

      return;
    }

    // Else, submit the data.
    onSubmit(result.data);
  };

  return (
    <form id='account-information-form' noValidate onSubmit={handleSubmit} className='space-y-2'>
      <InputField
        id='name'
        name='name'
        label='Name'
        type='text'
        placeholder='e.g. John Doe'
        value={data.name}
        onChange={handleChange}
        required
        error={errors.name}
      />
      <InputField
        id='email'
        name='email'
        label='Email'
        type='email'
        value={data.email}
        onChange={handleChange}
        required
        error={errors.email}
      />
      <div className='flex justify-end mt-3'>
        <div className='w-32'>
          <Button label='Save Changes' variant='primary' type='submit' disabled={!hasChanges} />
        </div>
      </div>
    </form>
  );
}
