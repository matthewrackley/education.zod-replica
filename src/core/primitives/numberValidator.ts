import BaseValidator from '../baseValidator';

class NumberValidator extends BaseValidator {

  validate(input: unknown) {
    if (typeof input === 'number') {
      return this.success(input);
    }

    return this.failure(input, [
      {
        path: [],
        message: `Expected a number but received ${typeof input}`,
        code: 'invalid_type',
        expected: 'number',
        received: input

      }
    ]);
  }
}

export default NumberValidator;
