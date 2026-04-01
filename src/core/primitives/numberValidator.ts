import BaseValidator from '../baseValidator';

export class NumberValidator extends BaseValidator {
  type: "number" = 'number';
  validate(input: unknown) {
    if (typeof input === 'number') {
      return this.success(input);
    }

    return this.failure(input, [this.invalidType(input)]);
  }
}

export default NumberValidator;
