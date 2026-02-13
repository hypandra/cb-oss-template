'use client'

import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { ChangeEntry, ChangeTerm } from '@/components/recipes/changelog/changes'
import { UPDATES } from '@/components/recipes/changelog/changes'

const sortUpdates = (updates: ChangeEntry[], order: 'desc' | 'asc') => {
  return [...updates].sort((a, b) =>
    order === 'desc'
      ? b.publishedAt.localeCompare(a.publishedAt)
      : a.publishedAt.localeCompare(b.publishedAt)
  )
}

const kindLabel = (kind: ChangeTerm['kind']) => {
  if (kind === 'internal') return 'Internal'
  if (kind === 'tool') return 'Tool'
  return 'Practice'
}

const kindStyles = (kind: ChangeTerm['kind']) => {
  if (kind === 'internal') return 'border-emerald-200 bg-emerald-50 text-emerald-800'
  if (kind === 'tool') return 'border-sky-200 bg-sky-50 text-sky-800'
  return 'border-amber-200 bg-amber-50 text-amber-800'
}

export function ChangesPage() {
  const [order, setOrder] = useState<'desc' | 'asc'>('desc')
  const [showAll, setShowAll] = useState(false)
  const sorted = useMemo(() => sortUpdates(UPDATES, order), [order])
  const visible = showAll ? sorted : sorted.slice(0, 4)

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground text-pretty">
          Realistic release notes with short builder context and terms used.
        </p>
        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            variant={order === 'desc' ? 'default' : 'outline'}
            onClick={() => setOrder('desc')}
          >
            Latest first
          </Button>
          <Button
            type="button"
            size="sm"
            variant={order === 'asc' ? 'default' : 'outline'}
            onClick={() => setOrder('asc')}
          >
            Oldest first
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {visible.map((update) => (
          <Card key={update.id}>
            <CardContent className="space-y-3 p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h2 className="font-semibold text-balance">{update.title}</h2>
                  <p className="text-xs text-muted-foreground tabular-nums">{update.publishedAt}</p>
                </div>
                {update.tags?.length ? (
                  <div className="flex flex-wrap gap-1">
                    {update.tags.map((tag) => (
                      <span key={tag} className="rounded border px-2 py-0.5 text-[11px] text-muted-foreground">
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>

              <p className="text-sm text-pretty">{update.summary}</p>

              {update.devNote ? (
                <div className="rounded border bg-muted/30 p-2 text-xs text-muted-foreground text-pretty">
                  <span className="font-medium text-foreground">Builder note:</span> {update.devNote}
                </div>
              ) : null}

              {update.terms?.length ? (
                <details className="rounded border bg-muted/10 p-2">
                  <summary className="cursor-pointer text-xs font-medium text-muted-foreground">
                    Terms we used
                  </summary>
                  <div className="mt-2 space-y-2">
                    {update.terms.map((term) => (
                      <div key={term.key} className="rounded border bg-background p-2 text-xs">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold">{term.label}</span>
                          <span className={`rounded-full border px-2 py-0.5 text-[10px] ${kindStyles(term.kind)}`}>
                            {kindLabel(term.kind)}
                          </span>
                        </div>
                        <p className="mt-1 text-muted-foreground text-pretty">{term.description}</p>
                        {term.note ? (
                          <p className="mt-1 text-muted-foreground text-pretty">{term.note}</p>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </details>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>

      {sorted.length > 4 ? (
        <Button type="button" variant="ghost" size="sm" onClick={() => setShowAll((prev) => !prev)}>
          {showAll ? 'Show fewer updates' : 'See more updates'}
        </Button>
      ) : null}
    </div>
  )
}

export default ChangesPage
