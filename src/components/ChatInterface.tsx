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

interface Question {
  id: string;
  text: string;
  category: string;
  options?: string[];
}

const CAREER_QUESTIONS: Question[] = [
  {
    id: 'name',
    text: "What's your name? I'd love to get to know you better! 👋",
    category: 'profile'
  },
  {
    id: 'age',
    text: "How old are you?",
    category: 'profile'
  },
  {
    id: 'education_level',
    text: "What's your current education level?",
    category: 'education',
    options: ['10th Grade', '12th Grade', 'Diploma', "Bachelor's Degree", "Master's Degree", 'Other']
  },
  {
    id: 'field_of_study',
    text: "What's your field of study?",
    category: 'education',
    options: ['Engineering', 'Commerce', 'Arts', 'Science', 'Medical', 'Law', 'Other']
  },
  {
    id: 'skills',
    text: "What skills do you currently have? (Technical or soft skills)",
    category: 'skills'
  },
  {
    id: 'interests',
    text: "What subjects or activities do you enjoy the most?",
    category: 'skills'
  },
  {
    id: 'work_environment',
    text: "What kind of work environment appeals to you?",
    category: 'skills',
    options: ['Coding/Technical', 'Management', 'Creative', 'Research', 'Business', 'Teaching', 'Other']
  },
  {
    id: 'short_term_goals',
    text: "What are your short-term goals (1-2 years)?",
    category: 'goals',
    options: ['Internship', 'Job', 'Higher Studies', 'Startup', 'Certification', 'Other']
  },
  {
    id: 'long_term_goals',
    text: "What are your long-term goals (5+ years)?",
    category: 'goals'
  }
];

export const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hey there! 🚀 I'm your AI Career Guide, here to help you discover the perfect career path! Let's start our journey together.",
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userResponses, setUserResponses] = useState<Record<string, string>>({});
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
    
    // Store the response for current question
    if (currentQuestionIndex < CAREER_QUESTIONS.length) {
      const currentQuestion = CAREER_QUESTIONS[currentQuestionIndex];
      setUserResponses(prev => ({
        ...prev,
        [currentQuestion.id]: inputValue
      }));
    }

    setInputValue('');

    // Generate AI response
    setTimeout(() => {
      generateAIResponse(inputValue);
    }, 1000);
  };

  const generateAIResponse = (userInput: string) => {
    let aiResponse = "";
    
    if (currentQuestionIndex < CAREER_QUESTIONS.length - 1) {
      // Ask next question
      const nextIndex = currentQuestionIndex + 1;
      const nextQuestion = CAREER_QUESTIONS[nextIndex];
      aiResponse = `Great! ${nextQuestion.text}`;
      setCurrentQuestionIndex(nextIndex);
    } else if (currentQuestionIndex === CAREER_QUESTIONS.length - 1) {
      // Final question completed, generate career recommendations
      aiResponse = generateCareerRecommendations();
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Conversation mode
      aiResponse = "That's interesting! Feel free to ask me anything about career guidance, education paths, or skill development. I'm here to help! 💡";
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
    const responses = userResponses;
    let recommendations = "🎯 Based on your responses, here are some personalized career recommendations:\n\n";
    
    // Simple recommendation logic based on responses
    if (responses.field_of_study?.toLowerCase().includes('engineering')) {
      recommendations += "🔧 **Software Engineer/Developer** - Your engineering background is perfect for tech roles\n";
      recommendations += "📊 **Data Scientist** - Combine your technical skills with analytics\n";
      recommendations += "🏗️ **Product Manager** - Bridge technical and business aspects\n\n";
    }
    
    if (responses.work_environment?.toLowerCase().includes('creative')) {
      recommendations += "🎨 **UI/UX Designer** - Perfect blend of creativity and technology\n";
      recommendations += "📱 **Digital Marketing** - Creative campaigns and strategies\n\n";
    }
    
    recommendations += "📚 **Next Steps:**\n";
    recommendations += "• Build relevant skills through online courses\n";
    recommendations += "• Create projects to showcase your abilities\n";
    recommendations += "• Connect with professionals in your field of interest\n";
    recommendations += "• Consider internships to gain practical experience\n\n";
    recommendations += "Would you like me to suggest specific courses or resources for any of these paths? 🚀";
    
    return recommendations;
  };

  const toggleVoiceInput = () => {
    setIsListening(!isListening);
    // Voice input logic would go here
  };

  const handleQuickResponse = (option: string) => {
    setInputValue(option);
  };

  const currentQuestion = currentQuestionIndex < CAREER_QUESTIONS.length ? CAREER_QUESTIONS[currentQuestionIndex] : null;

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
      {currentQuestion?.options && (
        <div className="p-4 border-t border-[var(--glass-border)]">
          <p className="text-sm text-muted-foreground mb-2">Quick responses:</p>
          <div className="flex flex-wrap gap-2">
            {currentQuestion.options.map((option) => (
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
      )}

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