const validSettingsData = {
  accountInformation: {
    name: 'John Doe',
    email: 'example@domain.com',
  },
};

const invalidSettingsData = {
  accountInformation: {
    emptyName: {
      ...validSettingsData.accountInformation,
      name: ' ',
    },
    overlongName: {
      ...validSettingsData.accountInformation,
      name: 'a'.repeat(101),
    },
    invalidEmail: {
      ...validSettingsData.accountInformation,
      email: 'invalid-email',
    },
  },
};

export { validSettingsData, invalidSettingsData };
