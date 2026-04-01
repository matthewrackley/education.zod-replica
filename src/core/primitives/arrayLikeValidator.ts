import BaseValidator from '../baseValidator';

export class ArrayLikeValidator extends BaseValidator {
  type: "array-like" = 'array-like';
  validate(input: unknown) {
    if (typeof input === 'object' && input !== null && Object.prototype.hasOwnProperty.call(input, 'length') && !Array.isArray(input)) {
      return this.success(input as ArrayLike<any>);
    }
    return this.failure(input, [this.invalidType(input)]);
  }
}

export default ArrayLikeValidator;
