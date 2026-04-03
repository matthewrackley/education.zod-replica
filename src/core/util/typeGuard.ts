import BaseValidator from '../baseValidator';
import ArrayLikeValidator from '../primitives/arrayLikeValidator';
import ArrayValidator from '../primitives/arrayValidator';
import BigIntValidator from '../primitives/bigintValidator';
import BooleanValidator from '../primitives/booleanValidator';
import FunctionValidator from '../primitives/functionValidator';
import NullValidator from '../primitives/nullValidator';
import NumberValidator from '../primitives/numberValidator';
import ObjectValidator from '../primitives/objectValidator';
import StringValidator from '../primitives/stringValidator';
import SymbolValidator from '../primitives/symbolValidator';
import TupleValidator from '../primitives/tupleValidator';
import UndefinedValidator from '../primitives/undefinedValidator';

export const isBasePrimitive = <
    BP extends BasePrimitive,
    Func extends ((input: unknown, ...args: any[]) => input is BP) = ((input: unknown, ...args: any[]) => input is BP)
  >(input: unknown, callback?: Func, ...args: Parameters<Func>): input is BasePrimitive =>
    typeof input === 'string' && [
      "string", "number", "bigint", "boolean", "symbol", "undefined", "object", "function", "array", "null", "array-like", "union", "xor"
    ].includes(input) && (callback ? callback(input, ...args) : true);

export const isIssueList = <T> (input: unknown[]): input is Issue[] => {
  return input.every((item) => isIssue(item));
};
export const isIssue = <T> (input: unknown): input is Issue => {
  return (
    typeof input === 'object' && input !== null &&
    'path' in input && 'code' in input && 'expected' in input && 'message' in input
  ) && (
      typeof input.code === 'string' && typeof input.message === 'string' && (
      typeof input.expected === "string" || typeof input.expected === "number"
    )
  );
}
export const isArrayIssueList = <T> (input: unknown[]): input is ArrayIssue[] => {
  return input.every((item) => isArrayIssue(item));
}
export const isArrayIssue = <T>(input: unknown): input is ArrayIssue => {
  return isIssue(input) && 'position' in input && typeof input.position === 'number';
}
export const isValidationResult = <T> (input: unknown): input is ValidationResult<T> => {
  return typeof input === 'object' && input !== null && 'isValid' in input && typeof input.isValid === 'boolean' && (input.isValid ? 'output' in input : 'issues' in input);

}
export const isValidationSuccess = <T> (input: unknown): input is ValidationSuccess<T> => {
  return isValidationResult(input) && input.isValid === true && 'output' in input;
}
export const isValidationFailure = <T>(input: unknown): input is ValidationFailure => {
  return isValidationResult(input) && input.isValid === false && 'issues' in input && isIssueList(input.issues);
}
export const isInputValidator = <BP extends BasePrimitive, T extends BaseValidator<unknown>> (input: BasePrimitive, instance: BaseValidator<PrimitiveToType<BP>>) => {
  switch (input) {
    case "string":
      return new StringValidator();
    case "number":
      return new NumberValidator();
    case "bigint":
      return new BigIntValidator()
    case "boolean":
      return new BooleanValidator()
    case "symbol":
      return new SymbolValidator()
    case "undefined":
      return new UndefinedValidator()
    case "object":
      return new ObjectValidator()
    case "function":
      return new FunctionValidator()
    case "array":
      return new ArrayValidator([]);
    case "null":
      return new NullValidator()
    case "array-like":
      return new ArrayLikeValidator()
    case "union":
      return new Union([], "union");
    case "xor":
      return new Union([], "xor");
    case "tuple":
      return new TupleValidator();
    default:
      return false;
  }
}



export function defineIssue (issue: Issue, code: IssueCode, ...path: string[]) {
  const messageMap: Record<IssueCode, string> = {
    invalid_type: `Expected type ${ issue.expected } but received ${ typeof issue.received }`,
    multiple_valid: `Input is valid against multiple validators, while XOR mode is enabled`,
    none_valid: `Input is not valid against any validator`,
    too_short: `Input is too short, expected minimum length of ${ issue.expected } but received length of ${ typeof issue.received === 'string' || Array.isArray(issue.received) ? issue.received.length : 'unknown' }`,
    too_long: `Input is too long, expected maximum length of ${ issue.expected } but received length of ${ typeof issue.received === 'string' || Array.isArray(issue.received) ? issue.received.length : 'unknown' }`,
    undefined: `Expected value to be defined, but received undefined`,
    non_validator_passby: `Non-validator passed to union or xor schema`,
    invalid_schema: `Invalid schema provided to validator`,
  };
  issue.code = code;
  issue.path = [...issue.path, ...path];
  issue.message = messageMap[code];
}
const typeguards = {
  isBasePrimitive,
  isIssueList,
  isIssue,
  isArrayIssueList,
  isArrayIssue,
  isValidationResult,
  isValidationSuccess,
  isValidationFailure,
};

export default typeguards;
