import BaseValidator from '../baseValidator';

interface StringValidatorRules {
  minLength?: number;
  maxLength?: number;
}


export class StringValidator extends BaseValidator<string> {
  type: "string" = 'string';
  constructor ( private readonly rules: StringValidatorRules = {}) {
    super();
  }
  protected _validate(input: unknown)  {
    if (typeof input === 'string') {
      if (this.rules.minLength && input.length < this.rules.minLength) {
        return this.failure(input, [this.defineIssue("too_short", {
          expected: this.rules.minLength,
          received: input,
        })]);
      }
      if (this.rules.maxLength && input.length > this.rules.maxLength) {
        return this.failure(input, [this.defineIssue("too_long", {
          expected: this.rules.maxLength,
          received: input,
        })]);
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
