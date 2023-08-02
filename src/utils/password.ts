import { compare, hash } from "bcrypt";

export const generatePasswordHash = async (
  password: string
): Promise<string> => {
  const passwordHash = await hash(password, 10);
  return passwordHash;
};

export const comparePasswords = async (
  plainTextPassword: string,
  hashedPassword: string
): Promise<boolean> => {
  return await compare(plainTextPassword, hashedPassword);
};
