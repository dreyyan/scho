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

const makeTask = (overrides: Partial<TaskResponse> = {}): TaskResponse => ({
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
  describe("status", () => {
    it("Selecting 'All' displays all tasks", () => {
      const tasks = [
        makeTask({ title: "Buy Milk", isCompleted: true }),
        makeTask({ title: "Wash dishes" }),
      ];

      const result = getVisibleTasks(tasks,
        { ...defaultTaskViewOptions, status: "all" });

      expect(result.map((task) => task.title)).toEqual(["Buy Milk", "Wash dishes"]);
    });
    it("Selecting 'Active' hides completed tasks", () => {
      const tasks = [
        makeTask({ title: "Buy Milk", isCompleted: true }),
        makeTask({ title: "Wash dishes" }),
      ];

      const result = getVisibleTasks(tasks,
        { ...defaultTaskViewOptions, status: "active" });

      expect(result.map((task) => task.title)).toEqual(["Wash dishes"]);
    });
    it("Selecting 'Completed' hides active tasks", () => {
      const tasks = [
        makeTask({ title: "Buy Milk", isCompleted: true }),
        makeTask({ title: "Wash dishes" }),
      ];

      const result = getVisibleTasks(tasks,
        { ...defaultTaskViewOptions, status: "completed" });

      expect(result.map((task) => task.title)).toEqual(["Buy Milk"]);
    });
  });
  describe("filter", () => {
    it("Selecting 'All Tasks' displays all tasks", () => {
      const tasks = [
        makeTask({ title: "Buy Milk", }),
        makeTask({ title: "Wash dishes" }),
      ];

      const result = getVisibleTasks(tasks,
        { ...defaultTaskViewOptions, filter: "all" });

      expect(result.map((task) => task.title)).toEqual(["Buy Milk", "Wash dishes"]);
    });
    it("Selecting 'With Deadline' only displays tasks with deadlines", () => {
      const tasks = [
        makeTask({ title: "Buy Milk", deadline: NOW.toLocaleString() }),
        makeTask({ title: "Wash dishes" }),
      ];

      const result = getVisibleTasks(tasks,
        { ...defaultTaskViewOptions, filter: "with-deadline" });

      expect(result.map((task) => task.title)).toEqual(["Buy Milk"]);
    });
    it("Selecting 'No Deadline' only displays tasks without deadlines", () => {
      const tasks = [
        makeTask({ title: "Buy Milk", deadline: NOW.toLocaleString() }),
        makeTask({ title: "Wash dishes" }),
      ];

      const result = getVisibleTasks(tasks,
        { ...defaultTaskViewOptions, filter: "no-deadline" });

      expect(result.map((task) => task.title)).toEqual(["Wash dishes"]);
    });
    it("Selecting 'Overdue' only displays tasks past the current time", () => {
      const tasks = [
        makeTask({ title: "Buy Milk", deadline: (NOW.getTime() - 1000).toLocaleString() }),
        makeTask({ title: "Wash dishes" }),
      ];

      const result = getVisibleTasks(tasks,
        { ...defaultTaskViewOptions, filter: "overdue" });

      expect(result.map((task) => task.title)).toEqual(["Buy Milk"]);
    });
  });
  // describe("sort", () => {
    
  // });
});