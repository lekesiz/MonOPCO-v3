import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { FileSignature, Plus, Trash2, Send, CheckCircle2, Clock, XCircle } from "lucide-react";

interface Signer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
}

export default function SignatureElectronique() {
  const [, setLocation] = useLocation();
  const [documentName, setDocumentName] = useState("");
  const [signers, setSigners] = useState<Signer[]>([{
    id: "1",
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
  }]);
  const [signatureLevel, setSignatureLevel] = useState<"electronic_signature" | "advanced_electronic_signature">("electronic_signature");
  const [authMode, setAuthMode] = useState<"no_otp" | "otp_sms" | "otp_email">("otp_email");
  const [emailNote, setEmailNote] = useState("");
  const [signatureRequestId, setSignatureRequestId] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const createSignatureRequestMutation = trpc.yousign.createSignatureRequest.useMutation();
  const addSignerMutation = trpc.yousign.addSigner.useMutation();
  const activateSignatureRequestMutation = trpc.yousign.activateSignatureRequest.useMutation();
  const getSignatureRequestQuery = trpc.yousign.getSignatureRequest.useQuery(
    { signatureRequestId: signatureRequestId || "" },
    { enabled: !!signatureRequestId, refetchInterval: 5000 }
  );

  const addSigner = () => {
    setSigners([...signers, {
      id: Date.now().toString(),
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
    }]);
  };

  const removeSigner = (id: string) => {
    if (signers.length > 1) {
      setSigners(signers.filter(s => s.id !== id));
    }
  };

  const updateSigner = (id: string, field: keyof Signer, value: string) => {
    setSigners(signers.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const handleCreateSignatureRequest = async () => {
    if (!documentName.trim()) {
      toast.error("Veuillez entrer un nom de document");
      return;
    }

    const invalidSigners = signers.filter(s => !s.firstName || !s.lastName || !s.email);
    if (invalidSigners.length > 0) {
      toast.error("Veuillez remplir tous les champs des signataires");
      return;
    }

    try {
      toast.loading("Création de la demande de signature...");

      // 1. Créer la demande de signature
      const signatureRequest = await createSignatureRequestMutation.mutateAsync({
        name: documentName,
        deliveryMode: "email",
        timezone: "Europe/Paris",
        emailCustomNote: emailNote || undefined,
      });

      setSignatureRequestId(signatureRequest.id);

      // 2. Ajouter les signataires
      for (const signer of signers) {
        await addSignerMutation.mutateAsync({
          signatureRequestId: signatureRequest.id,
          firstName: signer.firstName,
          lastName: signer.lastName,
          email: signer.email,
          phoneNumber: signer.phoneNumber || undefined,
          signatureLevel: signatureLevel,
          signatureAuthenticationMode: authMode,
        });
      }

      // 3. Activer la demande (envoyer aux signataires)
      await activateSignatureRequestMutation.mutateAsync({
        signatureRequestId: signatureRequest.id,
      });

      toast.dismiss();
      toast.success("Demande de signature envoyée avec succès !");
      setStatus("ongoing");
    } catch (error: any) {
      toast.dismiss();
      toast.error(`Erreur : ${error.message}`);
      console.error(error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "draft":
        return <Clock className="h-5 w-5 text-gray-500" />;
      case "ongoing":
        return <Clock className="h-5 w-5 text-blue-500" />;
      case "done":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "expired":
      case "canceled":
      case "declined":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "draft":
        return "Brouillon";
      case "ongoing":
        return "En cours";
      case "done":
        return "Terminé";
      case "expired":
        return "Expiré";
      case "canceled":
        return "Annulé";
      case "declined":
        return "Refusé";
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <FileSignature className="h-10 w-10 text-blue-600" />
            Signature Électronique
          </h1>
          <p className="text-gray-600">
            Créez une demande de signature électronique pour vos documents OPCO
          </p>
        </div>

        {signatureRequestId && getSignatureRequestQuery.data ? (
          <Card className="border-2 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getStatusIcon(getSignatureRequestQuery.data.status)}
                Demande de signature créée
              </CardTitle>
              <CardDescription>
                Statut : {getStatusLabel(getSignatureRequestQuery.data.status)}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>ID de la demande</Label>
                <Input value={signatureRequestId} readOnly className="font-mono text-sm" />
              </div>
              <div>
                <Label>Nom du document</Label>
                <Input value={getSignatureRequestQuery.data.name} readOnly />
              </div>
              <div>
                <Label>Signataires ({getSignatureRequestQuery.data.signers.length})</Label>
                <div className="space-y-2 mt-2">
                  {getSignatureRequestQuery.data.signers.map((signer, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <p className="font-medium">
                        {signer.info.first_name} {signer.info.last_name}
                      </p>
                      <p className="text-sm text-gray-600">{signer.info.email}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => {
                  setSignatureRequestId(null);
                  setStatus(null);
                  setDocumentName("");
                  setSigners([{ id: "1", firstName: "", lastName: "", email: "", phoneNumber: "" }]);
                  setEmailNote("");
                }}>
                  Nouvelle demande
                </Button>
                <Button variant="outline" onClick={() => setLocation("/dashboard")}>
                  Retour au dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informations du document</CardTitle>
                <CardDescription>
                  Entrez les détails du document à faire signer
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="documentName">Nom du document *</Label>
                  <Input
                    id="documentName"
                    placeholder="Ex: Contrat de formation OPCO 2025"
                    value={documentName}
                    onChange={(e) => setDocumentName(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="emailNote">Note personnalisée (email)</Label>
                  <Textarea
                    id="emailNote"
                    placeholder="Message personnalisé qui sera inclus dans l'email de demande de signature"
                    value={emailNote}
                    onChange={(e) => setEmailNote(e.target.value)}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Signataires ({signers.length})</span>
                  <Button onClick={addSigner} size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter
                  </Button>
                </CardTitle>
                <CardDescription>
                  Ajoutez les personnes qui doivent signer le document
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {signers.map((signer, index) => (
                  <div key={signer.id} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Signataire {index + 1}</h4>
                      {signers.length > 1 && (
                        <Button
                          onClick={() => removeSigner(signer.id)}
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Prénom *</Label>
                        <Input
                          placeholder="Jean"
                          value={signer.firstName}
                          onChange={(e) => updateSigner(signer.id, "firstName", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Nom *</Label>
                        <Input
                          placeholder="Dupont"
                          value={signer.lastName}
                          onChange={(e) => updateSigner(signer.id, "lastName", e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Email *</Label>
                      <Input
                        type="email"
                        placeholder="jean.dupont@example.com"
                        value={signer.email}
                        onChange={(e) => updateSigner(signer.id, "email", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Téléphone (optionnel)</Label>
                      <Input
                        type="tel"
                        placeholder="+33 6 12 34 56 78"
                        value={signer.phoneNumber}
                        onChange={(e) => updateSigner(signer.id, "phoneNumber", e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Options de signature</CardTitle>
                <CardDescription>
                  Configurez le niveau de sécurité de la signature
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="signatureLevel">Niveau de signature</Label>
                  <Select value={signatureLevel} onValueChange={(value: any) => setSignatureLevel(value)}>
                    <SelectTrigger id="signatureLevel">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="electronic_signature">
                        Signature électronique simple
                      </SelectItem>
                      <SelectItem value="advanced_electronic_signature">
                        Signature électronique avancée
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-500 mt-1">
                    {signatureLevel === "electronic_signature"
                      ? "Signature simple avec authentification par email"
                      : "Signature avancée avec vérification d'identité renforcée"}
                  </p>
                </div>
                <div>
                  <Label htmlFor="authMode">Mode d'authentification</Label>
                  <Select value={authMode} onValueChange={(value: any) => setAuthMode(value)}>
                    <SelectTrigger id="authMode">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no_otp">Sans OTP</SelectItem>
                      <SelectItem value="otp_email">OTP par email</SelectItem>
                      <SelectItem value="otp_sms">OTP par SMS</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-500 mt-1">
                    {authMode === "no_otp" && "Aucune authentification supplémentaire"}
                    {authMode === "otp_email" && "Code de vérification envoyé par email"}
                    {authMode === "otp_sms" && "Code de vérification envoyé par SMS"}
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button
                onClick={handleCreateSignatureRequest}
                className="flex-1"
                size="lg"
                disabled={createSignatureRequestMutation.isPending}
              >
                <Send className="h-5 w-5 mr-2" />
                {createSignatureRequestMutation.isPending
                  ? "Envoi en cours..."
                  : "Envoyer la demande de signature"}
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => setLocation("/dashboard")}
              >
                Annuler
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
