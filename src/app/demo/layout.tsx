'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const RECIPE_LABELS: Record<string, string> = {
  'prompt-transparency': 'Prompt Transparency',
  'thumbs-feedback': 'Thumbs Feedback',
  changelog: 'Changelog',
  'image-refinement': 'Image Refinement',
  canvas: 'ReactFlow Canvas',
  tts: 'STT + TTS',
  'multi-llm': 'Multi-LLM Orchestration',
  'feedback-review': 'Feedback Review CLI',
}

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const segment = pathname.split('/')[2] || ''
  const title = segment ? RECIPE_LABELS[segment] || segment : 'Recipe Demos'

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <div>
            <p className="text-xs uppercase text-muted-foreground">Demo</p>
            <h1 className="text-xl font-semibold text-balance">{title}</h1>
          </div>
          <Link href="/demo" className="text-sm text-muted-foreground underline-offset-4 hover:underline">
            Back to all demos
          </Link>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-4 py-6">{children}</main>
    </div>
  )
}
