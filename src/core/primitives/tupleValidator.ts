import BaseValidator from '../baseValidator';
import { isArray } from '../util/typeGuard';

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
    if (isArray(input)) {
      const result = this.builder(input, this.validators);
      if (result.isValid) {
        return this.success(result.output);
      }
      return this.failure(input, result.issues);
    }
    return this.failure(input, [this.invalidType(input)]);
  }

  protected builder(input: unknown[], elements: TSchema) {
    const issues = [] as Issue[];
    const output = [] as ArraySchemaToType<TSchema>;
    const len = Math.max(input.length, elements.length);
    for (let i = 0; i < len; i++) {
      const result = elements[i].validate(input[i]);
      if (!result.isValid) {
        issues.push(...result.issues.map((issue): ArrayIssue => ({
          ...issue,
          type: "array",
          position: i,
        })));
        continue;
      } else {
        output[i] = result.output as ArraySchemaToType<TSchema>[Extract<keyof TSchema, number>];
      }
    }
    if (input.length > elements.length) {
      issues.push(this.defineIssue("too_long",{
        expected: elements,
        received: input,
        path: ["array", "length"]
      }));
    }
    if (input.length < elements.length) {
      issues.push(this.defineIssue("too_short",{
        expected: elements,
        received: input,
        path: ["array", "length"]
      }));
    }

    if (issues.length === elements.length && issues.length === 0) {
      return this.success(output);
    }
    return this.failure(input, issues);
  }
}

export default TupleValidator;
