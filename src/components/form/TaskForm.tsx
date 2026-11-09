import React, { useState } from 'react'
import InputField from '../ui/InputField'
import { TaskFormData } from '@/types/task';

interface TaskFormProps {
  initialValues?: TaskFormData;
  onSubmit: (data: TaskFormData) => void;
}

export default function TaskForm({
  initialValues,
  onSubmit,
}: TaskFormProps) {
  const [data, setData] = useState<TaskFormData>({
    title: initialValues?.title || "",
  });

  const [errors, setErrors] = useState<TaskFormData>({
    title: "",
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    const field = name as keyof TaskFormData;

    setData((prev) => (
      { ...prev, [field]: value, }
    ));

    // Clear errors when the user edits a field.
    setErrors((prev) => ({
      ...prev,
      [field]: undefined,
    }))
  };

  const handleSubmit = (event: React.ChangeEvent<HTMLFormElement>) => {
    event.preventDefault(); 

    onSubmit(data);
  };

  return (
    <form id='task-form' onSubmit={handleSubmit}>
      <InputField
        id='task'
        name='title'
        label='Task Name'
        type='text'
        placeholder='e.g. Wash the dishes, study for exams...'
        value={data.title}
        onChange={handleChange}
        required
        error={errors.title}
      />
    </form>
  )
}
