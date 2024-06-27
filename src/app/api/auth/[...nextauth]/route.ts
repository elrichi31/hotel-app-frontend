import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "username", type: "text", placeholder: "username" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/login`,
            {
              method: "POST",
              body: JSON.stringify({
                username: credentials?.username,
                password: credentials?.password,
              }),
              headers: { "Content-Type": "application/json" },
            }
          );
          const user = await res.json();
          if (res.status === 200) {
            return user;
          } else {
            throw new Error(user.message || "Failed to authenticate");
          }
        } catch (error: any) {
          throw new Error(error.message || "Failed to authenticate");
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      return { ...token, ...user };
    },
    async session({ session, token }) {
      session.user = token as any;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: 'jwt',
    maxAge: 3 * 60 * 60 // 4 hours
  },
  // Redirigir a /login en caso de error durante la autenticación
});

export { handler as GET, handler as POST };
