import { z } from "zod";

const createTaskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required.")
    .max(150, "Title must not exceed 150 characters."),
});

const updateTaskSchema = createTaskSchema.extend({
  isCompleted: z.boolean(),
}).partial();

export { createTaskSchema, updateTaskSchema };