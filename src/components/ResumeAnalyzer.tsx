import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText, Wand2, Download, Loader2 } from 'lucide-react';
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
  const [experience, setExperience] = useState('');
  const [projects, setProjects] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'analyze' | 'generate'>('analyze');

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

  const handleGenerateResume = async () => {
    if (!profileData || !experience.trim()) return;
    
    setIsGenerating(true);
    try {
      const resume = await geminiService.generateATSResume(profileData, experience, projects);
      onAnalysisComplete(`📄 **Your ATS-Optimized Resume:**\n\n${resume}\n\n---\n\n💡 **Tips:**\n• Copy this resume to a document editor\n• Customize it further for specific job applications\n• Always tailor keywords to job descriptions\n• Keep formatting simple for ATS systems`);
    } catch (error) {
      onAnalysisComplete(`❌ **Error generating resume:** ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="glass-card p-4">
      <div className="flex items-center space-x-2 mb-4">
        <FileText className="w-5 h-5 text-[hsl(var(--cyber-purple))]" />
        <h3 className="font-semibold">Resume Tools</h3>
      </div>

      {/* Tab Selection */}
      <div className="flex space-x-2 mb-4">
        <Button
          variant={activeTab === 'analyze' ? 'cyber' : 'glass'}
          size="sm"
          onClick={() => setActiveTab('analyze')}
          className="flex-1"
        >
          Analyze Resume
        </Button>
        <Button
          variant={activeTab === 'generate' ? 'cyber' : 'glass'}
          size="sm"
          onClick={() => setActiveTab('generate')}
          className="flex-1"
        >
          Generate Resume
        </Button>
      </div>

      {activeTab === 'analyze' ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Paste your resume content here:
            </label>
            <Textarea
              placeholder="Copy and paste your entire resume content here for analysis..."
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              className="min-h-[200px] glass-card"
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
                Analyze & Get Feedback
              </>
            )}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <Alert>
            <AlertDescription className="text-sm">
              I'll create an ATS-friendly resume based on your profile and the details you provide below.
            </AlertDescription>
          </Alert>

          <div>
            <label className="block text-sm font-medium mb-2">
              Work Experience & Internships:
            </label>
            <Textarea
              placeholder="Describe your work experience, internships, part-time jobs, or relevant activities. Include company names, roles, duration, and key responsibilities..."
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              className="min-h-[120px] glass-card"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Projects (Optional):
            </label>
            <Textarea
              placeholder="Describe your projects, including technologies used, your role, and outcomes achieved..."
              value={projects}
              onChange={(e) => setProjects(e.target.value)}
              className="min-h-[100px] glass-card"
            />
          </div>
          
          <Button 
            onClick={handleGenerateResume}
            disabled={!experience.trim() || isGenerating || !profileData}
            variant="cyber"
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Resume...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4 mr-2" />
                Generate ATS Resume
              </>
            )}
          </Button>
        </div>
      )}
    </Card>
  );
};