const validTaskCreationData = {
  title: 'Example Task Title',
};

const invalidTaskCreationData = {
  emptyTitle: {
    title: '',
  },
  overlongTitle: {
    title: 'a'.repeat(151),
  },
};

const validTaskUpdateData = {
  title: validTaskCreationData.title,
  isCompleted: true,
};

export { validTaskCreationData, invalidTaskCreationData, validTaskUpdateData };
