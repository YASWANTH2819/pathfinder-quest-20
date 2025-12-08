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
              <h3 className="text-xl font-semibold mb-6 gradient-text-rainbow">{t('profile.educationBackground')}</h3>
              <div className="space-y-4">
                <div>
                  <Label>{t('profile.educationLevel')} *</Label>
                  <Select value={formData.educationLevel} onValueChange={(value) => updateField('educationLevel', value)}>
                    <SelectTrigger className="glass-card">
                      <SelectValue placeholder={t('profile.selectEducationLevel')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="High School">{t('profile.highSchool')}</SelectItem>
                      <SelectItem value="Diploma">{t('profile.diploma')}</SelectItem>
                      <SelectItem value="Bachelor's">{t('profile.bachelors')}</SelectItem>
                      <SelectItem value="Master's">{t('profile.masters')}</SelectItem>
                      <SelectItem value="PhD">{t('profile.phd')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="fieldOfStudy">{t('profile.fieldOfStudy')} *</Label>
                  <Input
                    id="fieldOfStudy"
                    value={formData.fieldOfStudy}
                    onChange={(e) => updateField('fieldOfStudy', e.target.value)}
                    placeholder={t('profile.fieldOfStudyPlaceholder')}
                    className="glass-card"
                  />
                </div>
                <div>
                  <Label htmlFor="specialization">{t('profile.specialization')}</Label>
                  <Input
                    id="specialization"
                    value={formData.specialization}
                    onChange={(e) => updateField('specialization', e.target.value)}
                    placeholder={t('profile.specializationPlaceholder')}
                    className="glass-card"
                  />
                </div>
                <div>
                  <Label htmlFor="currentYear">{t('profile.currentYear')}</Label>
                  <Input
                    id="currentYear"
                    value={formData.currentYear}
                    onChange={(e) => updateField('currentYear', e.target.value)}
                    placeholder={t('profile.currentYearPlaceholder')}
                    className="glass-card"
                  />
                </div>
                <div>
                  <Label htmlFor="certifications">{t('profile.certifications')}</Label>
                  <Textarea
                    id="certifications"
                    value={formData.certifications}
                    onChange={(e) => updateField('certifications', e.target.value)}
                    placeholder={t('profile.certificationsPlaceholder')}
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
                <h2 className="text-2xl font-bold gradient-text-rainbow">{t('profile.title')}</h2>
                <span className="text-sm text-muted-foreground">{t('profile.step')} 3 {t('profile.of')} 4</span>
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
              <h3 className="text-xl font-semibold mb-6 gradient-text-rainbow">{t('profile.skillsInterests')}</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="skills">{t('profile.skills')} *</Label>
                  <Textarea
                    id="skills"
                    value={formData.skills}
                    onChange={(e) => updateField('skills', e.target.value)}
                    placeholder={t('profile.skillsPlaceholder')}
                    className="glass-card"
                    rows={4}
                  />
                </div>
                <div>
                  <Label htmlFor="interests">{t('profile.interests')} *</Label>
                  <Textarea
                    id="interests"
                    value={formData.interests}
                    onChange={(e) => updateField('interests', e.target.value)}
                    placeholder={t('profile.interestsPlaceholder')}
                    className="glass-card"
                    rows={4}
                  />
                </div>
                <div>
                  <Label>{t('profile.workEnvironment')} *</Label>
                  <Select value={formData.workEnvironment} onValueChange={(value) => updateField('workEnvironment', value)}>
                    <SelectTrigger className="glass-card">
                      <SelectValue placeholder={t('profile.selectWorkEnvironment')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Remote">{t('profile.remote')}</SelectItem>
                      <SelectItem value="In-Office">{t('profile.inOffice')}</SelectItem>
                      <SelectItem value="Hybrid">{t('profile.hybrid')}</SelectItem>
                      <SelectItem value="Flexible">{t('profile.flexible')}</SelectItem>
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
                <h2 className="text-2xl font-bold gradient-text-rainbow">{t('profile.title')}</h2>
                <span className="text-sm text-muted-foreground">{t('profile.step')} 4 {t('profile.of')} 4</span>
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
              <h3 className="text-xl font-semibold mb-6 gradient-text-rainbow">{t('profile.careerGoals')}</h3>
              <div className="space-y-4">
                <div>
                  <Label>{t('profile.shortTermGoals')} *</Label>
                  <Select value={formData.shortTermGoals} onValueChange={(value) => updateField('shortTermGoals', value)}>
                    <SelectTrigger className="glass-card">
                      <SelectValue placeholder={t('profile.selectShortTermGoal')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Get Internship">{t('profile.getInternship')}</SelectItem>
                      <SelectItem value="Graduate">{t('profile.graduate')}</SelectItem>
                      <SelectItem value="First Job">{t('profile.firstJob')}</SelectItem>
                      <SelectItem value="Skill Development">{t('profile.skillDevelopment')}</SelectItem>
                      <SelectItem value="Career Switch">{t('profile.careerSwitch')}</SelectItem>
                      <SelectItem value="Promotion">{t('profile.promotion')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{t('profile.studyOrJob')} *</Label>
                  <Select value={formData.studyOrJob} onValueChange={(value) => updateField('studyOrJob', value)}>
                    <SelectTrigger className="glass-card">
                      <SelectValue placeholder={t('profile.selectPreference')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Continue Studies">{t('profile.continueStudies')}</SelectItem>
                      <SelectItem value="Start Working">{t('profile.startWorking')}</SelectItem>
                      <SelectItem value="Both">{t('profile.both')}</SelectItem>
                      <SelectItem value="Career Change">{t('profile.careerChange')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{t('profile.locationPreference')}</Label>
                  <Select value={formData.locationPreference} onValueChange={(value) => updateField('locationPreference', value)}>
                    <SelectTrigger className="glass-card">
                      <SelectValue placeholder={t('profile.selectLocation')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Local">{t('profile.local')}</SelectItem>
                      <SelectItem value="National">{t('profile.national')}</SelectItem>
                      <SelectItem value="International">{t('profile.international')}</SelectItem>
                      <SelectItem value="Remote">{t('profile.remoteWork')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{t('profile.companyType')}</Label>
                  <Select value={formData.companyType} onValueChange={(value) => updateField('companyType', value)}>
                    <SelectTrigger className="glass-card">
                      <SelectValue placeholder={t('profile.selectCompanyType')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Startup">{t('profile.startup')}</SelectItem>
                      <SelectItem value="MNC">{t('profile.mnc')}</SelectItem>
                      <SelectItem value="Government">{t('profile.government')}</SelectItem>
                      <SelectItem value="NGO">{t('profile.ngo')}</SelectItem>
                      <SelectItem value="Freelance">{t('profile.freelance')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="longTermGoals">{t('profile.longTermGoals')} *</Label>
                  <Textarea
                    id="longTermGoals"
                    value={formData.longTermGoals}
                    onChange={(e) => updateField('longTermGoals', e.target.value)}
                    placeholder={t('profile.longTermGoalsPlaceholder')}
                    className="glass-card"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="careerTransition">{t('profile.careerTransition')}</Label>
                  <Textarea
                    id="careerTransition"
                    value={formData.careerTransition}
                    onChange={(e) => updateField('careerTransition', e.target.value)}
                    placeholder={t('profile.careerTransitionPlaceholder')}
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