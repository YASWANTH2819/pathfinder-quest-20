import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Sparkles, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

interface FieldError {
  fieldOfStudy?: string;
  interests?: string;
  shortTermGoals?: string;
  longTermGoals?: string;
}

// Validation helper functions

const containsLetters = (text: string): boolean => {
  return /[a-zA-Z]/.test(text);
};

const isNonsenseInput = (text: string): boolean => {
  const trimmed = text.trim().toLowerCase();
  
  // Check for repeated characters (e.g., "aaaaaaa")
  if (/(.)\1{4,}/i.test(trimmed)) return true;
  
  // Check for keyboard patterns (e.g., "asdfgh", "qwerty")
  const keyboardPatterns = ['qwert', 'asdfg', 'zxcvb', 'qazws', 'poiuy', 'lkjhg', 'mnbvc'];
  if (keyboardPatterns.some(p => trimmed.includes(p))) return true;
  
  return false;
};

const validateEducationField = (value: string, t: (key: string) => string): string | undefined => {
  const trimmed = value.trim();
  
  if (!trimmed) {
    return t('validation.fieldRequired');
  }
  
  if (!containsLetters(trimmed)) {
    return t('validation.educationInvalid');
  }
  
  if (isNonsenseInput(trimmed)) {
    return t('validation.educationInvalid');
  }
  
  return undefined;
};

const validateDescriptiveField = (value: string, t: (key: string) => string): string | undefined => {
  const trimmed = value.trim();
  
  if (!trimmed) {
    return t('validation.fieldRequired');
  }
  
  // Require at least 5 characters or 2 words
  const words = trimmed.split(/\s+/).filter(w => w.length >= 1);
  if (trimmed.length < 5 && words.length < 2) {
    return t('validation.descriptiveInvalid');
  }
  
  if (!containsLetters(trimmed)) {
    return t('validation.descriptiveInvalid');
  }
  
  if (isNonsenseInput(trimmed)) {
    return t('validation.descriptiveInvalid');
  }
  
  return undefined;
};

export const ProfileForm = ({ onComplete, onBack }: ProfileFormProps) => {
  const { t } = useLanguage();
  const { toast } = useToast();
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
  
  const [errors, setErrors] = useState<FieldError>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const updateField = (field: keyof ProfileData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field as keyof FieldError]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleBlur = (field: keyof FieldError) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    
    const error = field === 'fieldOfStudy' 
      ? validateEducationField(formData[field], t)
      : validateDescriptiveField(formData[field], t);
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const validateAllFields = (): boolean => {
    const fieldOfStudyError = validateEducationField(formData.fieldOfStudy, t);
    const interestsError = validateDescriptiveField(formData.interests, t);
    const shortTermGoalsError = validateDescriptiveField(formData.shortTermGoals, t);
    const longTermGoalsError = validateDescriptiveField(formData.longTermGoals, t);
    
    const newErrors: FieldError = {
      fieldOfStudy: fieldOfStudyError,
      interests: interestsError,
      shortTermGoals: shortTermGoalsError,
      longTermGoals: longTermGoalsError,
    };
    
    setErrors(newErrors);
    setTouched({
      fieldOfStudy: true,
      interests: true,
      shortTermGoals: true,
      longTermGoals: true,
    });
    
    return !fieldOfStudyError && !interestsError && !shortTermGoalsError && !longTermGoalsError;
  };

  const handleSubmit = () => {
    if (!validateAllFields()) {
      toast({
        title: t('validation.formError'),
        description: t('validation.pleaseFixErrors'),
        variant: 'destructive',
      });
      return;
    }
    
    onComplete(formData);
  };

  const isFormValid = formData.fieldOfStudy.trim().length >= 1 && 
                      containsLetters(formData.fieldOfStudy) &&
                      formData.interests.trim().length >= 5 && 
                      formData.shortTermGoals.trim().length >= 5 && 
                      formData.longTermGoals.trim().length >= 5;

  const renderFieldError = (field: keyof FieldError) => {
    if (touched[field] && errors[field]) {
      return (
        <div className="flex items-center gap-1.5 mt-1.5 text-destructive text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{errors[field]}</span>
        </div>
      );
    }
    return null;
  };

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
                onBlur={() => handleBlur('fieldOfStudy')}
                placeholder={t('simpleForm.educationPlaceholder')}
                className={`glass-card mt-2 ${touched.fieldOfStudy && errors.fieldOfStudy ? 'border-destructive' : ''}`}
                rows={2}
              />
              {renderFieldError('fieldOfStudy')}
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
                onBlur={() => handleBlur('interests')}
                placeholder={t('simpleForm.subjectsPlaceholder')}
                className={`glass-card mt-2 ${touched.interests && errors.interests ? 'border-destructive' : ''}`}
                rows={2}
              />
              {renderFieldError('interests')}
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
                onBlur={() => handleBlur('shortTermGoals')}
                placeholder={t('simpleForm.shortTermPlaceholder')}
                className={`glass-card mt-2 ${touched.shortTermGoals && errors.shortTermGoals ? 'border-destructive' : ''}`}
                rows={2}
              />
              {renderFieldError('shortTermGoals')}
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
                onBlur={() => handleBlur('longTermGoals')}
                placeholder={t('simpleForm.longTermPlaceholder')}
                className={`glass-card mt-2 ${touched.longTermGoals && errors.longTermGoals ? 'border-destructive' : ''}`}
                rows={2}
              />
              {renderFieldError('longTermGoals')}
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
