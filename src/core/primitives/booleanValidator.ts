import BaseValidator from '../baseValidator';

class BooleanValidator extends BaseValidator {

  validate(input: unknown) {
    if (typeof input === 'boolean') {
      return this.success(input);
    }

    return this.failure(input, [
      {
        path: [],
        message: `Expected a boolean but received ${typeof input}`,
        code: 'invalid_type',
        expected: 'boolean',
        received: input
      }
    ]);
  }
}

export default BooleanValidator;
