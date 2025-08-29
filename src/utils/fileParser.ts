import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.worker.min.js';

export class FileParser {
  static async parseFile(file: File): Promise<string> {
    const fileType = file.type;
    const fileName = file.name.toLowerCase();

    try {
      if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
        return await this.parsePDF(file);
      } else if (
        fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        fileName.endsWith('.docx')
      ) {
        return await this.parseDOCX(file);
      } else if (fileType === 'application/msword' || fileName.endsWith('.doc')) {
        return await this.parseDOC(file);
      } else if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
        return await this.parseTXT(file);
      } else {
        throw new Error('Unsupported file format. Please upload PDF, DOC, DOCX, or TXT files.');
      }
    } catch (error) {
      console.error('Error parsing file:', error);
      throw error;
    }
  }

  static async parsePDF(file: File): Promise<string> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let text = '';

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        text += pageText + '\n';
      }

      return text.trim();
    } catch (error) {
      throw new Error('Failed to parse PDF file. Please ensure it\'s a valid PDF.');
    }
  }

  static async parseDOCX(file: File): Promise<string> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value.trim();
    } catch (error) {
      throw new Error('Failed to parse DOCX file. Please ensure it\'s a valid Word document.');
    }
  }

  static async parseDOC(file: File): Promise<string> {
    try {
      // For .doc files, we'll try to use mammoth as well
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value.trim();
    } catch (error) {
      throw new Error('Failed to parse DOC file. Please try converting to DOCX or PDF format.');
    }
  }

  static async parseTXT(file: File): Promise<string> {
    try {
      const text = await file.text();
      return text.trim();
    } catch (error) {
      throw new Error('Failed to read text file.');
    }
  }

  static getSupportedFormats(): string[] {
    return ['.pdf', '.doc', '.docx', '.txt'];
  }

  static getMaxFileSize(): number {
    return 10 * 1024 * 1024; // 10MB
  }

  static validateFile(file: File): { isValid: boolean; error?: string } {
    const maxSize = this.getMaxFileSize();
    const supportedFormats = this.getSupportedFormats();
    
    if (file.size > maxSize) {
      return {
        isValid: false,
        error: `File size must be less than ${maxSize / (1024 * 1024)}MB`
      };
    }

    const fileName = file.name.toLowerCase();
    const isSupported = supportedFormats.some(format => fileName.endsWith(format));
    
    if (!isSupported) {
      return {
        isValid: false,
        error: `Unsupported file format. Please upload one of: ${supportedFormats.join(', ')}`
      };
    }

    return { isValid: true };
  }
}