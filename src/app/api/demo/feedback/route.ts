import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { getPool } from '@/lib/postgres'

type FeedbackBody = {
  entityType?: string
  entityId?: string
  contextId?: string
  rating?: boolean
  feedbackText?: string
  userRole?: string
}

const inMemoryFeedback: Array<Record<string, unknown>> = []

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as FeedbackBody
    const { entityType, entityId, contextId, rating, feedbackText, userRole } = body

    if (!entityType || !entityId || typeof rating !== 'boolean') {
      return NextResponse.json(
        { error: 'entityType, entityId, and rating are required' },
        { status: 400 }
      )
    }

    if (!process.env.DATABASE_URL) {
      inMemoryFeedback.push({ entityType, entityId, contextId, rating, feedbackText, userRole, createdAt: new Date().toISOString() })
      return NextResponse.json({ success: true, persisted: false })
    }

    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user?.id) {
      inMemoryFeedback.push({ entityType, entityId, contextId, rating, feedbackText, userRole, createdAt: new Date().toISOString() })
      return NextResponse.json({ success: true, persisted: false, note: 'Login to persist feedback to database' })
    }

    const pool = getPool()

    await pool.query(
      `
      INSERT INTO cb_feedback (
        entity_type,
        entity_id,
        context_id,
        rating,
        feedback_text,
        user_role,
        user_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      `,
      [
        entityType,
        entityId,
        contextId ?? null,
        rating,
        feedbackText ?? null,
        userRole ?? null,
        session.user.id,
      ]
    )

    return NextResponse.json({ success: true, persisted: true })
  } catch (error) {
    console.error('Demo feedback error:', error)
    return NextResponse.json({ success: true, persisted: false })
  }
}
