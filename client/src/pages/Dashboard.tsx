import { useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { FileText, Upload, Mail, LogOut, User } from 'lucide-react';
import { APP_TITLE } from '@/const';
import { toast } from 'sonner';

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { user, appUser, loading, isAuthenticated, signOut } = useSupabaseAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      setLocation('/login');
    }
  }, [loading, isAuthenticated, setLocation]);

  const handleLogout = async () => {
    const { error } = await signOut();
    if (error) {
      toast.error('Erreur de déconnexion');
    } else {
      toast.success('Déconnexion réussie');
      setLocation('/');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
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
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm font-medium">
                  {appUser?.prenom} {appUser?.nom}
                </span>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Bienvenue, {appUser?.prenom}!
          </h1>
          <p className="text-muted-foreground">
            Gérez vos dossiers et documents depuis votre tableau de bord
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <CardTitle>Mes Dossiers</CardTitle>
              <CardDescription>
                Gérez vos dossiers de formation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/dossiers">
                <Button className="w-full">
                  Voir les dossiers
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg flex items-center justify-center mb-4">
                <Upload className="w-6 h-6 text-white" />
              </div>
              <CardTitle>Documents</CardTitle>
              <CardDescription>
                Téléchargez et gérez vos documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/documents">
                <Button className="w-full">
                  Gérer les documents
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-br from-orange-600 to-red-600 rounded-lg flex items-center justify-center mb-4">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <CardTitle>Emails</CardTitle>
              <CardDescription>
                Envoyez et suivez vos emails
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/emails">
                <Button className="w-full">
                  Voir les emails
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Dossiers actifs</CardDescription>
              <CardTitle className="text-3xl">0</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Documents</CardDescription>
              <CardTitle className="text-3xl">0</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Emails envoyés</CardDescription>
              <CardTitle className="text-3xl">0</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>En attente</CardDescription>
              <CardTitle className="text-3xl">0</CardTitle>
            </CardHeader>
          </Card>
        </div>
      </main>
    </div>
  );
}
