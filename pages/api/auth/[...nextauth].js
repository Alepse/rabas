import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      // Example: Allow sign-in only if the user's email is verified
      if (account.provider === 'google' && profile.email_verified) {
        return true;
      }
      // Return false to deny access
      return false;
    },
    async redirect({ url, baseUrl }) {
      return baseUrl;
    },
  },
}); 