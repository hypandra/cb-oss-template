-- Feedback table for thumbs up/down ratings with optional comments.
-- Replace "cb_feedback" with your project's prefixed table name (e.g. wr_feedback, kt_feedback).

CREATE TABLE cb_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  context_id TEXT,
  rating BOOLEAN NOT NULL,
  feedback_text TEXT,
  user_role TEXT,
  user_id TEXT,
  addressed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for admin review: find unaddressed feedback
CREATE INDEX idx_cb_feedback_unaddressed
  ON cb_feedback (created_at DESC)
  WHERE addressed_at IS NULL;

-- Index for entity lookup: find all feedback for a specific entity
CREATE INDEX idx_cb_feedback_entity
  ON cb_feedback (entity_type, entity_id);

-- RLS policies
ALTER TABLE cb_feedback ENABLE ROW LEVEL SECURITY;

-- Anyone can insert feedback
CREATE POLICY "cb_feedback_insert" ON cb_feedback
  FOR INSERT WITH CHECK (true);

-- Only authenticated users can read (for admin review)
-- Adjust this policy based on your auth setup
CREATE POLICY "cb_feedback_select" ON cb_feedback
  FOR SELECT USING (auth.role() = 'authenticated');
