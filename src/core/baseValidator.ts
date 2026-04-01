import { BasePrimitive, Issue, ValidationFailure, ValidationResult, ValidationSuccess } from './core.types';

export class ValidationError extends Error {
  issues: Issue[];
  constructor(issues: Issue[]) {
    super('Validation failed');
    this.issues = issues;
  }
}

export abstract class BaseValidator {
  abstract type: BasePrimitive;
  protected abstract validate (input: unknown): ValidationResult;
  protected success<T extends unknown> (input: T): ValidationSuccess<T> {
    return {
      input,
      isValid: true,
    };
  }
  protected failure (input: unknown, issues: Issue[]): ValidationFailure {
    return {
      input,
      isValid: false,
      issues,
    };
  }
  protected getType(input: unknown): BasePrimitive {
    if (Array.isArray(input)) return 'array' as const;
    if (input === null) return 'null' as const;
    if (typeof input === 'object' && Object.prototype.hasOwnProperty.call(input, 'length')) {
      return 'array-like' as const;
    }
    return typeof input;
  }
  protected invalidType(input: unknown, ...path: string[]): Issue {
    return {
      path: [...path],
      code: 'invalid_type',
      expected: this.type,
      received: input,
      message: `Expected ${this.type} but received ${this.getType(input)}`,
    };
  }
  public safeParse(input: unknown): ValidationResult {
    return this.validate(input);
  }
  public parse (input: unknown) {
    const result = this.validate(input);
    if (result.isValid) {
      return result.input;
    }
    throw new ValidationError(result.issues);
  }
}


export default BaseValidator;
