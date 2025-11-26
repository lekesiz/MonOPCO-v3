import { ENV } from "./_core/env";

const YOUSIGN_API_URL = "https://api-sandbox.yousign.app/v3";
const YOUSIGN_API_KEY = ENV.yousignApiKey;

interface YousignDocument {
  id: string;
  filename: string;
  nature: string;
}

interface YousignSigner {
  id: string;
  info: {
    first_name: string;
    last_name: string;
    email: string;
    phone_number?: string;
  };
  signature_level: "electronic_signature" | "advanced_electronic_signature";
  signature_authentication_mode: "no_otp" | "otp_sms" | "otp_email";
}

interface YousignSignatureRequest {
  id: string;
  name: string;
  delivery_mode: "email" | "none";
  timezone: string;
  email_custom_note?: string;
  status: "draft" | "ongoing" | "done" | "expired" | "canceled" | "declined";
  signers: YousignSigner[];
  documents: YousignDocument[];
  created_at: string;
  updated_at: string;
  expires_at?: string;
}

/**
 * Créer une demande de signature Yousign
 */
export async function createSignatureRequest(params: {
  name: string;
  deliveryMode?: "email" | "none";
  expiresAt?: string;
  timezone?: string;
  emailCustomNote?: string;
}): Promise<YousignSignatureRequest> {
  const response = await fetch(`${YOUSIGN_API_URL}/signature_requests`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${YOUSIGN_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: params.name,
      delivery_mode: params.deliveryMode || "email",
      timezone: params.timezone || "Europe/Paris",
      expires_at: params.expiresAt,
      email_custom_note: params.emailCustomNote,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Yousign API error: ${response.status} - ${error}`);
  }

  return await response.json();
}

/**
 * Uploader un document vers une demande de signature
 */
export async function uploadDocument(params: {
  signatureRequestId: string;
  file: Buffer | Uint8Array;
  filename: string;
  nature?: string;
}): Promise<YousignDocument> {
  const formData = new FormData();
  const fileArray = params.file instanceof Buffer ? Array.from(params.file) : Array.from(params.file);
  const blob = new Blob([new Uint8Array(fileArray)]);
  formData.append("file", blob, params.filename);
  formData.append("nature", params.nature || "signable_document");

  const response = await fetch(
    `${YOUSIGN_API_URL}/signature_requests/${params.signatureRequestId}/documents`,
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${YOUSIGN_API_KEY}`,
      },
      body: formData,
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Yousign API error: ${response.status} - ${error}`);
  }

  return await response.json();
}

/**
 * Ajouter un signataire à une demande de signature
 */
export async function addSigner(params: {
  signatureRequestId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  signatureLevel?: "electronic_signature" | "advanced_electronic_signature";
  signatureAuthenticationMode?: "no_otp" | "otp_sms" | "otp_email";
}): Promise<YousignSigner> {
  const response = await fetch(
    `${YOUSIGN_API_URL}/signature_requests/${params.signatureRequestId}/signers`,
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${YOUSIGN_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        info: {
          first_name: params.firstName,
          last_name: params.lastName,
          email: params.email,
          phone_number: params.phoneNumber,
        },
        signature_level: params.signatureLevel || "electronic_signature",
        signature_authentication_mode: params.signatureAuthenticationMode || "otp_email",
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Yousign API error: ${response.status} - ${error}`);
  }

  return await response.json();
}

/**
 * Activer une demande de signature (envoyer aux signataires)
 */
export async function activateSignatureRequest(
  signatureRequestId: string
): Promise<YousignSignatureRequest> {
  const response = await fetch(
    `${YOUSIGN_API_URL}/signature_requests/${signatureRequestId}/activate`,
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${YOUSIGN_API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Yousign API error: ${response.status} - ${error}`);
  }

  return await response.json();
}

/**
 * Récupérer le statut d'une demande de signature
 */
export async function getSignatureRequest(
  signatureRequestId: string
): Promise<YousignSignatureRequest> {
  const response = await fetch(
    `${YOUSIGN_API_URL}/signature_requests/${signatureRequestId}`,
    {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${YOUSIGN_API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Yousign API error: ${response.status} - ${error}`);
  }

  return await response.json();
}

/**
 * Télécharger les documents signés
 */
export async function downloadSignedDocuments(
  signatureRequestId: string
): Promise<Buffer> {
  const response = await fetch(
    `${YOUSIGN_API_URL}/signature_requests/${signatureRequestId}/documents/download`,
    {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${YOUSIGN_API_KEY}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Yousign API error: ${response.status} - ${error}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Annuler une demande de signature
 */
export async function cancelSignatureRequest(
  signatureRequestId: string,
  reason?: string
): Promise<YousignSignatureRequest> {
  const response = await fetch(
    `${YOUSIGN_API_URL}/signature_requests/${signatureRequestId}/cancel`,
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${YOUSIGN_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        reason: reason || "Annulation par l'utilisateur",
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Yousign API error: ${response.status} - ${error}`);
  }

  return await response.json();
}
