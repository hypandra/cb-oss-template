# Thumbs Feedback Recipe

Drop-in thumbs up/down feedback component for CB projects. Merges patterns from SpellBetterNow (clean 3-state flow) and Sawtheball (role picker).

## Files

- `src/types.ts` — shared types for payload and component props
- `src/ThumbsFeedback.tsx` — client component (React + Tailwind)
- `example/api/feedback/route.ts` — Next.js API route with BetterAuth session check
- `example/migration.sql` — Supabase table, indexes, and RLS policies

## Quick Start

1. Copy `src/` files into your project's components directory
2. Copy `example/migration.sql`, rename the table to your prefix (e.g. `wr_feedback`)
3. Copy `example/api/feedback/route.ts` to `app/api/feedback/route.ts`
4. Run the migration

## Usage

### Basic

```tsx
<ThumbsFeedback entityType="game" entityId={gameSlug} />
```

### With Roles

```tsx
<ThumbsFeedback
  entityType="puzzle"
  entityId={puzzleId}
  roles={['student', 'teacher', 'parent']}
  prompt="Was this round fun?"
/>
```

### Anonymous Mode

For unauthenticated projects, modify the API route:
- Remove the BetterAuth session check
- Pass `user_id: null` (or a session/device ID)

```tsx
<ThumbsFeedback
  entityType="message"
  entityId={messageId}
  endpoint="/api/feedback"
/>
```

### With Callback

```tsx
<ThumbsFeedback
  entityType="word"
  entityId={wordId}
  onSubmit={(payload) => {
    console.log('Feedback submitted:', payload)
  }}
/>
```

## Component Flow

1. **Idle**: Shows prompt text + 👍 👎 buttons
2. **Thumbs up**: Submits immediately (fire-and-forget), shows "Thanks"
3. **Thumbs down** (with `roles` prop, no saved role): Shows role picker
4. **Thumbs down** (role saved or no `roles` prop): Shows text input with Send/Skip
5. **Submitted**: Shows "Thanks for the feedback"

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `entityType` | `string` | required | What's being rated |
| `entityId` | `string` | required | Unique ID of the entity |
| `contextId` | `string` | — | Secondary context (attemptId, sessionId) |
| `prompt` | `string` | "Was this helpful?" | Text next to thumbs |
| `textPlaceholder` | `string` | "What went wrong?" | Input placeholder |
| `roles` | `string[]` | — | Enables role picker |
| `roleStorageKey` | `string` | "cb-feedback-role" | localStorage key for role |
| `endpoint` | `string` | "/api/feedback" | POST endpoint |
| `onSubmit` | `function` | — | Callback with payload |

## Customization

- **Table name**: Change `cb_feedback` in migration and API route to your prefix
- **Styling**: Component uses Tailwind with neutral zinc colors — override or adjust to match your theme
- **Auth**: The example route uses BetterAuth. For Supabase Auth or no auth, modify the session check
- **RLS**: Adjust the SELECT policy based on your admin access pattern
