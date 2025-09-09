import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HeroSection } from './HeroSection';
import { ProfileForm } from './ProfileForm';
import { CareerAnalyzer } from './CareerAnalyzer';

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
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<'hero' | 'form' | 'analyzer'>('hero');
  const [profileData, setProfileData] = useState<ProfileData | null>(null);

  const handleStartChat = () => {
    setCurrentView('form');
  };

  const handleFormComplete = (data: ProfileData) => {
    setProfileData(data);
    setCurrentView('analyzer');
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

  if (currentView === 'analyzer' && profileData) {
    return <CareerAnalyzer profileData={profileData} onBack={handleBackToForm} />;
  }

  return <HeroSection onStartChat={handleStartChat} />;
};