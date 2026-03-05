import React from 'react';
import { TrendingUp, Award, BookOpen, Briefcase, Target, AlertTriangle, CheckCircle, FileText } from 'lucide-react';
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
      resumeScore?: number;
      careerAlignmentFeedback?: string;
      overallRating?: number;
    };
    localizedText: string;
  };
}

export const CareerScoreDisplay: React.FC<CareerScoreProps> = ({ analysis }) => {
  const { t } = useLanguage();
  const { structuredData, localizedText } = analysis;

  // Calculate resume score from components if not provided
  const resumeScore = structuredData.resumeScore || Math.round(
    (structuredData.atsScore * 0.4) +
    ((structuredData.jobMatchScore || structuredData.skillsMatchScore) * 0.3) +
    ((structuredData.keywordCoverage || structuredData.skillsMatchScore) * 0.3)
  );

  const getHealthColor = (health: string) => {
    switch (health.toLowerCase()) {
      case 'excellent': return 'bg-green-500';
      case 'good': return 'bg-blue-500';
      case 'moderate': return 'bg-yellow-500';
      case 'needs upskill': return 'bg-red-500';
      default: return 'bg-muted';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'from-green-500 to-emerald-600';
    if (score >= 60) return 'from-blue-500 to-cyan-600';
    if (score >= 40) return 'from-yellow-500 to-amber-600';
    return 'from-red-500 to-rose-600';
  };

  return (
    <div className="space-y-6">
      {/* Resume Score Gauge */}
      <Card className="glass-card overflow-hidden">
        <div className={`bg-gradient-to-r ${getScoreBg(resumeScore)} p-8 text-center text-white`}>
          <p className="text-sm opacity-90 mb-2">Resume Score</p>
          <div className="text-6xl font-bold mb-1">{resumeScore}</div>
          <p className="text-lg opacity-90">/100</p>
          <div className="mt-4 max-w-xs mx-auto">
            <div className="w-full bg-white/20 rounded-full h-3">
              <div className="bg-white rounded-full h-3 transition-all duration-700" style={{ width: `${resumeScore}%` }} />
            </div>
          </div>
        </div>
      </Card>

      {/* Score Breakdown - 3 Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ATS Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className={`text-3xl font-bold ${getScoreColor(structuredData.atsScore)}`}>{structuredData.atsScore}%</div>
              <Progress value={structuredData.atsScore} className="h-2" />
              <p className="text-xs text-muted-foreground">ATS compatibility</p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Job Match</CardTitle>
            <Target className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className={`text-3xl font-bold ${getScoreColor(structuredData.jobMatchScore || structuredData.skillsMatchScore)}`}>
                {structuredData.jobMatchScore || structuredData.skillsMatchScore}%
              </div>
              <Progress value={structuredData.jobMatchScore || structuredData.skillsMatchScore} className="h-2" />
              <p className="text-xs text-muted-foreground">Role alignment</p>
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
              <p className="text-xs text-muted-foreground">Industry keywords</p>
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

      {/* Career Alignment Feedback */}
      {structuredData.careerAlignmentFeedback && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Career Alignment Feedback
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{structuredData.careerAlignmentFeedback}</p>
          </CardContent>
        </Card>
      )}

      {/* Missing Skills with severity */}
      {structuredData.missingSkills.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              {t('score.missingSkills')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {structuredData.missingSkills.map((skill, index) => (
                <Badge key={index} variant="outline" className={index < 3 ? 'border-red-500/50 text-red-600' : 'border-amber-500/50 text-amber-600'}>
                  {index < 3 && <AlertTriangle className="w-3 h-3 mr-1" />}
                  {skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Suggested Improvements (numbered) */}
      {structuredData.quickFixes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t('score.quickFixes')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-2">
              {structuredData.quickFixes.map((fix, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    {index + 1}
                  </div>
                  <span className="text-sm">{fix}</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {structuredData.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              {t('score.recommendations')}
            </CardTitle>
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
