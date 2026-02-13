export interface FeedbackPayload {
  entityType: string
  entityId: string
  contextId?: string
  rating: boolean
  feedbackText?: string
  userRole?: string
}

export interface ThumbsFeedbackProps {
  /** What kind of thing is being rated (e.g. "game", "word", "message") */
  entityType: string
  /** Unique ID for the entity being rated */
  entityId: string
  /** Optional secondary context (e.g. questionId, attemptId, sessionId) */
  contextId?: string
  /** Prompt text shown next to thumbs (default: "Was this helpful?") */
  prompt?: string
  /** Placeholder for text input on thumbs-down (default: "What went wrong?") */
  textPlaceholder?: string
  /** If provided, shows a role picker before comment. Persisted to localStorage. */
  roles?: string[]
  /** localStorage key for persisting selected role (default: "cb-feedback-role") */
  roleStorageKey?: string
  /** API endpoint to POST feedback (default: "/api/feedback") */
  endpoint?: string
  /** Keep feedback local in the UI and skip network calls. */
  disableNetwork?: boolean
  /** Optional callback after submission (receives the payload) */
  onSubmit?: (payload: FeedbackPayload) => void
}
