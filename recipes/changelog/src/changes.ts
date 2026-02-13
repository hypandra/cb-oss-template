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
  // Add entries here. Example:
  // {
  //   id: "2026-01-01-initial-launch",
  //   title: "First working version",
  //   summary: "The app is live with core features.",
  //   devNote: "Initial commit with auth, database, and basic UI.",
  //   publishedAt: "2026-01-01",
  //   tags: ["Launch"],
  //   terms: [
  //     {
  //       key: "betterauth",
  //       label: "BetterAuth",
  //       description: "The login system this app uses.",
  //       kind: "tool",
  //       note: "We chose it; we could swap later.",
  //     },
  //   ],
  // },
]
