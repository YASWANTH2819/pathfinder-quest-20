import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText, Loader2 } from 'lucide-react';
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


  return (
    <Card className="glass-card p-4">
      <div className="flex items-center space-x-2 mb-4">
        <FileText className="w-5 h-5 text-[hsl(var(--cyber-purple))]" />
        <h3 className="font-semibold">Resume Analyzer</h3>
      </div>

      <div className="space-y-4">
        <Alert>
          <AlertDescription className="text-sm">
            Paste your resume content below to get a detailed analysis including rating, ATS compatibility, and improvement suggestions.
          </AlertDescription>
        </Alert>

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
        
        <Button 
          onClick={handleAnalyzeResume}
          disabled={!resumeText.trim() || isAnalyzing}
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