/**
 * Pappers API Service
 * 
 * Service pour interroger l'API Pappers et récupérer les informations d'entreprise
 * à partir d'un numéro SIRET ou SIREN.
 * 
 * Documentation: https://www.pappers.fr/api/documentation
 */

const PAPPERS_API_URL = 'https://api.pappers.fr/v2';
const PAPPERS_API_KEY = process.env.PAPPERS_API_KEY;

export interface PappersEntreprise {
  siren: string;
  siret?: string;
  nom_entreprise: string;
  denomination?: string;
  nom?: string;
  prenom?: string;
  forme_juridique: string;
  code_naf: string;
  libelle_code_naf: string;
  domaine_activite: string;
  date_creation: string;
  siege: {
    adresse_ligne_1: string;
    adresse_ligne_2?: string;
    code_postal: string;
    ville: string;
    pays: string;
    complement_adresse?: string;
  };
  entreprise_cessee: boolean;
  date_cessation?: string;
}

export interface PappersSearchResult {
  success: boolean;
  data?: PappersEntreprise;
  error?: string;
}

/**
 * Recherche une entreprise par SIRET
 * @param siret - Numéro SIRET (14 chiffres)
 * @returns Informations de l'entreprise ou erreur
 */
export async function searchBySiret(siret: string): Promise<PappersSearchResult> {
  try {
    // Validation du format SIRET (14 chiffres)
    const cleanSiret = siret.replace(/\s/g, '');
    if (!/^\d{14}$/.test(cleanSiret)) {
      return {
        success: false,
        error: 'Le SIRET doit contenir exactement 14 chiffres',
      };
    }

    if (!PAPPERS_API_KEY) {
      return {
        success: false,
        error: 'Clé API Pappers non configurée',
      };
    }

    const response = await fetch(
      `${PAPPERS_API_URL}/entreprise?siret=${cleanSiret}`,
      {
        headers: {
          'api-key': PAPPERS_API_KEY,
        },
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return {
          success: false,
          error: 'Entreprise non trouvée avec ce SIRET',
        };
      }
      if (response.status === 401) {
        return {
          success: false,
          error: 'Clé API Pappers invalide',
        };
      }
      if (response.status === 429) {
        return {
          success: false,
          error: 'Limite de requêtes API atteinte',
        };
      }
      return {
        success: false,
        error: `Erreur API Pappers: ${response.status}`,
      };
    }

    const data = await response.json();

    return {
      success: true,
      data: {
        siren: data.siren,
        siret: cleanSiret,
        nom_entreprise: data.nom_entreprise,
        denomination: data.denomination,
        nom: data.nom,
        prenom: data.prenom,
        forme_juridique: data.forme_juridique,
        code_naf: data.code_naf,
        libelle_code_naf: data.libelle_code_naf,
        domaine_activite: data.domaine_activite,
        date_creation: data.date_creation,
        siege: data.siege,
        entreprise_cessee: data.entreprise_cessee,
        date_cessation: data.date_cessation,
      },
    };
  } catch (error: any) {
    console.error('[Pappers] Error searching by SIRET:', error);
    return {
      success: false,
      error: error.message || 'Erreur lors de la recherche',
    };
  }
}

/**
 * Recherche une entreprise par SIREN
 * @param siren - Numéro SIREN (9 chiffres)
 * @returns Informations de l'entreprise ou erreur
 */
export async function searchBySiren(siren: string): Promise<PappersSearchResult> {
  try {
    // Validation du format SIREN (9 chiffres)
    const cleanSiren = siren.replace(/\s/g, '');
    if (!/^\d{9}$/.test(cleanSiren)) {
      return {
        success: false,
        error: 'Le SIREN doit contenir exactement 9 chiffres',
      };
    }

    if (!PAPPERS_API_KEY) {
      return {
        success: false,
        error: 'Clé API Pappers non configurée',
      };
    }

    const response = await fetch(
      `${PAPPERS_API_URL}/entreprise?siren=${cleanSiren}`,
      {
        headers: {
          'api-key': PAPPERS_API_KEY,
        },
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return {
          success: false,
          error: 'Entreprise non trouvée avec ce SIREN',
        };
      }
      if (response.status === 401) {
        return {
          success: false,
          error: 'Clé API Pappers invalide',
        };
      }
      if (response.status === 429) {
        return {
          success: false,
          error: 'Limite de requêtes API atteinte',
        };
      }
      return {
        success: false,
        error: `Erreur API Pappers: ${response.status}`,
      };
    }

    const data = await response.json();

    return {
      success: true,
      data: {
        siren: data.siren,
        nom_entreprise: data.nom_entreprise,
        denomination: data.denomination,
        nom: data.nom,
        prenom: data.prenom,
        forme_juridique: data.forme_juridique,
        code_naf: data.code_naf,
        libelle_code_naf: data.libelle_code_naf,
        domaine_activite: data.domaine_activite,
        date_creation: data.date_creation,
        siege: data.siege,
        entreprise_cessee: data.entreprise_cessee,
        date_cessation: data.date_cessation,
      },
    };
  } catch (error: any) {
    console.error('[Pappers] Error searching by SIREN:', error);
    return {
      success: false,
      error: error.message || 'Erreur lors de la recherche',
    };
  }
}
