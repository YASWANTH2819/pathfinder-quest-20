import React, { useState, useCallback } from 'react';
import { Upload, FileText, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
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

  // Use the FileParser utility for proper file extraction
  const extractTextFromFile = async (file: File): Promise<string> => {
    // Dynamically import FileParser to avoid SSR issues
    const { FileParser } = await import('@/utils/fileParser');
    
    // Validate file first
    const validation = FileParser.validateFile(file);
    if (!validation.isValid) {
      throw new Error(validation.error || 'Invalid file');
    }
    
    // Parse and extract text from the file
    const extractedText = await FileParser.parseFile(file);
    
    if (!extractedText || extractedText.trim().length < 50) {
      throw new Error('Could not extract enough text from the file. Please ensure your resume has readable text content.');
    }
    
    return extractedText;
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

    setIsUploading(true);
    setProgress(0);
    setError('');

    try {
      // Progress: File reading (25%)
      setProgress(25);
      
      console.log('[ResumeUploader] Starting file extraction for:', file.name);
      
      let resumeText: string;
      try {
        resumeText = await extractTextFromFile(file);
        console.log('[ResumeUploader] DEBUG - Parsed resume length:', resumeText.length, 'characters');
        console.log('[ResumeUploader] DEBUG - First 200 chars:', resumeText.substring(0, 200));
      } catch (extractError) {
        console.error('[ResumeUploader] Extraction failed:', extractError);
        throw new Error(`Failed to extract text from file: ${extractError instanceof Error ? extractError.message : 'Unknown error'}`);
      }
      
      // Progress: Text extracted (50%)
      setProgress(50);
      
      // Validate extracted text length
      if (resumeText.trim().length < 50) {
        throw new Error(`Resume text too short (${resumeText.length} characters). Please ensure your resume file contains readable text content, not just images.`);
      }
      
      console.log('[ResumeUploader] Sending to AI for analysis, text length:', resumeText.length);
      
      // Build language-specific system prompt
      const languagePrompts: Record<string, string> = {
        en: 'Analyze this resume and provide detailed, personalized feedback in English.',
        hi: 'इस रिज्यूमे का विश्लेषण करें और हिंदी में विस्तृत, व्यक्तिगत प्रतिक्रिया दें।',
        te: 'ఈ రెజ్యూమేను విశ్లేషించండి మరియు తెలుగులో వివరమైన, వ్యక్తిగత అభిప్రాయాన్ని అందించండి।'
      };
      
      // Call Supabase edge function for analysis
      const { data, error: apiError } = await supabase.functions.invoke('analyze-resume', {
        body: {
          resumeText: resumeText.trim(),
          targetRole: 'General career guidance',
          language: language,
          userId: user?.id,
          systemPrompt: languagePrompts[language] || languagePrompts.en
        }
      });
      
      if (apiError) {
        throw new Error(apiError.message || 'Failed to analyze resume');
      }
      
      if (data?.error) {
        throw new Error(data.error);
      }
      
      // Progress: Analysis complete (100%)
      setProgress(100);
      
      const analysisResult = {
        structuredData: data?.analysis || {},
        localizedText: data?.explanation || '',
        originalResponse: data?.rawResponse || ''
      };
      
      setAnalysis(analysisResult);
      onAnalysisComplete?.(analysisResult);
      
      toast({
        title: t('upload.success'),
        description: t('upload.analysisComplete')
      });
      
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : t('upload.error'));
      toast({
        title: t('upload.error'),
        description: err instanceof Error ? err.message : t('upload.errorDescription'),
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
        'text/plain'
      ];
      
      if (allowedTypes.includes(file.type) || file.name.match(/\.(pdf|doc|docx|txt)$/i)) {
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
              accept=".pdf,.doc,.docx,.txt"
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
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('upload.processing')}
                </>
              ) : (
                t('upload.selectFile')
              )}
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