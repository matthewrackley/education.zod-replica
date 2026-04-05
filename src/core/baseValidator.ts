import OptionalValidator from './util/optionalValidator';
import { isArray } from './util/typeGuard';
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
  protected failure (input: unknown, issues: (ArrayIssue | Issue)[]): ValidationFailure {
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
  protected invalidType(input: unknown, path: string[] = [], index?: number): Issue {
    const core = {
      path,
      code: 'type_invalid' as const,
      expected: this.type,
      received: input,
      message: `Expected ${ this.type } but received ${ this.getType(input) }`,
    };
    return Number.isFinite(index)
      ? { ...core, type: 'array', position: index! }
      : { ...core, type: 'basic' };
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

  protected withPath<I extends BasicIssue | ArrayIssue> (
    issues: I[],
    basePath: string[]
  ): I[] {
    return issues.map((issue) =>
      ({ ...issue, path: [...basePath, ...issue.path] })
    );
  }

  /**
   * The message returned when using `required` code in `defineIssue` method.
   *
   * `Missing a required property key: ${options.expected}\nReceived the following keys: [${Object.keys(options.received).join(", ")}]`
   *
   * @public
   * @param {"required"} code
   * @param {IssueOptions} options
   * @returns {(BasicIssue | ArrayIssue)}
   */
  public defineIssue (code: "required", options: IssueOptions): BasicIssue | ArrayIssue;

  /**
   * The message returned when using `unexpected_keys` code in `defineIssue` method.
   *
   * `Received unexpected keys in object, expected keys are: [${Object.keys(options.expected).join(", ")}]`
   *
   * @public
   * @param {"unexpected_keys"} code
   * @param {IssueOptions} options
   * @returns {(BasicIssue | ArrayIssue)}
   */
  public defineIssue(code: "unexpected_keys", options: IssueOptions): BasicIssue | ArrayIssue;
  /**
   * The message returned when using `type_invalid` code in `defineIssue` method.
   *
   * `Expected type ${options.expected} but received ${typeof options.received}`
   *
   * @param code
   * @param {"type_invalid"} options
   * @returns {Issue}
   */
  public defineIssue (code: "type_invalid", options: IssueOptions): BasicIssue | ArrayIssue;

  /**
   * The message returned when using `multiple_valid` code in `defineIssue` method.
   *
   * `Input is valid against multiple validators, while XOR mode is enabled`
   *
   * @param code
   * @param {"multiple_valid"} options
   * @returns {Issue}
   */
  public defineIssue (code: "multiple_valid", options: IssueOptions): BasicIssue | ArrayIssue;

  /**
   * The message returned when using `none_valid` code in `defineIssue` method.
   *
   * `Input is not valid against any validator`
   *
   * @param code
   * @param {"none_valid"} options
   * @returns {Issue}
   */
  public defineIssue (code: "none_valid", options: IssueOptions): BasicIssue | ArrayIssue;

  /**
   * The message returned when using `too_short` code in `defineIssue` method.
   *
   * `Input is too short, expected minimum length of ${options.expected} but received length of ${typeof options.received === 'string' || Array.isArray(options.received) ? options.received.length : 'unknown'}`
   *
   * @param code
   * @param {"too_short"} options
   * @returns {Issue}
   */
  public defineIssue (code: "too_short", options: IssueOptions): BasicIssue | ArrayIssue;

  /**
   * The message returned when using `too_long` code in `defineIssue` method.
   *
   * `Input is too long, expected maximum length of ${options.expected} but received length of ${typeof options.received === 'string' || Array.isArray(options.received) ? options.received.length : 'unknown'}`
   *
   * @param code
   * @param {"too_long"} options
   * @returns {Issue}
   */
  public defineIssue (code: "too_long", options: IssueOptions): BasicIssue | ArrayIssue;

  /**
   * The message returned when using `undefined` code in `defineIssue` method.
   *
   * `Expected value to be defined, but received undefined`
   *
   * @param code
   * @param {"undefined"} options
   * @returns {Issue}
   */
  public defineIssue (code: "undefined", options: IssueOptions): BasicIssue | ArrayIssue;

  /**
   * The message returned when using `non_validator_passby` code in `defineIssue` method.
   *
   * `Non-validator passed to union or xor schema`
   *
   * @param code
   * @param {"non_validator_passby"} options
   * @returns {Issue}
   */
  public defineIssue (code: "non_validator_passby", options: IssueOptions): BasicIssue | ArrayIssue;

  /**
   * The message returned when using `schema_invalid` code in `defineIssue` method.
   *
   * `Invalid schema provided to validator`
   *
   * @param code
   * @param {"schema_invalid"} options
   * @returns {Issue}
   */
  public defineIssue (code: "schema_invalid", options: IssueOptions): BasicIssue | ArrayIssue;

  /**
   * Defines an issue for placing in the `Issue` stack.
   *
   * @public
   * @param {IssueCode} code
   * @param {IssueOptions} options
   * @returns {(BasicIssue | ArrayIssue)}
   */
  public defineIssue (code: IssueCode, options: IssueOptions): BasicIssue | ArrayIssue;
  /**
   * Defines an issue for placing in the `Issue` stack.
   *
   * @public
   * @param {IssueCode} code
   * @param {IssueOptions} options
   * @returns {(BasicIssue | ArrayIssue)}
   */
  public defineIssue<C extends IssueCode>(code: C, options: IssueOptions): BasicIssue | ArrayIssue {
    const template = {
      required: (optKey: "received" | "expected") => `${ (isArray(options[optKey])) ? "[" + (options[optKey].join(", ")) + "]" : "None" }`,
      too_: typeof options.received === 'string' || isArray<string>(options.received) ? options.received.length : typeof options.received === "number" ? options.received : "unknown"
    };
    function tooConcat (code: IssueCode) {
      return code === "too_short" || code === "too_long" ? `Input is ${ code }, expected ${ code === "too_short" ? "minimum" : "maximum" } length of ${ options.expected } but received length of ${ template.too_ }.` : "ERROR: Invalid code for tooConcat function.";
    };
    const messageMap: Record<IssueCode, string> = {
      required: `Missing a required property key: ${options.expected}\nReceived the following keys:\n${template.required("received")}`,
      unexpected_keys: `Received unexpected keys in object:${template.required("received")}\nExpected keys are:\n${template.required("expected")}`,
      type_invalid: `Expected type: ${options.expected}\rReceived type: ${typeof options.received}.`,
      multiple_valid: `Input is valid against multiple validators, while XOR mode is enabled.`,
      none_valid: `Input is not valid against any validator.`,
      too_short: tooConcat(code),
      too_long: tooConcat(code),
      undefined: `Expected value to be defined, but received undefined.`,
      non_validator_passby: `Non-validator passed to union or xor schema.`,
      schema_invalid: `Invalid schema provided to validator.`,
    };
    const issue = {
      code,
      expected: options.expected,
      received: options.received,
      path: options.path || [],
      message: messageMap[code],
    };
    return Number.isFinite(options.index) ? { ...issue, type: "array" as const, position: options.index! } as ArrayIssue : { ...issue, type: "basic" as const } as BasicIssue;
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
