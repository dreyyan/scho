const TASKS_PER_PAGE = 10;

const STATUS_OPTIONS = [
  { label: 'Active', value: 'active' },
  { label: 'Completed', value: 'completed' },
  { label: 'All', value: 'all' },
];

const SORT_OPTIONS = [
  { label: 'Newest First', value: 'newest' },
  { label: 'Oldest First', value: 'oldest' },
  { label: 'Due Date (Earliest)', value: 'due-asc' },
  { label: 'Due Date (Latest)', value: 'due-desc' },
  { label: 'Title (A–Z)', value: 'title-asc' },
];

const FILTER_OPTIONS = [
  { label: "All Tasks", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Completed", value: "completed" },
];

export {
  TASKS_PER_PAGE,
  STATUS_OPTIONS,
  FILTER_OPTIONS,
  SORT_OPTIONS,
};