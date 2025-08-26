import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Send, Bot, User, Mic, MicOff } from 'lucide-react';

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
}

interface ChatInterfaceProps {
  profileData: ProfileData | null;
}

export const ChatInterface = ({ profileData }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: `Hello ${profileData?.name || 'there'}! 🚀 I've reviewed your profile and I'm excited to help guide your career journey. Based on your background in ${profileData?.fieldOfStudy || 'your field'}, I can provide personalized advice on courses, skills, job opportunities, and career paths. What would you like to explore first?`,
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    setInputValue('');

    // Generate AI response
    setTimeout(() => {
      generateAIResponse(inputValue);
    }, 1000);
  };

  const generateAIResponse = (userInput: string) => {
    let aiResponse = "";
    
    // Generate contextual response based on user input and profile
    if (userInput.toLowerCase().includes('course') || userInput.toLowerCase().includes('skill')) {
      aiResponse = generateSkillRecommendations();
    } else if (userInput.toLowerCase().includes('job') || userInput.toLowerCase().includes('career')) {
      aiResponse = generateCareerRecommendations();
    } else if (userInput.toLowerCase().includes('roadmap') || userInput.toLowerCase().includes('path')) {
      aiResponse = generateRoadmap();
    } else {
      aiResponse = "That's a great question! Based on your profile, I can help you with:\n\n🎯 **Career recommendations** - Type 'career options'\n📚 **Skill development** - Type 'courses and skills'\n🗺️ **Learning roadmap** - Type 'roadmap'\n💼 **Job search tips** - Ask about interview prep or resume tips\n\nWhat would you like to explore?";
    }

    const aiMessage: Message = {
      id: Date.now().toString(),
      content: aiResponse,
      sender: 'ai',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, aiMessage]);
  };

  const generateCareerRecommendations = () => {
    if (!profileData) return "Please complete your profile first.";
    
    let recommendations = "🎯 Based on your profile, here are personalized career recommendations:\n\n";
    
    // Generate recommendations based on profile data
    if (profileData.fieldOfStudy.toLowerCase().includes('engineering')) {
      if (profileData.workEnvironment.toLowerCase().includes('coding')) {
        recommendations += "💻 **Software Developer/Engineer** - Perfect match for your technical interests\n";
        recommendations += "🤖 **AI/ML Engineer** - Growing field with excellent opportunities\n";
      }
      recommendations += "📊 **Data Scientist** - Combine engineering with analytics\n";
      recommendations += "🏗️ **Product Manager** - Bridge technical and business aspects\n\n";
    }
    
    if (profileData.workEnvironment.toLowerCase().includes('creative')) {
      recommendations += "🎨 **UI/UX Designer** - Perfect blend of creativity and technology\n";
      recommendations += "📱 **Digital Marketing Specialist** - Creative campaigns and strategies\n\n";
    }
    
    if (profileData.workEnvironment.toLowerCase().includes('research')) {
      recommendations += "🔬 **Research Scientist** - Perfect for analytical minds\n";
      recommendations += "📖 **Academic Career** - Teaching and research in universities\n\n";
    }
    
    recommendations += "📚 **Next Steps for your goals:**\n";
    recommendations += `• Focus on ${profileData.shortTermGoals} as your immediate priority\n`;
    recommendations += "• Build relevant skills through online courses\n";
    recommendations += "• Create projects to showcase your abilities\n";
    recommendations += "• Connect with professionals in your field of interest\n\n";
    recommendations += "Would you like specific course recommendations or a detailed roadmap? 🚀";
    
    return recommendations;
  };

  const generateSkillRecommendations = () => {
    if (!profileData) return "Please complete your profile first.";
    
    let skills = "📚 **Recommended Skills & Courses:**\n\n";
    
    if (profileData.fieldOfStudy.toLowerCase().includes('engineering')) {
      skills += "**Technical Skills:**\n";
      skills += "• Programming: Python, Java, JavaScript\n";
      skills += "• Data Analysis: SQL, Excel, Tableau\n";
      skills += "• Cloud: AWS, Azure basics\n\n";
    }
    
    skills += "**Soft Skills:**\n";
    skills += "• Communication & Presentation\n";
    skills += "• Project Management\n";
    skills += "• Leadership & Teamwork\n\n";
    
    skills += "**Recommended Platforms:**\n";
    skills += "• Coursera, edX for certifications\n";
    skills += "• YouTube for tutorials\n";
    skills += "• GitHub for project portfolio\n";
    skills += "• LinkedIn Learning for professional skills\n\n";
    
    skills += "Would you like specific course links or want to discuss any particular skill? 🎓";
    
    return skills;
  };

  const generateRoadmap = () => {
    if (!profileData) return "Please complete your profile first.";
    
    let roadmap = "🗺️ **Your Personalized Career Roadmap:**\n\n";
    
    roadmap += "**Phase 1 (Next 3 months):**\n";
    roadmap += "• Complete your current studies\n";
    roadmap += "• Learn 2-3 relevant technical skills\n";
    roadmap += "• Start building a portfolio/GitHub\n\n";
    
    roadmap += "**Phase 2 (3-6 months):**\n";
    roadmap += `• Focus on ${profileData.shortTermGoals}\n`;
    roadmap += "• Apply for internships/jobs\n";
    roadmap += "• Network with professionals\n";
    roadmap += "• Get certifications\n\n";
    
    roadmap += "**Phase 3 (6-12 months):**\n";
    roadmap += "• Gain practical experience\n";
    roadmap += "• Build advanced projects\n";
    roadmap += "• Prepare for next career step\n\n";
    
    roadmap += `**Long-term (2+ years): ${profileData.longTermGoals}**\n\n`;
    
    roadmap += "Would you like me to break down any specific phase in more detail? 📋";
    
    return roadmap;
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
    "Interview tips",
    "Resume help"
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
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type your message..."
            className="flex-1 glass-card"
          />
          <Button
            variant="cyber"
            size="icon"
            onClick={toggleVoiceInput}
            className={isListening ? 'animate-pulse-glow' : ''}
          >
            {isListening ? <MicOff size={16} /> : <Mic size={16} />}
          </Button>
          <Button variant="cyber" size="icon" onClick={handleSendMessage}>
            <Send size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
};