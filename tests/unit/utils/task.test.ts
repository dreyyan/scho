import { describe, expect, it } from "vitest";
import type { TaskResponse, TaskViewOptions } from "@/types/task";
import { NOW } from "../../fixtures/date";
import { getVisibleTasks } from "@/lib/utils/task";

const defaultTaskViewOptions: TaskViewOptions = {
  search: '',
  status: 'all',
  filter: 'all',
  sort: 'newest',
  currentTime: NOW.getTime(),
}

const makeTask = (overrides: Partial<TaskResponse>): TaskResponse => ({
  id: crypto.randomUUID(),
  title: "Title",
  isCompleted: false,
  deadline: null,
  createdAt: NOW.toISOString(),
  ...overrides,
});

describe("getVisibleTasks()", () => {
  describe("search", () => {
    it("matches titles case-insensitively", () => {
      const tasks = [
        makeTask({ title: "Buy Milk" }),
        makeTask({ title: "Wash dishes" }),
      ];

      const result = getVisibleTasks(tasks,
        { ...defaultTaskViewOptions, search: "milk" });

      expect(result.map((task) => task.title)).toEqual(["Buy Milk"]);
    });
  });
  // describe("status", () => {
    
  // });
  // describe("filter", () => {
    
  // });
  // describe("sort", () => {
    
  // });
});