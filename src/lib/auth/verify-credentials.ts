import { prisma } from "../prisma";
import * as argon2 from "argon2";

/**
 * Verify whether the user's provided credentials exist in the database records.
 * 
 * @param email The user's email.
 * @param password The user's password.
 * @returns The matching user id.
 */
export async function verifyCredentials(
  email: string,
  password: string,
) {
  // Check whether user exists in the database.
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      passwordHash: true,
    }
  });

  if (!user) return null;

  // Check whether password matches with the hashed password recorded in the database.
  const isPasswordValid = await argon2.verify(
    user.passwordHash, password,
  );

  if (!isPasswordValid) return null;

  return { id: user.id };
}