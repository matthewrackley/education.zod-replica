import BaseValidator from '../baseValidator';

export class UndefinedValidator extends BaseValidator<undefined> {
  type: "undefined" = 'undefined';
  protected _validate(input: unknown) {
    if (typeof input === 'undefined') {
      return this.success(input);
    }
    return this.failure(input, [this.invalidType(input)]);
  }
}

export default UndefinedValidator;
