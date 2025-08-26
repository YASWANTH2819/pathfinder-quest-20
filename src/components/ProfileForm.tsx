import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, ArrowRight } from 'lucide-react';

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

interface ProfileFormProps {
  onComplete: (data: ProfileData) => void;
  onBack: () => void;
}

export const ProfileForm = ({ onComplete, onBack }: ProfileFormProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<ProfileData>({
    name: '',
    age: '',
    country: '',
    educationLevel: '',
    fieldOfStudy: '',
    specialization: '',
    currentYear: '',
    certifications: '',
    skills: '',
    interests: '',
    workEnvironment: '',
    shortTermGoals: '',
    longTermGoals: '',
    careerTransition: '',
    studyOrJob: '',
    locationPreference: '',
    companyType: '',
    financialSupport: ''
  });

  const totalSteps = 4;

  const updateField = (field: keyof ProfileData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(formData);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      onBack();
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold gradient-text">Basic Profile</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  placeholder="Enter your name"
                  className="glass-card"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="age">Age *</Label>
                <Input
                  id="age"
                  type="number"
                  value={formData.age}
                  onChange={(e) => updateField('age', e.target.value)}
                  placeholder="Enter your age"
                  className="glass-card"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="country">Country/Region</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => updateField('country', e.target.value)}
                  placeholder="Enter your country"
                  className="glass-card"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold gradient-text">Education Background</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Education Level *</Label>
                <Select value={formData.educationLevel} onValueChange={(value) => updateField('educationLevel', value)}>
                  <SelectTrigger className="glass-card">
                    <SelectValue placeholder="Select education level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10th">10th Grade</SelectItem>
                    <SelectItem value="12th">12th Grade</SelectItem>
                    <SelectItem value="diploma">Diploma</SelectItem>
                    <SelectItem value="bachelor">Bachelor's Degree</SelectItem>
                    <SelectItem value="master">Master's Degree</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Field of Study *</Label>
                <Select value={formData.fieldOfStudy} onValueChange={(value) => updateField('fieldOfStudy', value)}>
                  <SelectTrigger className="glass-card">
                    <SelectValue placeholder="Select field" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="engineering">Engineering</SelectItem>
                    <SelectItem value="commerce">Commerce</SelectItem>
                    <SelectItem value="arts">Arts</SelectItem>
                    <SelectItem value="science">Science</SelectItem>
                    <SelectItem value="medical">Medical</SelectItem>
                    <SelectItem value="law">Law</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="specialization">Specialization/Branch</Label>
                <Input
                  id="specialization"
                  value={formData.specialization}
                  onChange={(e) => updateField('specialization', e.target.value)}
                  placeholder="e.g., CSE, Mechanical, Finance"
                  className="glass-card"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currentYear">Current Year of Study</Label>
                <Input
                  id="currentYear"
                  value={formData.currentYear}
                  onChange={(e) => updateField('currentYear', e.target.value)}
                  placeholder="e.g., 2nd Year, Final Year"
                  className="glass-card"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="certifications">Certifications/Courses Completed</Label>
                <Textarea
                  id="certifications"
                  value={formData.certifications}
                  onChange={(e) => updateField('certifications', e.target.value)}
                  placeholder="List any certifications or courses you've completed"
                  className="glass-card"
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold gradient-text">Skills & Interests</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="skills">Technical & Soft Skills *</Label>
                <Textarea
                  id="skills"
                  value={formData.skills}
                  onChange={(e) => updateField('skills', e.target.value)}
                  placeholder="e.g., Java, Python, Leadership, Communication"
                  className="glass-card"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="interests">Subjects/Activities You Enjoy *</Label>
                <Textarea
                  id="interests"
                  value={formData.interests}
                  onChange={(e) => updateField('interests', e.target.value)}
                  placeholder="What subjects or activities do you enjoy the most?"
                  className="glass-card"
                />
              </div>
              <div className="space-y-2">
                <Label>Preferred Work Environment *</Label>
                <Select value={formData.workEnvironment} onValueChange={(value) => updateField('workEnvironment', value)}>
                  <SelectTrigger className="glass-card">
                    <SelectValue placeholder="Select work environment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="coding">Coding/Technical</SelectItem>
                    <SelectItem value="management">Management</SelectItem>
                    <SelectItem value="creative">Creative</SelectItem>
                    <SelectItem value="research">Research</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="teaching">Teaching</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold gradient-text">Career Goals & Preferences</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Short-term Goals (1-2 years) *</Label>
                <Select value={formData.shortTermGoals} onValueChange={(value) => updateField('shortTermGoals', value)}>
                  <SelectTrigger className="glass-card">
                    <SelectValue placeholder="Select short-term goal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="internship">Internship</SelectItem>
                    <SelectItem value="job">Job</SelectItem>
                    <SelectItem value="higher-studies">Higher Studies</SelectItem>
                    <SelectItem value="startup">Startup</SelectItem>
                    <SelectItem value="certification">Certification</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Study or Job Preference *</Label>
                <Select value={formData.studyOrJob} onValueChange={(value) => updateField('studyOrJob', value)}>
                  <SelectTrigger className="glass-card">
                    <SelectValue placeholder="Select preference" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="job">Direct Job</SelectItem>
                    <SelectItem value="higher-studies">Higher Studies</SelectItem>
                    <SelectItem value="both">Both Options</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Location Preference</Label>
                <Select value={formData.locationPreference} onValueChange={(value) => updateField('locationPreference', value)}>
                  <SelectTrigger className="glass-card">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="india">India</SelectItem>
                    <SelectItem value="abroad">Abroad</SelectItem>
                    <SelectItem value="remote">Remote</SelectItem>
                    <SelectItem value="flexible">Flexible</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Company Type Preference</Label>
                <Select value={formData.companyType} onValueChange={(value) => updateField('companyType', value)}>
                  <SelectTrigger className="glass-card">
                    <SelectValue placeholder="Select company type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="startup">Startup</SelectItem>
                    <SelectItem value="mnc">MNC</SelectItem>
                    <SelectItem value="government">Government</SelectItem>
                    <SelectItem value="research">Research Institute</SelectItem>
                    <SelectItem value="any">Any</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="longTermGoals">Long-term Goals (5+ years) *</Label>
                <Textarea
                  id="longTermGoals"
                  value={formData.longTermGoals}
                  onChange={(e) => updateField('longTermGoals', e.target.value)}
                  placeholder="e.g., Software Engineer, Product Manager, Data Scientist"
                  className="glass-card"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="careerTransition">Career Transition Plans</Label>
                <Textarea
                  id="careerTransition"
                  value={formData.careerTransition}
                  onChange={(e) => updateField('careerTransition', e.target.value)}
                  placeholder="e.g., I am from Mechanical but want IT career"
                  className="glass-card"
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Card className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold gradient-text">Career Profile Setup</h1>
              <div className="text-sm text-muted-foreground">
                Step {currentStep} of {totalSteps}
              </div>
            </div>
            {/* Progress Bar */}
            <div className="w-full bg-[var(--glass-background)] rounded-full h-2">
              <div 
                className="h-2 bg-gradient-to-r from-[hsl(var(--cyber-purple))] to-[hsl(var(--cyber-blue))] rounded-full transition-all duration-500"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          </Card>
        </div>

        {/* Form Content */}
        <Card className="glass-card p-8 mb-6">
          {renderStep()}
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button variant="glass" onClick={prevStep}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            {currentStep === 1 ? 'Back to Home' : 'Previous'}
          </Button>
          <Button variant="cyber" onClick={nextStep}>
            {currentStep === totalSteps ? 'Start AI Guidance' : 'Next'}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};