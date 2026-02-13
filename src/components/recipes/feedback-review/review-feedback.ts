/**
 * Review and manage user feedback from the cb_feedback table.
 *
 * Usage:
 *   bun scripts/review-feedback.ts list          # Show unaddressed feedback
 *   bun scripts/review-feedback.ts address <id>  # Mark feedback as addressed
 *   bun scripts/review-feedback.ts stats         # Summary stats by entity
 *
 * Supports 8-char short IDs for the address command.
 */

import { createClient } from '@supabase/supabase-js'
import type { FeedbackConfig, FeedbackRow } from '@/components/recipes/feedback-review/types'

// ---- CONFIGURE THIS ----
const config: FeedbackConfig = {
  tableName: 'cb_feedback',
  // entityJoin: {
  //   select: 'your_entity_table!inner(name)',
  //   table: 'your_entity_table',
  //   column: 'name',
  // },
  listLimit: 50,
}
// ---- END CONFIG ----

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

const [, , command, ...args] = process.argv

async function listUnaddressed() {
  const selectCols = [
    'id',
    'entity_type',
    'entity_id',
    'rating',
    'feedback_text',
    'user_role',
    'created_at',
  ].join(', ')

  const selectExpr = config.entityJoin
    ? `${selectCols}, ${config.entityJoin.select}`
    : selectCols

  const { data, error } = await supabase
    .from(config.tableName)
    .select(selectExpr)
    .is('addressed_at', null)
    .order('created_at', { ascending: false })
    .limit(config.listLimit)

  if (error) {
    console.error('Error:', error.message)
    return
  }

  if (!data || data.length === 0) {
    console.log('No unaddressed feedback.')
    return
  }

  console.log(`\n${data.length} unaddressed feedback entries:\n`)
  for (const row of data as any[]) {
    const entityLabel = config.entityJoin
      ? row[config.entityJoin.table]?.[config.entityJoin.column] ?? row.entity_id
      : row.entity_id
    const rating = row.rating ? '👍' : '👎'
    const text = row.feedback_text ? ` — "${row.feedback_text}"` : ''
    const role = row.user_role ? ` [${row.user_role}]` : ''
    const date = new Date(row.created_at).toLocaleDateString()
    console.log(
      `  ${row.id.slice(0, 8)}  ${rating}  ${row.entity_type}:${entityLabel}${role}${text}  (${date})`
    )
  }
}

async function addressFeedback(idPrefix: string) {
  // Support 8-char short IDs by matching with ilike
  if (idPrefix.length < 36) {
    const { data, error } = await supabase
      .from(config.tableName)
      .select('id')
      .ilike('id', `${idPrefix}%`)
      .is('addressed_at', null)

    if (error) {
      console.error('Error:', error.message)
      return
    }

    if (!data || data.length === 0) {
      console.error(`No unaddressed feedback matching "${idPrefix}".`)
      return
    }

    if (data.length > 1) {
      console.error(
        `Ambiguous: ${data.length} entries match "${idPrefix}". Use a longer prefix.`
      )
      return
    }

    idPrefix = data[0].id
  }

  const { error } = await supabase
    .from(config.tableName)
    .update({ addressed_at: new Date().toISOString() })
    .eq('id', idPrefix)

  if (error) {
    console.error('Error:', error.message)
    return
  }

  console.log(`Marked ${idPrefix.slice(0, 8)}... as addressed.`)
}

async function showStats() {
  const { data, error } = await supabase
    .from(config.tableName)
    .select('entity_type, entity_id, rating')
    .is('addressed_at', null)

  if (error) {
    console.error('Error:', error.message)
    return
  }

  if (!data || data.length === 0) {
    console.log('No unaddressed feedback.')
    return
  }

  const byEntity = new Map<string, { up: number; down: number }>()
  for (const row of data) {
    const key = `${row.entity_type}:${row.entity_id}`
    const existing = byEntity.get(key) ?? { up: 0, down: 0 }
    if (row.rating) {
      existing.up++
    } else {
      existing.down++
    }
    byEntity.set(key, existing)
  }

  const sorted = [...byEntity.entries()].sort(
    ([, a], [, b]) => b.down - a.down
  )

  console.log(`\nFeedback by entity (${sorted.length} entities):\n`)
  console.log('  Entity                           👍   👎')
  console.log('  ' + '-'.repeat(42))
  for (const [entity, { up, down }] of sorted) {
    console.log(
      `  ${entity.padEnd(32)} ${String(up).padStart(3)}  ${String(down).padStart(3)}`
    )
  }
}

switch (command) {
  case 'list':
    await listUnaddressed()
    break
  case 'address':
    if (!args[0]) {
      console.error('Usage: bun scripts/review-feedback.ts address <id>')
      process.exit(1)
    }
    await addressFeedback(args[0])
    break
  case 'stats':
    await showStats()
    break
  default:
    console.log('Usage:')
    console.log('  bun scripts/review-feedback.ts list          # Unaddressed feedback')
    console.log('  bun scripts/review-feedback.ts address <id>  # Mark as addressed')
    console.log('  bun scripts/review-feedback.ts stats         # Stats by entity')
}
