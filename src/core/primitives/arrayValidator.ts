import BaseValidator from '../baseValidator';
import { isArray } from '../util/typeGuard';
import NumberValidator from './numberValidator';
import StringValidator from './stringValidator';

export class ArrayValidator<TItem = unknown> extends BaseValidator<TItem[]> {
  type: "array" = 'array';
  protected validators: BaseValidator<TItem>[];
  constructor (validators: BaseValidator<TItem>[] = []) {
    super();
    if (validators.length > 0 && validators.some((e) => !(e instanceof BaseValidator))) {
      throw new TypeError("All validators must be BaseValidator instances");
    }
    this.validators = validators;
  }
  protected _validate (input: unknown) {
    if (isArray(input)) {
      const result = this.builder(input, this.validators);
      if (!result.isValid) {
        return this.failure(result.input, result.issues);
      }
      return this.success(result.output);
    }
    return this.failure(input, [this.invalidType(input)]);
  }

  exact<TNextSchema extends BaseValidator<unknown>[]> (...validators: TNextSchema) {
    const validatorList = validators.map((validator)=> {
      if (validator instanceof BaseValidator) {
        return validator;
      }
      throw new TypeError(`Invalid schema validator ${ validator }`);
    });
    return new ArrayValidator<ValidatorToType<TNextSchema[number]>>(
      validatorList as BaseValidator<ValidatorToType<TNextSchema[number]>>[]
    );
  }

  of<TItemValidator extends BaseValidator<unknown>[]> (...validator: TItemValidator){
    return new ArrayValidator<ValidatorToType<TItemValidator[number]>>(
      validator as BaseValidator<ValidatorToType<TItemValidator[number]>>[]
    );
  }

  protected builder(input: unknown[], validators: BaseValidator<TItem>[]) {
    const issues = [] as Issue[];
    const output = [] as TItem[];

    for (let i = 0; i < input.length; i++) {
      const value = input[i];
      let matched = false;
      const localIssues = [] as Issue[];

      for (const validator of validators) {
        const result = validator.validate(value);
        if (result.isValid) {
          output.push(result.output);
          matched = true;
          break;
        }
        localIssues.push(...this.withPath(result.issues, [String(i)]));
      }

      if (!matched) {
        issues.push(this.defineIssue("none_valid", {
          expected: validators.map((v) => v.type),
          received: value,
          path: ["array", String(i)],
          index: i
        }), ...localIssues);
      }
    }
    if (issues.length > 0) return this.failure(input, issues);
    return this.success(output);
  }
}

function arrayValidator<TSchema extends BaseValidator<unknown>[]>(...elements: TSchema) {
  return new ArrayValidator<ValidatorToType<TSchema[number]>>(
    [...elements] as BaseValidator<ValidatorToType<TSchema[number]>>[]
  );
}

const arr = arrayValidator(new StringValidator(), new NumberValidator());

export default ArrayValidator;
