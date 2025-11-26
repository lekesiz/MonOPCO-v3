import { searchBySiret, type PappersEntreprise } from './pappers';

/**
 * Taux de contribution formation professionnelle (2024)
 * - Entreprises < 11 salariés : 0.55%
 * - Entreprises >= 11 salariés : 1%
 */
const TAUX_CONTRIBUTION = {
  MOINS_11: 0.0055,
  PLUS_11: 0.01,
};

/**
 * Salaire moyen annuel brut par employé (estimation France 2024)
 */
const SALAIRE_MOYEN_ANNUEL = 35000;

/**
 * Mapping NAF vers OPCO
 * Basé sur les 11 OPCO en France
 */
const NAF_TO_OPCO: Record<string, string> = {
  // AFDAS (Culture, médias, loisirs, sport)
  '59': 'AFDAS', '60': 'AFDAS', '90': 'AFDAS', '91': 'AFDAS', '93': 'AFDAS',
  
  // AKTO (Services à forte intensité de main d'œuvre)
  '78': 'AKTO', '81': 'AKTO', '82': 'AKTO', '95': 'AKTO',
  
  // ATLAS (Services financiers et conseil)
  '64': 'ATLAS', '65': 'ATLAS', '66': 'ATLAS', '69': 'ATLAS', '70': 'ATLAS',
  
  // Constructys (Construction)
  '41': 'Constructys', '42': 'Constructys', '43': 'Constructys',
  
  // OCAPIAT (Agriculture, pêche, agroalimentaire)
  '01': 'OCAPIAT', '02': 'OCAPIAT', '03': 'OCAPIAT', '10': 'OCAPIAT', '11': 'OCAPIAT',
  
  // OPCO 2i (Interindustriel)
  '19': 'OPCO 2i', '20': 'OPCO 2i', '21': 'OPCO 2i', '22': 'OPCO 2i', '23': 'OPCO 2i',
  '24': 'OPCO 2i', '25': 'OPCO 2i', '26': 'OPCO 2i', '27': 'OPCO 2i', '28': 'OPCO 2i',
  
  // OPCO Mobilités (Automobile, transport)
  '45': 'OPCO Mobilités', '49': 'OPCO Mobilités', '50': 'OPCO Mobilités', '51': 'OPCO Mobilités',
  
  // OPCO Santé (Santé)
  '86': 'OPCO Santé', '87': 'OPCO Santé', '88': 'OPCO Santé',
  
  // OPCO EP (Entreprises de proximité)
  '55': 'OPCO EP', '56': 'OPCO EP', '68': 'OPCO EP', '77': 'OPCO EP', '79': 'OPCO EP',
  '92': 'OPCO EP', '96': 'OPCO EP',
  
  // Uniformation (Cohésion sociale)
  '84': 'Uniformation', '85': 'Uniformation', '94': 'Uniformation',
  
  // OPCOMMERCE (Commerce)
  '46': 'OPCOMMERCE', '47': 'OPCOMMERCE',
};

export type EstimationResult = {
  siret: string;
  nomEntreprise: string;
  codeNaf: string;
  secteurActivite: string;
  nombreEmployes: number;
  masseSalarialeEstimee: number;
  opcoIdentifie: string;
  montantEstime: number;
  tauxContribution: number;
  detailsCalcul: {
    salaireMoyenAnnuel: number;
    tauxUtilise: number;
    formule: string;
  };
};

/**
 * Identifie l'OPCO à partir du code NAF
 */
export function identifierOPCO(codeNaf: string): string {
  // Extraire les 2 premiers chiffres du code NAF
  const prefix = codeNaf.substring(0, 2);
  
  const opco = NAF_TO_OPCO[prefix];
  
  if (opco) {
    return opco;
  }
  
  // Par défaut, OPCO EP (entreprises de proximité)
  return 'OPCO EP';
}

/**
 * Calcule l'estimation des droits de formation OPCO
 */
export async function calculerEstimationOPCO(
  siret: string,
  nombreEmployes: number
): Promise<EstimationResult> {
  // Récupérer les informations de l'entreprise via Pappers
  const result = await searchBySiret(siret);
  
  if (!result.success || !result.data) {
    throw new Error(result.error || 'Entreprise non trouvée avec ce SIRET');
  }
  
  const companyInfo = result.data;
  
  // Identifier l'OPCO
  const opcoIdentifie = identifierOPCO(companyInfo.code_naf);
  
  // Calculer la masse salariale estimée
  const masseSalarialeEstimee = nombreEmployes * SALAIRE_MOYEN_ANNUEL;
  
  // Déterminer le taux de contribution
  const tauxContribution = nombreEmployes < 11 ? TAUX_CONTRIBUTION.MOINS_11 : TAUX_CONTRIBUTION.PLUS_11;
  
  // Calculer le montant estimé
  const montantEstime = masseSalarialeEstimee * tauxContribution;
  
  return {
    siret,
    nomEntreprise: companyInfo.nom_entreprise,
    codeNaf: companyInfo.code_naf,
    secteurActivite: companyInfo.domaine_activite,
    nombreEmployes,
    masseSalarialeEstimee,
    opcoIdentifie,
    montantEstime,
    tauxContribution,
    detailsCalcul: {
      salaireMoyenAnnuel: SALAIRE_MOYEN_ANNUEL,
      tauxUtilise: tauxContribution,
      formule: `${nombreEmployes} employés × ${SALAIRE_MOYEN_ANNUEL}€ × ${(tauxContribution * 100).toFixed(2)}% = ${montantEstime.toFixed(2)}€`,
    },
  };
}

/**
 * Génère un email de pré-inscription OPCO
 */
export function genererEmailPreInscription(estimation: EstimationResult): {
  subject: string;
  body: string;
} {
  const subject = `Pré-inscription OPCO - ${estimation.nomEntreprise} (SIRET: ${estimation.siret})`;
  
  const body = `
Bonjour,

Nous souhaitons effectuer une pré-inscription auprès de votre OPCO pour notre entreprise.

**Informations de l'entreprise :**
- Nom : ${estimation.nomEntreprise}
- SIRET : ${estimation.siret}
- Code NAF : ${estimation.codeNaf}
- Secteur d'activité : ${estimation.secteurActivite}
- Nombre d'employés : ${estimation.nombreEmployes}

**Estimation des droits de formation :**
- OPCO identifié : ${estimation.opcoIdentifie}
- Masse salariale estimée : ${estimation.masseSalarialeEstimee.toLocaleString('fr-FR')}€
- Taux de contribution : ${(estimation.tauxContribution * 100).toFixed(2)}%
- Montant estimé annuel : ${estimation.montantEstime.toLocaleString('fr-FR')}€

Nous souhaitons obtenir plus d'informations sur :
- Les modalités de prise en charge de nos formations
- Les démarches à effectuer pour bénéficier de nos droits
- Les formations éligibles dans notre secteur

Merci de nous recontacter pour finaliser notre inscription.

Cordialement,
${estimation.nomEntreprise}
  `.trim();
  
  return { subject, body };
}
