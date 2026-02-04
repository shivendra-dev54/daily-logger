import * as argon2 from "argon2";

export const verifyPassword = async (
  hashedPassword: string,
  plainPassword: string
): Promise<boolean> => {
  return argon2.verify(hashedPassword, plainPassword);
};