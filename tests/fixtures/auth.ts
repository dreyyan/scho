const validRegistrationData = {
  email: 'user@example.com',
  password: 'SecurePass#123',
  confirmPassword: 'SecurePass#123',
};

const validLoginData = {
  email: 'user@example.com',
  password: 'SecurePass#123',
};

const invalidAuthData = {
  registration: {
    invalidEmail: {
      ...validRegistrationData,
      email: 'invalid-email',
    },
    shortPassword: {
      ...validRegistrationData,
      password: '123',
    },
    mismatchedPasswords: {
      ...validRegistrationData,
      confirmPassword: 'DifferentPass#123',
    },
  },
  login: {
    invalidEmail: {
      ...validLoginData,
      email: 'invalid-email',
    },
    emptyPassword: {
      ...validLoginData,
      password: '',
    },
  },
};

export { validRegistrationData, validLoginData, invalidAuthData };
