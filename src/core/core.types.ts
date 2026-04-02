type BasePrimitive = "string" | "number" | "bigint" | "boolean" | "symbol" | "undefined" | "object" | "function" | "array" | "null" | "array-like";



interface Issue {
  path: string[];
  code: string;
  expected: string | number;
  received?: unknown;
  message: string;
}
interface ArrayIssue extends Issue{
  position: number;
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
  ArrayIssue,
  ValidationResult,
  ValidationSuccess,
  ValidationFailure
}
