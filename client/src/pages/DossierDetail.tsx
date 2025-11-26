import { useEffect, useState } from 'react';
import { useLocation, useRoute, Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { supabase } from '@/lib/supabase';
import { FileText, Upload, Mail, ArrowLeft, Edit, Trash2, Calendar, User, Download } from 'lucide-react';
import { exportDossierToPDF } from '@/lib/pdfExport';
import { toast } from 'sonner';
import { APP_TITLE } from '@/const';

interface Dossier {
  id: string;
  titre: string;
  description: string;
  statut: 'brouillon' | 'en_cours' | 'termine' | 'archive';
  created_at: string;
  updated_at: string;
}

interface Document {
  id: string;
  nom_fichier: string;
  chemin_stockage: string;
  taille: number;
  type_fichier: string;
  dossier_id: string;
  created_at: string;
}

interface Email {
  id: string;
  destinataire: string;
  sujet: string;
  corps: string;
  statut: 'envoye' | 'en_attente' | 'echec';
  dossier_id: string;
  date_envoi: string;
}

export default function DossierDetail() {
  const [, params] = useRoute('/dossiers/:id');
  const [, setLocation] = useLocation();
  const { user, loading: authLoading } = useSupabaseAuth();
  const [dossier, setDossier] = useState<Dossier | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({ titre: '', description: '', statut: 'brouillon' as Dossier['statut'] });

  useEffect(() => {
    if (!authLoading && !user) {
      setLocation('/login');
    }
  }, [authLoading, user, setLocation]);

  useEffect(() => {
    if (params?.id && user) {
      loadDossierData(params.id);
    }
  }, [params?.id, user]);

  const loadDossierData = async (dossierId: string) => {
    try {
      setLoading(true);

      // Load dossier
      const { data: dossierData, error: dossierError } = await supabase
        .from('dossiers')
        .select('*')
        .eq('id', dossierId)
        .eq('user_id', user?.id)
        .single();

      if (dossierError) throw dossierError;
      setDossier(dossierData);
      setEditForm({ titre: dossierData.titre, description: dossierData.description, statut: dossierData.statut });

      // Load documents
      const { data: docsData, error: docsError } = await supabase
        .from('documents')
        .select('*')
        .eq('dossier_id', dossierId)
        .order('created_at', { ascending: false });

      if (docsError) throw docsError;
      setDocuments(docsData || []);

      // Load emails
      const { data: emailsData, error: emailsError } = await supabase
        .from('emails')
        .select('*')
        .eq('dossier_id', dossierId)
        .order('date_envoi', { ascending: false });

      if (emailsError) throw emailsError;
      setEmails(emailsData || []);

    } catch (error: any) {
      console.error('Error loading dossier:', error);
      toast.error('Erreur lors du chargement du dossier');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDossier = async () => {
    if (!dossier) return;

    try {
      const { error } = await supabase
        .from('dossiers')
        .update({
          titre: editForm.titre,
          description: editForm.description,
          statut: editForm.statut,
          updated_at: new Date().toISOString()
        })
        .eq('id', dossier.id);

      if (error) throw error;

      toast.success('Dossier mis à jour');
      setEditDialogOpen(false);
      loadDossierData(dossier.id);
    } catch (error: any) {
      console.error('Error updating dossier:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const getStatutBadge = (statut: Dossier['statut']) => {
    const variants = {
      brouillon: 'secondary',
      en_cours: 'default',
      termine: 'default',
      archive: 'secondary'
    } as const;

    return <Badge variant={variants[statut]}>{statut.replace('_', ' ')}</Badge>;
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!dossier) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Dossier non trouvé</h2>
          <Link href="/dossiers">
            <Button>Retour aux dossiers</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dossiers">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Retour
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">M</span>
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {APP_TITLE}
                </span>
              </div>
            </div>
            <Link href="/dashboard">
              <Button variant="outline">Dashboard</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Dossier Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <CardTitle className="text-3xl">{dossier.titre}</CardTitle>
                  {getStatutBadge(dossier.statut)}
                </div>
                <CardDescription className="text-base mt-2">
                  {dossier.description}
                </CardDescription>
                <div className="flex items-center space-x-4 mt-4 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>Créé le {new Date(dossier.created_at).toLocaleDateString('fr-FR')}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>Modifié le {new Date(dossier.updated_at).toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  onClick={async () => {
                    try {
                      await exportDossierToPDF(dossier, documents, emails);
                      toast.success('PDF exporté avec succès!');
                    } catch (error: any) {
                      toast.error('Erreur d\'export PDF', {
                        description: error.message,
                      });
                    }
                  }}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Exporter en PDF
                </Button>
                <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Edit className="w-4 h-4 mr-2" />
                      Modifier
                    </Button>
                  </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Modifier le dossier</DialogTitle>
                    <DialogDescription>
                      Modifiez les informations du dossier
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="edit-titre">Titre</Label>
                      <Input
                        id="edit-titre"
                        value={editForm.titre}
                        onChange={(e) => setEditForm({ ...editForm, titre: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-description">Description</Label>
                      <Textarea
                        id="edit-description"
                        value={editForm.description}
                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                        rows={4}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-statut">Statut</Label>
                      <Select value={editForm.statut} onValueChange={(value: Dossier['statut']) => setEditForm({ ...editForm, statut: value })}>
                        <SelectTrigger id="edit-statut">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="brouillon">Brouillon</SelectItem>
                          <SelectItem value="en_cours">En cours</SelectItem>
                          <SelectItem value="termine">Terminé</SelectItem>
                          <SelectItem value="archive">Archivé</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={handleUpdateDossier} className="w-full">
                      Enregistrer
                    </Button>
                  </div>
                </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="documents" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="documents">
              <Upload className="w-4 h-4 mr-2" />
              Documents ({documents.length})
            </TabsTrigger>
            <TabsTrigger value="emails">
              <Mail className="w-4 h-4 mr-2" />
              Emails ({emails.length})
            </TabsTrigger>
            <TabsTrigger value="activity">
              <FileText className="w-4 h-4 mr-2" />
              Activité
            </TabsTrigger>
          </TabsList>

          <TabsContent value="documents" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Documents associés</CardTitle>
                <CardDescription>
                  Liste des documents liés à ce dossier
                </CardDescription>
              </CardHeader>
              <CardContent>
                {documents.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Aucun document pour ce dossier
                  </div>
                ) : (
                  <div className="space-y-2">
                    {documents.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                        <div className="flex items-center space-x-3">
                          <Upload className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{doc.nom_fichier}</p>
                            <p className="text-sm text-muted-foreground">
                              {(doc.taille / 1024).toFixed(2)} KB • {new Date(doc.created_at).toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="emails" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Emails associés</CardTitle>
                <CardDescription>
                  Liste des emails liés à ce dossier
                </CardDescription>
              </CardHeader>
              <CardContent>
                {emails.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Aucun email pour ce dossier
                  </div>
                ) : (
                  <div className="space-y-2">
                    {emails.map((email) => (
                      <div key={email.id} className="p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium">{email.sujet}</p>
                          <Badge variant={email.statut === 'envoye' ? 'default' : 'secondary'}>
                            {email.statut}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          À: {email.destinataire} • {new Date(email.date_envoi).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Historique d'activité</CardTitle>
                <CardDescription>
                  Timeline des actions sur ce dossier
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium">Dossier créé</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(dossier.created_at).toLocaleString('fr-FR')}
                      </p>
                    </div>
                  </div>
                  {dossier.updated_at !== dossier.created_at && (
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                      <div>
                        <p className="font-medium">Dossier modifié</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(dossier.updated_at).toLocaleString('fr-FR')}
                        </p>
                      </div>
                    </div>
                  )}
                  {documents.map((doc) => (
                    <div key={doc.id} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <div>
                        <p className="font-medium">Document ajouté: {doc.nom_fichier}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(doc.created_at).toLocaleString('fr-FR')}
                        </p>
                      </div>
                    </div>
                  ))}
                  {emails.map((email) => (
                    <div key={email.id} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                      <div>
                        <p className="font-medium">Email envoyé: {email.sujet}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(email.date_envoi).toLocaleString('fr-FR')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
