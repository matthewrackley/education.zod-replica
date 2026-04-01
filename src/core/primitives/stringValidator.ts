import BaseValidator from '../baseValidator';

export class StringValidator extends BaseValidator {
  type: "string" = 'string';
  validate(input: unknown) {
    if (typeof input === 'string') {
      return this.success(input);
    }

    return this.failure(input, [this.invalidType(input)]);
  }
}

export default StringValidator;
