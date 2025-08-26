import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Key, ExternalLink, CheckCircle } from 'lucide-react';

interface APIKeySetupProps {
  onApiKeySet: (apiKey: string) => void;
  currentApiKey?: string;
}

export const APIKeySetup = ({ onApiKeySet, currentApiKey }: APIKeySetupProps) => {
  const [apiKey, setApiKey] = useState('');
  const [showInstructions, setShowInstructions] = useState(!currentApiKey);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim()) {
      onApiKeySet(apiKey.trim());
      setShowInstructions(false);
    }
  };

  if (currentApiKey && !showInstructions) {
    return (
      <div className="flex items-center justify-between p-3 bg-[hsl(var(--cyber-green)/0.1)] border border-[hsl(var(--cyber-green)/0.3)] rounded-lg">
        <div className="flex items-center space-x-2">
          <CheckCircle className="w-4 h-4 text-[hsl(var(--cyber-green))]" />
          <span className="text-sm text-[hsl(var(--cyber-green))]">Gemini AI Connected</span>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setShowInstructions(true)}
          className="text-xs"
        >
          Change API Key
        </Button>
      </div>
    );
  }

  return (
    <Card className="glass-card p-4 mb-4">
      <div className="flex items-center space-x-2 mb-3">
        <Key className="w-5 h-5 text-[hsl(var(--cyber-blue))]" />
        <h3 className="font-semibold">Setup Gemini AI</h3>
      </div>
      
      <Alert className="mb-4">
        <AlertDescription className="text-sm">
          To enable AI-powered career guidance, you need a free Gemini API key. 
          <a 
            href="https://makersuite.google.com/app/apikey" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[hsl(var(--cyber-blue))] hover:underline ml-1 inline-flex items-center"
          >
            Get your free API key here <ExternalLink className="w-3 h-3 ml-1" />
          </a>
        </AlertDescription>
      </Alert>

      <form onSubmit={handleSubmit} className="space-y-3">
        <Input
          type="password"
          placeholder="Enter your Gemini API key"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          className="glass-card"
        />
        <div className="flex space-x-2">
          <Button type="submit" variant="cyber" className="flex-1">
            Connect Gemini AI
          </Button>
          {currentApiKey && (
            <Button 
              type="button" 
              variant="glass" 
              onClick={() => setShowInstructions(false)}
            >
              Cancel
            </Button>
          )}
        </div>
      </form>
      
      <p className="text-xs text-muted-foreground mt-2">
        Your API key is stored locally and only used for AI responses.
      </p>
    </Card>
  );
};