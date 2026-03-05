import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { ResumeUploader } from '@/components/ResumeUploader';
import { CareerScoreDisplay } from '@/components/CareerScoreDisplay';
import { RoadmapGenerator } from '@/components/RoadmapGenerator';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function ResumeAnalyzer() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState<any>(null);
  const [roadmap, setRoadmap] = useState<any>(null);

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate('/main')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="text-center flex-1 space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            {t('navigation.resumeAnalyzer')}
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t('pages.resumeAnalyzer.description')}
          </p>
        </div>
        <div className="w-10" /> {/* spacer for centering */}
      </div>

      <ResumeUploader onAnalysisComplete={setAnalysis} />

      {analysis && (
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">{t('score.title')}</h2>
          <CareerScoreDisplay analysis={analysis} />
        </div>
      )}

      {analysis && (
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">{t('roadmap.title')}</h2>
          <RoadmapGenerator profileData={analysis.structuredData} onRoadmapGenerated={setRoadmap} />
        </div>
      )}
    </div>
  );
}
