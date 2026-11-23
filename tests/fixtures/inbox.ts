const validInboxItemCreationData = {
  content: 'Example Inbox Item Content',
};

const invalidInboxItemCreationData = {
  emptyContent: {
    content: '',
  },
  overlongContent: {
    content: 'a'.repeat(2001),
  },
};

const validInboxItemUpdateData = {
  content: validInboxItemCreationData.content,
};

export { validInboxItemCreationData, invalidInboxItemCreationData, validInboxItemUpdateData };
