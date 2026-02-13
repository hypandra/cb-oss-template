# Changelog

A typed, parent-friendly changelog with "Builder notes" and a "Terms we used" glossary per entry. Makes product changes visible and educational.

## Files

- `src/changes.ts` — Types and data array
- `src/ChangesPage.tsx` — Client component with sort and show more/less
- `example/footer-link.tsx` — Footer link snippet

## Why This Pattern

Three features make this more than a standard changelog:

1. **Builder notes** — Short technical context shown in a muted callout. Parents see how the system works without hiding the seams (seamfulness).
2. **Terms we used** — A collapsible inline glossary per entry. Teaches parents new concepts as the product evolves (learning transparency).
3. **Term kinds** — Each term is tagged `internal` (our name), `tool` (third-party), or `practice` (a method). This surfaces what's a design choice vs. what's imposed by a dependency.

## Data Structure

```ts
export type ChangeTermKind = "internal" | "tool" | "practice"

export interface ChangeTerm {
  key: string
  label: string
  description: string
  kind: ChangeTermKind
  note?: string       // e.g. "Our name; we can rename it later."
}

export interface ChangeEntry {
  id: string           // YYYY-MM-DD-slug
  title: string
  summary: string      // Plain language for caregivers
  devNote?: string     // Shown as "Builder note"
  publishedAt: string  // ISO date for sorting
  tags?: string[]
  terms?: ChangeTerm[]
}

export const UPDATES: ChangeEntry[] = []
```

## Populating Entries

Use `git log --oneline` as the source. For each user-visible change:

1. Write a plain-language `title` and `summary` (assume the reader is a parent, not a developer)
2. Add a `devNote` with short technical context
3. Add `terms` when a new concept appears — keep definitions short and friendly
4. Use ISO dates in `publishedAt` so sorting works
5. Tag with 1-2 categories (e.g. `AI`, `Games`, `Privacy`, `UI`)

## File Placement

```
data/changes.ts          # Typed UPDATES array
app/changes/page.tsx     # UI component
components/Footer.tsx    # Add link to /changes
```

## Footer Link

Add to your footer:

```tsx
<Link href="/changes" className="hover:text-bark/60 hover:underline">
  Changes
</Link>
```

## Styling

The page component uses your project's Tailwind tokens. Adapt `bg-cream`, `text-bark`, `font-display` etc. to match your theme. The "Terms we used" kind badges use standard Tailwind colors:

- Internal: emerald
- Tool: sky
- Practice: amber

## Origin

Extracted from WBZero (`src/data/changes.ts`, `src/app/(app)/changes/page.tsx`) and adapted for WildReader. The pattern works across CB builds with different styling.
