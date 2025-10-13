import type { AuthOptions } from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import connectToMongo from "@/app/utils/connectMongo"
import UserModel from "../../models/UserModel"

export const authOptions: AuthOptions = {
	providers: [
		Google({
			clientId: process.env.GOOGLE_CLIENT_ID!,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
		}),
		Credentials({
			name: "Credentials",
			credentials: {
				email: { label: "Email", type: "text" },
				password: { label: "Password", type: "password" },
			},
			async authorize(credentials) {
				if (!credentials?.email || !credentials?.password) return null
				await connectToMongo()
				const user = await UserModel.findOne({ email: credentials.email }).lean()
				if (!user || !user.password) return null
				const ok = await bcrypt.compare(credentials.password, user.password)
				if (!ok) return null
				return { id: String(user._id), name: user.name, email: user.email, image: user.image }
			},
		}),
	],
	session: { 
		strategy: "jwt",
		maxAge: 30 * 24 * 60 * 60, // 30 days
		updateAge: 24 * 60 * 60, // 24 hours
	},
	secret: process.env.AUTH_SECRET,
	pages: { signIn: "/signin" },
	cookies: {
		sessionToken: {
			name: `next-auth.session-token`,
			options: {
				httpOnly: true,
				sameSite: 'lax',
				path: '/',
				secure: process.env.NODE_ENV === 'production',
				maxAge: 30 * 24 * 60 * 60, // 30 days
			},
		},
		callbackUrl: {
			name: `next-auth.callback-url`,
			options: {
				sameSite: 'lax',
				path: '/',
				secure: process.env.NODE_ENV === 'production',
				maxAge: 60 * 60, // 1 hour
			},
		},
		csrfToken: {
			name: `next-auth.csrf-token`,
			options: {
				httpOnly: true,
				sameSite: 'lax',
				path: '/',
				secure: process.env.NODE_ENV === 'production',
				maxAge: 60 * 60, // 1 hour
			},
		},
	},
	callbacks: {
		async signIn({ user, account }: { user: any; account?: any }) {
			if (account?.provider !== "credentials") {
				await connectToMongo()
				const existing = await UserModel.findOne({ email: user.email })
				if (!existing) {
					await UserModel.create({
						name: user.name || "User",
						email: user.email,
						image: user.image,
						provider: account?.provider,
					})
				}
			}
			return true
		},
		async jwt({ token, user }: { token: any; user?: any }) {
			if (user) token.id = (user as any).id
			return token
		},
		async session({ session, token }: { session: any; token: any }) {
			if (session.user && token?.id) {
				;(session.user as any).id = token.id
			}
			return session
		},
	},
}
