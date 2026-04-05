export { };

declare global {
  export type BasePrimitive = "string" | "number" | "bigint" | "boolean" | "symbol" | "undefined" | "object" | "function" | "array" | "null" | "array-like" | "union" | "xor" | "tuple" | "unknown";

  export type PrimitiveToString<T extends unknown> =
    T extends string ? "string" :
    T extends number ? "number" :
    T extends bigint ? "bigint" :
    T extends boolean ? "boolean" :
    T extends symbol ? "symbol" :
    T extends undefined ? "undefined" :
    T extends object ? "object" :
    T extends Function ? "function" :
    T extends unknown[] ? T[number][] extends unknown ? "tuple" :"array" :
    T extends null ? "null" :
    T extends ArrayLike<unknown> ? "array-like" :
    unknown;

  export type PrimitiveToType<T extends BasePrimitive> =
    T extends "string" ? string :
    T extends "number" ? number :
    T extends "bigint" ? bigint :
    T extends "boolean" ? boolean :
    T extends "symbol" ? symbol :
    T extends "undefined" ? undefined :
    T extends "object" ? object :
    T extends "function" ? Function :
    T extends "array" ? unknown[] :
    T extends "null" ? null :
    T extends "array-like" ? ArrayLike<unknown> :
    T extends "tuple" ? unknown[] :
    T extends "union" ? T extends unknown ? T : never :
    unknown;

  export type UnionOf<T extends any[]> = T[number];

  export type DeUnionOf<T extends any> = T[];

  export type DistributedValidator<T> = T extends import('./baseValidator').BaseValidator<infer U> ? U extends unknown ? import('./baseValidator').BaseValidator<U> : never : never;

  export type Distributed<T> = T extends unknown ? T : never;

  export type ArraySchema = import('./baseValidator').BaseValidator<unknown>[];

  export type ValidatorToType<TValidator extends import('./baseValidator').BaseValidator<unknown>> =
    TValidator extends import('./baseValidator').BaseValidator<infer TOutput> ? TOutput : never;

  export type SchemaToTuple<TSchema extends ArraySchema> = {
    [K in keyof TSchema]: TSchema[K] extends import('./baseValidator').BaseValidator<unknown>
      ? ValidatorToType<TSchema[K]>
      : never;
  };

  export type UnionToIntersection<U> =
    (U extends unknown ? (k: U) => void : never) extends
    (k: infer I) => void ? I : never;

  export type TupleToUnion<TTuple extends unknown[]> = TTuple[number][];

  export type ArraySchemaToType<TSchema extends ArraySchema> =
    TSchema['length'] extends 0
      ? unknown[]
      : TSchema['length'] extends 1
        ? Array<ValidatorToType<TSchema[0]>>
        : SchemaToTuple<TSchema>;

  export type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  export type Xor<T, U> = (T | U) extends object
    ? (Without<T, U> & U) | (Without<U, T> & T)
    : never;

  export type TupleDestructure<U> = U extends unknown ? U extends Array<unknown> ? U[number] : never : never;

  export type UnionToTuple<T, U = T> =
    [T] extends [never]
      ? []
      : T extends unknown
        ? [T, ...UnionToTuple<Exclude<U, T>>]
    : never;

  export type UnwrapBase<T> = T extends import('./baseValidator').BaseValidator<infer U> ? U : never;

  export type PrimitiveToValidator<T extends unknown> =
    T extends string ? import('./primitives/stringValidator').StringValidator :
    T extends number ? import('./primitives/numberValidator').NumberValidator :
    T extends bigint ? import('./primitives/bigintValidator').BigIntValidator :
    T extends boolean ? import('./primitives/booleanValidator').BooleanValidator :
    T extends symbol ? import('./primitives/symbolValidator').SymbolValidator :
    T extends undefined ? import('./primitives/undefinedValidator').UndefinedValidator :
    T extends object ? import('./primitives/objectValidator').ObjectValidator<T> :
    T extends Function ? import('./primitives/functionValidator').FunctionValidator :
    T extends unknown[] ? T[number][] extends unknown ? import('./primitives/tupleValidator').TupleValidator<TSchema> : import('./primitives/arrayValidator').ArrayValidator<T[number]> :
    T extends null ? import('./primitives/nullValidator').NullValidator :
    T extends ArrayLike<unknown> ? import('./primitives/arrayLikeValidator').ArrayLikeValidator<T> :
    unknown;

  //___=============================>                  <============================___\\
  //___|| ==================== ||        SCHEMA TYPES      || =================== ||___\\
  //___=============================>                  <============================___\\


  export interface RecordSchema<TLeaf = unknown> {
    [key: string]: RecordNode<TLeaf>;
  }
  export type RecordNode<TLeaf = unknown> = RecordSchema<TLeaf> | TLeaf;

  export interface ObjectSchema {
    [key: string]: SchemaNode;
  }

  export type SchemaNode = import("./baseValidator").BaseValidator<any> | ObjectSchema;

  export type OSchemaToRSchema<T extends ObjectSchema> = {
    [K in keyof T]: T[K] extends import("./baseValidator").BaseValidator<infer Out>
      ? Out
      : T[K] extends ObjectSchema
        ? ObjectSchemaToRecordSchema<T[K]>
        : never;
  }
  export type NodeToType<TNode extends SchemaNode> =
    TNode extends import('./baseValidator').BaseValidator<infer TOutput>
      ? TOutput
      : TNode extends ObjectSchema
        ? SchemaToType<TNode>
        : never;

  export type SchemaToObject<TObject extends ObjectSchema, Mode extends "strict" | "loose" = "loose"> = Mode extends "strict" ?
    SchemaToType<TObject> : (SchemaToType<TObject> & {
      [key: string]: any;
    }) extends infer O ? {
      [K in keyof O]: O[K]
    } : never;

  export type SchemaToType<TSchema extends ObjectSchema> = TSchema extends ObjectSchema ? {
    [K in keyof TSchema]: NodeToType<TSchema[K]>;
    [key: string]: any;
  } : never;

  //___=============================>                 <============================___\\
  //___|| ==================== ||        ISSUE TYPES      || =================== ||___\\
  //___=============================>                 <============================___\\

  export type IssueCode = "type_invalid" | "multiple_valid" | "none_valid" | "too_short" | "too_long" | "undefined" | "non_validator_passby" | "schema_invalid" | "required" | "unexpected_keys";

  export interface BasicIssue extends IssueBase {
    type: "basic";
  }
  interface IssueBase {
    path: string[];
    code: IssueCode;
    expected: string | number;
    received?: unknown;
    message: string;
  }
  export interface ArrayIssue extends IssueBase {
    type: "array";
    position: number;
  }
  export type Issue = BasicIssue | ArrayIssue;

  export interface IssueOptions {
    expected: string | number | Array<unknown>;
    received: unknown;
    path?: string[];
    index?: number;
  }

  //___=============================>                      <============================___\\
  //___|| ==================== ||        VALIDATION TYPES      || =================== ||___\\
  //___=============================>                      <============================___\\


  export type ValidationResult<T = unknown> =
    | ValidationSuccess<T>
    | ValidationFailure;

  export interface ValidationSuccess<T> {
    output: T;
    isValid: true;
  }

  export interface ValidationFailure {
    input: unknown;
    isValid: false;
    issues: Issue[];
  }
}
