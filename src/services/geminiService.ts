interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
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

export class GeminiService {
  private apiKey: string;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

  constructor() {
    // DEPRECATED: This class is no longer recommended for direct use.
    // Please use Supabase edge functions instead:
    // - supabase.functions.invoke('chat-with-ai') for chat
    // - supabase.functions.invoke('analyze-resume') for resume analysis
    // - supabase.functions.invoke('generate-roadmap') for roadmap generation
    // API keys should NEVER be stored in client-side code.
    this.apiKey = '';
  }

  setApiKey(key: string) {
    this.apiKey = key;
  }

  getApiKey(): string {
    return this.apiKey;
  }

  private createCareerPrompt(profileData: ProfileData | null, userMessage: string, language: string = 'en'): string {
    const languageInstructions = {
      en: 'Respond in English.',
      hi: 'कृपया हिंदी में जवाब दें। Use Devanagari script for Hindi.',
      te: 'దయచేసి తెలుగులో సమాధానం ఇవ్వండి। Use Telugu script for Telugu.'
    };
    
    const languageInstruction = languageInstructions[language as keyof typeof languageInstructions] || languageInstructions.en;
    const profileContext = profileData ? `
User Profile:
- Name: ${profileData.name}
- Education: ${profileData.educationLevel} in ${profileData.fieldOfStudy} (${profileData.specialization})
- Current Year: ${profileData.currentYear}
- Skills: ${profileData.skills}
- Interests: ${profileData.interests}
- Work Environment Preference: ${profileData.workEnvironment}
- Short-term Goals: ${profileData.shortTermGoals}
- Long-term Goals: ${profileData.longTermGoals}
- Location Preference: ${profileData.locationPreference}
- Company Type: ${profileData.companyType}
- Career Transition: ${profileData.careerTransition}
- Study or Job: ${profileData.studyOrJob}
- Certifications: ${profileData.certifications}
- Financial Support: ${profileData.financialSupport}
${profileData.resumeText ? `\nCurrent Resume Content:\n${profileData.resumeText}` : ''}
` : '';

    return `${languageInstruction}

You are a specialized AI Career Guidance Assistant for students and professionals. You MUST ONLY provide information related to career development and education. 

CORE SERVICES YOU PROVIDE:

📚 **LEARNING ROADMAPS**: Create detailed, step-by-step learning paths with:
- Course progression (beginner → intermediate → advanced)
- Specific skills to master at each level
- Timeline recommendations (weeks/months)
- Free and paid resource recommendations

🎥 **YOUTUBE RESOURCES**: Always include relevant YouTube channels/playlists:
- For technical skills: channels like FreeCodeCamp, Traversy Media, Programming with Mosh
- For business skills: channels like Harvard Business Review, Simon Sinek
- For specific technologies: include channel names and specific video topics

💼 **JOB & INTERNSHIP PLATFORMS**: Recommend specific platforms:
- LinkedIn Jobs (with search tips)
- Indeed, Glassdoor, AngelList, Wellfound
- Niche platforms like GitHub Jobs, Stack Overflow Jobs, Dribbble (for design)
- Company career pages for target companies
- University career centers and job boards

🛠️ **SKILL DEVELOPMENT**: Identify exact skills needed and provide:
- Technical skills roadmap
- Soft skills development
- Certification recommendations (Google, AWS, Microsoft, etc.)
- Practice platforms (HackerRank, LeetCode, Kaggle)

📝 **RESUME & PORTFOLIO**: 
- ATS-friendly resume tips
- Portfolio project suggestions
- GitHub profile optimization
- LinkedIn profile enhancement

🎯 **APPLICATION STRATEGIES**:
- How to tailor applications for specific roles
- Networking strategies (LinkedIn, events, communities)
- Interview preparation resources
- Salary negotiation guidance

STRICT RESTRICTIONS:
- ONLY career, education, and professional development topics
- NO general knowledge, entertainment, politics, health, or personal advice
- Always provide specific, actionable recommendations
- Include platform names, course titles, YouTube channels when relevant

${profileContext}

User Message: ${userMessage}

Provide a helpful, detailed response focused ONLY on career guidance and education. Include specific recommendations, links to platforms, and actionable steps.`;
  }

