import React, { useState } from 'react';
import { HeroSection } from './HeroSection';
import { ChatInterface } from './ChatInterface';
import { ProfileForm } from './ProfileForm';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home, FileText } from 'lucide-react';

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

export const CareerGuidePage = () => {
  const [currentView, setCurrentView] = useState<'hero' | 'form' | 'chat'>('hero');
  const [profileData, setProfileData] = useState<ProfileData | null>(null);

  const handleStartChat = () => {
    setCurrentView('form');
  };

  const handleFormComplete = (data: ProfileData) => {
    setProfileData(data);
    setCurrentView('chat');
  };

  const handleBackToHome = () => {
    setCurrentView('hero');
  };

  const handleBackToForm = () => {
    setCurrentView('form');
  };

  if (currentView === 'hero') {
    return <HeroSection onStartChat={handleStartChat} />;
  }

  if (currentView === 'form') {
    return <ProfileForm onComplete={handleFormComplete} onBack={handleBackToHome} />;
  }

  return (
    <div className="min-h-screen cyber-grid flex flex-col">
      {/* Chat Header */}
      <div className="p-4 glass-card m-4 rounded-2xl shimmer">
        <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="rainbow" size="icon" onClick={handleBackToForm}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold gradient-text-rainbow">AI Career Guide</h1>
                <p className="text-sm text-muted-foreground">Chat with {profileData?.name || 'Student'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-[hsl(var(--cyber-green))] rounded-full animate-pulse"></div>
                <span className="text-sm text-muted-foreground">Online</span>
              </div>
            </div>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="flex-1 mx-4 mb-4">
        <Card className="glass-card h-full">
          <ChatInterface profileData={profileData} />
        </Card>
      </div>
    </div>
  );
};