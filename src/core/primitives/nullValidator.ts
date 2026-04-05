import BaseValidator from '../baseValidator';

export class NullValidator extends BaseValidator<null> {
  type: "null" = 'null';
  protected _validate(input: unknown)  {
    if (input === null) {
      return this.success(input);
    }
    return this.failure(input, [this.invalidType(input)]);
  }
}

export default NullValidator;
