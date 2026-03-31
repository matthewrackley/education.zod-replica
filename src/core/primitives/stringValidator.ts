import BaseValidator from '../baseValidator';

class StringValidator extends BaseValidator {

  validate(input: unknown) {
    if (typeof input === 'string') {
      return this.success(input);
    }

    return this.failure(input, [
      {
        path: ["input"],
        message: `Expected a string but received ${typeof input}`,
        code: 'invalid_type',
        expected: 'string',
        received: input
      }
    ]);
  }
}

export default StringValidator;
