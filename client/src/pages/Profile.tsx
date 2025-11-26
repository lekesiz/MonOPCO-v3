import { useState, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { supabase } from '@/lib/supabase';
import { User, Mail, Building, Upload, Lock, Save, FileText, Send, Search, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';
import { APP_TITLE } from '@/const';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

type UserProfile = {
  id: string;
  email: string;
  prenom?: string;
  nom?: string;
  entreprise_nom?: string;
  entreprise_siret?: string;
  avatar_url?: string;
  created_at: string;
};

type Stats = {
  dossiers: number;
  documents: number;
  emails: number;
};

export default function Profile() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, loading: authLoading } = useSupabaseAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<Stats>({ dossiers: 0, documents: 0, emails: 0 });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    prenom: '',
    nom: '',
    entreprise_nom: '',
    entreprise_siret: '',
    entreprise_adresse: '',
    entreprise_forme_juridique: '',
  });
  const [searchingPappers, setSearchingPappers] = useState(false);
  const searchBySiretMutation = trpc.pappers.searchBySiret.useMutation();
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setLocation('/login');
    }
  }, [authLoading, isAuthenticated, setLocation]);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchStats();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      
      setProfile(data);
      setFormData({
        prenom: data.prenom || '',
        nom: data.nom || '',
        entreprise_nom: data.entreprise_nom || '',
        entreprise_siret: data.entreprise_siret || '',
        entreprise_adresse: data.entreprise_adresse || '',
        entreprise_forme_juridique: data.entreprise_forme_juridique || '',
      });
    } catch (error: any) {
      toast.error('Erreur de chargement du profil', {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const [dossiersRes, documentsRes, emailsRes] = await Promise.all([
        supabase.from('dossiers').select('id', { count: 'exact', head: true }).eq('user_id', user?.id),
        supabase.from('documents').select('id', { count: 'exact', head: true }).eq('user_id', user?.id),
        supabase.from('emails').select('id', { count: 'exact', head: true }).eq('user_id', user?.id),
      ]);

      setStats({
        dossiers: dossiersRes.count || 0,
        documents: documentsRes.count || 0,
        emails: emailsRes.count || 0,
      });
    } catch (error: any) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Format invalide', {
        description: 'Veuillez sélectionner une image',
      });
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Fichier trop volumineux', {
        description: 'La taille maximale est de 2MB',
      });
      return;
    }

    setUploading(true);

    try {
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      // Update user profile
      const { error: updateError } = await supabase
        .from('users')
        .update({ avatar_url: publicUrl })
        .eq('id', user?.id);

      if (updateError) throw updateError;

      toast.success('Avatar mis à jour!');
      fetchProfile();
    } catch (error: any) {
      toast.error('Erreur de téléchargement', {
        description: error.message,
      });
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { error } = await supabase
        .from('users')
        .update(formData)
        .eq('id', user?.id);

      if (error) throw error;

      toast.success('Profil mis à jour!');
      fetchProfile();
    } catch (error: any) {
      toast.error('Erreur de mise à jour', {
        description: error.message,
      });
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      });

      if (error) throw error;

      toast.success('Mot de passe changé avec succès!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      toast.error('Erreur de changement de mot de passe', {
        description: error.message,
      });
    }
  };

  const getInitials = () => {
    if (profile?.prenom && profile?.nom) {
      return `${profile.prenom[0]}${profile.nom[0]}`.toUpperCase();
    }
    return profile?.email?.[0]?.toUpperCase() || 'U';
  };

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
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Mon Profil</h1>
          <p className="text-muted-foreground mb-8">
            Gérez vos informations personnelles et préférences
          </p>

          <div className="grid gap-6">
            {/* Avatar & Stats Card */}
            <Card>
              <CardHeader>
                <CardTitle>Informations du compte</CardTitle>
                <CardDescription>Votre photo de profil et statistiques</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-start space-x-6">
                  <div className="flex flex-col items-center space-y-4">
                    <Avatar className="w-24 h-24">
                      <AvatarImage src={profile?.avatar_url} />
                      <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                        {getInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <input
                        type="file"
                        id="avatar-upload"
                        className="hidden"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        disabled={uploading}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => document.getElementById('avatar-upload')?.click()}
                        disabled={uploading}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        {uploading ? 'Téléchargement...' : 'Changer la photo'}
                      </Button>
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <FileText className="w-5 h-5 text-blue-600" />
                          <span className="text-sm text-muted-foreground">Dossiers</span>
                        </div>
                        <p className="text-2xl font-bold text-blue-600">{stats.dossiers}</p>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <FileText className="w-5 h-5 text-purple-600" />
                          <span className="text-sm text-muted-foreground">Documents</span>
                        </div>
                        <p className="text-2xl font-bold text-purple-600">{stats.documents}</p>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <Send className="w-5 h-5 text-green-600" />
                          <span className="text-sm text-muted-foreground">Emails</span>
                        </div>
                        <p className="text-2xl font-bold text-green-600">{stats.emails}</p>
                      </div>
                    </div>
                    <div className="mt-4 text-sm text-muted-foreground">
                      <p>Email: {profile?.email}</p>
                      <p>Membre depuis: {new Date(profile?.created_at || '').toLocaleDateString('fr-FR')}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Profile Information Card */}
            <Card>
              <CardHeader>
                <CardTitle>Informations personnelles</CardTitle>
                <CardDescription>Mettez à jour vos informations</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="prenom">Prénom</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="prenom"
                          className="pl-10"
                          value={formData.prenom}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, prenom: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nom">Nom</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="nom"
                          className="pl-10"
                          value={formData.nom}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, nom: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label htmlFor="entreprise_nom">Nom de l'entreprise</Label>
                    <div className="relative">
                      <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="entreprise_nom"
                        className="pl-10"
                        value={formData.entreprise_nom}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, entreprise_nom: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="entreprise_siret">SIRET</Label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="entreprise_siret"
                          className="pl-10"
                          value={formData.entreprise_siret}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, entreprise_siret: e.target.value })}
                          maxLength={14}
                          placeholder="14 chiffres"
                          disabled={searchingPappers}
                        />
                      </div>
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
                              toast.success('Informations récupérées!', {
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
                        disabled={searchingPappers || !formData.entreprise_siret}
                      >
                        {searchingPappers ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Search className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Cliquez sur le bouton de recherche pour récupérer automatiquement les informations
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="entreprise_adresse">Adresse</Label>
                    <div className="relative">
                      <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="entreprise_adresse"
                        className="pl-10"
                        value={formData.entreprise_adresse}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, entreprise_adresse: e.target.value })}
                        placeholder="123 Rue de la République, 75001 Paris"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="entreprise_forme_juridique">Forme juridique</Label>
                    <div className="relative">
                      <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="entreprise_forme_juridique"
                        className="pl-10"
                        value={formData.entreprise_forme_juridique}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, entreprise_forme_juridique: e.target.value })}
                        placeholder="SARL, SAS, EURL..."
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full">
                    <Save className="w-4 h-4 mr-2" />
                    Enregistrer les modifications
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Password Change Card */}
            <Card>
              <CardHeader>
                <CardTitle>Changer le mot de passe</CardTitle>
                <CardDescription>Mettez à jour votre mot de passe</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="newPassword"
                        type="password"
                        className="pl-10"
                        value={passwordData.newPassword}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        type="password"
                        className="pl-10"
                        value={passwordData.confirmPassword}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full">
                    <Lock className="w-4 h-4 mr-2" />
                    Changer le mot de passe
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
