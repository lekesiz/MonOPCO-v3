import { useState, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { supabase } from '@/lib/supabase';
import { Plus, Mail, Search, Edit, Trash2, Eye, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { APP_TITLE } from '@/const';

type EmailTemplate = {
  id: string;
  nom: string;
  sujet: string;
  corps: string;
  placeholders: string[];
  user_id: string;
  created_at: string;
  updated_at: string;
};

export default function EmailTemplates() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, loading: authLoading } = useSupabaseAuth();
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);
  const [formData, setFormData] = useState({
    nom: '',
    sujet: '',
    corps: '',
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setLocation('/login');
    }
  }, [authLoading, isAuthenticated, setLocation]);

  useEffect(() => {
    if (user) {
      fetchTemplates();
    }
  }, [user]);

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .eq('user_id', user?.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error: any) {
      toast.error('Erreur de chargement', {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const extractPlaceholders = (text: string): string[] => {
    const regex = /\{\{(\w+)\}\}/g;
    const matches = text.match(regex) || [];
    return Array.from(new Set(matches.map(m => m.replace(/\{\{|\}\}/g, ''))));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    const placeholders = [
      ...extractPlaceholders(formData.sujet),
      ...extractPlaceholders(formData.corps)
    ];

    try {
      const { error } = await supabase.from('email_templates').insert([
        {
          ...formData,
          placeholders,
          user_id: user?.id,
        },
      ]);

      if (error) throw error;

      toast.success('Template créé avec succès!');
      setIsCreateDialogOpen(false);
      setFormData({ nom: '', sujet: '', corps: '' });
      fetchTemplates();
    } catch (error: any) {
      toast.error('Erreur de création', {
        description: error.message,
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce template?')) return;

    try {
      const { error } = await supabase.from('email_templates').delete().eq('id', id);

      if (error) throw error;

      toast.success('Template supprimé');
      fetchTemplates();
    } catch (error: any) {
      toast.error('Erreur de suppression', {
        description: error.message,
      });
    }
  };

  const handlePreview = (template: EmailTemplate) => {
    setPreviewTemplate(template);
    setIsPreviewDialogOpen(true);
  };

  const handleCopyTemplate = (template: EmailTemplate) => {
    const text = `Sujet: ${template.sujet}\n\n${template.corps}`;
    navigator.clipboard.writeText(text);
    toast.success('Template copié dans le presse-papiers');
  };

  const filteredTemplates = templates.filter((t) =>
    t.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.sujet.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">M</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {APP_TITLE}
              </span>
            </div>
            <Link href="/dashboard">
              <Button variant="outline">Dashboard</Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Templates d'Emails</h1>
            <p className="text-muted-foreground">
              Créez et gérez vos templates d'emails réutilisables
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nouveau Template
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <form onSubmit={handleCreate}>
                <DialogHeader>
                  <DialogTitle>Créer un nouveau template</DialogTitle>
                  <DialogDescription>
                    Utilisez des placeholders comme {'{{nom}}'}, {'{{prenom}}'}, {'{{email}}'} pour personnaliser
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="nom">Nom du template *</Label>
                    <Input
                      id="nom"
                      placeholder="Ex: Confirmation d'inscription"
                      value={formData.nom}
                      onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sujet">Sujet *</Label>
                    <Input
                      id="sujet"
                      placeholder="Ex: Bienvenue {'{{prenom}}'} - Votre inscription est confirmée"
                      value={formData.sujet}
                      onChange={(e) => setFormData({ ...formData, sujet: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="corps">Corps du message *</Label>
                    <Textarea
                      id="corps"
                      placeholder={`Bonjour {'{{prenom}}'} {'{{nom}}'},\n\nNous avons bien reçu votre demande...\n\nCordialement,\nL'équipe ${APP_TITLE}`}
                      value={formData.corps}
                      onChange={(e) => setFormData({ ...formData, corps: e.target.value })}
                      rows={10}
                      required
                    />
                  </div>
                  <div className="bg-muted p-3 rounded-lg text-sm">
                    <p className="font-medium mb-1">Placeholders disponibles:</p>
                    <p className="text-muted-foreground">
                      {'{{nom}}'}, {'{{prenom}}'}, {'{{email}}'}, {'{{entreprise}}'}, {'{{date}}'}
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Créer le template</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Mes Templates</CardTitle>
                <CardDescription>{filteredTemplates.length} template(s)</CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Search className="w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredTemplates.length === 0 ? (
              <div className="text-center py-12">
                <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Aucun template trouvé</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Sujet</TableHead>
                    <TableHead>Placeholders</TableHead>
                    <TableHead>Date de création</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTemplates.map((template) => (
                    <TableRow key={template.id}>
                      <TableCell className="font-medium">{template.nom}</TableCell>
                      <TableCell className="max-w-md truncate">
                        {template.sujet}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {template.placeholders.map((p, i) => (
                            <span key={i} className="text-xs bg-muted px-2 py-1 rounded">
                              {'{{' + p + '}}'}
                            </span>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(template.created_at).toLocaleDateString('fr-FR')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handlePreview(template)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopyTemplate(template)}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(template.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Preview Dialog */}
      <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{previewTemplate?.nom}</DialogTitle>
            <DialogDescription>
              Aperçu du template
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Sujet</Label>
              <div className="mt-1 p-3 bg-muted rounded-lg">
                {previewTemplate?.sujet}
              </div>
            </div>
            <div>
              <Label>Corps du message</Label>
              <div className="mt-1 p-3 bg-muted rounded-lg whitespace-pre-wrap">
                {previewTemplate?.corps}
              </div>
            </div>
            <div>
              <Label>Placeholders détectés</Label>
              <div className="mt-1 flex flex-wrap gap-2">
                {previewTemplate?.placeholders.map((p, i) => (
                  <span key={i} className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-full">
                    {'{{' + p + '}}'}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
