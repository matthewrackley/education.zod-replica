import { BasePrimitive, Issue, ValidationFailure, ValidationResult, ValidationSuccess } from './core.types';
import OptionalValidator from './util/optionalValidator';
import UnionValidator from './util/unionValidator';

export class ValidationError extends Error {
  issues: Issue[];
  constructor(issues: Issue[]) {
    super('Validation failed');
    this.issues = issues;
  }
}

/**
 * The Base Validator class extended by all Primitive classes
 *
 * @export
 * @abstract
 * @class BaseValidator
 * @type {BaseValidator}
 */
export abstract class BaseValidator<TOutput> {

  /**
   * The primitive type of the Validator as a string literal. This is used for error messages and type checking.
   *
   * @abstract
   * @type {BasePrimitive}
   */
  abstract type: BasePrimitive;

  /**
   * The method ran by the validator that helps it decide if it should return a `ValidationSuccess<T>` or a `ValidationFailure`.
   * This method should be implemented by all validators and should contain the logic for validating the input.
   *
   * @protected
   * @abstract
   * @param {unknown} input
   * @returns {ValidationResult<unknown>}
   */
  protected abstract _validate (input: unknown): ValidationResult<TOutput>;

  validate(input: unknown): ValidationResult<TOutput> {
    return this._validate(input);
  }

  /**
   * The success method ran within validate to return a `ValidationSuccess<T>` object.
   *
   * @protected
   * @template {unknown} T
   * @param {T} input
   * @returns {ValidationSuccess<T>}
   */
  protected success(input: TOutput): ValidationSuccess<TOutput> {
    return {
      output: input,
      isValid: true,
    };
  }

  /**
   * The failure method ran within validate to return a `ValidationFailure` object.
   *
   * @protected
   * @param {unknown} input
   * @param {Issue[]} issues
   * @returns {ValidationFailure}
   */
  protected failure (input: unknown, issues: Issue[]): ValidationFailure {
    return {
      input,
      isValid: false,
      issues,
    };
  }

  /**
   * The method that returns the actual typeof input provided. Ran within blocks that need it.
   *
   * @protected
   * @param {unknown} input
   * @returns {BasePrimitive}
   */
  protected getType(input: unknown): BasePrimitive {
    if (Array.isArray(input)) return 'array' as const;
    if (input === null) return 'null' as const;
    if (typeof input === 'object' && Object.prototype.hasOwnProperty.call(input, 'length')) {
      return 'array-like' as const;
    }
    return typeof input;
  }

  /**
   * The method that returns an issue for an invalid type.
   *
   * @protected
   * @param {unknown} input
   * @param {...string[]} path
   * @returns {Issue}
   */
  protected invalidType(input: unknown, ...path: string[]): Issue {
    return {
      path: [...path],
      code: 'invalid_type',
      expected: this.type,
      received: input,
      message: `Expected ${this.type} but received ${this.getType(input)}`,
    };
  }

  /**
   * The public method to return either `ValidationResult` object.
   *
   * @public
   * @param {unknown} input
   * @returns {ValidationResult}
   */
  public safeParse(input: unknown): ValidationResult<TOutput> {
    return this.validate(input);
  }

  /**
   * The public method to return the input if it is valid or throw a `ValidationError` if it is invalid.
   *
   * @public
   * @param {unknown} input
   * @returns {TOutput}
   * @throws {ValidationError} If the input is invalid. Throw a `ValidationError` with the issues from the `ValidationFailure` object.
   */
  public parse(input: unknown): TOutput  {
    const result = this.validate(input);
    if (result.isValid) {
      return result.output;
    }
    throw new ValidationError(result.issues);
  }

  public optional () {
    return new OptionalValidator(this);
  }

}


export default BaseValidator;
