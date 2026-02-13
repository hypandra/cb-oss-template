export type ChangeTermKind = "internal" | "tool" | "practice"

export interface ChangeTerm {
  key: string
  label: string
  description: string
  kind: ChangeTermKind
  note?: string
}

export interface ChangeEntry {
  id: string
  title: string
  summary: string
  devNote?: string
  publishedAt: string
  tags?: string[]
  terms?: ChangeTerm[]
}

export const UPDATES: ChangeEntry[] = [
  {
    id: '2026-02-11-demo-recipes',
    title: 'Added recipe demos under /demo',
    summary:
      'You can now preview all template recipes in one place without creating an account.',
    devNote:
      'Each demo has isolated routes under /api/demo to avoid touching production app behavior.',
    publishedAt: '2026-02-11',
    tags: ['Demo', 'UX'],
    terms: [
      {
        key: 'isolated-routes',
        label: 'Isolated routes',
        description:
          'Separate endpoints used only by demos, so app endpoints stay focused on core product flows.',
        kind: 'practice',
      },
    ],
  },
  {
    id: '2026-02-07-tts-fallback',
    title: 'Speech demo now degrades to browser APIs',
    summary:
      'Voice demos keep working when API keys are missing by using built-in browser speech capabilities.',
    devNote:
      'TTS falls back to speechSynthesis and STT can rely on SpeechRecognition when available.',
    publishedAt: '2026-02-07',
    tags: ['Audio', 'Reliability'],
    terms: [
      {
        key: 'speechsynthesis',
        label: 'SpeechSynthesis',
        description: 'A browser API that reads text aloud using local/device voices.',
        kind: 'tool',
      },
    ],
  },
  {
    id: '2026-01-29-canvas-demo',
    title: 'Canvas recipe supports in-memory graph storage',
    summary:
      'The canvas demo ships with editable nodes and edges that work immediately in local development.',
    devNote:
      'Node/edge CRUD routes use process memory in demo mode to minimize setup friction.',
    publishedAt: '2026-01-29',
    tags: ['Canvas', 'DX'],
    terms: [
      {
        key: 'in-memory',
        label: 'In-memory store',
        description:
          'Data lives only while the dev server is running and resets when restarted.',
        kind: 'practice',
      },
    ],
  },
  {
    id: '2026-01-21-feedback-loop',
    title: 'Thumbs feedback flow includes role + comment capture',
    summary:
      'Negative feedback can now ask who the user is and capture a short explanation.',
    devNote:
      'Role preference is stored in localStorage so users do not need to re-select every time.',
    publishedAt: '2026-01-21',
    tags: ['Feedback'],
    terms: [
      {
        key: 'local-storage',
        label: 'localStorage',
        description: 'Small key-value browser storage used for lightweight client preferences.',
        kind: 'tool',
      },
    ],
  },
  {
    id: '2026-01-12-prompt-visibility',
    title: 'Prompt transparency dialog added to chat responses',
    summary:
      'Users can inspect the system prompt and supporting context behind generated responses.',
    devNote:
      'Prompt content supports lazy loading from async functions to reduce initial page work.',
    publishedAt: '2026-01-12',
    tags: ['AI', 'Transparency'],
    terms: [
      {
        key: 'system-prompt',
        label: 'System prompt',
        description:
          'The hidden instruction that shapes model behavior before user messages are processed.',
        kind: 'internal',
      },
    ],
  },
]
