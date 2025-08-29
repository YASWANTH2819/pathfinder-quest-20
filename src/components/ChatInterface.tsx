import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Send, Bot, User, Mic, MicOff, FileText, Loader2 } from 'lucide-react';
import { geminiService } from '@/services/geminiService';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface ProfileData {
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
  resumeText?: string;
}

interface ChatInterfaceProps {
  profileData: ProfileData | null;
}

export const ChatInterface = ({ profileData }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: `Hello ${profileData?.name || 'there'}! 🚀 I've reviewed your profile and I'm excited to help guide your career journey. Based on your background in ${profileData?.fieldOfStudy || 'your field'}, I can provide personalized advice on:\n\n🎯 **Career Recommendations** - Job roles and paths\n📚 **Skill Development** - Courses and certifications\n🗺️ **Learning Roadmaps** - Step-by-step career plans\n📹 **YouTube Resources** - Tutorial links and channels\n💼 **Job Platforms** - Where to find opportunities\n📄 **Resume Analysis** - Based on your current resume\n🎤 **Interview Prep** - Tips and practice questions\n\nWhat would you like to explore first?`,
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    const userInput = inputValue;
    setInputValue('');
    setIsLoading(true);

    try {
      const aiResponse = await geminiService.generateCareerResponse(profileData, userInput);
      
      const aiMessage: Message = {
        id: Date.now().toString(),
        content: aiResponse,
        sender: 'ai',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: Date.now().toString(),
        content: `❌ **Error:** ${error instanceof Error ? error.message : 'Failed to get AI response. Please try again.'}`,
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleVoiceInput = () => {
    setIsListening(!isListening);
    // Voice input logic would go here
  };

  const handleQuickResponse = (option: string) => {
    setInputValue(option);
  };

  const quickOptions = [
    "Career options",
    "Courses and skills", 
    "Learning roadmap",
    "YouTube tutorials",
    "Job platforms",
    "Resume analyzer",
    "Interview tips"
  ];

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex items-start space-x-3 max-w-xs sm:max-w-md lg:max-w-lg ${
              message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
            }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                message.sender === 'user' 
                  ? 'bg-gradient-to-r from-[hsl(var(--cyber-purple))] to-[hsl(var(--cyber-blue))]' 
                  : 'bg-gradient-to-r from-[hsl(var(--cyber-green))] to-[hsl(var(--cyber-blue))]'
              }`}>
                {message.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <Card className={`p-3 glass-card ${
                message.sender === 'user' 
                  ? 'bg-gradient-to-r from-[hsl(var(--cyber-purple)/0.2)] to-[hsl(var(--cyber-blue)/0.2)]' 
                  : 'bg-[var(--glass-background)]'
              }`}>
                <p className="text-sm whitespace-pre-line">{message.content}</p>
                <span className="text-xs text-muted-foreground mt-1 block">
                  {message.timestamp.toLocaleTimeString()}
                </span>
              </Card>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Response Options */}
      <div className="p-4 border-t border-[var(--glass-border)]">
        <p className="text-sm text-muted-foreground mb-2">Quick topics:</p>
        <div className="flex flex-wrap gap-2">
          {quickOptions.map((option) => (
            <Button
              key={option}
              variant="glass"
              size="sm"
              onClick={() => handleQuickResponse(option)}
              className="text-xs"
            >
              {option}
            </Button>
          ))}
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-[var(--glass-border)]">
        <div className="flex space-x-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
            placeholder={isLoading ? "AI is thinking..." : "Ask about careers, skills, roadmaps, resume help..."}
            disabled={isLoading}
            className="flex-1 glass-card"
          />
          <Button
            variant="cyber"
            size="icon"
            onClick={toggleVoiceInput}
            className={isListening ? 'animate-pulse-glow' : ''}
            disabled={isLoading}
          >
            {isListening ? <MicOff size={16} /> : <Mic size={16} />}
          </Button>
          <Button 
            variant="cyber" 
            size="icon" 
            onClick={handleSendMessage}
            disabled={isLoading || !inputValue.trim()}
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send size={16} />}
          </Button>
        </div>
      </div>
    </div>
  );
};