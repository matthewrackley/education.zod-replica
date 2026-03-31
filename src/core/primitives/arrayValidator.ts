import BaseValidator from '../baseValidator';

class ArrayValidator extends BaseValidator {

  validate(input: unknown) {
    if (Array.isArray(input)) {
      return this.success(input);
    }

    return this.failure(input, [
      {
        path: [],
        message: `Expected an array but received ${this.determineType(input)}`,
        code: 'invalid_type',
        expected: 'array',
        received: input
      }
    ]);
  }

  determineType(input: unknown): string {
    if (Array.isArray(input)) {
      return 'array';
    }
    if (input === null) {
      return 'null';
    }
    if (typeof input === 'object' && input.hasOwnProperty('length')) {
      return 'array-like object';
    }
    return typeof input;
  }
}

export default ArrayValidator;
