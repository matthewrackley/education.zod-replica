import BaseValidator from '../baseValidator';
import { Issue, NumberValidator, StringValidator, ValidationSuccess } from '../index';

type ValidatorOutput<T extends BaseValidator<unknown>> = T extends BaseValidator<infer U> ? U : never;

type TupleToUnion<TValidators extends BaseValidator<unknown>[]> = TValidators[number][];

type Union<Type extends BaseValidator<unknown>[]> = Type[number][];
type TypeOfUnionToUnion<Type extends BaseValidator<unknown>[]> = ValidatorOutput<Type[number]>;

type Head<T extends unknown[]> = T extends [infer H, ...unknown[]] ? H : never;
type Tail<T extends unknown[]> = T extends [unknown, ...infer R] ? R : never;

type TypeOfToUnion<T extends unknown> = T[] extends (infer U | infer V)[] ? U : never;
type test = TypeOfToUnion<string | number>;

export class UnionValidator<TValidators extends BaseValidator<unknown>[]> extends BaseValidator<ValidatorOutput<TValidators[number]>> {
  type: "union" = 'union';
  validators = [] as unknown as TValidators;
  constructor (...validators: TValidators) {
    super();
    if (validators.some((v) => !(v instanceof BaseValidator))) {
      throw new TypeError("All validators must be BaseValidator instances");
    }
    if (validators.length === 0) {
      throw new TypeError("At least one validator must be provided");
    }
    this.validators = validators;
  }
  protected _validate (input: unknown) {

    const result = this.build(input);
    if (Array.isArray(result)) {
      return this.failure(input, result);
    }
    return this.success(result.output)
  }
  build(input: unknown) {
    const issues = [] as Issue[];
    let validated = {} as ValidationSuccess<ValidatorOutput<TValidators[number]>>;
    let successes = 0;
    for (const validator of this.validators) {
      const result = validator.validate(input);
      if (result.isValid) {
        if (successes === 0) {
          validated = result as ValidationSuccess<ValidatorOutput<TValidators[number]>>;
        }
        successes++;
        if (successes > 1) {
          issues.push({
            path: ["union", validator.type],
            message: "Input is valid against multiple validators, unable to determine correct output type",
            code: "multiple_valid",
            expected: validator.type,
            received: this.getType(input),
          });
        }
      }
    }
    if (successes === 1) {
      return validated;
    }
    if (successes === 0) {
      issues.push({
        path: ["union"],
        message: "Input is not valid against any validator",
        code: "none_valid",
        expected: this.validators.map((v) => v.type).join(" | "),
        received: input,
      });
    }
    return issues;
  }
  as<Type extends BaseValidator<unknown>>(validator: Type) {
    if (!(validator instanceof BaseValidator)) {
      throw new TypeError("Provided validator must be a BaseValidator instance");
    }
    return new UnionValidator(...[...this.validators, validator] as [...TValidators, Type]);
  }
}

export const makeUnion = <Validators extends BaseValidator<unknown>[]>(...validators: Validators) => new UnionValidator(...validators) as UnionValidator<Validators[number][]>;

export default UnionValidator;
