import BaseValidator from '../baseValidator';

interface StringValidatorRules {
  minLength?: number;
  maxLength?: number;
}


export class StringValidator extends BaseValidator<string> {
  type: "string" = 'string';
  constructor (private readonly rules: StringValidatorRules = {}) {
    super();
  }
  protected _validate (input: unknown) {
    if (typeof input === 'string') {
      if (this.rules.minLength && input.length < this.rules.minLength) {
        return this.failure(input, [
          {
            path: ["min"],
            message: `String must be at least ${ this.rules.minLength } characters long`,
            code: "min_length",
            expected: this.rules.minLength,
            received: input.length
          }
        ]);
      }
      if (this.rules.maxLength && input.length > this.rules.maxLength) {
        return this.failure(input, [
          {
            path: ["max"],
            message: `String must be at most ${ this.rules.maxLength } characters long`,
            code: "max_length",
            expected: this.rules.maxLength,
            received: input.length
          }
        ]);
      }
      return this.success(input);
    }
    return this.failure(input, [this.invalidType(input)]);
  }
  min (length: number) {
    return new StringValidator({ ...this.rules, minLength: length });
  }
  max (length: number) {
    return new StringValidator({ ...this.rules, maxLength: length });
  }
}

export default StringValidator;
