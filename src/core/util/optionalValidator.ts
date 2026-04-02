import BaseValidator from '../baseValidator';
import { BasePrimitive } from '../core.types';

class OptionalValidator<TOutput = unknown> extends BaseValidator<TOutput | undefined> {
  type;
  constructor(private readonly inner: BaseValidator<TOutput>) {
    super();
    this.type = this.inner.type;
  }
  protected _validate (input: unknown) {
    if (input === undefined) {
      return this.success(input);
    }
    return this.inner.validate(input);
  }
}

export default OptionalValidator;
