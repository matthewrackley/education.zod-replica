import BaseValidator from '../baseValidator';

class ObjectValidator extends BaseValidator {

  validate(input: unknown) {
    if (typeof input === 'object' && input !== null && !Array.isArray(input)) {
      return this.success(input);
    }

    return this.failure(input, [
      {
        path: [],
        message: `Expected an object but received ${typeof input}`,
        code: 'invalid_type',
        expected: 'object',
        received: input
      }
    ]);
  }

}

export default ObjectValidator;
