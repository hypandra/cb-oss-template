import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import { auth } from '@/lib/auth'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

function getServiceClient() {
  if (!supabaseServiceKey) {
    throw new Error('Missing Supabase service role key')
  }
  return createClient(supabaseUrl, supabaseServiceKey)
}

export async function POST(request: NextRequest) {
  try {
    // --- Authentication ---
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // --- For anonymous/unauthenticated projects, replace the above with: ---
    // const userId = null

    const body = await request.json()
    const { entityType, entityId, contextId, rating, feedbackText, userRole } =
      body as {
        entityType: string
        entityId: string
        contextId?: string
        rating: boolean
        feedbackText?: string
        userRole?: string
      }

    if (!entityType || !entityId || typeof rating !== 'boolean') {
      return NextResponse.json(
        { error: 'entityType, entityId, and rating are required' },
        { status: 400 }
      )
    }

    // --- Optional: add custom authorization checks here ---
    // e.g. verify the entity belongs to this user

    const supabase = getServiceClient()

    const { error } = await supabase.from('cb_feedback').insert({
      entity_type: entityType,
      entity_id: entityId,
      context_id: contextId || null,
      rating,
      feedback_text: feedbackText || null,
      user_role: userRole || null,
      user_id: session.user.id,
    })

    if (error) {
      console.error('Failed to save feedback:', error)
      return NextResponse.json(
        { error: 'Failed to save feedback' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Feedback error:', error)
    return NextResponse.json(
      { error: 'Failed to save feedback' },
      { status: 500 }
    )
  }
}
