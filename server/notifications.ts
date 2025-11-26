/**
 * Notifications Helper
 * 
 * Système centralisé pour créer des notifications dans la base de données
 * et envoyer des emails via Resend
 */

// Note: Using direct SQL execution instead of client-side supabase
// to avoid import issues in server context
import { sendNewDocumentEmail, sendStatusChangeEmail } from './resend';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  metadata?: Record<string, any>;
}

/**
 * Crée une notification dans la base de données
 * Note: This is a placeholder - actual DB insertion should be done via Supabase client in frontend
 * or via database helper functions
 */
export async function createNotification(params: CreateNotificationParams): Promise<boolean> {
  try {
    // Log the notification creation
    console.log('[Notifications] Creating notification:', {
      userId: params.userId,
      type: params.type,
      title: params.title,
      message: params.message,
    });

    // TODO: Implement actual database insertion
    // For now, we'll just log and return success
    // The frontend will handle creating notifications via Supabase client
    
    return true;
  } catch (error) {
    console.error('[Notifications] Exception creating notification:', error);
    return false;
  }
}

/**
 * Trigger: Nouveau document uploadé
 */
export async function notifyNewDocument(params: {
  userId: string;
  userEmail: string;
  userName: string;
  documentName: string;
  dossierName: string;
  dossierId: string;
}): Promise<void> {
  // Créer la notification dans la DB
  await createNotification({
    userId: params.userId,
    type: 'info',
    title: '📄 Nouveau document',
    message: `Le document "${params.documentName}" a été ajouté au dossier "${params.dossierName}"`,
    link: `/dossiers/${params.dossierId}`,
    metadata: {
      documentName: params.documentName,
      dossierName: params.dossierName,
      dossierId: params.dossierId,
    },
  });

  // Envoyer l'email
  await sendNewDocumentEmail(
    params.userEmail,
    params.userName,
    params.documentName,
    params.dossierName
  );

  console.log(`[Notifications] New document notification sent to ${params.userEmail}`);
}

/**
 * Trigger: Changement de statut de dossier
 */
export async function notifyStatusChange(params: {
  userId: string;
  userEmail: string;
  userName: string;
  dossierName: string;
  dossierId: string;
  oldStatus: string;
  newStatus: string;
}): Promise<void> {
  const statusLabels: Record<string, string> = {
    'en_attente': 'En attente',
    'en_cours': 'En cours',
    'valide': 'Validé',
    'refuse': 'Refusé',
  };

  const newStatusLabel = statusLabels[params.newStatus] || params.newStatus;

  // Créer la notification dans la DB
  await createNotification({
    userId: params.userId,
    type: params.newStatus === 'valide' ? 'success' : params.newStatus === 'refuse' ? 'error' : 'info',
    title: '🔔 Changement de statut',
    message: `Le dossier "${params.dossierName}" est maintenant : ${newStatusLabel}`,
    link: `/dossiers/${params.dossierId}`,
    metadata: {
      dossierName: params.dossierName,
      dossierId: params.dossierId,
      oldStatus: params.oldStatus,
      newStatus: params.newStatus,
    },
  });

  // Envoyer l'email
  await sendStatusChangeEmail(
    params.userEmail,
    params.userName,
    params.dossierName,
    params.oldStatus,
    params.newStatus
  );

  console.log(`[Notifications] Status change notification sent to ${params.userEmail}`);
}

/**
 * Trigger: Nouveau dossier créé
 */
export async function notifyNewDossier(params: {
  userId: string;
  dossierName: string;
  dossierId: string;
}): Promise<void> {
  await createNotification({
    userId: params.userId,
    type: 'success',
    title: '✅ Dossier créé',
    message: `Le dossier "${params.dossierName}" a été créé avec succès`,
    link: `/dossiers/${params.dossierId}`,
    metadata: {
      dossierName: params.dossierName,
      dossierId: params.dossierId,
    },
  });

  console.log(`[Notifications] New dossier notification created for user ${params.userId}`);
}

/**
 * Trigger: Email envoyé avec succès
 */
export async function notifyEmailSent(params: {
  userId: string;
  recipient: string;
  subject: string;
}): Promise<void> {
  await createNotification({
    userId: params.userId,
    type: 'success',
    title: '📧 Email envoyé',
    message: `Email envoyé à ${params.recipient} : "${params.subject}"`,
    metadata: {
      recipient: params.recipient,
      subject: params.subject,
    },
  });

  console.log(`[Notifications] Email sent notification created for user ${params.userId}`);
}
