import jsPDF from 'jspdf';

interface ExportData {
  name: string;
  atsScore: number;
  careerHealthScore: number;
  skillsMatch: number;
  roadmapProgress: number;
  resumeRating: string;
  keyStrengths: string[];
  improvementAreas: string[];
  recommendedSkills: string[];
  careerPath: string;
  estimatedSalary: string;
}

export class PDFExporter {
  static async exportCareerReport(data: ExportData): Promise<void> {
    const pdf = new jsPDF();
    
    // Colors (RGB)
    const primaryBlue = [33, 150, 243] as const;
    const accentGreen = [76, 175, 80] as const;
    const textDark = [33, 37, 41] as const;
    const textLight = [108, 117, 125] as const;

    // Header
    pdf.setFillColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
    pdf.rect(0, 0, 210, 40, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.text('AI CAREER GUIDE', 20, 20);
    pdf.setFontSize(12);
    pdf.text('Professional Career Analysis Report', 20, 30);

    // Candidate Info
    let y = 60;
    pdf.setTextColor(textDark[0], textDark[1], textDark[2]);
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`Career Report for: ${data.name}`, 20, y);
    
    y += 15;
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, y);

    // Career Health Score Section
    y += 25;
    pdf.setFillColor(accentGreen[0], accentGreen[1], accentGreen[2]);
    pdf.rect(15, y - 5, 180, 8, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('CAREER HEALTH SCORE', 20, y);

    y += 20;
    pdf.setTextColor(textDark[0], textDark[1], textDark[2]);
    pdf.setFontSize(24);
    pdf.text(`${data.careerHealthScore}%`, 20, y);
    
    pdf.setFontSize(10);
    pdf.text(`Formula: (ATS Score: ${data.atsScore}% + Skills Match: ${data.skillsMatch}% + Roadmap Progress: ${data.roadmapProgress}%) ÷ 3`, 60, y - 5);

    // Resume Rating
    y += 25;
    pdf.setFillColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
    pdf.rect(15, y - 5, 180, 8, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(14);
    pdf.text('RESUME ANALYSIS', 20, y);

    y += 15;
    pdf.setTextColor(textDark[0], textDark[1], textDark[2]);
    pdf.setFontSize(12);
    pdf.text(`Overall Rating: ${data.resumeRating}`, 20, y);
    pdf.text(`ATS Compatibility Score: ${data.atsScore}%`, 20, y + 10);

    // Career Path
    y += 30;
    pdf.setFillColor(accentGreen[0], accentGreen[1], accentGreen[2]);
    pdf.rect(15, y - 5, 180, 8, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(14);
    pdf.text('RECOMMENDED CAREER PATH', 20, y);

    y += 15;
    pdf.setTextColor(textDark[0], textDark[1], textDark[2]);
    pdf.setFontSize(12);
    pdf.text(`Path: ${data.careerPath}`, 20, y);
    pdf.text(`Estimated Salary: ${data.estimatedSalary}`, 20, y + 10);

    // Save the PDF
    pdf.save(`${data.name.replace(/\s+/g, '_')}_Career_Report.pdf`);
  }
}