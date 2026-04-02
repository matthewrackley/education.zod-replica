import BaseValidator from '../baseValidator';
import { Issue } from '../core.types';
import NumberValidator from './numberValidator';
import StringValidator from './stringValidator';

export interface ObjectSchema {
  [key: string]: SchemaNode;
}

type SchemaNode = BaseValidator<unknown> | ObjectSchema;

type NodeToType<TNode extends SchemaNode> =
  TNode extends BaseValidator<infer TOutput>
    ? TOutput
    : TNode extends ObjectSchema
      ? SchemaToType<TNode>
      : never;

export type SchemaToType<TSchema extends ObjectSchema> = TSchema extends ObjectSchema ? {
  [K in keyof TSchema]: NodeToType<TSchema[K]>;
} : never;

export class ObjectValidator<Schema extends ObjectSchema> extends BaseValidator<SchemaToType<Schema>> {
  type: "object" = 'object';
  constructor (private readonly schema: Schema = {} as Schema) {
    super();
  }
  protected _validate (input: unknown) {
    if (typeof input === 'object' && input !== null && !Array.isArray(input)) {
      const result = this.builder(input as Record<string, unknown>, this.schema);
      return this.success(result.output);
    }
    return this.failure(input, [this.invalidType(input)]);
  }

  private builder<TObject extends ObjectSchema> (
    input: Record<string, unknown>,
    schema: TObject,
    path: string[] = []
  ): { issues: Issue[]; output: SchemaToType<TObject>; } {
    const issues: Issue[] = [];
    const output: Partial<SchemaToType<TObject>> = {};

    for (const key of Object.keys(schema) as Array<Extract<keyof TObject, string>>) {
      const schemaNode = schema[key];
      const inputValue = input[key];
      const nextPath = [...path, key];

      if (schemaNode instanceof BaseValidator) {
        const result = schemaNode.safeParse(inputValue);
        if (!result.isValid) {
          issues.push(...result.issues.map((issue): Issue => ({
            ...issue,
            path: [
              ...nextPath,
              ...issue.path
            ]
          })));
        }
        output[key] = result.input as SchemaToType<TObject>[Extract<keyof TObject, string>];
        continue;
      }

      // If the schema node is an object (but not an array), recursively build the output for the nested object.
      if (schemaNode && typeof schemaNode === 'object' && !Array.isArray(schemaNode)) {
        if (inputValue && typeof inputValue === "object" && !Array.isArray(inputValue)) {
          const result = this.builder(inputValue as Record<string, unknown>, schemaNode, nextPath);
          output[key] = result.output as SchemaToType<TObject>[Extract<keyof TObject, string>];
          issues.push(...result.issues);
        } else {
          issues.push(this.invalidType(inputValue, ...nextPath));
        }
        continue;
      }

      throw new Error(`Invalid schema at key ${ nextPath.join(".") }`);
    }
    return { issues, output: output as SchemaToType<TObject> };
  }
}

const test = new ObjectValidator({
  name: new StringValidator().min(2).max(50),
  age: new NumberValidator(),
}).parse({
  name: "John Doe",
  age: 30,
});
export default ObjectValidator;
