import BaseValidator from '../baseValidator';

export class BooleanValidator extends BaseValidator<boolean> {
  type: "boolean" = 'boolean';
  protected _validate(input: unknown)  {
    if (typeof input === 'boolean') {
      return this.success(input);
    }
    return this.failure(input, [this.invalidType(input)]);
  }
}

export default BooleanValidator;
