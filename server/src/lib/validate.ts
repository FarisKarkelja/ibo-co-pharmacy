import type { z, ZodTypeAny } from 'zod';

/** Parses input with a zod schema; a ZodError is turned into a 400 by the error handler. */
export function parse<S extends ZodTypeAny>(schema: S, input: unknown): z.output<S> {
  return schema.parse(input);
}
