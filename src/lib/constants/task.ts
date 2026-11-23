const TASKS_PER_PAGE = 10;
const TASKS_API_URL = '/api/tasks';

const STATUS_OPTIONS = [
  { label: 'Active', value: 'active' },
  { label: 'Completed', value: 'completed' },
  { label: 'All', value: 'all' },
] as const;

const SORT_OPTIONS = [
  { label: 'Newest First', value: 'newest' },
  { label: 'Oldest First', value: 'oldest' },
  { label: 'Due Date (Earliest)', value: 'due-asc' },
  { label: 'Due Date (Latest)', value: 'due-desc' },
  { label: 'Title (A–Z)', value: 'title-asc' },
] as const;

const FILTER_OPTIONS = [
  { label: 'All Tasks', value: 'all' },
  { label: 'With Deadline', value: 'with-deadline' },
  { label: 'No Deadline', value: 'no-deadline' },
  { label: 'Overdue', value: 'overdue' },
] as const;

export { TASKS_PER_PAGE, TASKS_API_URL, STATUS_OPTIONS, FILTER_OPTIONS, SORT_OPTIONS };
