import { NextAuthOptions } from 'next-auth'
import { JWT } from 'next-auth/jwt'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@vuna/db'
import bcrypt from 'bcryptjs'

type ExtendedJWT = JWT & {
  id?: string
  role?: string
  isVerified?: boolean
  brandName?: string
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        role: { label: 'Role', type: 'text' },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password required')
        }

        // Check if seller is logging in
        if (credentials.role === 'SELLER') {
          const seller = await prisma.seller.findUnique({
            where: { email: credentials.email },
            include: { location: true, category: true }
          })

          if (!seller) throw new Error('No account found with this email')

          const passwordMatch = await bcrypt.compare(
            credentials.password,
            seller.password
          )

          if (!passwordMatch) throw new Error('Incorrect password')

          return {
            id: seller.id,
            email: seller.email,
            name: seller.name,
            role: 'SELLER',
            brandName: seller.brandName,
            isVerified: seller.isVerified,
          }
        }

        // Buyer login
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { location: true }
        })

        if (!user) throw new Error('No account found with this email')

        const passwordMatch = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!passwordMatch) throw new Error('Incorrect password')

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          isVerified: user.isVerified,
        }
      }
    })
  ],

  callbacks: {
    async jwt({ token, user }) {
      const t = token as ExtendedJWT
      if (user) {
        t.id = user.id
        t.role = (user as ExtendedJWT).role
        t.isVerified = (user as ExtendedJWT).isVerified
        t.brandName = (user as ExtendedJWT).brandName
      }
      return t
    },

    async session({ session, token }) {
      const t = token as ExtendedJWT
      if (t) {
        session.user.id = t.id as string
        session.user.role = t.role as string
        session.user.isVerified = t.isVerified as boolean
        session.user.brandName = t.brandName as string
      }
      return session
    }
  },

  pages: {
    signIn: '/login',
    error: '/login',
  },

  session: {
    strategy: 'jwt',
  },

  secret: process.env.NEXTAUTH_SECRET,
}
