import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { supabase } from '@/lib/supabase';
import { Mail, Send, Search, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';

type Email = {
  id: string;
  destinataire: string;
  sujet: string;
  corps: string;
  statut: 'envoye' | 'en_attente' | 'echec';
  date_envoi: string | null;
  user_id: string;
};

export default function Emails() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, loading: authLoading } = useSupabaseAuth();
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSendDialogOpen, setIsSendDialogOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [formData, setFormData] = useState({
    destinataire: '',
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
      fetchEmails();
    }
  }, [user]);

  const fetchEmails = async () => {
    try {
      const { data, error } = await supabase
        .from('emails')
        .select('*')
        .eq('user_id', user?.id)
        .order('date_envoi', { ascending: false });

      if (error) throw error;
      setEmails(data || []);
    } catch (error: any) {
      toast.error('Erreur de chargement', {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);

    try {
      // In a real app, you would send the email via an API
      // For now, we just save it to the database
      const { error } = await supabase.from('emails').insert([
        {
          ...formData,
          user_id: user?.id,
          statut: 'envoye',
          date_envoi: new Date().toISOString(),
        },
      ]);

      if (error) throw error;

      toast.success('Email envoyé avec succès!');
      setIsSendDialogOpen(false);
      setFormData({ destinataire: '', sujet: '', corps: '' });
      fetchEmails();
    } catch (error: any) {
      toast.error('Erreur d\'envoi', {
        description: error.message,
      });
    } finally {
      setSending(false);
    }
  };

  const getStatusBadge = (statut: Email['statut']) => {
    const variants: Record<Email['statut'], { label: string; variant: 'default' | 'secondary' | 'destructive' }> = {
      envoye: { label: 'Envoyé', variant: 'default' },
      en_attente: { label: 'En attente', variant: 'secondary' },
      echec: { label: 'Échec', variant: 'destructive' },
    };

    const { label, variant } = variants[statut];
    return <Badge variant={variant}>{label}</Badge>;
  };

  const filteredEmails = emails.filter(
    (e) =>
      e.destinataire.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.sujet.toLowerCase().includes(searchTerm.toLowerCase())
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
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Mes Emails</h1>
            <p className="text-muted-foreground">
              Gérez vos communications professionnelles
            </p>
          </div>
          <Dialog open={isSendDialogOpen} onOpenChange={setIsSendDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Send className="w-4 h-4 mr-2" />
                Envoyer un email
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <form onSubmit={handleSend}>
                <DialogHeader>
                  <DialogTitle>Envoyer un email</DialogTitle>
                  <DialogDescription>
                    Composez votre message professionnel
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="destinataire">Destinataire *</Label>
                    <Input
                      id="destinataire"
                      type="email"
                      placeholder="email@example.com"
                      value={formData.destinataire}
                      onChange={(e) => setFormData({ ...formData, destinataire: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sujet">Sujet *</Label>
                    <Input
                      id="sujet"
                      placeholder="Objet de l'email"
                      value={formData.sujet}
                      onChange={(e) => setFormData({ ...formData, sujet: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="corps">Message *</Label>
                    <Textarea
                      id="corps"
                      placeholder="Votre message..."
                      value={formData.corps}
                      onChange={(e) => setFormData({ ...formData, corps: e.target.value })}
                      rows={8}
                      required
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={sending}>
                    {sending ? 'Envoi...' : 'Envoyer'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Historique des emails</CardTitle>
                <CardDescription>{filteredEmails.length} email(s)</CardDescription>
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
            {filteredEmails.length === 0 ? (
              <div className="text-center py-12">
                <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Aucun email trouvé</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Destinataire</TableHead>
                    <TableHead>Sujet</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Date d'envoi</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmails.map((email) => (
                    <TableRow key={email.id}>
                      <TableCell className="font-medium">{email.destinataire}</TableCell>
                      <TableCell className="max-w-md truncate">{email.sujet}</TableCell>
                      <TableCell>{getStatusBadge(email.statut)}</TableCell>
                      <TableCell>
                        {email.date_envoi
                          ? new Date(email.date_envoi).toLocaleDateString('fr-FR')
                          : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
