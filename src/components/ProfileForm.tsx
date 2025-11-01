import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
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
  resumeText?: string;
}

interface ProfileFormProps {
  onComplete: (data: ProfileData) => void;
  onBack: () => void;
}

export const ProfileForm = ({ onComplete, onBack }: ProfileFormProps) => {
  const { t } = useLanguage();
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
    financialSupport: '',
    resumeText: ''
  });

  const totalSteps = 4;

  const updateField = (field: keyof ProfileData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    onComplete(formData);
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
            {/* Progress Header */}
            <Card className="glass-card p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold gradient-text-rainbow">{t('profile.title')}</h2>
                <span className="text-sm text-muted-foreground">{t('profile.step')} 1 {t('profile.of')} 4</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div 
                  className="h-2 rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-300"
                  style={{ width: '25%' }}
                ></div>
              </div>
            </Card>

            {/* Basic Profile Form */}
            <Card className="glass-card p-6">
              <h3 className="text-xl font-semibold mb-6 gradient-text-rainbow">{t('profile.basicProfile')}</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">{t('profile.fullName')} *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    placeholder={t('profile.placeholders.name')}
                    className="glass-card"
                  />
                </div>
                <div>
                  <Label htmlFor="age">{t('profile.age')} *</Label>
                  <Input
                    id="age"
                    value={formData.age}
                    onChange={(e) => updateField('age', e.target.value)}
                    placeholder={t('profile.placeholders.age')}
                    className="glass-card"
                  />
                </div>
                <div>
                  <Label htmlFor="country">{t('profile.country')}</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) => updateField('country', e.target.value)}
                    placeholder={t('profile.placeholders.country')}
                    className="glass-card"
                  />
                </div>
              </div>
            </Card>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            {/* Progress Header */}
            <Card className="glass-card p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold gradient-text-rainbow">{t('profile.title')}</h2>
                <span className="text-sm text-muted-foreground">{t('profile.step')} 2 {t('profile.of')} 4</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div 
                  className="h-2 rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-300"
                  style={{ width: '50%' }}
                ></div>
              </div>
            </Card>

            {/* Education Background Form */}
            <Card className="glass-card p-6">
              <h3 className="text-xl font-semibold mb-6 gradient-text-rainbow">Education Background</h3>
              <div className="space-y-4">
                <div>
                  <Label>Education Level *</Label>
                  <Select value={formData.educationLevel} onValueChange={(value) => updateField('educationLevel', value)}>
                    <SelectTrigger className="glass-card">
                      <SelectValue placeholder="Select education level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="High School">High School</SelectItem>
                      <SelectItem value="Diploma">Diploma</SelectItem>
                      <SelectItem value="Bachelor's">Bachelor's Degree</SelectItem>
                      <SelectItem value="Master's">Master's Degree</SelectItem>
                      <SelectItem value="PhD">PhD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="fieldOfStudy">Field of Study *</Label>
                  <Input
                    id="fieldOfStudy"
                    value={formData.fieldOfStudy}
                    onChange={(e) => updateField('fieldOfStudy', e.target.value)}
                    placeholder="e.g., Computer Science, Engineering, Business"
                    className="glass-card"
                  />
                </div>
                <div>
                  <Label htmlFor="specialization">Specialization</Label>
                  <Input
                    id="specialization"
                    value={formData.specialization}
                    onChange={(e) => updateField('specialization', e.target.value)}
                    placeholder="e.g., Machine Learning, Web Development"
                    className="glass-card"
                  />
                </div>
                <div>
                  <Label htmlFor="currentYear">Current Year/Experience Level</Label>
                  <Input
                    id="currentYear"
                    value={formData.currentYear}
                    onChange={(e) => updateField('currentYear', e.target.value)}
                    placeholder="e.g., 3rd Year, Fresh Graduate, 2 Years Experience"
                    className="glass-card"
                  />
                </div>
                <div>
                  <Label htmlFor="certifications">Certifications & Courses Completed</Label>
                  <Textarea
                    id="certifications"
                    value={formData.certifications}
                    onChange={(e) => updateField('certifications', e.target.value)}
                    placeholder="List any certifications, online courses, or additional qualifications you have completed"
                    className="glass-card"
                    rows={4}
                  />
                </div>
              </div>
            </Card>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            {/* Progress Header */}
            <Card className="glass-card p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold gradient-text-rainbow">Career Profile Setup</h2>
                <span className="text-sm text-muted-foreground">Step 3 of 4</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div 
                  className="h-2 rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-300"
                  style={{ width: '75%' }}
                ></div>
              </div>
            </Card>

            {/* Skills & Interests Form */}
            <Card className="glass-card p-6">
              <h3 className="text-xl font-semibold mb-6 gradient-text-rainbow">Skills & Interests</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="skills">Technical & Soft Skills *</Label>
                  <Textarea
                    id="skills"
                    value={formData.skills}
                    onChange={(e) => updateField('skills', e.target.value)}
                    placeholder="e.g., Java, Python, Leadership, Communication"
                    className="glass-card"
                    rows={4}
                  />
                </div>
                <div>
                  <Label htmlFor="interests">Subjects/Activities You Enjoy *</Label>
                  <Textarea
                    id="interests"
                    value={formData.interests}
                    onChange={(e) => updateField('interests', e.target.value)}
                    placeholder="What subjects or activities do you enjoy the most?"
                    className="glass-card"
                    rows={4}
                  />
                </div>
                <div>
                  <Label>Preferred Work Environment *</Label>
                  <Select value={formData.workEnvironment} onValueChange={(value) => updateField('workEnvironment', value)}>
                    <SelectTrigger className="glass-card">
                      <SelectValue placeholder="Select work environment" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Remote">Remote Work</SelectItem>
                      <SelectItem value="In-Office">In-Office</SelectItem>
                      <SelectItem value="Hybrid">Hybrid (Mix of both)</SelectItem>
                      <SelectItem value="Flexible">Flexible/Varies</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            {/* Progress Header */}
            <Card className="glass-card p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold gradient-text-rainbow">Career Profile Setup</h2>
                <span className="text-sm text-muted-foreground">Step 4 of 4</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div 
                  className="h-2 rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-300"
                  style={{ width: '100%' }}
                ></div>
              </div>
            </Card>

            {/* Career Goals & Preferences Form */}
            <Card className="glass-card p-6">
              <h3 className="text-xl font-semibold mb-6 gradient-text-rainbow">Career Goals & Preferences</h3>
              <div className="space-y-4">
                <div>
                  <Label>Short-term Goals (1-2 years) *</Label>
                  <Select value={formData.shortTermGoals} onValueChange={(value) => updateField('shortTermGoals', value)}>
                    <SelectTrigger className="glass-card">
                      <SelectValue placeholder="Select short-term goal" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Get Internship">Get an Internship</SelectItem>
                      <SelectItem value="Graduate">Graduate Successfully</SelectItem>
                      <SelectItem value="First Job">Land First Job</SelectItem>
                      <SelectItem value="Skill Development">Develop New Skills</SelectItem>
                      <SelectItem value="Career Switch">Switch Career Path</SelectItem>
                      <SelectItem value="Promotion">Get Promoted</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Study or Job Preference *</Label>
                  <Select value={formData.studyOrJob} onValueChange={(value) => updateField('studyOrJob', value)}>
                    <SelectTrigger className="glass-card">
                      <SelectValue placeholder="Select preference" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Continue Studies">Continue Studies</SelectItem>
                      <SelectItem value="Start Working">Start Working</SelectItem>
                      <SelectItem value="Both">Both (Work & Study)</SelectItem>
                      <SelectItem value="Career Change">Career Change</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Location Preference</Label>
                  <Select value={formData.locationPreference} onValueChange={(value) => updateField('locationPreference', value)}>
                    <SelectTrigger className="glass-card">
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Local">Local/Current City</SelectItem>
                      <SelectItem value="National">Anywhere in Country</SelectItem>
                      <SelectItem value="International">International</SelectItem>
                      <SelectItem value="Remote">Remote Work</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Company Type Preference</Label>
                  <Select value={formData.companyType} onValueChange={(value) => updateField('companyType', value)}>
                    <SelectTrigger className="glass-card">
                      <SelectValue placeholder="Select company type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Startup">Startup</SelectItem>
                      <SelectItem value="MNC">Multinational Corporation</SelectItem>
                      <SelectItem value="Government">Government Sector</SelectItem>
                      <SelectItem value="NGO">Non-Profit/NGO</SelectItem>
                      <SelectItem value="Freelance">Freelancing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="longTermGoals">Long-term Goals (5+ years) *</Label>
                  <Textarea
                    id="longTermGoals"
                    value={formData.longTermGoals}
                    onChange={(e) => updateField('longTermGoals', e.target.value)}
                    placeholder="e.g., Software Engineer, Product Manager, Data Scientist"
                    className="glass-card"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="careerTransition">Career Transition Plans</Label>
                  <Textarea
                    id="careerTransition"
                    value={formData.careerTransition}
                    onChange={(e) => updateField('careerTransition', e.target.value)}
                    placeholder="e.g., I am from Mechanical but want IT career"
                    className="glass-card"
                    rows={3}
                  />
                </div>
              </div>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen cyber-grid p-4">
      <div className="max-w-4xl mx-auto">
        {/* Form Content */}
        {renderStep()}

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          {currentStep > 1 ? (
            <Button variant="glass" onClick={prevStep} className="flex items-center">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('profile.previous')}
            </Button>
          ) : (
            <Button variant="glass" onClick={onBack} className="flex items-center">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('profile.backToHome')}
            </Button>
          )}
          
          {currentStep < 4 ? (
            <Button 
              variant="rainbow" 
              onClick={nextStep} 
              className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white font-bold shadow-[0_0_20px_rgba(59,130,246,0.5)] hover:shadow-[0_0_30px_rgba(168,85,247,0.7)] border-2 border-white/30 hover:border-white/50 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 ml-auto group"
            >
              <span className="relative z-10 flex items-center">
                {t('profile.next')}
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            </Button>
          ) : (
            <Button 
              variant="rainbow" 
              onClick={nextStep} 
              className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white font-bold shadow-[0_0_20px_rgba(59,130,246,0.5)] hover:shadow-[0_0_30px_rgba(168,85,247,0.7)] border-2 border-white/30 hover:border-white/50 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 ml-auto group"
            >
              <span className="relative z-10 flex items-center">
                {t('profile.startAnalysis')}
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};