import BaseValidator from '../baseValidator';



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

    for (const key of Object.keys(schema) as Array<Extract<keyof typeof schema, string>>) {
      const schemaNode = schema[key];
      const inputValue = input[key as keyof typeof input];
      const nextPath = [...path, key];

      if (schemaNode instanceof BaseValidator) {
        const result = schemaNode.safeParse(inputValue);
        if (result.isValid === false) {
          issues.push(...result.issues.map((issue): Issue => ({
            ...issue,
            path: [
              ...nextPath,
              ...issue.path
            ]
          })));
        }
        if (result.isValid === true) {
          output[key as keyof typeof output] = result.output as SchemaToType<TObject>[keyof typeof output];
          continue;
        }
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


export default ObjectValidator;
