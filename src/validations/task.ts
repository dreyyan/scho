import { z } from "zod";

const createTaskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required.")
    .max(150, "Title must not exceed 150 characters."),
  sourceItemId: z.uuid().optional(),
  deadline: z.iso.datetime().nullish(),
});

const updateTaskSchema = createTaskSchema.extend({
  isCompleted: z.boolean(),
  deadline: z.iso.datetime().nullish(),
}).partial();

export { createTaskSchema, updateTaskSchema };