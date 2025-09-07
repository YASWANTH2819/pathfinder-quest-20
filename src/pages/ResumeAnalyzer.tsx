import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ResumeUploader } from '@/components/ResumeUploader';
import { CareerScoreDisplay } from '@/components/CareerScoreDisplay';
import { RoadmapGenerator } from '@/components/RoadmapGenerator';

export default function ResumeAnalyzer() {
  const { t } = useLanguage();
  const [analysis, setAnalysis] = useState<any>(null);
  const [roadmap, setRoadmap] = useState<any>(null);

  const handleAnalysisComplete = (analysisResult: any) => {
    setAnalysis(analysisResult);
  };

  const handleRoadmapGenerated = (roadmapResult: any) => {
    setRoadmap(roadmapResult);
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          {t('navigation.resumeAnalyzer')}
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          {t('pages.resumeAnalyzer.description')}
        </p>
      </div>

      {/* Resume Upload Section */}
      <ResumeUploader onAnalysisComplete={handleAnalysisComplete} />

      {/* Analysis Results */}
      {analysis && (
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">{t('score.title')}</h2>
          <CareerScoreDisplay analysis={analysis} />
        </div>
      )}

      {/* Roadmap Generation */}
      {analysis && (
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">{t('roadmap.title')}</h2>
          <RoadmapGenerator 
            profileData={analysis.structuredData}
            onRoadmapGenerated={handleRoadmapGenerated}
          />
        </div>
      )}
    </div>
  );
}