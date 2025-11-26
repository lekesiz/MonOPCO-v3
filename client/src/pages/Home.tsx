import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { FileText, Upload, Mail, Shield, Zap, Users } from 'lucide-react';
import { APP_TITLE } from '@/const';

export default function Home() {
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useSupabaseAuth();

  const features = [
    {
      icon: FileText,
      title: 'Gestion de Dossiers',
      description: 'Organisez et gérez vos dossiers de formation professionnelle en toute simplicité.',
    },
    {
      icon: Upload,
      title: 'Upload de Documents',
      description: 'Téléchargez et stockez vos documents en toute sécurité dans le cloud.',
    },
    {
      icon: Mail,
      title: 'Envoi d\'Emails',
      description: 'Envoyez des emails professionnels directement depuis la plateforme.',
    },
    {
      icon: Shield,
      title: 'Sécurité Avancée',
      description: 'Vos données sont protégées par les dernières technologies de sécurité.',
    },
    {
      icon: Zap,
      title: 'Rapide et Efficace',
      description: 'Interface moderne et rapide pour une productivité maximale.',
    },
    {
      icon: Users,
      title: 'Multi-utilisateurs',
      description: 'Gérez plusieurs utilisateurs et leurs accès facilement.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <header className="container mx-auto px-4 py-8">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">M</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {APP_TITLE}
            </span>
          </div>
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <Button onClick={() => setLocation('/dashboard')}>
                Dashboard
              </Button>
            ) : (
              <>
                <Button variant="ghost" onClick={() => setLocation('/login')}>
                  Connexion
                </Button>
                <Button onClick={() => setLocation('/register')}>
                  S'inscrire
                </Button>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* Hero Content */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          Simplifiez la gestion de vos formations professionnelles
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Une plateforme moderne et intuitive pour gérer vos dossiers OPCO, documents et communications en un seul endroit.
        </p>
        <div className="flex items-center justify-center space-x-4">
          <Button size="lg" onClick={() => setLocation('/register')}>
            Commencer gratuitement
          </Button>
          <Button size="lg" variant="outline" onClick={() => setLocation('/login')}>
            Se connecter
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">
          Fonctionnalités principales
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="border-2 hover:border-primary transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="bg-gradient-to-br from-blue-600 to-purple-600 border-0">
          <CardContent className="p-12 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Prêt à commencer?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Rejoignez des centaines d'entreprises qui font confiance à MonOPCO pour gérer leurs formations professionnelles.
            </p>
            <Button size="lg" variant="secondary" onClick={() => setLocation('/register')}>
              Créer un compte gratuitement
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            © 2025 {APP_TITLE}. Tous droits réservés.
          </p>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm">
              Conditions
            </Button>
            <Button variant="ghost" size="sm">
              Confidentialité
            </Button>
            <Button variant="ghost" size="sm">
              Contact
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
}
