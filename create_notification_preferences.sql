-- Table pour stocker les préférences de notifications des utilisateurs
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Préférences par canal
  enable_toast BOOLEAN DEFAULT true,
  enable_email BOOLEAN DEFAULT true,
  enable_push BOOLEAN DEFAULT false,
  
  -- Préférences par type de notification
  notify_new_dossier BOOLEAN DEFAULT true,
  notify_new_document BOOLEAN DEFAULT true,
  notify_status_change BOOLEAN DEFAULT true,
  notify_email_sent BOOLEAN DEFAULT true,
  
  -- Métadonnées
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Contrainte unique par utilisateur
  UNIQUE(user_id)
);

-- Index pour recherche rapide par user_id
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id 
ON notification_preferences(user_id);

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_notification_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour updated_at
DROP TRIGGER IF EXISTS trigger_update_notification_preferences_updated_at 
ON notification_preferences;

CREATE TRIGGER trigger_update_notification_preferences_updated_at
BEFORE UPDATE ON notification_preferences
FOR EACH ROW
EXECUTE FUNCTION update_notification_preferences_updated_at();

-- Commentaires pour documentation
COMMENT ON TABLE notification_preferences IS 'Préférences de notifications des utilisateurs';
COMMENT ON COLUMN notification_preferences.enable_toast IS 'Activer les notifications toast (popup)';
COMMENT ON COLUMN notification_preferences.enable_email IS 'Activer les notifications par email';
COMMENT ON COLUMN notification_preferences.enable_push IS 'Activer les notifications push (navigateur)';
COMMENT ON COLUMN notification_preferences.notify_new_dossier IS 'Notifier lors de la création d''un dossier';
COMMENT ON COLUMN notification_preferences.notify_new_document IS 'Notifier lors de l''upload d''un document';
COMMENT ON COLUMN notification_preferences.notify_status_change IS 'Notifier lors du changement de statut';
COMMENT ON COLUMN notification_preferences.notify_email_sent IS 'Notifier lors de l''envoi d''un email';
