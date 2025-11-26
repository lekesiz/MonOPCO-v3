# Configuration Google OAuth pour MonOPCO v3

Ce guide vous explique comment activer et configurer Google OAuth dans Supabase pour permettre aux utilisateurs de se connecter avec leur compte Google.

---

## 📋 Prérequis

- Accès au dashboard Supabase (https://supabase.com/dashboard)
- Projet Supabase : `kblnyssyrmmuedpwrtup`
- Accès à Google Cloud Console (https://console.cloud.google.com)

---

## 🔧 Étape 1 : Créer un Projet Google Cloud

1. Allez sur https://console.cloud.google.com
2. Cliquez sur **"Select a project"** → **"New Project"**
3. Nom du projet : `MonOPCO v3`
4. Cliquez sur **"Create"**

---

## 🔑 Étape 2 : Créer les Credentials OAuth 2.0

1. Dans Google Cloud Console, allez dans **"APIs & Services"** → **"Credentials"**
2. Cliquez sur **"Create Credentials"** → **"OAuth client ID"**
3. Si demandé, configurez l'écran de consentement OAuth :
   - Type d'application : **External**
   - Nom de l'application : `MonOPCO v3`
   - Email d'assistance utilisateur : Votre email
   - Logo de l'application : (optionnel)
   - Domaines autorisés : `monopco.fr`, `manus.space`
   - Informations de contact du développeur : Votre email
   - Cliquez sur **"Save and Continue"**

4. Retournez dans **"Credentials"** → **"Create Credentials"** → **"OAuth client ID"**
5. Type d'application : **Web application**
6. Nom : `MonOPCO v3 - Supabase Auth`

7. **Authorized JavaScript origins** :
   ```
   https://kblnyssyrmmuedpwrtup.supabase.co
   https://3000-icmk7cu1xeo1em8safiau-18ca064f.manusvm.computer
   https://monopco.fr
   ```

8. **Authorized redirect URIs** :
   ```
   https://kblnyssyrmmuedpwrtup.supabase.co/auth/v1/callback
   ```

9. Cliquez sur **"Create"**
10. **Copiez le Client ID et Client Secret** (vous en aurez besoin pour Supabase)

---

## ⚙️ Étape 3 : Configurer Google OAuth dans Supabase

1. Allez sur https://supabase.com/dashboard/project/kblnyssyrmmuedpwrtup
2. Dans le menu latéral, cliquez sur **"Authentication"** → **"Providers"**
3. Trouvez **"Google"** dans la liste
4. Activez le toggle **"Enable Sign in with Google"**
5. Remplissez les champs :
   - **Client ID** : Collez le Client ID de Google Cloud
   - **Client Secret** : Collez le Client Secret de Google Cloud
6. Cliquez sur **"Save"**

---

## ✅ Étape 4 : Vérifier la Configuration

1. Redémarrez le serveur de développement MonOPCO v3
2. Allez sur la page de connexion : https://3000-icmk7cu1xeo1em8safiau-18ca064f.manusvm.computer/login
3. Cliquez sur le bouton **"Google"**
4. Vous devriez être redirigé vers la page de connexion Google
5. Après authentification, vous devriez être redirigé vers le dashboard MonOPCO

---

## 🔍 Dépannage

### Erreur : "Unsupported provider: provider is not enabled"

**Solution** : Google OAuth n'est pas activé dans Supabase. Suivez l'Étape 3.

### Erreur : "redirect_uri_mismatch"

**Solution** : L'URL de redirection n'est pas autorisée dans Google Cloud Console. Vérifiez que vous avez bien ajouté :
```
https://kblnyssyrmmuedpwrtup.supabase.co/auth/v1/callback
```
dans les **Authorized redirect URIs**.

### Erreur : "invalid_client"

**Solution** : Le Client ID ou Client Secret est incorrect. Vérifiez que vous avez bien copié les bonnes valeurs depuis Google Cloud Console.

---

## 📝 Notes Importantes

- **Google OAuth fonctionne uniquement sur HTTPS** en production. En développement, localhost est autorisé.
- **Après activation**, tous les utilisateurs pourront se connecter avec Google.
- **Les données utilisateur** (email, nom, photo de profil) seront automatiquement récupérées depuis Google.
- **La première connexion** créera automatiquement un compte utilisateur dans Supabase.

---

## 🔐 Sécurité

- **Ne partagez jamais** votre Client Secret
- **Limitez les domaines autorisés** dans Google Cloud Console
- **Activez la vérification d'email** dans Supabase si nécessaire
- **Configurez les scopes OAuth** selon vos besoins (email, profile par défaut)

---

## 📚 Ressources

- [Documentation Supabase Auth](https://supabase.com/docs/guides/auth)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Supabase Google Provider Guide](https://supabase.com/docs/guides/auth/social-login/auth-google)
