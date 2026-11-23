import { z } from 'zod';

const createInboxItemSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, 'Content is required.')
    .max(2000, 'Content must not exceed 2000 characters.'),
});

const updateInboxItemSchema = createInboxItemSchema;

export { createInboxItemSchema, updateInboxItemSchema };
