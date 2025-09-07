import React, { useState, useCallback } from 'react';
import { Upload, FileText, AlertTriangle, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { aiService } from '@/services/aiService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/hooks/use-toast';

interface ResumeUploaderProps {
  onAnalysisComplete?: (analysis: any) => void;
}

export const ResumeUploader: React.FC<ResumeUploaderProps> = ({
  onAnalysisComplete
}) => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [consent, setConsent] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [error, setError] = useState<string>('');

  const extractTextFromFile = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const result = e.target?.result;
          
          if (file.type === 'text/plain') {
            resolve(result as string);
          } else if (file.type === 'application/pdf') {
            // For PDF, we'll need to implement PDF parsing
            // For now, just return placeholder
            resolve('PDF content extraction not yet implemented');
          } else if (file.type.includes('word') || file.name.endsWith('.docx') || file.name.endsWith('.doc')) {
            // For Word docs, we'll need to implement Word parsing
            resolve('Word document content extraction not yet implemented');
          } else if (file.type.startsWith('image/')) {
            // For images, we could use OCR
            resolve('Image OCR not yet implemented');
          } else {
            reject(new Error('Unsupported file type'));
          }
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      
      if (file.type === 'text/plain') {
        reader.readAsText(file);
      } else {
        reader.readAsArrayBuffer(file);
      }
    });
  };

  const handleFileUpload = useCallback(async (file: File) => {
    if (!consent) {
      toast({
        title: t('upload.consentRequired'),
        description: t('upload.consentDescription'),
        variant: 'destructive'
      });
      return;
    }

    // Skip email verification check for now as Supabase handles this internally
    // We can add this check later when we implement proper email verification

    setIsUploading(true);
    setProgress(0);
    setError('');

    try {
      // Progress: File reading (25%)
      setProgress(25);
      const resumeText = await extractTextFromFile(file);
      
      // Progress: Text extracted (50%)
      setProgress(50);
      
      // Call AI service for analysis
      const analysisResult = await aiService.analyzeResume({
        resumeText,
        language,
        userId: user?.id
      });
      
      // Progress: Analysis complete (100%)
      setProgress(100);
      
      setAnalysis(analysisResult);
      onAnalysisComplete?.(analysisResult);
      
      toast({
        title: t('upload.success'),
        description: t('upload.analysisComplete')
      });
      
    } catch (error) {
      console.error('Upload error:', error);
      setError(error instanceof Error ? error.message : t('upload.error'));
      toast({
        title: t('upload.error'),
        description: error instanceof Error ? error.message : t('upload.errorDescription'),
        variant: 'destructive'
      });
    } finally {
      setIsUploading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  }, [consent, user, language, t, onAnalysisComplete]);

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const file = files[0];
    
    if (file) {
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'image/jpeg',
        'image/png',
        'image/jpg'
      ];
      
      if (allowedTypes.includes(file.type) || file.name.match(/\.(pdf|doc|docx|txt|jpg|jpeg|png)$/i)) {
        handleFileUpload(file);
      } else {
        setError(t('upload.invalidFileType'));
      }
    }
  }, [handleFileUpload, t]);

  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            {t('upload.title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Consent Checkbox */}
          <div className="flex items-start space-x-2">
            <Checkbox
              id="consent"
              checked={consent}
              onCheckedChange={(checked) => setConsent(checked as boolean)}
            />
            <label
              htmlFor="consent"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {t('upload.consentText')}
            </label>
          </div>

          {/* Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              consent
                ? 'border-primary hover:border-primary/80 bg-primary/5'
                : 'border-muted bg-muted/20'
            }`}
            onDrop={onDrop}
            onDragOver={onDragOver}
          >
            <FileText className={`mx-auto h-12 w-12 mb-4 ${consent ? 'text-primary' : 'text-muted-foreground'}`} />
            <h3 className="text-lg font-semibold mb-2">{t('upload.dragDrop')}</h3>
            <p className="text-muted-foreground mb-4">{t('upload.supportedFormats')}</p>
            
            <input
              type="file"
              id="resume-upload"
              className="hidden"
              accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file);
              }}
              disabled={!consent}
            />
            
            <Button
              onClick={() => document.getElementById('resume-upload')?.click()}
              disabled={!consent || isUploading}
              variant="outline"
            >
              {t('upload.selectFile')}
            </Button>
          </div>

          {/* Progress */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{t('upload.processing')}</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}

          {/* Error */}
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Success */}
          {analysis && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                {t('upload.analysisComplete')} - {t('upload.score')}: {analysis.structuredData?.atsScore || 'N/A'}%
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};