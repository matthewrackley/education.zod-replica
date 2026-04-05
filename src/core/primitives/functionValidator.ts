import BaseValidator from '../baseValidator';

export class FunctionValidator<F extends (...args: unknown[]) => unknown> extends BaseValidator<F> {
  constructor() {
    super();
  }
  type: "function" = 'function';
  protected _validate(input: unknown)  {
    if (typeof input === 'function') {
      return this.success(input as F);
    }
    return this.failure(input, [this.invalidType(input)]);
  }
}

export default FunctionValidator;
