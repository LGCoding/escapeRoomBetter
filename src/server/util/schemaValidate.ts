import { z } from "zod";

export const sessionSchema = z.object({ id: z.string(), userId: z.string() });
export const userSchema = z.object({
  name: z.string(),
  email: z.string(),
  password: z.string(),
});

export function createObjectFromJson<T extends z.ZodTypeAny>(
  schema: T,
  content: string,
): z.infer<T> {
  const test = z
    .custom<string>((_) => {
      try {
        JSON.parse(content);
      } catch (error) {
        return false;
      }
      return true;
    }, "invalid json") // write whatever error you want here
    .transform<unknown>((content) => JSON.parse(content))
    .pipe(schema)
    .parse(content);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return test;
}
