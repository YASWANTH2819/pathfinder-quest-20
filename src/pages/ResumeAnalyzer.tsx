import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText, ArrowLeft, Upload, Loader2, Star, CheckCircle } from 'lucide-react';
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
  resumeText?: string;
}

export const ResumeAnalyzerPage = () => {
  const [resumeText, setResumeText] = useState('');
  const [analysis, setAnalysis] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Get profile data from localStorage if available
  const getProfileData = (): ProfileData | null => {
    try {
      const saved = localStorage.getItem('career_profile_data');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  };

  const profileData = getProfileData();

  const handleAnalyzeResume = async () => {
    if (!resumeText.trim()) return;
    
    setIsAnalyzing(true);
    try {
      const analysisResult = await geminiService.analyzeResume(resumeText, profileData);
      setAnalysis(analysisResult);
    } catch (error) {
      setAnalysis(`❌ **Error analyzing resume:** ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/plain') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setResumeText(content);
      };
      reader.readAsText(file);
    } else {
      alert('Please upload a plain text (.txt) file');
    }
  };

  return (
    <div className="min-h-screen cyber-grid">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center space-x-4 mb-8">
          <Button
            variant="glass"
            size="icon"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold gradient-text">Resume Analyzer</h1>
            <p className="text-muted-foreground">AI-powered resume analysis with ATS compatibility check</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Input */}
          <div className="space-y-6">
            <Card className="glass-card p-6">
              <div className="flex items-center space-x-2 mb-4">
                <FileText className="w-5 h-5 text-[hsl(var(--cyber-purple))]" />
                <h2 className="text-xl font-semibold">Resume Analysis</h2>
              </div>

              <div className="space-y-4">
                <Alert>
                  <CheckCircle className="w-4 h-4" />
                  <AlertDescription>
                    Get comprehensive analysis including rating, ATS compatibility check, and detailed improvement suggestions.
                  </AlertDescription>
                </Alert>

                {profileData && (
                  <Alert>
                    <Star className="w-4 h-4" />
                    <AlertDescription>
                      Analysis will be tailored to your profile: {profileData.fieldOfStudy} ({profileData.specialization})
                    </AlertDescription>
                  </Alert>
                )}

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Upload Resume File:
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="file"
                      accept=".txt"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="resume-upload"
                    />
                    <label htmlFor="resume-upload">
                      <Button variant="glass" size="sm" className="cursor-pointer" asChild>
                        <span>
                          <Upload className="w-4 h-4 mr-2" />
                          Upload .txt file
                        </span>
                      </Button>
                    </label>
                    <span className="text-sm text-muted-foreground">or paste below</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Resume Content:
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
          </div>

          {/* Right Column - Results */}
          <div className="space-y-6">
            {analysis ? (
              <Card className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-4 gradient-text">Analysis Results</h3>
                <div className="prose prose-sm max-w-none text-foreground">
                  <pre className="whitespace-pre-wrap text-sm leading-relaxed">{analysis}</pre>
                </div>
              </Card>
            ) : (
              <Card className="glass-card p-6 flex flex-col items-center justify-center min-h-[400px]">
                <FileText className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Ready to analyze your resume</h3>
                <p className="text-muted-foreground text-center max-w-md">
                  Upload or paste your resume content to get AI-powered analysis with:
                </p>
                <ul className="text-sm text-muted-foreground mt-3 space-y-1">
                  <li>• Overall effectiveness rating (1-10)</li>
                  <li>• ATS compatibility check</li>
                  <li>• Detailed improvement suggestions</li>
                  <li>• Keyword optimization recommendations</li>
                  <li>• Enhanced bullet point examples</li>
                </ul>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};