import type { NextApiRequest, NextApiResponse } from 'next'
import { OAuth2Client } from 'google-auth-library'
import jwt from 'jsonwebtoken'
import User from '@/models/User'
import { dbConnect } from '@/lib/db'

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') return res.status(405).end()
    const { idToken } = req.body
    if (!idToken) return res.status(400).json({ message: 'ID Token required' })

    try {
        await dbConnect()

        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        })

        const payload = ticket.getPayload()
        if (!payload?.email) {
            return res.status(400).json({ message: 'Google token verification failed' })
        }

        let user = await User.findOne({ email: payload.email })

        if (!user) {
            user = await User.create({
                name: payload.name || 'No Name',
                email: payload.email,
                avatar: payload.picture || '',
                role: 'OrgUser',
                tenantId: null,
            })
        }

        const token = jwt.sign(
            { userId: user._id, email: user.email, role: user.role, tenantId: user.tenantId },
            process.env.JWT_SECRET!,
            { expiresIn: '7d' }
        )

        return res.status(200).json({ token, user: { id: user._id, email: user.email, name: user.name, tenantId: user.tenantId } })

    } catch (error) {
        console.error('Google login error:', error)
        return res.status(500).json({ message: 'Internal Server Error' })
    }
}
