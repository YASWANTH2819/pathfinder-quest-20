import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  LogOut,
  Sparkles,
  Brain,
  FileText,
  Heart
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function MainPage() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-white">PathFinder</h1>
            </div>
            <Button variant="outline" size="sm" onClick={handleSignOut} className="border-white text-white hover:bg-white hover:text-primary">
              <LogOut className="w-4 h-4 mr-2" />
              {t('common.signOut')}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Three Main Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Career Guide */}
          <Card 
            className="p-10 text-center group cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 bg-white border border-gray-200 rounded-xl"
            onClick={() => navigate('/career-guide')}
          >
            <div className="space-y-6">
              <div className="w-20 h-20 mx-auto bg-primary rounded-full flex items-center justify-center mb-6 group-hover:bg-secondary transition-colors duration-300">
                <Brain className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-textmain">{t('nav.careerGuide')}</h2>
              <p className="text-gray-600 leading-relaxed">
                {t('main.careerGuideDesc')}
              </p>
            </div>
          </Card>

          {/* Resume Analyzer */}
          <Card 
            className="p-10 text-center group cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 bg-white border border-gray-200 rounded-xl"
            onClick={() => navigate('/resume-analyzer')}
          >
            <div className="space-y-6">
              <div className="w-20 h-20 mx-auto bg-primary rounded-full flex items-center justify-center mb-6 group-hover:bg-secondary transition-colors duration-300">
                <FileText className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-textmain">{t('nav.resumeAnalyzer')}</h2>
              <p className="text-gray-600 leading-relaxed">
                {t('main.resumeAnalyzerDesc')}
              </p>
            </div>
          </Card>

          {/* Career Health Score */}
          <Card 
            className="p-10 text-center group cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 bg-white border border-gray-200 rounded-xl"
            onClick={() => navigate('/career-health')}
          >
            <div className="space-y-6">
              <div className="w-20 h-20 mx-auto bg-primary rounded-full flex items-center justify-center mb-6 group-hover:bg-secondary transition-colors duration-300">
                <Heart className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-textmain">{t('dashboard.careerHealthScore')}</h2>
              <p className="text-gray-600 leading-relaxed">
                {t('main.careerHealthDesc')}
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}