/**
 * useNotifications Hook
 * 
 * Hook personnalisé pour gérer les notifications toast et backend
 * de manière centralisée et cohérente
 */

import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';

export function useNotifications() {
  const notifyNewDocumentMutation = trpc.notifications.notifyNewDocument.useMutation();
  const notifyStatusChangeMutation = trpc.notifications.notifyStatusChange.useMutation();
  const notifyNewDossierMutation = trpc.notifications.notifyNewDossier.useMutation();
  const notifyEmailSentMutation = trpc.notifications.notifyEmailSent.useMutation();

  /**
   * Notification de succès avec toast
   */
  const success = (title: string, description?: string) => {
    toast.success(title, { description });
  };

  /**
   * Notification d'erreur avec toast
   */
  const error = (title: string, description?: string) => {
    toast.error(title, { description });
  };

  /**
   * Notification d'information avec toast
   */
  const info = (title: string, description?: string) => {
    toast.info(title, { description });
  };

  /**
   * Notification d'avertissement avec toast
   */
  const warning = (title: string, description?: string) => {
    toast.warning(title, { description });
  };

  /**
   * Notification de nouveau document (toast + DB + email)
   */
  const notifyNewDocument = async (params: {
    documentName: string;
    dossierName: string;
    dossierId: string;
  }) => {
    // Toast immédiat
    toast.success('📄 Document ajouté', {
      description: `"${params.documentName}" ajouté au dossier "${params.dossierName}"`,
      action: {
        label: 'Voir',
        onClick: () => window.location.href = `/dossiers/${params.dossierId}`,
      },
    });

    // Notification backend + email (async)
    try {
      await notifyNewDocumentMutation.mutateAsync(params);
    } catch (err) {
      console.error('Failed to send notification:', err);
    }
  };

  /**
   * Notification de changement de statut (toast + DB + email)
   */
  const notifyStatusChange = async (params: {
    dossierName: string;
    dossierId: string;
    oldStatus: string;
    newStatus: string;
  }) => {
    const statusLabels: Record<string, string> = {
      'en_attente': 'En attente',
      'en_cours': 'En cours',
      'valide': '✅ Validé',
      'refuse': '❌ Refusé',
    };

    const newStatusLabel = statusLabels[params.newStatus] || params.newStatus;

    // Toast immédiat
    const toastType = params.newStatus === 'valide' ? 'success' : params.newStatus === 'refuse' ? 'error' : 'info';
    
    toast[toastType]('🔔 Statut mis à jour', {
      description: `Dossier "${params.dossierName}" : ${newStatusLabel}`,
      action: {
        label: 'Voir',
        onClick: () => window.location.href = `/dossiers/${params.dossierId}`,
      },
    });

    // Notification backend + email (async)
    try {
      await notifyStatusChangeMutation.mutateAsync(params);
    } catch (err) {
      console.error('Failed to send notification:', err);
    }
  };

  /**
   * Notification de nouveau dossier (toast + DB)
   */
  const notifyNewDossier = async (params: {
    dossierName: string;
    dossierId: string;
  }) => {
    // Toast immédiat
    toast.success('✅ Dossier créé', {
      description: `"${params.dossierName}" a été créé avec succès`,
      action: {
        label: 'Voir',
        onClick: () => window.location.href = `/dossiers/${params.dossierId}`,
      },
    });

    // Notification backend (async)
    try {
      await notifyNewDossierMutation.mutateAsync(params);
    } catch (err) {
      console.error('Failed to send notification:', err);
    }
  };

  /**
   * Notification d'email envoyé (toast + DB)
   */
  const notifyEmailSent = async (params: {
    recipient: string;
    subject: string;
  }) => {
    // Toast immédiat
    toast.success('📧 Email envoyé', {
      description: `Email envoyé à ${params.recipient}`,
    });

    // Notification backend (async)
    try {
      await notifyEmailSentMutation.mutateAsync(params);
    } catch (err) {
      console.error('Failed to send notification:', err);
    }
  };

  return {
    success,
    error,
    info,
    warning,
    notifyNewDocument,
    notifyStatusChange,
    notifyNewDossier,
    notifyEmailSent,
  };
}
