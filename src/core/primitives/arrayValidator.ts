import BaseValidator from '../baseValidator';
import { ArrayIssue } from '../core.types';
import UnionValidator from '../util/unionValidator';
import NumberValidator from './numberValidator';
import StringValidator from './stringValidator';

type ArraySchema = BaseValidator<unknown>[];

type ValidatorToType<TValidator extends BaseValidator<unknown>> =
  TValidator extends BaseValidator<infer TOutput> ? TOutput : never;

type SchemaToTuple<TSchema extends ArraySchema> = {
  [K in keyof TSchema]: TSchema[K] extends BaseValidator<unknown>
    ? ValidatorToType<TSchema[K]>
    : never;
};
type TupleToUnion<TTuple extends unknown[]> = TTuple[number][];

export type SchemaToType<TSchema extends ArraySchema> =
  TSchema['length'] extends 0
    ? unknown[]
    : TSchema['length'] extends 1
      ? Array<ValidatorToType<TSchema[0]>>
      : SchemaToTuple<TSchema>;


export class ArrayValidator<TSchema extends ArraySchema = []> extends BaseValidator<SchemaToType<TSchema>> {
  type: "array" = 'array';
  protected validators: TSchema;
  constructor (...elements: TSchema) {
    super();
    if (elements.some((e) => !(e instanceof BaseValidator))) {
      throw new TypeError("All elements must be BaseValidator instances");
    }
    this.validators = elements;
  }
  protected _validate (input: unknown) {
    if (typeof input === 'object' && input !== null && Array.isArray(input)) {
      const result = this.builder(input, this.validators);
      if (isArrayIssue(result)) {
        return this.failure(input, result);
      }
      return this.success(result);
    }
    return this.failure(input, [this.invalidType(input)]);
  }

  exact<TNextSchema extends ArraySchema> (...elements: TNextSchema) {
    const validators = elements.map((element): BaseValidator<unknown> => {
      if (element instanceof BaseValidator) {
        return element;
      }
      throw new TypeError(`Invalid schema element ${ element }`);
    }) as BaseValidator<unknown>[];
    return new ArrayValidator(...(validators as TNextSchema));
  }

  of<TItemValidator extends BaseValidator<unknown>[]> (...value: TItemValidator): ArrayValidator<[UnionValidator<TItemValidator[number][]>]> {
    return new ArrayValidator(new UnionValidator(...value));
  }
  union() {
    return new UnionValidator(this);
  }

  protected builder(input: unknown[], elements: TSchema) {
    const issues = [] as ArrayIssue[];
    const output = [] as SchemaToType<TSchema>;
    elements.forEach((element, i) => {
      const result = element.validate(input[i]);
      if (!result.isValid) {
        issues.push(...result.issues.map((issue): ArrayIssue => ({
          ...issue,
          position: i,
        })));
      } else {
        output[i] = result.output as SchemaToTuple<TSchema>[Extract<keyof TSchema, number>];
      };
    });
    if (output.length === input.length && issues.length === 0) {
      return output;
    }
    return issues;
  }
}
function isArrayIssue(value: unknown): value is ArrayIssue[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'object' && item !== null && 'position' in item);
}


new ArrayValidator().of(new StringValidator());

const arr = new ArrayValidator().of(new StringValidator(), new NumberValidator());



const array = new ArrayValidator().of(new StringValidator(), new NumberValidator());
const str = array.parse(["hello", 42]);
