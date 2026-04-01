import BaseValidator from '../baseValidator';

export class BigIntValidator extends BaseValidator {
  type: "bigint" = 'bigint';
  validate(input: unknown) {
    if (typeof input === 'bigint') {
      return this.success(input);
    }

    return this.failure(input, [this.invalidType(input)]);
  }
}

export default BigIntValidator;
