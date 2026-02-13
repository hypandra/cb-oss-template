import { NextRequest, NextResponse } from 'next/server'
import { buildContextSummary } from '@/components/recipes/multi-llm/context'
import {
  orchestrateQuerySearchSummaries,
  sanitizeMessages,
} from '@/components/recipes/multi-llm/orchestrator'
import type {
  ChatMessage,
  OrchestrationContext,
  SummaryPackage,
} from '@/components/recipes/multi-llm/types'

const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL ?? 'anthropic/claude-3.5-haiku'

function buildMockPackage(topic: string): SummaryPackage {
  return {
    intro: 'Mock mode is active. Configure API keys to run live orchestration.',
    headline: 'Starter research bundle',
    summary:
      'Use this as a scaffold while wiring credentials. The UI and orchestration flow are fully wired and ready for live data.',
    sources: [
      {
        title: `Sample source for: ${topic}`,
        url: 'https://example.com/source-1',
        notes: 'Demonstrates source packaging and rationale text in the response UI.',
      },
      {
        title: 'Evidence-based literacy overview',
        url: 'https://example.com/source-2',
        notes: 'Placeholder citation to demonstrate multi-source summaries.',
      },
      {
        title: 'At-home reading routines',
        url: 'https://example.com/source-3',
        notes: 'Shows how follow-up research links are rendered for users.',
      },
    ],
    followups: ['Which source should we trust most and why?', 'What is the simplest first experiment to run?'],
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const messages = Array.isArray(body?.messages) ? body.messages : []
  const context = body?.context as OrchestrationContext | undefined

  const sanitizedMessages = sanitizeMessages(messages as ChatMessage[])
  const lastUserMessage = [...sanitizedMessages].reverse().find((message) => message.role === 'user')

  const seedPrompt = lastUserMessage?.content ?? 'Summarize the most relevant sources for the user.'
  const contextSummary = buildContextSummary(context)

  const openRouterApiKey = process.env.OPENROUTER_API_KEY
  const parallelApiKey = process.env.PARALLEL_API_KEY

  if (!openRouterApiKey || !parallelApiKey) {
    return NextResponse.json({
      mode: 'mock',
      message: 'Mock orchestration response',
      package: buildMockPackage(seedPrompt),
      plan: {
        objective: `Find practical sources for: ${seedPrompt}`,
        searchQueries: [
          `${seedPrompt} evidence`,
          `${seedPrompt} implementation guide`,
          `${seedPrompt} expert recommendations`,
        ],
      },
      results: [],
    })
  }

  try {
    const result = await orchestrateQuerySearchSummaries({
      config: {
        openRouterApiKey,
        openRouterModel: OPENROUTER_MODEL,
        openRouterSiteUrl: process.env.OPENROUTER_SITE_URL,
        openRouterAppName: process.env.OPENROUTER_APP_NAME,
        parallelApiKey,
      },
      contextSummary,
      seedPrompt,
    })

    return NextResponse.json({
      mode: 'live',
      message: result.summary.intro,
      package: result.summary,
      plan: result.plan,
      results: result.results,
    })
  } catch (error) {
    console.error('Multi-LLM orchestrator error:', error)
    return NextResponse.json({ error: 'Orchestration failed' }, { status: 502 })
  }
}
