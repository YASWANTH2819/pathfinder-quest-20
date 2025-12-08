import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Set up PDF.js worker using CDN - version 5.x compatible
// Note: pdfjs-dist 5.x uses ESM workers
try {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@5.0.375/build/pdf.worker.min.mjs`;
} catch (e) {
  console.warn('[FileParser] Could not set PDF.js worker, using fallback');
}

export class FileParser {
  static async parseFile(file: File): Promise<string> {
    const fileType = file.type;
    const fileName = file.name.toLowerCase();

    console.log(`[FileParser] Parsing file: ${fileName}, type: ${fileType}, size: ${file.size} bytes`);

    try {
      let extractedText = '';
      
      if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
        extractedText = await this.parsePDF(file);
      } else if (
        fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        fileName.endsWith('.docx')
      ) {
        extractedText = await this.parseDOCX(file);
      } else if (fileType === 'application/msword' || fileName.endsWith('.doc')) {
        extractedText = await this.parseDOC(file);
      } else if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
        extractedText = await this.parseTXT(file);
      } else if (fileName.endsWith('.rtf')) {
        extractedText = await this.parseRTF(file);
      } else if (fileType === 'text/csv' || fileName.endsWith('.csv')) {
        extractedText = await this.parseCSV(file);
      } else {
        throw new Error('Unsupported file format. Supported formats: PDF, DOC, DOCX, TXT, RTF, CSV');
      }
      
      console.log(`[FileParser] Successfully extracted ${extractedText.length} characters from ${fileName}`);
      
      if (!extractedText || extractedText.trim().length === 0) {
        throw new Error('No text content could be extracted from the file. The file may be empty, image-based, or corrupted.');
      }
      
      return extractedText;
    } catch (error) {
      console.error('[FileParser] Error parsing file:', error);
      throw error;
    }
  }

  static async parsePDF(file: File): Promise<string> {
    console.log('[FileParser] Starting PDF parsing...');
    try {
      const arrayBuffer = await file.arrayBuffer();
      console.log('[FileParser] PDF ArrayBuffer size:', arrayBuffer.byteLength);
      
      const loadingTask = pdfjsLib.getDocument({ 
        data: arrayBuffer,
        useSystemFonts: true,
        disableFontFace: true
      });
      
      const pdf = await loadingTask.promise;
      console.log('[FileParser] PDF loaded, pages:', pdf.numPages);
      
      let text = '';

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => {
            // Handle different item types
            if ('str' in item) {
              return item.str;
            }
            return '';
          })
          .filter((str: string) => str.length > 0)
          .join(' ');
        
        text += pageText + '\n';
        console.log(`[FileParser] Page ${pageNum}: extracted ${pageText.length} characters`);
      }

      const finalText = text.trim();
      console.log('[FileParser] Total PDF text extracted:', finalText.length, 'characters');
      
      if (finalText.length === 0) {
        throw new Error('PDF appears to be image-based or has no extractable text. Please try a text-based PDF or convert to DOCX.');
      }
      
      return finalText;
    } catch (error) {
      console.error('[FileParser] PDF parsing error:', error);
      if (error instanceof Error && error.message.includes('image-based')) {
        throw error;
      }
      throw new Error(`Failed to parse PDF file: ${error instanceof Error ? error.message : 'Unknown error'}. Please ensure it's a valid, text-based PDF.`);
    }
  }

  static async parseDOCX(file: File): Promise<string> {
    console.log('[FileParser] Starting DOCX parsing...');
    try {
      const arrayBuffer = await file.arrayBuffer();
      console.log('[FileParser] DOCX ArrayBuffer size:', arrayBuffer.byteLength);
      
      const result = await mammoth.extractRawText({ arrayBuffer });
      const text = result.value.trim();
      
      console.log('[FileParser] DOCX text extracted:', text.length, 'characters');
      
      if (result.messages && result.messages.length > 0) {
        console.log('[FileParser] DOCX parsing messages:', result.messages);
      }
      
      return text;
    } catch (error) {
      console.error('[FileParser] DOCX parsing error:', error);
      throw new Error(`Failed to parse DOCX file: ${error instanceof Error ? error.message : 'Unknown error'}. Please ensure it's a valid Word document.`);
    }
  }

  static async parseDOC(file: File): Promise<string> {
    console.log('[FileParser] Starting DOC parsing (using mammoth fallback)...');
    try {
      // For .doc files, mammoth may have limited support
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      const text = result.value.trim();
      
      console.log('[FileParser] DOC text extracted:', text.length, 'characters');
      
      if (text.length === 0) {
        throw new Error('Could not extract text from DOC file. Please convert to DOCX or PDF format.');
      }
      
      return text;
    } catch (error) {
      console.error('[FileParser] DOC parsing error:', error);
      throw new Error('Failed to parse DOC file. Please convert to DOCX or PDF format for better compatibility.');
    }
  }

  static async parseTXT(file: File): Promise<string> {
    console.log('[FileParser] Starting TXT parsing...');
    try {
      const text = await file.text();
      console.log('[FileParser] TXT text extracted:', text.length, 'characters');
      return text.trim();
    } catch (error) {
      console.error('[FileParser] TXT parsing error:', error);
      throw new Error('Failed to read text file.');
    }
  }

  static async parseRTF(file: File): Promise<string> {
    console.log('[FileParser] Starting RTF parsing...');
    try {
      const text = await file.text();
      // Simple RTF text extraction (removes RTF formatting codes)
      const cleanText = text
        .replace(/\\[a-z]+\d*\s?/gi, '') // Remove RTF commands
        .replace(/[{}]/g, '') // Remove braces
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();
      
      console.log('[FileParser] RTF text extracted:', cleanText.length, 'characters');
      return cleanText;
    } catch (error) {
      console.error('[FileParser] RTF parsing error:', error);
      throw new Error('Failed to parse RTF file.');
    }
  }

  static async parseCSV(file: File): Promise<string> {
    console.log('[FileParser] Starting CSV parsing...');
    try {
      const text = await file.text();
      // Convert CSV to readable format
      const lines = text.split('\n');
      const result = lines.map(line => line.replace(/,/g, ' | ')).join('\n');
      console.log('[FileParser] CSV text extracted:', result.length, 'characters');
      return result;
    } catch (error) {
      console.error('[FileParser] CSV parsing error:', error);
      throw new Error('Failed to parse CSV file.');
    }
  }

  static getSupportedFormats(): string[] {
    return ['.pdf', '.doc', '.docx', '.txt', '.rtf', '.csv'];
  }

  static getMaxFileSize(): number {
    return 15 * 1024 * 1024; // 15MB
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

    if (file.size === 0) {
      return {
        isValid: false,
        error: 'File is empty. Please upload a valid resume file.'
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