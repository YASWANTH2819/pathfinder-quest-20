import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Loader2, Upload, X } from 'lucide-react';
import { geminiService } from '@/services/geminiService';

interface ProfileData {
  name: string;
  age: string;
  country: string;
  educationLevel: string;
  fieldOfStudy: string;
  specialization: string;
  currentYear: string;
  certifications: string;
  skills: string;
  interests: string;
  workEnvironment: string;
  shortTermGoals: string;
  longTermGoals: string;
  careerTransition: string;
  studyOrJob: string;
  locationPreference: string;
  companyType: string;
  financialSupport: string;
}

interface ResumeAnalyzerProps {
  profileData: ProfileData | null;
  onAnalysisComplete: (analysis: string) => void;
}

export const ResumeAnalyzer = ({ profileData, onAnalysisComplete }: ResumeAnalyzerProps) => {
  const [resumeText, setResumeText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAnalyzeResume = async () => {
    if (!resumeText.trim()) return;
    
    setIsAnalyzing(true);
    try {
      const analysis = await geminiService.analyzeResume(resumeText, profileData);
      onAnalysisComplete(`📋 **Resume Analysis Results:**\n\n${analysis}`);
    } catch (error) {
      onAnalysisComplete(`❌ **Error analyzing resume:** ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Import FileParser dynamically to avoid issues with SSR
    const { FileParser } = await import('@/utils/fileParser');

    // Validate file
    const validation = FileParser.validateFile(file);
    if (!validation.isValid) {
      onAnalysisComplete(`❌ **File Upload Error:** ${validation.error}`);
      return;
    }

    setIsProcessingFile(true);
    setUploadedFile(file);

    try {
      const extractedText = await FileParser.parseFile(file);
      setResumeText(extractedText);
      onAnalysisComplete(`✅ **File processed successfully!** Resume content extracted from ${file.name}. You can now analyze it or edit the text if needed.`);
    } catch (error) {
      onAnalysisComplete(`❌ **File Processing Error:** ${error instanceof Error ? error.message : 'Failed to process file'}`);
      setUploadedFile(null);
    } finally {
      setIsProcessingFile(false);
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setResumeText('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };


  return (
    <Card className="glass-card p-4">
      <div className="flex items-center space-x-2 mb-4">
        <FileText className="w-5 h-5 text-[hsl(var(--cyber-purple))]" />
        <h3 className="font-semibold">Resume Analyzer</h3>
      </div>

      <div className="space-y-4">
        <Alert>
          <AlertDescription className="text-sm">
            Upload your resume file (PDF, DOC, DOCX, TXT) or paste the text content for detailed analysis including rating, ATS compatibility, and improvement suggestions.
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Upload File</TabsTrigger>
            <TabsTrigger value="text">Paste Text</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload" className="space-y-4">
            {!uploadedFile ? (
              <div className="border-2 border-dashed border-[hsl(var(--glass-border-bright))] rounded-lg p-8 text-center hover:border-[hsl(var(--cyber-purple))] transition-colors">
                <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <div className="space-y-2">
                  <p className="text-sm font-medium">Upload your resume</p>
                  <p className="text-xs text-muted-foreground">
                    Supported formats: PDF, DOC, DOCX, TXT (Max 10MB)
                  </p>
                </div>
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleFileUpload}
                  disabled={isProcessingFile}
                  className="mt-4 cursor-pointer file:cursor-pointer"
                />
              </div>
            ) : (
              <div className="glass-card p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FileText className="w-8 h-8 text-[hsl(var(--cyber-green))]" />
                  <div>
                    <p className="font-medium">{uploadedFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(uploadedFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleRemoveFile}
                  className="text-destructive hover:text-destructive"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}

            {isProcessingFile && (
              <div className="flex items-center justify-center space-x-2 py-4">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Processing file...</span>
              </div>
            )}
          </TabsContent>

          <TabsContent value="text" className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Paste your resume content here:
              </label>
              <Textarea
                placeholder="Copy and paste your entire resume content here for comprehensive analysis..."
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                className="min-h-[300px] glass-card"
              />
            </div>
          </TabsContent>
        </Tabs>
        
        {resumeText.trim() && (
          <div className="glass-card p-3 bg-[hsl(var(--cyber-green)/0.1)] border-[hsl(var(--cyber-green)/0.3)]">
            <p className="text-sm text-[hsl(var(--cyber-green))]">
              ✅ Resume content ready for analysis ({resumeText.length} characters)
            </p>
          </div>
        )}
        
        <Button 
          onClick={handleAnalyzeResume}
          disabled={!resumeText.trim() || isAnalyzing || isProcessingFile}
          variant="cyber"
          className="w-full"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analyzing Resume...
            </>
          ) : (
            <>
              <FileText className="w-4 h-4 mr-2" />
              Analyze Resume & Get Detailed Feedback
            </>
          )}
        </Button>
      </div>
    </Card>
  );
};