  async generateCareerResponse(profileData: ProfileData | null, userMessage: string, language: string = 'en'): Promise<string> {
    if (!this.apiKey || this.apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
      throw new Error('Please add your Gemini API key in src/services/geminiService.ts');
    }

    try {
      const prompt = this.createCareerPrompt(profileData, userMessage, language);
      
      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.8,
            maxOutputTokens: 1000,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data: GeminiResponse = await response.json();
      
      if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
        return data.candidates[0].content.parts[0].text;
      } else {
        throw new Error('Invalid response format from Gemini API');
      }
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw error;
    }
  }

  async analyzeResume(resumeText: string, profileData: ProfileData | null, language: string = 'en'): Promise<string> {
    if (!this.apiKey || this.apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
      throw new Error('Please add your Gemini API key in src/services/geminiService.ts');
    }

    const profileContext = profileData ? `
Target Profile Context:
- Field: ${profileData.fieldOfStudy} (${profileData.specialization})
- Career Goals: ${profileData.shortTermGoals} → ${profileData.longTermGoals}
- Skills: ${profileData.skills}
- Work Environment: ${profileData.workEnvironment}
- Location: ${profileData.locationPreference}
- Company Type: ${profileData.companyType}
` : '';

    const languageInstructions = {
      en: 'Respond in English.',
      hi: 'कृपया हिंदी में जवाब दें। Use Devanagari script for Hindi.',
      te: 'దయచేసి తెలుగులో సమాధానం ఇవ్వండి। Use Telugu script for Telugu.'
    };
    
    const languageInstruction = languageInstructions[language as keyof typeof languageInstructions] || languageInstructions.en;

    const prompt = `${languageInstruction}

You are an expert ATS-friendly resume analyzer. Provide a comprehensive analysis of this resume with the following structure:

## 📊 **RESUME RATING: X/10**
Rate the overall effectiveness of this resume (1-10 scale).

## 🤖 **ATS COMPATIBILITY CHECK**
- **Status**: ATS-Friendly ✅ / Not ATS-Friendly ❌
- **Analysis**: Detailed explanation of ATS compatibility
- **Issues Found**: List any ATS-unfriendly elements

## ✨ **KEY STRENGTHS**
List 3-5 things that are working well in this resume.

## 🚨 **CRITICAL ISSUES**
List problems that need immediate attention.

## 📋 **MISSING ELEMENTS**
What essential components should be added.

## 🔍 **KEYWORD ANALYSIS**
- **Current Keywords**: Keywords found in the resume
- **Missing Keywords**: Industry-specific keywords to add
- **Keyword Density**: Assessment of keyword usage

## 🎯 **ATS-FRIENDLY IMPROVEMENTS**
Specific changes to make the resume more ATS-compatible:
- Formatting improvements
- Section organization
- Content structure

## 📝 **ACTION ITEMS**
Prioritized list of specific improvements to implement.

## 💡 **ENHANCED EXAMPLES**
Provide 3-5 improved bullet points showing better formatting and content.

${profileContext}

**Resume Content to Analyze:**
${resumeText}

Provide detailed, actionable feedback with specific examples and clear explanations.`;

    try {
      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.3,
            topK: 40,
            topP: 0.8,
            maxOutputTokens: 1500,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data: GeminiResponse = await response.json();
      
      if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
        return data.candidates[0].content.parts[0].text;
      } else {
        throw new Error('Invalid response format from Gemini API');
      }
    } catch (error) {
      console.error('Resume Analysis Error:', error);
      throw error;
    }
  }

}

export const geminiService = new GeminiService();