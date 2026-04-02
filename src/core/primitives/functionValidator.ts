import BaseValidator from '../baseValidator';

export class FunctionValidator extends BaseValidator<Function> {
  type: "function" = 'function';
  protected _validate (input: unknown) {
    if (typeof input === 'function') {
      return this.success(input);
    }
    return this.failure(input, [this.invalidType(input)]);
  }
}

export default FunctionValidator;
