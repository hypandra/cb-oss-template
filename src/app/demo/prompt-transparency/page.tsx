'use client'

import { Card, CardContent } from '@/components/ui/card'
import { PromptViewerDialog } from '@/components/recipes/prompt-transparency/PromptViewerDialog'

const MOCK_SYSTEM_PROMPT = `You are a reading coach assistant for caregivers.
Explain in short steps and keep vocabulary beginner-friendly.
Always offer one next activity the caregiver can do immediately.`

const MOCK_CONTEXT = `Child age: 6\nCurrent challenge: blending sounds\nSession goal: finish 10 minutes with one confidence win`

export default function PromptTransparencyDemoPage() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground text-pretty">
        Example chat message with a prompt transparency dialog attached.
      </p>

      <Card>
        <CardContent className="space-y-3 p-4">
          <div className="text-xs text-muted-foreground">User</div>
          <p className="rounded-md border bg-muted/30 p-3 text-sm text-pretty">
            My child gets frustrated with long reading tasks. What should I try tonight?
          </p>

          <div className="text-xs text-muted-foreground">Assistant</div>
          <div className="rounded-md border bg-background p-3">
            <p className="text-sm text-pretty">
              Start with one short word family like <strong>cat, bat, hat</strong>. Read each word once,
              then have your child tap each sound as they say it. End with one easy win and praise the effort.
            </p>
            <div className="mt-2">
              <PromptViewerDialog
                label="Reading Coach"
                description="System instructions and runtime context used for this answer."
                prompt={{
                  systemPrompt: MOCK_SYSTEM_PROMPT,
                  context: async () => MOCK_CONTEXT,
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
