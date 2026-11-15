import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { loginSchema } from './validations/auth';
import { verifyCredentials } from './lib/auth/verify-credentials';

/**
 * Configure NextAuth to authenticate users using validated credentials and
 * mange JWT-based sessions, sign-in, sign-out, and auth routes.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        const result = loginSchema.safeParse(credentials);

        if (!result.success) return null;

        const { email, password } = result.data;

        return verifyCredentials(email, password);
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  // Explicitly transfer the authenticated user's ID into the JWT and into the session.
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user && typeof token.id === 'string') {
        session.user.id = token.id;
      }

      return session;
    },
  },
});
