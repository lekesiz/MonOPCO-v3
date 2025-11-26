-- Notifications table for MonOPCO v3
-- This table stores real-time notifications for users

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('document', 'email', 'dossier', 'system')),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  related_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- RLS Policies
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can view own notifications
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create own notifications
CREATE POLICY "Users can create own notifications"
  ON notifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete own notifications
CREATE POLICY "Users can delete own notifications"
  ON notifications FOR DELETE
  USING (auth.uid() = user_id);

-- Enable Realtime for notifications table
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

COMMENT ON TABLE notifications IS 'Stores user notifications for real-time updates';
COMMENT ON COLUMN notifications.type IS 'Type of notification: document, email, dossier, or system';
COMMENT ON COLUMN notifications.read IS 'Whether the notification has been read by the user';
COMMENT ON COLUMN notifications.related_id IS 'Optional reference to the related entity (document_id, email_id, etc.)';
