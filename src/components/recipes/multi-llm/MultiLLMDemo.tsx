'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { PromptViewerDialog } from '@/components/recipes/prompt-transparency/PromptViewerDialog'
import ThumbsFeedback from '@/components/recipes/thumbs-feedback/ThumbsFeedback'
import { QUERY_SYSTEM_PROMPT, SUMMARY_SYSTEM_PROMPT } from '@/components/recipes/multi-llm/prompts'

interface MultiLLMDemoProps {
  hasConfig: boolean
}

interface DemoResult {
  mode?: 'live' | 'mock'
  message?: string
  plan?: {
    objective: string
    searchQueries: string[]
  }
  package?: {
    headline: string
    intro: string
    summary: string
    sources: Array<{ title: string; url: string; notes: string }>
    followups?: string[]
  }
  error?: string
}

export function MultiLLMDemo({ hasConfig }: MultiLLMDemoProps) {
  const [prompt, setPrompt] = useState('Find research-backed reading comprehension strategies for early readers.')
  const [result, setResult] = useState<DemoResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const run = async () => {
    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/demo/orchestrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          context: {
            document: {
              id: 'demo-doc',
              title: 'Reading Plan Draft',
              content: 'Need practical and evidence-based techniques for grade K-2 home reading sessions.',
            },
          },
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        setResult({ error: data.error || 'Request failed' })
      } else {
        setResult(data)
      }
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : 'Request failed'
      setResult({ error: message })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {!hasConfig ? (
        <p className="text-sm text-muted-foreground text-pretty">
          Missing API keys. The orchestrator is running in mock mode until <code>OPENROUTER_API_KEY</code> and
          <code> PARALLEL_API_KEY</code> are configured.
        </p>
      ) : null}

      <Card>
        <CardContent className="space-y-3 p-4">
          <Textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} className="min-h-24" />
          <Button onClick={run} disabled={isLoading || !prompt.trim()}>
            {isLoading ? 'Running...' : 'Run orchestration'}
          </Button>
        </CardContent>
      </Card>

      {result?.error ? (
        <Card>
          <CardContent className="p-4 text-sm text-destructive">{result.error}</CardContent>
        </Card>
      ) : null}

      {result?.package ? (
        <Card>
          <CardContent className="space-y-3 p-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-base font-semibold text-balance">{result.package.headline}</h2>
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-black/60 text-white px-1.5 py-0.5 rounded whitespace-nowrap">
                  AI-written · Claude 3.5 Haiku via OpenRouter
                </span>
                <span className="text-xs text-muted-foreground uppercase">{result.mode || 'live'}</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground text-pretty">{result.package.intro}</p>
            <p className="text-sm text-pretty">{result.package.summary}</p>

            {result.plan ? (
              <div className="rounded border bg-muted/30 p-2 text-xs">
                <p className="font-medium">Objective</p>
                <p className="text-muted-foreground text-pretty">{result.plan.objective}</p>
              </div>
            ) : null}

            <div className="space-y-2">
              {result.package.sources.map((source) => (
                <div key={source.url} className="rounded border p-3">
                  <a href={source.url} target="_blank" rel="noreferrer" className="text-sm font-medium underline">
                    {source.title}
                  </a>
                  <p className="mt-1 text-xs text-muted-foreground text-pretty">
                    <span className="italic text-muted-foreground/60">AI note:</span> {source.notes}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between border-t pt-3">
              <PromptViewerDialog
                label="Multi-LLM Orchestration"
                description="Two LLM calls power this result: a planner that generates search queries, and a summarizer that packages the findings."
                prompt={{
                  systemPrompt: QUERY_SYSTEM_PROMPT + '\n\n---\n\n' + SUMMARY_SYSTEM_PROMPT,
                  context: 'Planning model: anthropic/claude-3.5-haiku (temp 0.5)\nSummary model: anthropic/claude-3.5-haiku (temp 0.4)\nSearch: Parallel AI web search API\nProvider: OpenRouter',
                }}
              />
              <ThumbsFeedback
                entityType="demo-research"
                entityId={`research-${Date.now()}`}
                prompt="Was this research helpful?"
                textPlaceholder="What was missing?"
                endpoint="/api/demo/feedback"
                disableNetwork
              />
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
