# Feedback Review Recipe

CLI script for reviewing and managing user feedback collected by the `thumbs-feedback` recipe. Run with Bun.

## Files

- `src/types.ts` — `FeedbackRow` and `FeedbackConfig` types
- `src/review-feedback.ts` — CLI script with `list`, `address`, and `stats` commands

## Setup

1. Copy `src/review-feedback.ts` to your project's `scripts/` directory
2. Copy `src/types.ts` alongside it (or inline the types)
3. Edit the `config` object at the top of the script:

```ts
const config: FeedbackConfig = {
  tableName: 'wr_feedback',  // your prefixed table
  listLimit: 50,
}
```

### Optional: Entity Join

To show display names instead of raw IDs in `list` output, configure `entityJoin`:

```ts
const config: FeedbackConfig = {
  tableName: 'wr_feedback',
  entityJoin: {
    select: 'wr_games!inner(title)',
    table: 'wr_games',
    column: 'title',
  },
  listLimit: 50,
}
```

## Usage

```bash
# List unaddressed feedback (most recent first, up to 50)
bun scripts/review-feedback.ts list
```

```
12 unaddressed feedback entries:

  a1b2c3d4  👎  game:alphabet-dash [parent] — "Too fast for my 5yo"  (2/9/2026)
  e5f6g7h8  👍  game:word-builder  (2/8/2026)
  ...
```

```bash
# Mark feedback as addressed (supports 8-char short IDs)
bun scripts/review-feedback.ts address a1b2c3d4
```

```
Marked a1b2c3d4... as addressed.
```

```bash
# Aggregate stats by entity, sorted by thumbs-down count
bun scripts/review-feedback.ts stats
```

```
Feedback by entity (5 entities):

  Entity                           👍   👎
  ------------------------------------------
  game:alphabet-dash                 2    8
  game:word-builder                 12    3
  game:sound-match                   5    1
```

## Environment Variables

Requires Supabase service role credentials:

```
NEXT_PUBLIC_SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
```

Load from your project's `.env.local`:

```bash
source .env.local && bun scripts/review-feedback.ts list
```

## Customization

- **Table name**: Set `config.tableName` to your project's feedback table
- **Entity display**: Use `entityJoin` to show human-readable names
- **List limit**: Adjust `config.listLimit` for larger/smaller batches
- **Short IDs**: The `address` command accepts any UUID prefix (8+ chars recommended)
