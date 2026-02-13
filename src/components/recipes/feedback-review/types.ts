export interface FeedbackRow {
  id: string
  entity_type: string
  entity_id: string
  context_id: string | null
  rating: boolean
  feedback_text: string | null
  user_role: string | null
  user_id: string | null
  addressed_at: string | null
  created_at: string
}

export interface FeedbackConfig {
  /** Name of the feedback table (e.g. "wr_feedback", "kt_feedback") */
  tableName: string
  /**
   * Optional entity join for display names in list output.
   * Example: "spelling_word_bank!inner(word)" joins to show word text.
   * The joined column is accessed as (row as any)[joinTable]?.[joinColumn].
   */
  entityJoin?: {
    /** Supabase join expression (e.g. "spelling_word_bank!inner(word)") */
    select: string
    /** Table name to access from the result (e.g. "spelling_word_bank") */
    table: string
    /** Column name for display (e.g. "word") */
    column: string
  }
  /** Max items to show in list command (default: 50) */
  listLimit: number
}
