import BaseValidator from '../baseValidator';

export class SymbolValidator extends BaseValidator<symbol> {
  type: "symbol" = 'symbol';
  protected _validate(input: unknown) {
    if (typeof input === 'symbol') {
      return this.success(input);
    }
    return this.failure(input, [this.invalidType(input)]);
  }
}

export default SymbolValidator;
