import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Sparkles } from 'lucide-react';

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

  const updateField = (field: keyof ProfileData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    onComplete(formData);
  };

  const isFormValid = formData.fieldOfStudy.trim() !== '' && 
                      formData.interests.trim() !== '' && 
                      formData.shortTermGoals.trim() !== '' && 
                      formData.longTermGoals.trim() !== '';

  return (
    <div className="min-h-screen cyber-grid p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <Card className="glass-card p-6 mb-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold gradient-text-rainbow mb-2">{t('simpleForm.title')}</h2>
            <p className="text-muted-foreground">{t('simpleForm.subtitle')}</p>
          </div>
        </Card>

        {/* Single Form */}
        <Card className="glass-card p-6">
          <div className="space-y-6">
            {/* Education Background */}
            <div>
              <Label htmlFor="fieldOfStudy" className="text-base font-semibold">
                {t('simpleForm.educationBackground')} *
              </Label>
              <Textarea
                id="fieldOfStudy"
                value={formData.fieldOfStudy}
                onChange={(e) => updateField('fieldOfStudy', e.target.value)}
                placeholder={t('simpleForm.educationPlaceholder')}
                className="glass-card mt-2"
                rows={2}
              />
            </div>

            {/* Subjects/Areas Enjoyed */}
            <div>
              <Label htmlFor="interests" className="text-base font-semibold">
                {t('simpleForm.subjectsEnjoyed')} *
              </Label>
              <Textarea
                id="interests"
                value={formData.interests}
                onChange={(e) => updateField('interests', e.target.value)}
                placeholder={t('simpleForm.subjectsPlaceholder')}
                className="glass-card mt-2"
                rows={2}
              />
            </div>

            {/* Short-term Goals */}
            <div>
              <Label htmlFor="shortTermGoals" className="text-base font-semibold">
                {t('simpleForm.shortTermGoals')} *
              </Label>
              <Textarea
                id="shortTermGoals"
                value={formData.shortTermGoals}
                onChange={(e) => updateField('shortTermGoals', e.target.value)}
                placeholder={t('simpleForm.shortTermPlaceholder')}
                className="glass-card mt-2"
                rows={2}
              />
            </div>

            {/* Long-term Goals */}
            <div>
              <Label htmlFor="longTermGoals" className="text-base font-semibold">
                {t('simpleForm.longTermGoals')} *
              </Label>
              <Textarea
                id="longTermGoals"
                value={formData.longTermGoals}
                onChange={(e) => updateField('longTermGoals', e.target.value)}
                placeholder={t('simpleForm.longTermPlaceholder')}
                className="glass-card mt-2"
                rows={2}
              />
            </div>
          </div>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button variant="glass" onClick={onBack} className="flex items-center">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('common.back')}
          </Button>
          
          <Button 
            variant="rainbow" 
            onClick={handleSubmit}
            disabled={!isFormValid}
            className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white font-bold shadow-[0_0_20px_rgba(59,130,246,0.5)] hover:shadow-[0_0_30px_rgba(168,85,247,0.7)] border-2 border-white/30 hover:border-white/50 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="relative z-10 flex items-center">
              <Sparkles className="w-4 h-4 mr-2" />
              {t('simpleForm.getRecommendations')}
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
          </Button>
        </div>
      </div>
    </div>
  );
};
