
type BasePrimitive = "string" | "number" | "bigint" | "boolean" | "symbol" | "undefined" | "object" | "function" | "array" | "null" | "array-like";

interface Issue {
  path: string[];
  code: string;
  expected: string;
  received?: unknown;
  message: string;
}

type ValidationResult<T = unknown> =
  | ValidationSuccess<T>
  | ValidationFailure;

interface ValidationSuccess<T> {
  input: T;
  isValid: true;
}

interface ValidationFailure {
  input: unknown;
  isValid: false;
  issues: Issue[];
}

export type {
  BasePrimitive,
  Issue,
  ValidationResult,
  ValidationSuccess,
  ValidationFailure
}
