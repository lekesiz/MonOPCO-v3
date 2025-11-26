import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Database types
export type User = {
  id: string;
  email: string;
  prenom?: string;
  nom?: string;
  role: 'entreprise' | 'admin';
  entreprise_siret?: string;
  entreprise_nom?: string;
  created_at: string;
  updated_at: string;
  last_signed_in: string;
};

export type Dossier = {
  id: string;
  user_id: string;
  titre: string;
  description?: string;
  statut: 'brouillon' | 'en_cours' | 'termine';
  date_creation: string;
  date_modification: string;
};

export type Document = {
  id: string;
  dossier_id: string;
  nom_fichier: string;
  type_fichier?: string;
  taille_fichier?: number;
  url_stockage: string;
  storage_path: string;
  uploaded_by?: string;
  date_upload: string;
};

export type Email = {
  id: string;
  user_id: string;
  dossier_id: string;
  destinataire: string;
  sujet: string;
  contenu: string;
  statut: 'en_attente' | 'envoye' | 'echec';
  date_envoi?: string;
  created_at: string;
};
