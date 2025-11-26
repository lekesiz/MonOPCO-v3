-- OPCO Directory table - Liste des OPCO par secteur NAF
CREATE TABLE IF NOT EXISTS opco_directory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom_opco VARCHAR(255) NOT NULL,
  code_naf VARCHAR(10) NOT NULL,
  secteur_activite TEXT NOT NULL,
  description TEXT,
  contact_email VARCHAR(320),
  contact_phone VARCHAR(20),
  website_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster NAF code lookups
CREATE INDEX IF NOT EXISTS idx_opco_directory_code_naf ON opco_directory(code_naf);

-- OPCO Estimations table - Historique des estimations
CREATE TABLE IF NOT EXISTS opco_estimations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  siret VARCHAR(14) NOT NULL,
  nom_entreprise VARCHAR(255) NOT NULL,
  code_naf VARCHAR(10) NOT NULL,
  secteur_activite TEXT NOT NULL,
  nombre_employes INTEGER NOT NULL,
  masse_salariale_estimee DECIMAL(12, 2),
  opco_identifie VARCHAR(255),
  montant_estime DECIMAL(10, 2),
  taux_contribution DECIMAL(5, 4),
  details_calcul JSONB,
  statut VARCHAR(50) DEFAULT 'en_attente',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster user queries
CREATE INDEX IF NOT EXISTS idx_opco_estimations_user_id ON opco_estimations(user_id);
CREATE INDEX IF NOT EXISTS idx_opco_estimations_siret ON opco_estimations(siret);

-- RLS Policies for opco_estimations
ALTER TABLE opco_estimations ENABLE ROW LEVEL SECURITY;

-- Users can view own estimations
CREATE POLICY "Users can view own opco estimations"
  ON opco_estimations FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create own estimations
CREATE POLICY "Users can create own opco estimations"
  ON opco_estimations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update own estimations
CREATE POLICY "Users can update own opco estimations"
  ON opco_estimations FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete own estimations
CREATE POLICY "Users can delete own opco estimations"
  ON opco_estimations FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_opco_estimations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER opco_estimations_updated_at
  BEFORE UPDATE ON opco_estimations
  FOR EACH ROW
  EXECUTE FUNCTION update_opco_estimations_updated_at();

-- Insert initial OPCO directory data (11 OPCO en France)
INSERT INTO opco_directory (nom_opco, code_naf, secteur_activite, description, contact_email, website_url) VALUES
-- AFDAS (Culture, médias, loisirs, sport)
('AFDAS', '59.11', 'Culture, médias, loisirs, sport', 'OPCO des secteurs de la culture, des industries créatives, des médias, de la communication, des télécommunications, du sport, du tourisme, des loisirs et du divertissement', 'contact@afdas.com', 'https://www.afdas.com'),
('AFDAS', '90.01', 'Arts du spectacle vivant', 'OPCO des secteurs de la culture, des industries créatives, des médias', 'contact@afdas.com', 'https://www.afdas.com'),

-- AKTO (Services à forte intensité de main d''œuvre)
('AKTO', '78.10', 'Services à forte intensité de main d''œuvre', 'OPCO des entreprises et des salariés des services à forte intensité de main d''œuvre', 'contact@akto.fr', 'https://www.akto.fr'),
('AKTO', '81.21', 'Nettoyage courant des bâtiments', 'OPCO des entreprises de propreté et services associés', 'contact@akto.fr', 'https://www.akto.fr'),

-- ATLAS (Services financiers et conseil)
('ATLAS', '64.19', 'Services financiers et conseil', 'OPCO des entreprises de services financiers et de conseil', 'contact@opco-atlas.fr', 'https://www.opco-atlas.fr'),
('ATLAS', '66.12', 'Courtage de valeurs mobilières', 'OPCO des services financiers', 'contact@opco-atlas.fr', 'https://www.opco-atlas.fr'),

-- Constructys (Construction)
('Constructys', '41.20', 'Construction', 'OPCO de la construction et du BTP', 'contact@constructys.fr', 'https://www.constructys.fr'),
('Constructys', '42.11', 'Construction de routes', 'OPCO de la construction', 'contact@constructys.fr', 'https://www.constructys.fr'),

-- OCAPIAT (Agriculture, pêche, agroalimentaire)
('OCAPIAT', '01.11', 'Agriculture, pêche, agroalimentaire', 'OPCO de la coopération agricole, de l''agriculture, de la pêche, de l''industrie agroalimentaire et des territoires', 'contact@ocapiat.fr', 'https://www.ocapiat.fr'),
('OCAPIAT', '10.11', 'Transformation et conservation de viande', 'OPCO de l''agroalimentaire', 'contact@ocapiat.fr', 'https://www.ocapiat.fr'),

-- OPCO 2i (Interindustriel)
('OPCO 2i', '25.11', 'Interindustriel', 'OPCO interindustriel (chimie, pétrole, pharmacie, plasturgie, etc.)', 'contact@opco2i.fr', 'https://www.opco2i.fr'),
('OPCO 2i', '20.11', 'Fabrication de gaz industriels', 'OPCO de l''industrie chimique', 'contact@opco2i.fr', 'https://www.opco2i.fr'),

-- OPCO Mobilités (Automobile, transport)
('OPCO Mobilités', '45.11', 'Automobile, transport', 'OPCO des services de l''automobile, du cycle et du motocycle, du transport routier et des activités connexes', 'contact@opcomobilites.fr', 'https://www.opcomobilites.fr'),
('OPCO Mobilités', '49.41', 'Transports routiers de fret', 'OPCO du transport routier', 'contact@opcomobilites.fr', 'https://www.opcomobilites.fr'),

-- OPCO Santé (Santé)
('OPCO Santé', '86.10', 'Santé', 'OPCO de la santé (secteur privé hospitalier, sanitaire, social et médico-social)', 'contact@opco-sante.fr', 'https://www.opco-sante.fr'),
('OPCO Santé', '87.10', 'Hébergement médico-social', 'OPCO du secteur médico-social', 'contact@opco-sante.fr', 'https://www.opco-sante.fr'),

-- OPCO EP (Entreprises de proximité)
('OPCO EP', '47.11', 'Entreprises de proximité', 'OPCO des entreprises de proximité (artisanat, commerce, professions libérales)', 'contact@opcoep.fr', 'https://www.opcoep.fr'),
('OPCO EP', '56.10', 'Restauration traditionnelle', 'OPCO de la restauration et hôtellerie', 'contact@opcoep.fr', 'https://www.opcoep.fr'),

-- Uniformation (Cohésion sociale)
('Uniformation', '88.10', 'Cohésion sociale', 'OPCO de la cohésion sociale (associations, mutuelles, coopératives)', 'contact@uniformation.fr', 'https://www.uniformation.fr'),
('Uniformation', '94.99', 'Autres organisations associatives', 'OPCO du secteur associatif', 'contact@uniformation.fr', 'https://www.uniformation.fr'),

-- OPCOMMERCE (Commerce)
('OPCOMMERCE', '47.19', 'Commerce', 'OPCO du commerce (commerce de détail et de gros, e-commerce)', 'contact@lopcommerce.com', 'https://www.lopcommerce.com'),
('OPCOMMERCE', '47.71', 'Commerce de détail d''habillement', 'OPCO du commerce de détail', 'contact@lopcommerce.com', 'https://www.lopcommerce.com');
