import BaseValidator from '../baseValidator';

export class FunctionValidator extends BaseValidator {
  type: "function" = 'function';
  validate (input: unknown) {
    if (typeof input === 'function') {
      return this.success(input);
    }

    return this.failure(input, [this.invalidType(input)]);
  }
}

export default FunctionValidator;
