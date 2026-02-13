import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'

const OUTPUT = `12 unaddressed feedback entries:

  a1b2c3d4  👎  game:alphabet-dash [parent] — "Too fast for my 5yo"  (2/9/2026)
  e5f6g7h8  👍  game:word-builder  (2/8/2026)
  ...

Feedback by entity (5 entities):

  Entity                           👍   👎
  ------------------------------------------
  game:alphabet-dash                 2    8
  game:word-builder                 12    3`

export default function FeedbackReviewDemoPage() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground text-pretty">
        This recipe is a Bun CLI script for triaging feedback from the thumbs-feedback table.
      </p>

      <Card>
        <CardContent className="space-y-3 p-4">
          <div className="space-y-1 text-sm">
            <p><code>bun scripts/review-feedback.ts list</code></p>
            <p><code>bun scripts/review-feedback.ts address a1b2c3d4</code></p>
            <p><code>bun scripts/review-feedback.ts stats</code></p>
          </div>
          <pre className="overflow-x-auto rounded border bg-muted/40 p-3 text-xs">{OUTPUT}</pre>
          <p className="text-sm">
            <Link
              href="https://github.com/curiosity-builds/cb-oss-template/tree/main/recipes/feedback-review"
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
              View recipe source
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
