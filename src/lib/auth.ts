import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Kakao from "next-auth/providers/kakao"
import type { KakaoProfile } from "next-auth/providers/kakao"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

const kakaoScope = process.env.KAKAO_SCOPE?.trim()
const authSecret =
    process.env.AUTH_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    (process.env.NODE_ENV !== "production" ? "dev-only-auth-secret" : undefined)

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: PrismaAdapter(prisma),
    secret: authSecret,
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
        Kakao({
            clientId: process.env.KAKAO_CLIENT_ID,
            clientSecret: process.env.KAKAO_CLIENT_SECRET,
            authorization: {
                url: "https://kauth.kakao.com/oauth/authorize",
                ...(kakaoScope ? { params: { scope: kakaoScope } } : {}),
            },
            profile(profile: KakaoProfile) {
                const nickname = profile?.kakao_account?.profile?.nickname ?? profile?.properties?.nickname
                const image = profile?.kakao_account?.profile?.profile_image_url ?? profile?.properties?.profile_image
                return {
                    id: profile.id.toString(),
                    name: nickname ?? null,
                    email: profile?.kakao_account?.email ?? null,
                    image: image ?? null,
                }
            },
        }),
    ],
    callbacks: {
        async session({ session, user }) {
            if (session.user) {
                session.user.id = user.id

                try {
                    const latestUser = await prisma.user.findUnique({
                        where: { id: user.id },
                        select: {
                            role: true,
                            email: true,
                            name: true,
                        },
                    })

                    session.user.role = latestUser?.role || user.role || "USER"
                    session.user.email = latestUser?.email ?? session.user.email ?? null
                    session.user.name = latestUser?.name ?? session.user.name ?? null
                } catch (error) {
                    console.error("Error refreshing session role:", error)
                    session.user.role = user.role || "USER"
                }
            }
            return session
        },
    },
    pages: {
        signIn: '/login',
        error: '/auth/error',
    },
    trustHost: true,
    events: {
        async signIn({ user, account, profile }) {
            if (account?.provider === "kakao") {
                try {
                    const kakaoProfile = profile as KakaoProfile | undefined
                    const nickname =
                        kakaoProfile?.kakao_account?.profile?.nickname ??
                        kakaoProfile?.properties?.nickname

                    if (!nickname) return

                    // If user has no name or name is different from nickname (and we want to sync it)
                    // Note: This updates the DB record. NextAuth session might need a refresh to see changes immediately.
                    if (!user.name || user.name === "Guest") {
                        await prisma.user.update({
                            where: { id: user.id },
                            data: { name: nickname }
                        })
                    }
                } catch (error) {
                    console.error("Error syncing user name from Kakao:", error)
                }
            }
        }
    }
})
