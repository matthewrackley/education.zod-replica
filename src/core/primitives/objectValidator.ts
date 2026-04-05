import BaseValidator from '../baseValidator';
import { isIssueList, isObjectSchema, isRecord } from '../util/typeGuard';
import NumberValidator from './numberValidator';
import StringValidator from './stringValidator';

//___=============================>                    <============================___\\
//___|| ==================== ||      HELPER FUNCTIONS      || =================== ||___\\
//___=============================>                    <============================___\\


function checkUnexpectedKeys(input: Record<string, unknown>, expectedKeys: string[]): [boolean, string[]] {
  const inputKeys = Object.keys(input);
  const unexpectedKeys = inputKeys.filter((key) => !expectedKeys.includes(key));
  return [unexpectedKeys.length > 0, unexpectedKeys];
}
type ObjectBuilder = <Schema extends ObjectSchema, M extends "strict" | "loose">(this: ObjectValidator<Schema> | ObjectValidatorStrict<Schema>, input: Record<string, unknown>, schema: Schema, path: string[] | undefined, mode: M) => ValidationResult<SchemaToObject<Schema, M>>;
function objectBuilder<Schema extends ObjectSchema, M extends "strict" | "loose"> (
  this: ObjectValidator<Schema> | ObjectValidatorStrict<Schema>,
  input: Record<string, unknown>,
  schema: Schema,
  path: string[] = ["object"],
  mode: M
): ValidationResult<SchemaToObject<Schema, M>> {
  const output: Partial<SchemaToObject<Schema, M>> = {};
  const issues: Issue[] = [];
  const [hasUnexpectedKeys, unexpectedKeys] = checkUnexpectedKeys(input, Object.keys(schema));
  for (const key of Object.keys(schema) as Array<Extract<keyof SchemaToObject<Schema, M>, string>>) {
    if (mode === "strict" && hasUnexpectedKeys) {
      issues.push(this.defineIssue("unexpected_keys", {
        expected: Object.keys(schema),
        received: unexpectedKeys,
        path: [...path, "strict"]
      }));
      break;
    }
    if (!(key in input)) {
      issues.push(this.defineIssue("required", {
        expected: key,
        received: input,
        path: [...path, key]
      }));
      continue;
    }
    const value = input[key];
    const node = schema[key as keyof SchemaNode];
    const nextPath = [...path, key];

    if (node instanceof BaseValidator) {
      const result = node.validate(value);
      if (!result.isValid) issues.push(...this.addPath(result.issues, nextPath));
      else output[key] = result.output as SchemaToObject<Schema, M>[typeof key];
      continue;
    }
    if (isObjectSchema(node)) {
      if (!isRecord(value)) {
        issues.push(this.defineIssue("type_invalid", {
          expected: "Record<string, unknown>",
          received: value,
          path: nextPath
        }));
        continue;
      }
      const result = this.builder(value, node, nextPath, mode);
      if (!result.isValid) issues.push(...result.issues);
      else (output as Record<string, unknown>)[key] = result.output;
      continue;
    }
    issues.push(this.defineIssue("schema_invalid", {
      expected: "ObjectSchema | BaseValidator",
      received: node,
      path: [...nextPath, key],
    }));
  }
  return issues.length ? { input, isValid: false, issues } : { output: output as SchemaToObject<Schema, M>, isValid: true };
}

//___=============================>                     <============================___\\
//___|| ==================== ||      OBJECT VALIDATORS      || =================== ||___\\
//___=============================>                     <============================___\\


class ObjectValidatorStrict<Schema extends ObjectSchema> extends BaseValidator<SchemaToObject<Schema, "strict">> {
  type: "object" = 'object';
  constructor (private readonly schema: Schema) {
    super();
  }
  protected _validate(input: unknown): ValidationResult<SchemaToObject<Schema, "strict">> {
    if (!isRecord(input)) {
      return this.failure(input, [this.invalidType(input, ["object"])]);
    }
    const result = this.builder(input, this.schema, ["object"], "strict");
    return result.isValid ? this.success(result.output) : this.failure(input, result.issues);
  }
  public addPath = this.withPath;
  builder = objectBuilder.bind(this) as ObjectBuilder;
}


export class ObjectValidator<Schema extends ObjectSchema> extends BaseValidator<SchemaToObject<Schema, "loose">> {
  type: "object" = 'object';
  constructor (private readonly schema: Schema) {
    super();
  }
  protected _validate(input: unknown): ValidationResult<SchemaToObject<Schema, "loose">> {
    if (!isRecord(input)) {
      return this.failure(input, [this.invalidType(input, ["object"])]);
    }
    const result = this.builder(input, this.schema, ["object"], "loose");
    return result.isValid ? this.success(result.output) : this.failure(input, result.issues);
  }
  public addPath = this.withPath;
  builder = objectBuilder.bind(this) as ObjectBuilder;
  strict () {
    return new ObjectValidatorStrict(this.schema);
  }
}

export default ObjectValidator;
