const INBOX_PER_PAGE = 10;
const INBOX_API_URL = '/api/inbox';

const TYPE_OPTIONS = [
  { label: 'All', value: 'all' },
  { label: 'Notes', value: 'TEXT' },
  { label: 'Links', value: 'LINK' },
] as const;

const SORT_OPTIONS = [
  { label: 'Newest First', value: 'newest' },
  { label: 'Oldest First', value: 'oldest' },
] as const;

export { INBOX_PER_PAGE, INBOX_API_URL, TYPE_OPTIONS, SORT_OPTIONS };
