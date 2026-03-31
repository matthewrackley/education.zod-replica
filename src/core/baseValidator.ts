import { Issue, ValidationFailure, ValidationResult, ValidationSuccess } from './core.types';

abstract class BaseValidator {
  abstract validate(input: unknown): ValidationResult;

  protected success(input: unknown): ValidationSuccess {
    return {
      input,
      isValid: true,
    };
  }
  protected failure(input: unknown, issues: Issue[]): ValidationFailure {
    return {
      input,
      isValid: false,
      issues,
    };
  }
}

export default BaseValidator;
