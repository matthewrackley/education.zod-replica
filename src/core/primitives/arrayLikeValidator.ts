import BaseValidator from '../baseValidator';

export class ArrayLikeValidator<T = unknown> extends BaseValidator<ArrayLike<T>> {
  type: "array-like" = 'array-like';
  protected _validate(input: unknown) {
    if (typeof input === 'object' && input !== null && Object.prototype.hasOwnProperty.call(input, 'length') && !Array.isArray(input)) {
      return this.success(input as ArrayLike<T>);
    }
    return this.failure(input, [this.invalidType(input)]);
  }
}

export default ArrayLikeValidator;
