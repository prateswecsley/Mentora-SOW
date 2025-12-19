import NextAuth, { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import GoogleProvider from "next-auth/providers/google"
import GitHubProvider from "next-auth/providers/github"
import EmailProvider from "next-auth/providers/email"
import { prisma } from "@/lib/prisma"
import CredentialsProvider from "next-auth/providers/credentials"

export const authOptions: NextAuthOptions = {
    secret: process.env.NEXTAUTH_SECRET,
    adapter: PrismaAdapter(prisma),
    session: {
        strategy: "jwt",
    },
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        }),
        GitHubProvider({
            clientId: process.env.GITHUB_ID || "",
            clientSecret: process.env.GITHUB_SECRET || "",
        }),
        EmailProvider({
            server: process.env.EMAIL_SERVER,
            from: process.env.EMAIL_FROM,
        }),
        CredentialsProvider({
            name: "Login de Teste",
            credentials: {
                email: { label: "Email", type: "email", placeholder: "teste@sow.com" },
            },
            async authorize(credentials) {
                if (!credentials?.email) return null

                // Find or create user for dev/test
                const user = await prisma.user.upsert({
                    where: { email: credentials.email },
                    update: {},
                    create: {
                        email: credentials.email,
                        name: credentials.email.split("@")[0],
                    },
                })

                return user
            }
        })
    ],
    callbacks: {
        session: async ({ session, token }) => {
            if (token?.sub) {
                // Fetch fresh user data from DB to get latest name/image
                // This avoids storing large Base64 images in usage JWT cookie
                const user = await prisma.user.findUnique({
                    where: { id: token.sub }
                });

                if (user && session.user) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (session.user as any).id = user.id;
                    session.user.name = user.name;
                    session.user.image = user.image;
                }
            }
            return session;
        },
        jwt: async ({ token, user }) => {
            if (user) {
                // Minimize cookie size: ONLY store the user ID
                return { sub: user.id }
            }
            return token;
        }
    },
    pages: {
        signIn: '/auth/signin',
    },
}
