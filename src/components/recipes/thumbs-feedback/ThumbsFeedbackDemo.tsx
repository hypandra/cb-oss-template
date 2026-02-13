'use client'

import { useState } from 'react'
import ThumbsFeedback from '@/components/recipes/thumbs-feedback/ThumbsFeedback'
import type { FeedbackPayload } from '@/components/recipes/thumbs-feedback/types'
import { Card, CardContent } from '@/components/ui/card'

interface ThumbsFeedbackDemoProps {
  hasDatabase: boolean
}

export function ThumbsFeedbackDemo({ hasDatabase }: ThumbsFeedbackDemoProps) {
  const [lastPayload, setLastPayload] = useState<FeedbackPayload | null>(null)

  return (
    <div className="space-y-4">
      {!hasDatabase ? (
        <p className="text-sm text-muted-foreground text-pretty">
          Connect a database to persist feedback.
        </p>
      ) : null}

      <Card>
        <CardContent className="space-y-4 p-4">
          <div className="rounded-md border bg-muted/30 p-3 text-sm text-pretty">
            Try asking the AI to use shorter examples for younger learners, then rate this response.
          </div>

          <div className="rounded-md border bg-background p-3">
            <p className="text-sm text-pretty">
              We can adapt to your child&apos;s level by using one concept per step and repeating key words.
              If you want, I can switch to a 5-year-old mode for shorter, slower prompts.
            </p>
          </div>

          <ThumbsFeedback
            entityType="demo-message"
            entityId="message-1"
            roles={['parent', 'teacher', 'student']}
            endpoint="/api/demo/feedback"
            disableNetwork={!hasDatabase}
            onSubmit={setLastPayload}
          />
        </CardContent>
      </Card>

      {lastPayload ? (
        <Card>
          <CardContent className="p-4">
            <p className="mb-2 text-xs text-muted-foreground">Latest payload</p>
            <pre className="overflow-x-auto rounded bg-muted p-3 text-xs">{JSON.stringify(lastPayload, null, 2)}</pre>
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
