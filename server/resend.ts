/**
 * Resend Email Service
 * 
 * Service professionnel pour l'envoi d'emails transactionnels et notifications
 * via l'API Resend.com
 * 
 * Documentation: https://resend.com/docs
 */

import { Resend } from 'resend';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = 'MonOPCO <noreply@monopco.fr>'; // À personnaliser avec votre domaine vérifié

// Initialize Resend client
let resendClient: Resend | null = null;

function getResendClient(): Resend {
  if (!RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not configured');
  }
  
  if (!resendClient) {
    resendClient = new Resend(RESEND_API_KEY);
  }
  
  return resendClient;
}

export interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  tags?: { name: string; value: string }[];
}

export interface SendEmailResult {
  success: boolean;
  id?: string;
  error?: string;
}

/**
 * Envoie un email via Resend
 * @param params - Paramètres de l'email
 * @returns Résultat de l'envoi
 */
export async function sendEmail(params: SendEmailParams): Promise<SendEmailResult> {
  try {
    const client = getResendClient();
    
    const { data, error } = await client.emails.send({
      from: FROM_EMAIL,
      to: params.to,
      subject: params.subject,
      html: params.html,
      text: params.text,
      replyTo: params.replyTo,
      tags: params.tags,
    });

    if (error) {
      console.error('[Resend] Error sending email:', error);
      return {
        success: false,
        error: error.message || 'Failed to send email',
      };
    }

    console.log('[Resend] Email sent successfully:', data?.id);
    return {
      success: true,
      id: data?.id,
    };
  } catch (error: any) {
    console.error('[Resend] Exception sending email:', error);
    return {
      success: false,
      error: error.message || 'Exception occurred while sending email',
    };
  }
}

/**
 * Email de bienvenue après inscription
 */
export async function sendWelcomeEmail(to: string, userName: string): Promise<SendEmailResult> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bienvenue sur MonOPCO</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 0;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                      Bienvenue sur MonOPCO ! 🎉
                    </h1>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px 30px;">
                    <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                      Bonjour <strong>${userName}</strong>,
                    </p>
                    
                    <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                      Nous sommes ravis de vous accueillir sur <strong>MonOPCO</strong>, votre plateforme de gestion de formations professionnelles.
                    </p>
                    
                    <p style="margin: 0 0 30px; color: #333333; font-size: 16px; line-height: 1.6;">
                      Vous pouvez désormais :
                    </p>
                    
                    <ul style="margin: 0 0 30px; padding-left: 20px; color: #333333; font-size: 16px; line-height: 1.8;">
                      <li>Créer et gérer vos dossiers OPCO</li>
                      <li>Uploader et organiser vos documents</li>
                      <li>Envoyer des emails professionnels</li>
                      <li>Suivre l'avancement de vos demandes</li>
                    </ul>
                    
                    <div style="text-align: center; margin: 30px 0;">
                      <a href="https://monopco.fr/dashboard" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-size: 16px; font-weight: 600;">
                        Accéder à mon tableau de bord
                      </a>
                    </div>
                    
                    <p style="margin: 30px 0 0; color: #666666; font-size: 14px; line-height: 1.6;">
                      Besoin d'aide ? N'hésitez pas à nous contacter à <a href="mailto:support@monopco.fr" style="color: #667eea; text-decoration: none;">support@monopco.fr</a>
                    </p>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
                    <p style="margin: 0 0 10px; color: #6c757d; font-size: 14px;">
                      © 2025 MonOPCO. Tous droits réservés.
                    </p>
                    <p style="margin: 0; color: #6c757d; font-size: 12px;">
                      Cet email a été envoyé à ${to}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  const text = `
Bienvenue sur MonOPCO !

Bonjour ${userName},

Nous sommes ravis de vous accueillir sur MonOPCO, votre plateforme de gestion de formations professionnelles.

Vous pouvez désormais :
- Créer et gérer vos dossiers OPCO
- Uploader et organiser vos documents
- Envoyer des emails professionnels
- Suivre l'avancement de vos demandes

Accédez à votre tableau de bord : https://monopco.fr/dashboard

Besoin d'aide ? Contactez-nous à support@monopco.fr

© 2025 MonOPCO. Tous droits réservés.
  `;

  return sendEmail({
    to,
    subject: '🎉 Bienvenue sur MonOPCO !',
    html,
    text,
    tags: [
      { name: 'category', value: 'welcome' },
      { name: 'user_type', value: 'new' },
    ],
  });
}

