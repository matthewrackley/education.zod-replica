import BaseValidator from '../baseValidator';

export class ArrayValidator extends BaseValidator {
  type: "array" = 'array';
  validate(input: unknown) {
    if (typeof input === 'object' && input !== null && Array.isArray(input)) {
      return this.success(input);
    }

    return this.failure(input, [this.invalidType(input)]);
  }
}

export default ArrayValidator;
