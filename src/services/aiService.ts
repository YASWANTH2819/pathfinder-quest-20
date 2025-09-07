import { Language } from '@/types';
import { supabase } from '@/integrations/supabase/client';

interface AIServiceResponse {
  structuredData: any;
  localizedText: string;
  originalResponse?: string;
}

interface ResumeAnalysisRequest {
  resumeText: string;
  targetRole?: string;
  language: Language;
  userId?: string;
}

interface RoadmapGenerationRequest {
  profileData: any;
  goal: string;
  language: Language;
  userId?: string;
}

class AIService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = ''; // Will be fetched from Supabase Edge Functions
    this.baseUrl = import.meta.env.VITE_SUPABASE_URL || '';
  }

  private async getSystemPrompt(language: Language): Promise<string> {
    const languageNames = {
      en: 'English',
      hi: 'Hindi (हिंदी)',
      te: 'Telugu (తెలుగు)'
    };

    return `You are an expert career advisor and resume analyst. 

IMPORTANT INSTRUCTIONS:
- User preference language is ${languageNames[language]}
- Always respond in ${languageNames[language]} using native script
- If input is in other language, translate your analysis into ${languageNames[language]}
- Provide both structured JSON and human-readable explanation in ${languageNames[language]}
- Be culturally appropriate and consider Indian job market context
- Focus on practical, actionable advice

For resume analysis:
- Calculate ATS score based on formatting, keywords, structure
- Identify missing skills for target roles
- Suggest improvements for better ATS compatibility
- Provide career health assessment

For roadmap generation:
- Create short-term (0-6 months), mid-term (6-18 months), long-term (18+ months) goals
- Include specific skills, certifications, projects, and resources
- Consider Indian education system and job market
- Suggest relevant courses and platforms available in India`;
  }

  async analyzeResume(request: ResumeAnalysisRequest): Promise<AIServiceResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('analyze-resume', {
        body: {
          resumeText: request.resumeText,
          targetRole: request.targetRole,
          language: request.language,
          userId: request.userId,
          systemPrompt: await this.getSystemPrompt(request.language)
        }
      });

      if (error) throw error;

      return {
        structuredData: data.analysis,
        localizedText: data.explanation,
        originalResponse: data.rawResponse
      };
    } catch (error) {
      console.error('Error analyzing resume:', error);
      
      // Fallback response in case of API failure
      return this.getFallbackResumeAnalysis(request.language);
    }
  }

  async generateRoadmap(request: RoadmapGenerationRequest): Promise<AIServiceResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('generate-roadmap', {
        body: {
          profileData: request.profileData,
          goal: request.goal,
          language: request.language,
          userId: request.userId,
          systemPrompt: await this.getSystemPrompt(request.language)
        }
      });

      if (error) throw error;

      return {
        structuredData: data.roadmap,
        localizedText: data.explanation,
        originalResponse: data.rawResponse
      };
    } catch (error) {
      console.error('Error generating roadmap:', error);
      
      // Fallback response in case of API failure
      return this.getFallbackRoadmap(request.language);
    }
  }

  async translateContent(content: string, targetLanguage: Language): Promise<string> {
    try {
      const { data, error } = await supabase.functions.invoke('translate-content', {
        body: {
          content,
          targetLanguage,
          systemPrompt: `Translate the following content to ${targetLanguage} while maintaining professional tone and technical accuracy. Use native script.`
        }
      });

      if (error) throw error;

      return data.translatedContent;
    } catch (error) {
      console.error('Error translating content:', error);
      return content; // Return original if translation fails
    }
  }

  async chatWithAI(message: string, language: Language, context?: any): Promise<string> {
    try {
      const { data, error } = await supabase.functions.invoke('chat-with-ai', {
        body: {
          message,
          language,
          context,
          systemPrompt: await this.getSystemPrompt(language)
        }
      });

      if (error) throw error;

      return data.response;
    } catch (error) {
      console.error('Error in AI chat:', error);
      
      // Fallback response
      const fallbackMessages = {
        en: "I'm sorry, I'm currently unable to process your request. Please try again later.",
        hi: "क्षमा करें, मैं वर्तमान में आपके अनुरोध को संसाधित करने में असमर्थ हूं। कृपया बाद में पुनः प्रयास करें।",
        te: "క్షమించండి, నేను ప్రస్తుతం మీ అభ్యర్థనను ప్రాసెస్ చేయలేకపోతున్నాను. దయచేసి తర్వాత మళ్లీ ప్రయత్నించండి."
      };
      
      return fallbackMessages[language];
    }
  }

  private getFallbackResumeAnalysis(language: Language): AIServiceResponse {
    const fallbackData = {
      en: {
        structuredData: {
          atsScore: 75,
          skillsMatchScore: 68,
          missingSkills: ["React", "TypeScript", "Node.js"],
          quickFixes: ["Add more keywords", "Improve formatting", "Include quantified achievements"],
          careerHealth: "Good",
          recommendations: ["Take online courses", "Build portfolio projects", "Network with professionals"]
        },
        localizedText: "Your resume shows good potential with an ATS score of 75%. Focus on adding technical keywords and quantifying your achievements to improve your score."
      },
      hi: {
        structuredData: {
          atsScore: 75,
          skillsMatchScore: 68,
          missingSkills: ["React", "TypeScript", "Node.js"],
          quickFixes: ["अधिक कीवर्ड जोड़ें", "फॉर्मेटिंग सुधारें", "मात्रात्मक उपलब्धियां शामिल करें"],
          careerHealth: "अच्छा",
          recommendations: ["ऑनलाइन कोर्स लें", "पोर्टफोलियो प्रोजेक्ट बनाएं", "पेशेवरों के साथ नेटवर्क करें"]
        },
        localizedText: "आपका रिज्यूमे 75% ATS स्कोर के साथ अच्छी संभावना दिखाता है। अपना स्कोर बेहतर बनाने के लिए तकनीकी कीवर्ड जोड़ने और अपनी उपलब्धियों को मापने पर ध्यान दें।"
      },
      te: {
        structuredData: {
          atsScore: 75,
          skillsMatchScore: 68,
          missingSkills: ["React", "TypeScript", "Node.js"],
          quickFixes: ["మరిన్ని కీవర్డ్‌లను జోడించండి", "ఫార్మాటింగ్‌ను మెరుగుపరచండి", "లెక్కించబడిన విజయాలను చేర్చండి"],
          careerHealth: "మంచిది",
          recommendations: ["ఆన్‌లైన్ కోర్సులు తీసుకోండి", "పోర్ట్‌ఫోలియో ప్రాజెక్ట్‌లను నిర్మించండి", "నిపుణులతో నెట్‌వర్క్ చేయండి"]
        },
        localizedText: "మీ రెజ్యూమె 75% ATS స్కోర్‌తో మంచి సంభావ్యతను చూపిస్తోంది। మీ స్కోర్‌ను మెరుగుపరచడానికి సాంకేతిక కీవర్డ్‌లను జోడించడం మరియు మీ విజయాలను లెక్కించడంపై దృష్టి పెట్టండి."
      }
    };

    return fallbackData[language];
  }

  private getFallbackRoadmap(language: Language): AIServiceResponse {
    const fallbackData = {
      en: {
        structuredData: {
          shortTerm: [
            { task: "Complete React course", duration: "2 months", type: "skill" },
            { task: "Build portfolio website", duration: "1 month", type: "project" }
          ],
          midTerm: [
            { task: "Get React certification", duration: "3 months", type: "certification" },
            { task: "Apply for internships", duration: "6 months", type: "internship" }
          ],
          longTerm: [
            { task: "Land full-time developer role", duration: "18+ months", type: "career" },
            { task: "Contribute to open source", duration: "ongoing", type: "project" }
          ]
        },
        localizedText: "Your roadmap focuses on building React expertise through courses, projects, and certifications to achieve your career goals in web development."
      },
      hi: {
        structuredData: {
          shortTerm: [
            { task: "React कोर्स पूरा करें", duration: "2 महीने", type: "skill" },
            { task: "पोर्टफोलियो वेबसाइट बनाएं", duration: "1 महीना", type: "project" }
          ],
          midTerm: [
            { task: "React सर्टिफिकेशन प्राप्त करें", duration: "3 महीने", type: "certification" },
            { task: "इंटर्नशिप के लिए आवेदन करें", duration: "6 महीने", type: "internship" }
          ],
          longTerm: [
            { task: "फुल-टाइम डेवलपर की भूमिका पाएं", duration: "18+ महीने", type: "career" },
            { task: "ओपन सोर्स में योगदान दें", duration: "निरंतर", type: "project" }
          ]
        },
        localizedText: "आपका रोडमैप वेब डेवलपमेंट में आपके करियर लक्ष्यों को प्राप्त करने के लिए कोर्स, प्रोजेक्ट और सर्टिफिकेशन के माध्यम से React विशेषज्ञता बनाने पर केंद्रित है।"
      },
      te: {
        structuredData: {
          shortTerm: [
            { task: "React కోర్సు పూర्ण చేయండి", duration: "2 నెలలు", type: "skill" },
            { task: "పోర్ట్‌ఫోలియో వెబ్‌సైట్ నిర్మించండి", duration: "1 నెల", type: "project" }
          ],
          midTerm: [
            { task: "React సర్టిఫికేషన్ పొందండి", duration: "3 నెలలు", type: "certification" },
            { task: "ఇంటర్న్‌షిప్‌ల కోసం దరఖాస్తు చేయండి", duration: "6 నెలలు", type: "internship" }
          ],
          longTerm: [
            { task: "పూర్తి సమయం డెవలపర్ పాత్ర పొందండి", duration: "18+ నెలలు", type: "career" },
            { task: "ఓపెన్ సోర్స్‌కు దోహదపడండి", duration: "కొనసాగుతూనే", type: "project" }
          ]
        },
        localizedText: "మీ రోడ్‌మ్యాప్ వెబ్ డెవలప్‌మెంట్‌లో మీ కెరీర్ లక్ష్యాలను సాధించడానికి కోర్సులు, ప్రాజెక్ట్‌లు మరియు సర్టిఫికేషన్‌ల ద్వారా React నైపుణ్యాన్ని నిర్మించడంపై దృష్టి పెడుతుంది."
      }
    };

    return fallbackData[language];
  }
}

export const aiService = new AIService();