/**
 * Email de notification de nouveau document
 */
export async function sendNewDocumentEmail(
  to: string,
  userName: string,
  documentName: string,
  dossierName: string
): Promise<SendEmailResult> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Nouveau document ajouté</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 0;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">
                      📄 Nouveau Document
                    </h1>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px 30px;">
                    <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                      Bonjour <strong>${userName}</strong>,
                    </p>
                    
                    <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                      Un nouveau document a été ajouté à votre dossier :
                    </p>
                    
                    <div style="background-color: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; border-radius: 4px;">
                      <p style="margin: 0 0 10px; color: #333333; font-size: 14px;">
                        <strong>Dossier :</strong> ${dossierName}
                      </p>
                      <p style="margin: 0; color: #333333; font-size: 14px;">
                        <strong>Document :</strong> ${documentName}
                      </p>
                    </div>
                    
                    <div style="text-align: center; margin: 30px 0;">
                      <a href="https://monopco.fr/dashboard" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-size: 16px; font-weight: 600;">
                        Voir le document
                      </a>
                    </div>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
                    <p style="margin: 0; color: #6c757d; font-size: 12px;">
                      © 2025 MonOPCO. Tous droits réservés.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  return sendEmail({
    to,
    subject: `📄 Nouveau document : ${documentName}`,
    html,
    tags: [
      { name: 'category', value: 'notification' },
      { name: 'type', value: 'new_document' },
    ],
  });
}

/**
 * Email de changement de statut de dossier
 */
export async function sendStatusChangeEmail(
  to: string,
  userName: string,
  dossierName: string,
  oldStatus: string,
  newStatus: string
): Promise<SendEmailResult> {
  const statusColors: Record<string, string> = {
    'en_attente': '#ffc107',
    'en_cours': '#2196f3',
    'valide': '#4caf50',
    'refuse': '#f44336',
  };

  const statusLabels: Record<string, string> = {
    'en_attente': 'En attente',
    'en_cours': 'En cours',
    'valide': 'Validé',
    'refuse': 'Refusé',
  };

  const color = statusColors[newStatus] || '#667eea';
  const label = statusLabels[newStatus] || newStatus;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Changement de statut</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 0;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">
                      🔔 Changement de Statut
                    </h1>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px 30px;">
                    <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                      Bonjour <strong>${userName}</strong>,
                    </p>
                    
                    <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                      Le statut de votre dossier a été mis à jour :
                    </p>
                    
                    <div style="background-color: #f8f9fa; border-left: 4px solid ${color}; padding: 20px; margin: 20px 0; border-radius: 4px;">
                      <p style="margin: 0 0 15px; color: #333333; font-size: 14px;">
                        <strong>Dossier :</strong> ${dossierName}
                      </p>
                      <p style="margin: 0; color: #333333; font-size: 14px;">
                        <strong>Nouveau statut :</strong> 
                        <span style="display: inline-block; background-color: ${color}; color: #ffffff; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; margin-left: 8px;">
                          ${label}
                        </span>
                      </p>
                    </div>
                    
                    <div style="text-align: center; margin: 30px 0;">
                      <a href="https://monopco.fr/dashboard" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-size: 16px; font-weight: 600;">
                        Voir le dossier
                      </a>
                    </div>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
                    <p style="margin: 0; color: #6c757d; font-size: 12px;">
                      © 2025 MonOPCO. Tous droits réservés.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  return sendEmail({
    to,
    subject: `🔔 Dossier "${dossierName}" - Statut : ${label}`,
    html,
    tags: [
      { name: 'category', value: 'notification' },
      { name: 'type', value: 'status_change' },
      { name: 'new_status', value: newStatus },
    ],
  });
}

/**
 * Email personnalisé utilisant un template de la base de données
 */
export async function sendCustomEmail(
  to: string,
  subject: string,
  htmlContent: string,
  textContent?: string
): Promise<SendEmailResult> {
  return sendEmail({
    to,
    subject,
    html: htmlContent,
    text: textContent,
    tags: [
      { name: 'category', value: 'custom' },
    ],
  });
}
