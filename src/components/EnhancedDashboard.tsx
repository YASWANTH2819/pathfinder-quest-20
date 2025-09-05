import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CareerHealthGauge } from './CareerHealthGauge';
import { RoadmapTimeline } from './RoadmapTimeline';
import { 
  Download, 
  FileText, 
  TrendingUp, 
  Star, 
  Award, 
  Target,
  BookOpen,
  Briefcase,
  Users,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface DashboardData {
  atsScore: number;
  skillsMatch: number;
  roadmapProgress: number;
  resumeRating: 'Excellent' | 'Good' | 'Needs Work';
  keyStrengths: string[];
  improvementAreas: string[];
  recommendedSkills: string[];
  careerPath: string;
  estimatedSalary: string;
  jobMatches: number;
}

interface EnhancedDashboardProps {
  data: DashboardData;
  onExportPDF: () => void;
}

export const EnhancedDashboard = ({ data, onExportPDF }: EnhancedDashboardProps) => {
  const [activeTab, setActiveTab] = useState('overview');

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'Excellent': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'Good': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      default: return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
            Career Analysis Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Comprehensive AI-powered insights for your career journey
          </p>
        </div>
        <Button onClick={onExportPDF} className="bg-green-600 hover:bg-green-700 text-white">
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card p-4 text-center">
          <Award className="w-8 h-8 mx-auto text-blue-400 mb-2" />
          <div className="text-2xl font-bold text-blue-400">{data.atsScore}%</div>
          <div className="text-xs text-muted-foreground">ATS Score</div>
        </Card>
        
        <Card className="glass-card p-4 text-center">
          <Target className="w-8 h-8 mx-auto text-green-400 mb-2" />
          <div className="text-2xl font-bold text-green-400">{data.skillsMatch}%</div>
          <div className="text-xs text-muted-foreground">Skills Match</div>
        </Card>
        
        <Card className="glass-card p-4 text-center">
          <TrendingUp className="w-8 h-8 mx-auto text-purple-400 mb-2" />
          <div className="text-2xl font-bold text-purple-400">{data.roadmapProgress}%</div>
          <div className="text-xs text-muted-foreground">Roadmap Progress</div>
        </Card>
        
        <Card className="glass-card p-4 text-center">
          <Briefcase className="w-8 h-8 mx-auto text-orange-400 mb-2" />
          <div className="text-2xl font-bold text-orange-400">{data.jobMatches}</div>
          <div className="text-xs text-muted-foreground">Job Matches</div>
        </Card>
      </div>

      {/* Career Health Gauge */}
      <CareerHealthGauge 
        atsScore={data.atsScore}
        skillsMatch={data.skillsMatch}
        roadmapProgress={data.roadmapProgress}
      />

      {/* Detailed Analysis Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Resume Rating */}
            <Card className="glass-card p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-400" />
                Resume Rating
              </h3>
              <div className="text-center">
                <Badge className={`text-lg px-4 py-2 ${getRatingColor(data.resumeRating)}`}>
                  {data.resumeRating}
                </Badge>
                <p className="text-sm text-muted-foreground mt-3">
                  Based on ATS compatibility, formatting, and content quality
                </p>
              </div>
            </Card>

            {/* Career Path */}
            <Card className="glass-card p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-green-400" />
                Recommended Career Path
              </h3>
              <div className="text-center">
                <div className="text-xl font-medium text-green-400 mb-2">
                  {data.careerPath}
                </div>
                <div className="text-sm text-muted-foreground">
                  Estimated Salary: <span className="text-blue-400 font-medium">{data.estimatedSalary}</span>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="skills" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Key Strengths */}
            <Card className="glass-card p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                Key Strengths
              </h3>
              <div className="space-y-2">
                {data.keyStrengths.map((strength, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-green-400" />
                    <span className="text-sm">{strength}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Improvement Areas */}
            <Card className="glass-card p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-orange-400" />
                Areas for Improvement
              </h3>
              <div className="space-y-2">
                {data.improvementAreas.map((area, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-orange-400" />
                    <span className="text-sm">{area}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Recommended Skills */}
          <Card className="glass-card p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-purple-400" />
              Recommended Skills to Learn
            </h3>
            <div className="flex flex-wrap gap-2">
              {data.recommendedSkills.map((skill, index) => (
                <Badge key={index} variant="secondary" className="bg-purple-500/10 text-purple-400">
                  {skill}
                </Badge>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="roadmap">
          <RoadmapTimeline 
            steps={[
              {
                id: '1',
                title: 'Learn Python Fundamentals',
                description: 'Master Python basics including data structures, loops, and functions',
                type: 'skill',
                semester: 1,
                isCompleted: true,
                recommendedResources: ['Python.org Tutorial', 'Codecademy Python', 'CS50x'],
                userId: 'demo-user',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              },
              {
                id: '2', 
                title: 'Build Data Analysis Project',
                description: 'Create a portfolio project analyzing real-world data',
                type: 'project',
                semester: 1,
                isCompleted: false,
                recommendedResources: ['Kaggle Datasets', 'Pandas Documentation', 'Matplotlib Guide'],
                userId: 'demo-user',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              },
              {
                id: '3',
                title: 'Apply for Data Science Internship',
                description: 'Secure hands-on experience in data science field',
                type: 'internship',
                semester: 2,
                isCompleted: false,
                recommendedResources: ['LinkedIn Jobs', 'Indeed', 'AngelList'],
                userId: 'demo-user',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              }
            ]}
            onStepComplete={(stepId, isCompleted) => {
              console.log(`Step ${stepId} completed: ${isCompleted}`);
            }}
          />
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <Card className="glass-card p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              Market Insights
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-lg bg-blue-500/5">
                <div className="text-2xl font-bold text-blue-400">85%</div>
                <div className="text-sm text-muted-foreground">Industry Growth</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-green-500/5">
                <div className="text-2xl font-bold text-green-400">₹12L+</div>
                <div className="text-sm text-muted-foreground">Avg. Salary</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-purple-500/5">
                <div className="text-2xl font-bold text-purple-400">2.3k</div>
                <div className="text-sm text-muted-foreground">Open Positions</div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};