import { useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, GraduationCap, Target, TrendingUp, Users } from "lucide-react";

export default function BilanCompetence() {
  const [, setLocation] = useLocation();

  // Redirect to bilancompetence.ai after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.href = "https://bilancompetence.ai/";
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleRedirectNow = () => {
    window.location.href = "https://bilancompetence.ai/";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-3">
            <GraduationCap className="h-10 w-10 text-blue-600" />
            Bilan de Compétences
          </h1>
          <p className="text-gray-600 text-lg">
            Découvrez votre potentiel avec notre solution IA
          </p>
        </div>

        <Card className="border-2 border-blue-200 mb-6">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Redirection en cours...</CardTitle>
            <CardDescription>
              Vous allez être redirigé vers <strong>bilancompetence.ai</strong> dans quelques secondes
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="mb-6">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            </div>
            <Button onClick={handleRedirectNow} size="lg" className="gap-2">
              <ExternalLink className="h-5 w-5" />
              Accéder maintenant à bilancompetence.ai
            </Button>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-white" />
              </div>
              <CardTitle>Clarifiez vos objectifs</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Identifiez vos compétences, vos motivations et définissez votre projet professionnel avec l'aide de l'intelligence artificielle.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-teal-600 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <CardTitle>Évoluez professionnellement</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Bénéficiez d'un accompagnement personnalisé pour votre reconversion ou évolution de carrière.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-br from-orange-600 to-red-600 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <CardTitle>Accompagnement expert</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Des consultants certifiés vous guident tout au long de votre démarche de bilan de compétences.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <CardTitle>Financement OPCO</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Votre bilan de compétences peut être financé par votre OPCO. Nous vous accompagnons dans les démarches.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Pourquoi choisir bilancompetence.ai ?</h2>
          <p className="text-lg mb-6">
            Une solution innovante qui combine l'expertise humaine et l'intelligence artificielle pour un bilan de compétences moderne et efficace.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={handleRedirectNow} size="lg" variant="secondary" className="gap-2">
              <ExternalLink className="h-5 w-5" />
              Découvrir bilancompetence.ai
            </Button>
            <Button onClick={() => setLocation("/dashboard")} size="lg" variant="outline" className="bg-white/10 hover:bg-white/20 text-white border-white/30">
              Retour au dashboard
            </Button>
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            Un service proposé par <strong>Netz Informatique</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
