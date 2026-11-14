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
        makeTask({ title: "Buy Milk", deadline: NOW.toISOString() }),
        makeTask({ title: "Wash dishes" }),
      ];

      const result = getVisibleTasks(tasks,
        { ...defaultTaskViewOptions, filter: "with-deadline" });

      expect(result.map((task) => task.title)).toEqual(["Buy Milk"]);
    });
    it("Selecting 'No Deadline' only displays tasks without deadlines", () => {
      const tasks = [
        makeTask({ title: "Buy Milk", deadline: NOW.toISOString() }),
        makeTask({ title: "Wash dishes" }),
      ];

      const result = getVisibleTasks(tasks,
        { ...defaultTaskViewOptions, filter: "no-deadline" });

      expect(result.map((task) => task.title)).toEqual(["Wash dishes"]);
    });
    it("Selecting 'Overdue' only displays incomplete tasks past their deadline", () => {
      const pastDeadline = new Date(NOW.getTime() - 1000).toISOString();

      const tasks = [
        makeTask({ title: "Buy Milk", deadline: pastDeadline }),
        makeTask({ title: "Pay bills", deadline: pastDeadline, isCompleted: true }),
        makeTask({ title: "Wash dishes" }),
      ];

      const result = getVisibleTasks(tasks,
        { ...defaultTaskViewOptions, filter: "overdue" });

      expect(result.map((task) => task.title)).toEqual(["Buy Milk"]);
    });
  });
  describe("sort", () => {
    it("Selecting 'Newest First' sorts the tasks from newest to oldest", () => {
      const tasks = [
        makeTask({ title: "A", createdAt: "2026-11-13T02:00:00Z" }),
        makeTask({ title: "C", createdAt: "2026-11-11T02:00:00Z" }),
        makeTask({ title: "B", createdAt: "2026-11-12T02:00:00Z" }),
      ];

      const result = getVisibleTasks(tasks,
        { ...defaultTaskViewOptions, sort: "newest" });

      expect(result.map((task) => task.title)).toEqual(["A", "B", "C"]);
    });
    it("Selecting 'Oldest First' sorts the tasks from oldest to newest", () => {
      const tasks = [
        makeTask({ title: "A", createdAt: "2026-11-11T02:00:00Z" }),
        makeTask({ title: "C", createdAt: "2026-11-13T02:00:00Z" }),
        makeTask({ title: "B", createdAt: "2026-11-12T02:00:00Z" }),
      ];

      const result = getVisibleTasks(tasks,
        { ...defaultTaskViewOptions, sort: "oldest" });

      expect(result.map((task) => task.title)).toEqual(["A", "B", "C"]);
    });
    it("Selecting 'Due Date(Earliest)' sorts the tasks from earliest to latest", () => {
      const tasks = [
        makeTask({ title: "A", deadline: "2026-11-11T02:00:00Z" }),
        makeTask({ title: "C", deadline: "2026-11-13T02:00:00Z" }),
        makeTask({ title: "B", deadline: "2026-11-12T02:00:00Z" }),
      ];

      const result = getVisibleTasks(tasks,
        { ...defaultTaskViewOptions, sort: "due-asc" });

      expect(result.map((task) => task.title)).toEqual(["A", "B", "C"]);
    });
    it("Selecting 'Due Date(Latest)' sorts the tasks from earliest to latest", () => {
      const tasks = [
        makeTask({ title: "A", deadline: "2026-11-13T02:00:00Z" }),
        makeTask({ title: "C", deadline: "2026-11-11T02:00:00Z" }),
        makeTask({ title: "B", deadline: "2026-11-12T02:00:00Z" }),
      ];

      const result = getVisibleTasks(tasks,
        { ...defaultTaskViewOptions, sort: "due-desc" });

      expect(result.map((task) => task.title)).toEqual(["A", "B", "C"]);
    });
    it("Selecting 'Title (A-Z)' sorts the tasks alphabetically", () => {
      const tasks = [
        makeTask({ title: "A" }),
        makeTask({ title: "C" }),
        makeTask({ title: "B" }),
      ];

      const result = getVisibleTasks(tasks,
        { ...defaultTaskViewOptions, sort: "title-asc" });

      expect(result.map((task) => task.title)).toEqual(["A", "B", "C"]);
    });
  });
});