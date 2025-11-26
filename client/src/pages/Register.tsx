import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { Loader2, Search } from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';

export default function Register() {
  const [, setLocation] = useLocation();
  const { signUp } = useSupabaseAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    prenom: '',
    nom: '',
    entreprise_siret: '',
    entreprise_nom: '',
    entreprise_adresse: '',
    entreprise_forme_juridique: '',
  });
  const [loading, setLoading] = useState(false);
  const [searchingPappers, setSearchingPappers] = useState(false);
  const searchBySiretMutation = trpc.pappers.searchBySiret.useMutation();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setLoading(true);

    try {
      const { error } = await signUp(formData.email, formData.password, {
        prenom: formData.prenom,
        nom: formData.nom,
        entreprise_siret: formData.entreprise_siret || undefined,
        entreprise_nom: formData.entreprise_nom || undefined,
        entreprise_adresse: formData.entreprise_adresse || undefined,
        entreprise_forme_juridique: formData.entreprise_forme_juridique || undefined,
      });

      if (error) {
        toast.error('Erreur d\'inscription', {
          description: error.message,
        });
      } else {
        toast.success('Inscription réussie!', {
          description: 'Vérifiez votre email pour confirmer votre compte.',
        });
        setLocation('/login');
      }
    } catch (error) {
      toast.error('Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Inscription</CardTitle>
          <CardDescription className="text-center">
            Créez votre compte MonOPCO
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="prenom">Prénom *</Label>
                <Input
                  id="prenom"
                  name="prenom"
                  type="text"
                  placeholder="Jean"
                  value={formData.prenom}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nom">Nom *</Label>
                <Input
                  id="nom"
                  name="nom"
                  type="text"
                  placeholder="Dupont"
                  value={formData.nom}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="votre@email.com"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe *</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmer le mot de passe *</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-sm font-medium text-muted-foreground">Informations entreprise (optionnel)</h3>
              
              {/* SIRET avec recherche automatique */}
              <div className="space-y-2">
                <Label htmlFor="entreprise_siret">SIRET</Label>
                <div className="flex gap-2">
                  <Input
                    id="entreprise_siret"
                    name="entreprise_siret"
                    type="text"
                    placeholder="12345678901234 (14 chiffres)"
                    maxLength={14}
                    value={formData.entreprise_siret}
                    onChange={handleChange}
                    disabled={loading || searchingPappers}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={async () => {
                      if (!formData.entreprise_siret) {
                        toast.error('Veuillez entrer un SIRET');
                        return;
                      }
                      if (formData.entreprise_siret.length !== 14) {
                        toast.error('Le SIRET doit contenir 14 chiffres');
                        return;
                      }
                      
                      setSearchingPappers(true);
                      try {
                        const result = await searchBySiretMutation.mutateAsync({
                          siret: formData.entreprise_siret,
                        });
                        
                        if (result.success && result.data) {
                          const { data } = result;
                          setFormData(prev => ({
                            ...prev,
                            entreprise_nom: data.nom_entreprise,
                            entreprise_adresse: `${data.siege.adresse_ligne_1}, ${data.siege.code_postal} ${data.siege.ville}`,
                            entreprise_forme_juridique: data.forme_juridique,
                          }));
                          toast.success('Informations récupérées avec succès!', {
                            description: `${data.nom_entreprise} - ${data.forme_juridique}`,
                          });
                        } else {
                          toast.error('Erreur', {
                            description: result.error || 'Entreprise non trouvée',
                          });
                        }
                      } catch (error: any) {
                        toast.error('Erreur de recherche', {
                          description: error.message,
                        });
                      } finally {
                        setSearchingPappers(false);
                      }
                    }}
                    disabled={loading || searchingPappers || !formData.entreprise_siret}
                  >
                    {searchingPappers ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Cliquez sur le bouton de recherche pour récupérer automatiquement les informations de l'entreprise
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="entreprise_nom">Nom de l'entreprise</Label>
                <Input
                  id="entreprise_nom"
                  name="entreprise_nom"
                  type="text"
                  placeholder="MonEntreprise SARL"
                  value={formData.entreprise_nom}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="entreprise_adresse">Adresse</Label>
                <Input
                  id="entreprise_adresse"
                  name="entreprise_adresse"
                  type="text"
                  placeholder="123 Rue de la République, 75001 Paris"
                  value={formData.entreprise_adresse}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="entreprise_forme_juridique">Forme juridique</Label>
                <Input
                  id="entreprise_forme_juridique"
                  name="entreprise_forme_juridique"
                  type="text"
                  placeholder="SARL, SAS, EURL..."
                  value={formData.entreprise_forme_juridique}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              S'inscrire
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <div className="text-sm text-center text-muted-foreground">
            Vous avez déjà un compte?{' '}
            <Button
              variant="link"
              className="p-0 h-auto font-normal"
              onClick={() => setLocation('/login')}
            >
              Se connecter
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
