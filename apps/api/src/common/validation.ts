import { BadRequestException } from "@nestjs/common";
import { z } from "zod";

export function parseOrBadRequest<TSchema extends z.ZodType>(
  schema: TSchema,
  value: unknown,
): z.infer<TSchema> {
  const result = schema.safeParse(value);

  if (!result.success)
    throw new BadRequestException(z.flattenError(result.error));

  return result.data;
}
