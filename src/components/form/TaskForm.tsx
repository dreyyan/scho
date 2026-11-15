import React, { useState } from 'react';
import InputField from '../ui/InputField';
import { TaskFormData, TaskFormErrors } from '@/types/task';
import { toDateTimeLocal } from '@/lib/utils/date';

interface TaskFormProps {
  initialValues?: TaskFormData;
  onSubmit: (data: TaskFormData) => void;
}

export default function TaskForm({ initialValues, onSubmit }: TaskFormProps) {
  const [data, setData] = useState<TaskFormData>({
    title: initialValues?.title || '',
    // extract date portion of an ISO DateTime string.
    deadline: initialValues?.deadline ? toDateTimeLocal(initialValues.deadline) : '',
  });

  const [errors, setErrors] = useState<TaskFormErrors>({
    title: '',
    deadline: '',
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    const field = name as keyof TaskFormData;

    setData((prev) => ({ ...prev, [field]: value }));

    // Clear errors when the user edits a field.
    setErrors((prev) => ({
      ...prev,
      [field]: undefined,
    }));
  };

  const handleSubmit = (event: React.ChangeEvent<HTMLFormElement>) => {
    event.preventDefault();

    onSubmit({
      ...data,
      deadline: data.deadline
        ? new Date(data.deadline).toISOString() // convert localtime to UTC.
        : null,
    });
  };

  return (
    <form id='task-form' onSubmit={handleSubmit} className='space-y-2'>
      <InputField
        id='title'
        name='title'
        label='Task Name'
        type='text'
        placeholder='e.g. Wash the dishes, study for exams...'
        value={data.title}
        onChange={handleChange}
        required
        error={errors.title}
      />
      <InputField
        id='deadline'
        name='deadline'
        label='Deadline'
        type='datetime-local'
        value={data.deadline ?? ''}
        onChange={handleChange}
        required={false}
        error={errors.deadline ?? ''}
      />
    </form>
  );
}
