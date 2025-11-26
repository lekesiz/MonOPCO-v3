import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calculator, Building2, Users, Euro, Mail, CheckCircle2, AlertCircle } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

type EstimationResult = {
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

export default function EstimationOPCO() {
  const [siret, setSiret] = useState('');
  const [nombreEmployes, setNombreEmployes] = useState('');
  const [estimation, setEstimation] = useState<EstimationResult | null>(null);
  const [loading, setLoading] = useState(false);

  const calculerEstimation = trpc.opco.calculerEstimation.useMutation();
  const genererEmail = trpc.opco.genererEmailPreInscription.useMutation();

  const handleCalculer = async () => {
    if (!siret || !nombreEmployes) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    if (siret.length !== 14) {
      toast.error('Le SIRET doit contenir exactement 14 chiffres');
      return;
    }

    const nbEmployes = parseInt(nombreEmployes);
    if (isNaN(nbEmployes) || nbEmployes <= 0) {
      toast.error('Le nombre d\'employés doit être un nombre positif');
      return;
    }

    setLoading(true);
    try {
      const result = await calculerEstimation.mutateAsync({
        siret,
        nombreEmployes: nbEmployes,
      });

      setEstimation(result);
      toast.success('Estimation calculée avec succès !');
    } catch (error: any) {
      console.error('Erreur lors du calcul:', error);
      toast.error(error.message || 'Erreur lors du calcul de l\'estimation');
    } finally {
      setLoading(false);
    }
  };

  const handlePreInscription = async () => {
    if (!estimation) return;

    try {
      const emailContent = await genererEmail.mutateAsync(estimation);
      
      // Copier le contenu de l'email dans le presse-papiers
      await navigator.clipboard.writeText(`Sujet: ${emailContent.subject}\n\n${emailContent.body}`);
      
      toast.success('Email de pré-inscription copié dans le presse-papiers !', {
        description: 'Vous pouvez maintenant le coller dans votre client email',
      });
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la génération de l\'email');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2 mb-2">
          <Calculator className="h-8 w-8 text-primary" />
          Estimation OPCO
        </h1>
        <p className="text-muted-foreground">
          Calculez rapidement vos droits de formation professionnelle et identifiez votre OPCO
        </p>
      </div>

      {/* Formulaire */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Informations de votre entreprise</CardTitle>
          <CardDescription>
            Entrez votre SIRET et le nombre d'employés pour obtenir une estimation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="siret">Numéro SIRET</Label>
            <div className="flex gap-2">
              <Input
                id="siret"
                placeholder="12345678901234"
                value={siret}
                onChange={(e) => setSiret(e.target.value.replace(/\D/g, '').slice(0, 14))}
                maxLength={14}
                className="flex-1"
              />
              <Badge variant="outline" className="flex items-center gap-1">
                <Building2 className="h-3 w-3" />
                14 chiffres
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Le SIRET sera utilisé pour récupérer automatiquement les informations de votre entreprise
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="employes">Nombre d'employés</Label>
            <div className="flex gap-2">
              <Input
                id="employes"
                type="number"
                placeholder="10"
                value={nombreEmployes}
                onChange={(e) => setNombreEmployes(e.target.value)}
                min="1"
                className="flex-1"
              />
              <Badge variant="outline" className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                Effectif total
              </Badge>
            </div>
          </div>

          <Button 
            onClick={handleCalculer} 
            disabled={loading || !siret || !nombreEmployes}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Calcul en cours...
              </>
            ) : (
              <>
                <Calculator className="h-4 w-4 mr-2" />
                Calculer l'estimation
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Résultats */}
      {estimation && (
        <div className="space-y-6">
          {/* Informations entreprise */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                Informations de l'entreprise
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Nom de l'entreprise</p>
                  <p className="font-semibold">{estimation.nomEntreprise}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">SIRET</p>
                  <p className="font-mono">{estimation.siret}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Code NAF</p>
                  <p className="font-mono">{estimation.codeNaf}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Secteur d'activité</p>
                  <p>{estimation.secteurActivite}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* OPCO identifié */}
          <Card className="border-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                OPCO Identifié
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Votre OPCO de rattachement</p>
                  <p className="text-2xl font-bold text-primary">{estimation.opcoIdentifie}</p>
                </div>
                <Badge className="text-lg px-4 py-2" variant="default">
                  Identifié automatiquement
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Estimation financière */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Euro className="h-5 w-5 text-green-600" />
                Estimation des Droits de Formation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Nombre d'employés</p>
                  <p className="text-2xl font-bold text-blue-600">{estimation.nombreEmployes}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Masse salariale estimée</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {estimation.masseSalarialeEstimee.toLocaleString('fr-FR')}€
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Taux de contribution</p>
                  <p className="text-2xl font-bold text-green-600">
                    {(estimation.tauxContribution * 100).toFixed(2)}%
                  </p>
                </div>
              </div>

              <Separator />

              <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 p-6 rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Montant annuel estimé</p>
                <p className="text-4xl font-bold text-primary mb-2">
                  {estimation.montantEstime.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}€
                </p>
                <p className="text-xs text-muted-foreground">
                  Formule : {estimation.detailsCalcul.formule}
                </p>
              </div>

              <div className="flex items-start gap-2 p-4 bg-amber-50 rounded-lg">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div className="text-sm text-amber-800">
                  <p className="font-semibold mb-1">Information importante</p>
                  <p>
                    Cette estimation est basée sur un salaire moyen annuel de{' '}
                    {estimation.detailsCalcul.salaireMoyenAnnuel.toLocaleString('fr-FR')}€ par employé.
                    Le montant réel peut varier selon votre masse salariale effective.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Prochaines étapes</CardTitle>
              <CardDescription>
                Lancez votre pré-inscription auprès de l'OPCO identifié
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={handlePreInscription}
                className="w-full"
                size="lg"
                variant="default"
              >
                <Mail className="h-4 w-4 mr-2" />
                Générer l'email de pré-inscription
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                L'email sera copié dans votre presse-papiers. Vous pourrez ensuite le coller dans votre client email
                et l'envoyer à votre OPCO.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
