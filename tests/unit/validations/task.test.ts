import { describe, expect, it } from "vitest";
import { createTaskSchema, updateTaskSchema } from "@/validations/task";
import { invalidTaskCreationData, validTaskCreationData } from "../../fixtures/task";

describe("Task Creation Validation", () => {
  it("accepts valid task creation data", () => {
    const result = createTaskSchema.safeParse(validTaskCreationData);
    expect(result.success).toBe(true);
  });

  it("rejects an empty title", () => {
    const result = createTaskSchema.safeParse(invalidTaskCreationData.emptyTitle);
    expect(result.success).toBe(false);
  });

  it("rejects a title exceeding 150 characters", () => {
    const result = createTaskSchema.safeParse(invalidTaskCreationData.overlongTitle);
    expect(result.success).toBe(false);
  });
});

describe("Task Update Validation", () => {
  it("accepts valid task update data", () => {
    const result = updateTaskSchema.safeParse(validTaskCreationData);
    expect(result.success).toBe(true);
  });
});