import BaseValidator from '../baseValidator';

export class TupleValidator<TSchema extends ArraySchema = []> extends BaseValidator<ArraySchemaToType<TSchema>> {
  type: "tuple" = 'tuple';
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

  protected builder(input: unknown[], elements: TSchema) {
    const issues = [] as ArrayIssue[];
    const output = [] as ArraySchemaToType<TSchema>;
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

export default TupleValidator;
