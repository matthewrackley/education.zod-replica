import BaseValidator from '../baseValidator';
import { NumberValidator, StringValidator } from '../index';

type ValidatorOutput<T extends BaseValidator<any>> = T extends BaseValidator<infer U> ? U : never;

export class UnionValidator<TValidator> extends BaseValidator<TValidator> {
  validators: BaseValidator<TValidator>[];
  type: 'union' | 'xor';

  constructor (validators: TValidator[], type: 'union' | 'xor' = 'union') {
    super();
    if (validators.some((v) => !(v instanceof BaseValidator))) {
      throw new TypeError('All validators must be BaseValidator instances');
    }
    if (validators.length === 0) {
      throw new TypeError('At least one validator must be provided');
    }
    this.validators = validators;
    this.type = type;
  }

  protected _validate(input: unknown): ValidationResult<TValidator> {
    const successes: ValidationSuccess<TValidator>[] = [];
    const issues: Issue[] = [];

    for (let i = 0; i < this.validators.length; i++) {
      const validator = this.validators[i];
      const result = validator.validate(input);
      if (result.isValid) {
        successes.push(result as ValidationSuccess<TValidator>);
      } else {
        issues.push(...this.withPath(result.issues, ['union', validator.type]));
      }
    }

    if (this.type === 'union') {
      if (successes.length > 0) {
        return this.success(successes[0].output);
      }
      issues.push(this.defineIssue('none_valid', {
        expected: this.validators.map((v) => v.type).join(' | '),
        received: input,
        path: ['union'],
      }));
      return this.failure(input, issues);
    }

    if (successes.length === 1) {
      return this.success(successes[0].output);
    }

    if (successes.length > 1) {
      return this.failure(input, [this.defineIssue('multiple_valid', {
        expected: 1,
        received: successes.length,
        path: ['union', 'xor'],
      })]);
    }

    issues.push(this.defineIssue('none_valid', {
      expected: this.validators.map((v) => v.type).join(' | '),
      received: input,
      path: ['union', 'xor'],
    }));
    return this.failure(input, issues);
  }

  as<TNext extends BaseValidator<any>>(validator: TNext) {
    if (!(validator instanceof BaseValidator)) {
      throw new TypeError('Provided validator must be a BaseValidator instance');
    }
    return new UnionValidator<TValidator | TNext>([...this.validators, validator], this.type);
  }
}

export class Union<TValidator extends BaseValidator<any>> extends UnionValidator<TValidator> {}

export const makeUnion = <TValidators extends BaseValidator<any>[]>(...validators: TValidators) =>
  new UnionValidator<ValidatorOutput<TValidators[number]>>(validators);

const union = makeUnion(new StringValidator(), new NumberValidator());
export default UnionValidator;
