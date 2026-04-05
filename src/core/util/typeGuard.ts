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

export const isIssueList = (input: unknown): input is Issue[] => {
  return Array.isArray(input) && input.every((item) => isIssue(item));
};
export const isIssue = (input: unknown): input is Issue => {
  return (
    typeof input === 'object' && input !== null &&
    'path' in input && 'code' in input && 'expected' in input && 'message' in input && 'type' in input
  ) && (
      typeof input.code === 'string' && typeof input.message === 'string' && (
      typeof input.expected === "string" || typeof input.expected === "number"
    )
  );
}

export const isArray = <T = unknown>(input: unknown): input is Array<T> => {
  return Array.isArray(input) && input.length >= 0;
}

export const isBasicIssueList = (input: unknown[]): input is BasicIssue[] => {
  return input.every((item) => isBasicIssue(item));
}
export const isArrayIssueList = (input: unknown[]): input is ArrayIssue[] => {
  return input.every((item) => isArrayIssue(item));
}
export const isBasicIssue = (input: unknown): input is BasicIssue => {
  return isIssue(input) && !('position' in input) && input.type === 'basic' && isArrayIssue(input) === false;
}
export const isArrayIssue = (input: unknown): input is ArrayIssue => {
  return isIssue(input) && 'position' in input && typeof input.position === 'number' && input.type === 'array' && isBasicIssue(input) === false;
}
export const isValidationResult = <T> (input: unknown): input is ValidationResult<T> => {
  return typeof input === 'object' && input !== null && 'isValid' in input && typeof input.isValid === 'boolean' && (input.isValid ? 'output' in input : 'issues' in input);

}
export const isValidationSuccess = <T>(input: unknown): input is ValidationSuccess<T> => {
  return isValidationResult(input) && input.isValid === true && 'output' in input;
}
export const isValidationFailure = (input: unknown): input is ValidationFailure => {
  return isValidationResult(input) && input.isValid === false && 'issues' in input && isIssueList(input.issues);
}
export const isRecord = (input: unknown): input is Record<string, unknown> => {
  return typeof input === 'object' && input !== null && !Array.isArray(input) && Object.keys(input).some(k => typeof k === 'string');
}
export const isSchemaNode = (input: unknown): input is SchemaNode => {
  return input instanceof BaseValidator || isObjectSchema(input);
}
export const isObjectSchema = (input: unknown): input is ObjectSchema => {
  return isRecord(input) && Object.keys(input).some((key) => input[key] instanceof BaseValidator || isObjectSchema(input[key]));
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
      return new UnionValidator([], "xor");
    case "tuple":
      return new TupleValidator();
    default:
      return false;
  }
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
  isRecord,
  isSchemaNode,
  isObjectSchema,
  isInputValidator,
};

export default typeguards;
