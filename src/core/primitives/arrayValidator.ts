import BaseValidator from '../baseValidator';
import { ArrayIssue } from '../core.types';
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
      return this.success(input as SchemaToType<TSchema>);
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

  of<TItemValidator extends BaseValidator<unknown>> (value: TItemValidator): ArrayValidator<TItemValidator[]> {
    return new ArrayValidator(value);
  }


  builder<TNext extends ArraySchema> (input: unknown[], elements: TSchema) {
    const built = {} as { issues: ArrayIssue[]; output: SchemaToTuple<TSchema>; };
    built.issues = [] as ArrayIssue[];
    built.output = [] as SchemaToTuple<TSchema>;
    const validators = elements.map((element, i) => {

      const isValid = element.validate(input[i]);
      if (!isValid.isValid) {
        built.issues.push(...isValid.issues.map((issue): ArrayIssue => ({
          ...issue,
          position: i,
        })));
      } else {
        built.output[i] = isValid.input as SchemaToTuple<TSchema>[Extract<keyof TSchema, number>];
      };
      return built;
    });
    const useValidator = validators.every(v => v instanceof BaseValidator) ? validators : validator instanceof BaseValidator ? [validator] : null;
    return new ArrayValidator(...useValidator) as TNext extends ArraySchema ? ArrayValidator<TNext> : TNext extends ArraySchema[number] ? ArrayValidator<TNext[]> : never;
  }
}


new ArrayValidator().of(new StringValidator());

const arr = new ArrayValidator().of(new StringValidator());



const array = new ArrayValidator().exact(new StringValidator(), new NumberValidator());
const str = array.parse(["hello", 42]);
