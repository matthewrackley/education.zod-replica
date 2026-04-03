import BaseValidator from '../baseValidator';

import { Union } from '../util/unionValidator';
import NumberValidator from './numberValidator';
import StringValidator from './stringValidator';

type UnionValidate = { _validate<TSchema extends ArraySchema> (input: unknown): ValidationResult<ArraySchemaToType<TSchema>> };

export class ArrayValidator<TSchema extends ArraySchema = []> extends BaseValidator<ArraySchemaToType<TSchema>> {
  type: "array" = 'array';
  protected validators: TSchema;
  constructor (elements: TSchema = [] as unknown as TSchema) {
    super();
    if (elements.length > 0 && elements.some((e) => !(e instanceof BaseValidator))) {
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
    const validators = elements.map((element)=> {
      if (element instanceof BaseValidator) {
        return element;
      }
      throw new TypeError(`Invalid schema element ${ element }`);
    });
    return new ArrayValidator((validators as TNextSchema));
  }

  of<TItemValidator extends BaseValidator<unknown>[]> (...value: TItemValidator){
    return new ArrayValidator<TItemValidator[number][]>(value);
  }

  protected builder(input: unknown[], elements: TSchema) {
    const issues = [] as ArrayIssue[];
    const output = [] as ArraySchemaToType<TSchema>;
    elements.forEach((element, i) => {
      const result = element.validate(input[i]);
      if (result.isValid === false) {
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
function arrayValidator<TSchema extends ArraySchema = []>(...elements: TSchema) {

  return new ArrayValidator([...elements]);
}

const arr = arrayValidator().exact(new StringValidator(), new NumberValidator());

const arr2 = arrayValidator(new StringValidator(), new NumberValidator());



const array = new ArrayValidator().of(new StringValidator(), new NumberValidator());
const str = array.parse(["hello", 42]);

export default ArrayValidator;
