import React, { useState } from 'react';
import InputField from '../ui/InputField';
import { InboxItemFormData, InboxItemFormErrors } from '@/types/inbox';
import { createInboxItemSchema } from '@/validations/inbox';
import z from 'zod';

interface InboxItemFormProps {
  initialValues?: InboxItemFormData;
  onSubmit: (data: InboxItemFormData) => void;
}

export default function InboxItemForm({ initialValues, onSubmit }: InboxItemFormProps) {
  const [data, setData] = useState<InboxItemFormData>({
    content: initialValues?.content || '',
  });

  const [errors, setErrors] = useState<InboxItemFormErrors>({
    content: '',
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    const field = name as keyof InboxItemFormData;

    setData((prev) => ({ ...prev, [field]: value }));

    // Clear errors when the user edits a field.
    setErrors((prev) => ({
      ...prev,
      [field]: undefined,
    }));
  };

  const handleSubmit = (event: React.ChangeEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Build the payload.
    const payload = data;

    // Validate the payload's data.
    const result = createInboxItemSchema.safeParse(payload);

    // If invalid data, set the errors and return.
    if (!result.success) {
      const fieldErrors = z.flattenError(result.error).fieldErrors;

      setErrors({
        content: fieldErrors.content?.[0],
      });

      return;
    }

    // Else, submit the data.
    onSubmit(result.data);
  };

  return (
    <form id='inbox-item-form' noValidate onSubmit={handleSubmit} className='space-y-2'>
      <InputField
        id='content'
        name='content'
        label='Content'
        type='text'
        placeholder='e.g. Wash the dishes, https://youtube.com...'
        value={data.content}
        onChange={handleChange}
        required
        error={errors.content}
      />
    </form>
  );
}
