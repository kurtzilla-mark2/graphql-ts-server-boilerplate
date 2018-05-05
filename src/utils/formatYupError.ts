import { ValidationError } from 'yup';

export const formatYupError = (err: ValidationError) => {
  const errors: Array<{ path: string; message: string }> = [];

  err.inner.forEach(e => {
    errors.push({
      path: e.path,
      message: e.message
    });
  });

  return errors;
};

/*
    ValidationError {
      name: 'ValidationError',
      value: { password: 'al', email: 'to' },
      path: undefined,
      type: undefined,
      errors:
       [ 'email must be at least 3 characters',
         'email must be a valid email',
         'password must be at least 3 characters' ],
      inner:
       [ ValidationError {
           name: 'ValidationError',
           value: 'to',
           path: 'email',
           type: 'min',
           errors: [Array],
           inner: [],
           message: 'email must be at least 3 characters',
           params: [Object] },
         ValidationError {
           ...
*/
