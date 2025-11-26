import { jsPDF } from 'jspdf';

type Dossier = {
  id: string;
  titre: string;
  description: string;
  statut: 'brouillon' | 'en_cours' | 'termine' | 'archive';
  created_at: string;
  updated_at: string;
};

type Document = {
  id: string;
  nom_fichier: string;
  type_fichier: string;
  taille: number;
  created_at: string;
};

type Email = {
  id: string;
  destinataire: string;
  sujet: string;
  corps: string;
  statut: 'envoye' | 'en_attente' | 'echec';
  date_envoi: string;
};

export async function exportDossierToPDF(
  dossier: Dossier,
  documents: Document[],
  emails: Email[]
): Promise<void> {
  const doc = new jsPDF();
  
  // Configuration
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const lineHeight = 7;
  let yPosition = margin;

  // Helper function to add new page if needed
  const checkPageBreak = (requiredSpace: number = 20) => {
    if (yPosition + requiredSpace > pageHeight - margin) {
      doc.addPage();
      yPosition = margin;
      return true;
    }
    return false;
  };

  // Helper function to format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // Helper function to format file size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  // Helper function to get status label
  const getStatusLabel = (statut: Dossier['statut']) => {
    const labels: Record<Dossier['statut'], string> = {
      brouillon: 'Brouillon',
      en_cours: 'En cours',
      termine: 'Terminé',
      archive: 'Archivé',
    };
    return labels[statut];
  };

  // ===== HEADER =====
  // Logo/Title
  doc.setFillColor(59, 130, 246); // Blue
  doc.rect(margin, yPosition, 30, 10, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('MonOPCO', margin + 15, yPosition + 7, { align: 'center' });
  
  // Document title
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(20);
  doc.text('Dossier de Formation', margin + 40, yPosition + 7);
  
  yPosition += 20;

  // ===== DOSSIER INFORMATION =====
  doc.setFillColor(240, 240, 240);
  doc.rect(margin, yPosition, pageWidth - 2 * margin, 8, 'F');
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(59, 130, 246);
  doc.text('Informations du Dossier', margin + 2, yPosition + 6);
  yPosition += 12;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);

  // Title
  doc.setFont('helvetica', 'bold');
  doc.text('Titre:', margin, yPosition);
  doc.setFont('helvetica', 'normal');
  doc.text(dossier.titre, margin + 30, yPosition);
  yPosition += lineHeight;

  // Description
  if (dossier.description) {
    doc.setFont('helvetica', 'bold');
    doc.text('Description:', margin, yPosition);
    doc.setFont('helvetica', 'normal');
    const descLines = doc.splitTextToSize(dossier.description, pageWidth - 2 * margin - 30);
    doc.text(descLines, margin + 30, yPosition);
    yPosition += lineHeight * descLines.length;
  }

  // Status
  doc.setFont('helvetica', 'bold');
  doc.text('Statut:', margin, yPosition);
  doc.setFont('helvetica', 'normal');
  doc.text(getStatusLabel(dossier.statut), margin + 30, yPosition);
  yPosition += lineHeight;

  // Dates
  doc.setFont('helvetica', 'bold');
  doc.text('Créé le:', margin, yPosition);
  doc.setFont('helvetica', 'normal');
  doc.text(formatDate(dossier.created_at), margin + 30, yPosition);
  yPosition += lineHeight;

  doc.setFont('helvetica', 'bold');
  doc.text('Modifié le:', margin, yPosition);
  doc.setFont('helvetica', 'normal');
  doc.text(formatDate(dossier.updated_at), margin + 30, yPosition);
  yPosition += 15;

  // ===== DOCUMENTS SECTION =====
  checkPageBreak(30);

  doc.setFillColor(240, 240, 240);
  doc.rect(margin, yPosition, pageWidth - 2 * margin, 8, 'F');
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(59, 130, 246);
  doc.text(`Documents (${documents.length})`, margin + 2, yPosition + 6);
  yPosition += 12;

  if (documents.length === 0) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(128, 128, 128);
    doc.text('Aucun document associé', margin, yPosition);
    yPosition += 10;
  } else {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    
    // Table header
    doc.text('Nom du fichier', margin, yPosition);
    doc.text('Type', margin + 80, yPosition);
    doc.text('Taille', margin + 110, yPosition);
    doc.text('Date', margin + 140, yPosition);
    yPosition += 5;
    
    // Separator line
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 5;

    // Table rows
    doc.setFont('helvetica', 'normal');
    documents.forEach((document, index) => {
      checkPageBreak(10);
      
      const fileName = document.nom_fichier.length > 30 
        ? document.nom_fichier.substring(0, 27) + '...' 
        : document.nom_fichier;
      
      doc.text(fileName, margin, yPosition);
      doc.text(document.type_fichier || '-', margin + 80, yPosition);
      doc.text(formatFileSize(document.taille), margin + 110, yPosition);
      doc.text(formatDate(document.created_at), margin + 140, yPosition);
      yPosition += 6;

      // Light separator
      if (index < documents.length - 1) {
        doc.setDrawColor(240, 240, 240);
        doc.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 1;
      }
    });
    yPosition += 10;
  }

  // ===== EMAILS SECTION =====
  checkPageBreak(30);

  doc.setFillColor(240, 240, 240);
  doc.rect(margin, yPosition, pageWidth - 2 * margin, 8, 'F');
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(59, 130, 246);
  doc.text(`Emails (${emails.length})`, margin + 2, yPosition + 6);
  yPosition += 12;

  if (emails.length === 0) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(128, 128, 128);
    doc.text('Aucun email associé', margin, yPosition);
    yPosition += 10;
  } else {
    emails.forEach((email, index) => {
      checkPageBreak(25);

      // Email card
      doc.setDrawColor(200, 200, 200);
      doc.setFillColor(250, 250, 250);
      const cardHeight = 20;
      doc.roundedRect(margin, yPosition, pageWidth - 2 * margin, cardHeight, 2, 2, 'FD');
      
      yPosition += 5;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('À:', margin + 3, yPosition);
      doc.setFont('helvetica', 'normal');
      doc.text(email.destinataire, margin + 15, yPosition);
      yPosition += 5;

      doc.setFont('helvetica', 'bold');
      doc.text('Sujet:', margin + 3, yPosition);
      doc.setFont('helvetica', 'normal');
      const sujetText = email.sujet.length > 60 
        ? email.sujet.substring(0, 57) + '...' 
        : email.sujet;
      doc.text(sujetText, margin + 15, yPosition);
      yPosition += 5;

      doc.setFont('helvetica', 'bold');
      doc.text('Date:', margin + 3, yPosition);
      doc.setFont('helvetica', 'normal');
      doc.text(formatDate(email.date_envoi), margin + 15, yPosition);
      
      // Status badge
      const statusX = pageWidth - margin - 25;
      const statusColors: Record<Email['statut'], [number, number, number]> = {
        envoye: [34, 197, 94],
        en_attente: [251, 191, 36],
        echec: [239, 68, 68],
      };
      const statusLabels: Record<Email['statut'], string> = {
        envoye: 'Envoyé',
        en_attente: 'En attente',
        echec: 'Échec',
      };
      
      doc.setFillColor(...statusColors[email.statut]);
      doc.roundedRect(statusX, yPosition - 3, 20, 5, 1, 1, 'F');
      doc.setFontSize(7);
      doc.setTextColor(255, 255, 255);
      doc.text(statusLabels[email.statut], statusX + 10, yPosition, { align: 'center' });
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);

      yPosition += 10;
    });
  }

  // ===== FOOTER =====
  const totalPages = doc.internal.pages.length - 1; // Subtract 1 for the empty first page
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Page ${i} sur ${totalPages} - Généré le ${new Date().toLocaleDateString('fr-FR')}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }

  // ===== SAVE PDF =====
  const fileName = `Dossier_${dossier.titre.replace(/[^a-z0-9]/gi, '_')}_${new Date().getTime()}.pdf`;
  doc.save(fileName);
}
