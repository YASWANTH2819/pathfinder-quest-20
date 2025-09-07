import React, { useState } from 'react';
import { MapPin, Target, Loader2, Download } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { aiService } from '@/services/aiService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';

interface RoadmapGeneratorProps {
  profileData?: any;
  onRoadmapGenerated?: (roadmap: any) => void;
}

export const RoadmapGenerator: React.FC<RoadmapGeneratorProps> = ({
  profileData,
  onRoadmapGenerated
}) => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const [goal, setGoal] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [roadmap, setRoadmap] = useState<any>(null);

  const handleGenerateRoadmap = async () => {
    if (!goal.trim()) {
      toast({
        title: t('roadmap.goalRequired'),
        description: t('roadmap.goalRequiredDescription'),
        variant: 'destructive'
      });
      return;
    }

    setIsGenerating(true);

    try {
      const roadmapResult = await aiService.generateRoadmap({
        profileData,
        goal: goal.trim(),
        language,
        userId: user?.id
      });

      setRoadmap(roadmapResult);
      onRoadmapGenerated?.(roadmapResult);

      toast({
        title: t('roadmap.success'),
        description: t('roadmap.generated')
      });

    } catch (error) {
      console.error('Roadmap generation error:', error);
      toast({
        title: t('roadmap.error'),
        description: error instanceof Error ? error.message : t('roadmap.errorDescription'),
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const exportToPDF = async () => {
    if (!roadmap) return;

    try {
      // This would call a PDF export service
      toast({
        title: t('export.success'),
        description: t('export.downloadStarted')
      });
    } catch (error) {
      toast({
        title: t('export.error'),
        description: t('export.errorDescription'),
        variant: 'destructive'
      });
    }
  };

  const renderRoadmapSection = (title: string, items: any[]) => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">{title}</h3>
      {items.map((item, index) => (
        <Card key={index}>
          <CardContent className="pt-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-medium mb-2">{item.task}</h4>
                <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline">{item.type}</Badge>
                  <span className="text-xs text-muted-foreground">{item.duration}</span>
                </div>
                {item.resources && item.resources.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {item.resources.map((resource: string, idx: number) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {resource}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            {t('roadmap.title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              {t('roadmap.goalLabel')}
            </label>
            <Textarea
              placeholder={t('roadmap.goalPlaceholder')}
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <Button 
            onClick={handleGenerateRoadmap}
            disabled={isGenerating || !goal.trim()}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('roadmap.generating')}
              </>
            ) : (
              <>
                <MapPin className="mr-2 h-4 w-4" />
                {t('roadmap.generate')}
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {roadmap && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{t('roadmap.yourRoadmap')}</CardTitle>
              <Button onClick={exportToPDF} variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                {t('export.pdf')}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* AI Explanation */}
            <div className="mb-6 p-4 bg-muted rounded-lg">
              <p className="text-sm">{roadmap.localizedText}</p>
            </div>

            {/* Roadmap Tabs */}
            <Tabs defaultValue="shortTerm" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="shortTerm">{t('roadmap.shortTerm')}</TabsTrigger>
                <TabsTrigger value="midTerm">{t('roadmap.midTerm')}</TabsTrigger>
                <TabsTrigger value="longTerm">{t('roadmap.longTerm')}</TabsTrigger>
              </TabsList>
              
              <TabsContent value="shortTerm" className="mt-6">
                {renderRoadmapSection(
                  t('roadmap.shortTermTitle'),
                  roadmap.structuredData?.shortTerm || []
                )}
              </TabsContent>
              
              <TabsContent value="midTerm" className="mt-6">
                {renderRoadmapSection(
                  t('roadmap.midTermTitle'),
                  roadmap.structuredData?.midTerm || []
                )}
              </TabsContent>
              
              <TabsContent value="longTerm" className="mt-6">
                {renderRoadmapSection(
                  t('roadmap.longTermTitle'),
                  roadmap.structuredData?.longTerm || []
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
};