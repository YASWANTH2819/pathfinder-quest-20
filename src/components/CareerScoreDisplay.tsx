import React from 'react';
import { TrendingUp, Award, BookOpen, Briefcase } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface CareerScoreProps {
  analysis: {
    structuredData: {
      atsScore: number;
      jobMatchScore?: number;
      keywordCoverage?: number;
      skillsMatchScore: number;
      missingSkills: string[];
      quickFixes: string[];
      careerHealth: string;
      recommendations: string[];
    };
    localizedText: string;
  };
}

export const CareerScoreDisplay: React.FC<CareerScoreProps> = ({ analysis }) => {
  const { t } = useLanguage();
  const { structuredData, localizedText } = analysis;

  const getHealthColor = (health: string) => {
    switch (health.toLowerCase()) {
      case 'excellent':
        return 'bg-green-500';
      case 'good':
        return 'bg-blue-500';
      case 'moderate':
        return 'bg-yellow-500';
      case 'needs upskill':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Overall Scores - 2 Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ATS Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className={`text-3xl font-bold ${getScoreColor(structuredData.atsScore)}`}>
                {structuredData.atsScore}%
              </div>
              <Progress value={structuredData.atsScore} className="h-2" />
              <p className="text-xs text-muted-foreground">Applicant Tracking System compatibility</p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Keyword Coverage</CardTitle>
            <BookOpen className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className={`text-3xl font-bold ${getScoreColor(structuredData.keywordCoverage || structuredData.skillsMatchScore)}`}>
                {structuredData.keywordCoverage || structuredData.skillsMatchScore}%
              </div>
              <Progress value={structuredData.keywordCoverage || structuredData.skillsMatchScore} className="h-2" />
              <p className="text-xs text-muted-foreground">Industry-relevant keywords present</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Career Health */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            {t('score.careerHealth')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <div className={`w-4 h-4 rounded-full ${getHealthColor(structuredData.careerHealth)}`} />
            <span className="font-semibold">{structuredData.careerHealth}</span>
          </div>
          <p className="text-muted-foreground mt-2">{localizedText}</p>
        </CardContent>
      </Card>

      {/* Missing Skills */}
      {structuredData.missingSkills.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              {t('score.missingSkills')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {structuredData.missingSkills.map((skill, index) => (
                <Badge key={index} variant="outline">
                  {skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Fixes */}
      {structuredData.quickFixes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t('score.quickFixes')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {structuredData.quickFixes.map((fix, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <span className="text-sm">{fix}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {structuredData.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t('score.recommendations')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {structuredData.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                  <span className="text-sm">{rec}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
};