interface Issue {
  path: string[];
  code: string;
  expected: string;
  received?: unknown;
  message: string;
}

type ValidationResult =
  | ValidationSuccess
  | ValidationFailure;

interface ValidationSuccess {
  input: unknown;
  isValid: true;
}

interface ValidationFailure {
  input: unknown;
  isValid: false;
  issues: Issue[];
}

export type {
  Issue,
  ValidationResult,
  ValidationSuccess,
  ValidationFailure,
}
