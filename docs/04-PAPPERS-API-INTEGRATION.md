# 🏢 Intégration API Pappers - Guide Complet

## Vue d'ensemble

L'intégration de l'API Pappers permet de récupérer automatiquement les informations légales d'une entreprise française à partir de son numéro SIRET ou SIREN. Cette fonctionnalité simplifie considérablement le processus d'inscription et de mise à jour des informations entreprise.

---

## 🔑 Configuration

### Variables d'environnement

La clé API Pappers est stockée de manière sécurisée dans les variables d'environnement:

```
PAPPERS_API_KEY=8ac33043127b8eae5f093f6d4e0adb4ee76098ccec556719
```

**Important:** Cette clé est utilisée côté serveur uniquement pour des raisons de sécurité.

### Obtenir une clé API

1. Créez un compte sur [Pappers.fr](https://www.pappers.fr)
2. Accédez à [Mon Compte API](https://moncompte.pappers.fr/api)
3. Copiez votre clé API
4. Ajoutez-la dans les secrets du projet Manus

---

## 📚 Architecture

### Backend (Server-side)

#### `server/pappers.ts` - Service principal

Contient les fonctions de recherche:

```typescript
// Recherche par SIRET (14 chiffres)
export async function searchBySiret(siret: string): Promise<PappersSearchResult>

// Recherche par SIREN (9 chiffres)
export async function searchBySiren(siren: string): Promise<PappersSearchResult>
```

**Données récupérées:**
- `siren` / `siret` - Numéros d'identification
- `nom_entreprise` - Nom complet de l'entreprise
- `forme_juridique` - SARL, SAS, EURL, etc.
- `code_naf` + `libelle_code_naf` - Code et libellé d'activité
- `domaine_activite` - Secteur d'activité
- `date_creation` - Date de création
- `siege.adresse_ligne_1` - Adresse du siège social
- `siege.code_postal` + `siege.ville` - Code postal et ville
- `entreprise_cessee` - Statut actif/cessé

#### `server/routers.ts` - Endpoints tRPC

```typescript
pappers: router({
  searchBySiret: publicProcedure
    .input(z.object({ siret: z.string() }))
    .mutation(async ({ input }) => {
      return await searchBySiret(input.siret);
    }),
  searchBySiren: publicProcedure
    .input(z.object({ siren: z.string() }))
    .mutation(async ({ input }) => {
      return await searchBySiren(input.siren);
    }),
}),
```

### Frontend (Client-side)

#### Page d'inscription (`client/src/pages/Register.tsx`)

Formulaire d'inscription avec recherche automatique SIRET:

1. L'utilisateur entre un SIRET (14 chiffres)
2. Clique sur le bouton de recherche 🔍
3. Les informations sont récupérées automatiquement:
   - Nom de l'entreprise
   - Adresse complète
   - Forme juridique
4. Les champs sont pré-remplis mais restent modifiables

#### Page de profil (`client/src/pages/Profile.tsx`)

Même fonctionnalité pour mettre à jour les informations entreprise existantes.

---

## 🎯 Utilisation

### Exemple d'utilisation dans le frontend

```typescript
import { trpc } from '@/lib/trpc';

const searchBySiretMutation = trpc.pappers.searchBySiret.useMutation();

const handleSearch = async (siret: string) => {
  const result = await searchBySiretMutation.mutateAsync({ siret });
  
  if (result.success && result.data) {
    // Utiliser les données récupérées
    console.log(result.data.nom_entreprise);
    console.log(result.data.forme_juridique);
    console.log(result.data.siege);
  } else {
    // Gérer l'erreur
    console.error(result.error);
  }
};
```

### Validation automatique

Le service valide automatiquement:
- ✅ Format SIRET (14 chiffres exactement)
- ✅ Format SIREN (9 chiffres exactement)
- ✅ Existence de l'entreprise dans la base Pappers
- ✅ Clé API valide

### Gestion des erreurs

Messages d'erreur retournés:
- `"Le SIRET doit contenir exactement 14 chiffres"` - Format invalide
- `"Entreprise non trouvée avec ce SIRET"` - SIRET inexistant
- `"Clé API Pappers invalide"` - Problème d'authentification
- `"Limite de requêtes API atteinte"` - Quota dépassé

---

## 🧪 Tests

### Tests automatisés (`server/pappers.test.ts`)

```bash
pnpm test pappers.test.ts
```

**Tests inclus:**
1. ✅ Validation de la clé API avec un SIRET connu (Google France)
2. ✅ Rejet des formats SIRET invalides
3. ✅ Gestion des SIRET inexistants
4. ✅ Recherche par SIREN fonctionnelle
5. ✅ Rejet des formats SIREN invalides

**Résultats:**
```
✓ server/pappers.test.ts (5)
  ✓ Pappers API (5)
    ✓ should validate API key by searching a known SIRET
    ✓ should return error for invalid SIRET format
    ✓ should return error for non-existent SIRET
    ✓ should search by SIREN successfully
    ✓ should return error for invalid SIREN format
```

---

## 💡 Exemples de SIRET pour tests

- **Google France:** `44306184100047` (SIREN: `443061841`)
- **Apple France:** `44382875900038` (SIREN: `443828759`)
- **Microsoft France:** `32737481300045` (SIREN: `327374813`)

---

## 📊 Consommation de crédits

Chaque requête à l'API Pappers consomme **1 crédit**.

**Recommandations:**
- Implémenter un cache côté serveur pour les recherches fréquentes
- Limiter les recherches aux actions utilisateur explicites (clic sur bouton)
- Ne pas faire de recherche automatique à chaque saisie de caractère

---

## 🔒 Sécurité

### Bonnes pratiques implémentées

1. ✅ **Clé API côté serveur uniquement** - Jamais exposée au frontend
2. ✅ **Validation des entrées** - Format SIRET/SIREN vérifié avant l'appel API
3. ✅ **Gestion des erreurs** - Messages d'erreur clairs sans exposer de détails techniques
4. ✅ **Rate limiting** - Détection des erreurs 429 (trop de requêtes)

---

## 🚀 Améliorations futures possibles

1. **Cache Redis** - Stocker les résultats fréquents pour réduire les appels API
2. **Recherche par nom** - Utiliser l'endpoint `/recherche` de Pappers
3. **Autocomplétion** - Suggérer des entreprises pendant la saisie
4. **Historique** - Sauvegarder les recherches récentes
5. **Webhook** - Surveiller les changements d'informations entreprise

---

## 📖 Documentation API Pappers

- **Documentation officielle:** https://www.pappers.fr/api/documentation
- **Changelog:** https://www.pappers.fr/api/changelog
- **Support:** support@pappers.fr

---

## ✅ Checklist d'intégration

- [x] Clé API configurée dans les secrets
- [x] Service backend créé (`server/pappers.ts`)
- [x] Endpoints tRPC ajoutés (`server/routers.ts`)
- [x] Tests unitaires écrits et validés
- [x] Intégration dans le formulaire d'inscription
- [x] Intégration dans la page de profil
- [x] Validation des formats SIRET/SIREN
- [x] Gestion des erreurs utilisateur
- [x] Documentation complète

---

**Date de mise à jour:** 26 novembre 2025  
**Version:** 1.0.0
