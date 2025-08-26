import React, { useState } from 'react';
import { HeroSection } from './HeroSection';
import { ChatInterface } from './ChatInterface';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home } from 'lucide-react';

export const CareerGuidePage = () => {
  const [currentView, setCurrentView] = useState<'hero' | 'chat'>('hero');

  const handleStartChat = () => {
    setCurrentView('chat');
  };

  const handleBackToHome = () => {
    setCurrentView('hero');
  };

  if (currentView === 'hero') {
    return <HeroSection onStartChat={handleStartChat} />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Chat Header */}
      <div className="p-4 glass-card m-4 rounded-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="glass" size="icon" onClick={handleBackToHome}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold gradient-text">AI Career Guide</h1>
              <p className="text-sm text-muted-foreground">Your personal career advisor</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-[hsl(var(--cyber-green))] rounded-full animate-pulse"></div>
            <span className="text-sm text-muted-foreground">Online</span>
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="flex-1 mx-4 mb-4">
        <Card className="glass-card h-full">
          <ChatInterface />
        </Card>
      </div>
    </div>
  );
};