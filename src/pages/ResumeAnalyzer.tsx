import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText, Wand2, ArrowLeft, Upload, Loader2, Star } from 'lucide-react';
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
  const [experience, setExperience] = useState('');
  const [projects, setProjects] = useState('');
  const [analysis, setAnalysis] = useState('');
  const [generatedResume, setGeneratedResume] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'analyze' | 'generate'>('analyze');

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
      const result = await geminiService.analyzeResume(resumeText, profileData);
      setAnalysis(result);
    } catch (error) {
      setAnalysis(`❌ **Error analyzing resume:** ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateResume = async () => {
    if (!profileData || !experience.trim()) return;
    
    setIsGenerating(true);
    try {
      const resume = await geminiService.generateATSResume(profileData, experience, projects);
      setGeneratedResume(resume);
    } catch (error) {
      setGeneratedResume(`❌ **Error generating resume:** ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsGenerating(false);
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
    }
  };

  return (
    <div className="min-h-screen cyber-grid">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
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
            <p className="text-muted-foreground">AI-powered resume analysis and generation</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Input */}
          <div className="space-y-6">
            <Card className="glass-card p-6">
              <div className="flex items-center space-x-2 mb-4">
                <FileText className="w-5 h-5 text-[hsl(var(--cyber-purple))]" />
                <h2 className="text-xl font-semibold">Resume Tools</h2>
              </div>

              {/* Tab Selection */}
              <div className="flex space-x-2 mb-6">
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
                  <Alert>
                    <Star className="w-4 h-4" />
                    <AlertDescription>
                      Upload or paste your resume to get AI-powered analysis with ATS compatibility check and improvement suggestions.
                    </AlertDescription>
                  </Alert>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Upload Resume File (Text format):
                    </label>
                    <div className="flex items-center space-x-2 mb-2">
                      <input
                        type="file"
                        accept=".txt"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="resume-upload"
                      />
                      <label
                        htmlFor="resume-upload"
                        className="flex items-center space-x-2 px-4 py-2 glass-card rounded-lg cursor-pointer hover:bg-[hsl(var(--cyber-blue)/0.1)] transition-colors"
                      >
                        <Upload className="w-4 h-4" />
                        <span className="text-sm">Choose File</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Or paste your resume content:
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
                    <Wand2 className="w-4 h-4" />
                    <AlertDescription>
                      Generate an ATS-friendly resume based on your profile {profileData ? `(${profileData.name})` : 'and experience'}.
                    </AlertDescription>
                  </Alert>

                  {!profileData && (
                    <Alert>
                      <AlertDescription className="text-amber-600">
                        Complete your profile first for better resume generation.
                      </AlertDescription>
                    </Alert>
                  )}

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Work Experience & Internships: *
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
          </div>

          {/* Right Column - Results */}
          <div className="space-y-6">
            {activeTab === 'analyze' && analysis && (
              <Card className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-4 gradient-text">Analysis Results</h3>
                <div className="prose prose-sm max-w-none text-foreground">
                  <pre className="whitespace-pre-wrap text-sm">{analysis}</pre>
                </div>
              </Card>
            )}

            {activeTab === 'generate' && generatedResume && (
              <Card className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-4 gradient-text">Generated Resume</h3>
                <div className="prose prose-sm max-w-none text-foreground">
                  <pre className="whitespace-pre-wrap text-sm font-mono">{generatedResume}</pre>
                </div>
                <div className="mt-4 p-3 glass-card rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    💡 <strong>Tips:</strong> Copy this resume to a document editor, customize it further for specific jobs, and always tailor keywords to job descriptions.
                  </p>
                </div>
              </Card>
            )}

            {!analysis && !generatedResume && (
              <Card className="glass-card p-6 flex flex-col items-center justify-center min-h-[300px]">
                <FileText className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Ready to analyze your resume</h3>
                <p className="text-muted-foreground text-center">
                  {activeTab === 'analyze' 
                    ? 'Upload or paste your resume content to get AI-powered analysis with improvement suggestions.'
                    : 'Fill in your experience details to generate an ATS-optimized resume based on your profile.'
                  }
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};