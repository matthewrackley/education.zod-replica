import * as Validators from './core/index';

export const ValidationError = Validators.ValidationError;

export const v = {
  string: () => new Validators.StringValidator(),
  number: () => new Validators.NumberValidator(),
  boolean: () => new Validators.BooleanValidator(),
  bigint: () => new Validators.BigIntValidator(),
  object: <TSchema extends Validators.ObjectSchema>(schema: TSchema) => new Validators.ObjectValidator(schema),
  array: () => new Validators.ArrayValidator(),
  function: () => new Validators.FunctionValidator(),
  arrayLike: () => new Validators.ArrayLikeValidator(),
}


export default v;
