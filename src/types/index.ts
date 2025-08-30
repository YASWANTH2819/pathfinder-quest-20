// Enhanced types for the PathFinder Quest application

export interface ProfileData {
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
  targetRole?: string;
  language?: 'en' | 'hi' | 'te';
}

export interface ResumeAnalysis {
  id: string;
  userId: string;
  atsScore: number;
  skillsMatchScore: number;
  missingSkills: string[];
  quickFixes: string[];
  suggestedCourses: Course[];
  createdAt: string;
  resumeText: string;
}

export interface Course {
  title: string;
  provider: string;
  url?: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  skills: string[];
  price: string;
  language: string;
  indianFocus: boolean;
}

export interface RoadmapStep {
  id: string;
  userId: string;
  title: string;
  description: string;
  type: 'skill' | 'project' | 'internship' | 'prep';
  semester?: number;
  isCompleted: boolean;
  recommendedResources?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CareerHealthScore {
  id: string;
  userId: string;
  atsScore: number;
  skillsMatchScore: number;
  roadmapProgress: number;
  overallScore: number;
  createdAt: string;
}

export interface Badge {
  id: string;
  userId: string;
  badgeCode: string;
  title: string;
  description: string;
  awardedAt: string;
}

export interface Role {
  title: string;
  requiredSkills: string[];
  description: string;
  averageSalary: string;
  growthRate: string;
  indianMarketDemand: 'Low' | 'Medium' | 'High' | 'Very High';
}

export interface SkillGapAnalysis {
  targetRole: string;
  currentSkills: string[];
  requiredSkills: string[];
  missingSkills: string[];
  matchPercentage: number;
  recommendations: Course[];
}

export interface DashboardData {
  careerHealthScore: CareerHealthScore;
  recentAnalyses: ResumeAnalysis[];
  skillGapAnalysis: SkillGapAnalysis;
  roadmapProgress: {
    totalSteps: number;
    completedSteps: number;
    percentage: number;
  };
  badges: Badge[];
  chartData: {
    healthScoreHistory: Array<{ date: string; score: number }>;
    atsScoreHistory: Array<{ date: string; score: number }>;
    skillsProgress: Array<{ skill: string; proficiency: number }>;
  };
}

export type Language = 'en' | 'hi' | 'te';

export interface Translation {
  [key: string]: string | Translation;
}

export interface TranslationData {
  en: Translation;
  hi: Translation;
  te: Translation;
}