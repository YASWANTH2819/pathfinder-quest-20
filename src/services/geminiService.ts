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
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

  constructor() {
    // Replace this with your actual Gemini API key from Google AI Studio
    // Get your free API key at: https://makersuite.google.com/app/apikey
    this.apiKey = 'YOUR_GEMINI_API_KEY_HERE';
  }

  setApiKey(key: string) {
    this.apiKey = key;
  }

  getApiKey(): string {
    return this.apiKey;
  }

  private createCareerPrompt(profileData: ProfileData | null, userMessage: string): string {
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

    return `You are a specialized AI Career Guidance Assistant. You MUST ONLY provide information related to:
- Career guidance and job recommendations
- Educational paths and courses
- Skill development and certifications
- Resume building and analysis
- Interview preparation
- Internship and job opportunities
- Learning roadmaps
- YouTube tutorial links for career skills
- Job platforms and application strategies
- Salary guidance and career growth

STRICT RESTRICTIONS:
- DO NOT answer questions about general topics, entertainment, politics, health, or anything unrelated to career/education
- If asked about non-career topics, politely redirect to career guidance
- Always provide actionable, practical advice
- Include specific platform names, course suggestions, and YouTube channel recommendations when relevant
- Provide ATS-friendly resume tips when discussing resumes

${profileContext}

User Message: ${userMessage}

Provide a helpful, detailed response focused ONLY on career guidance and education. Include specific recommendations, links to platforms, and actionable steps.`;
  }

  async generateCareerResponse(profileData: ProfileData | null, userMessage: string): Promise<string> {
    if (!this.apiKey || this.apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
      throw new Error('Please add your Gemini API key in src/services/geminiService.ts');
    }

    try {
      const prompt = this.createCareerPrompt(profileData, userMessage);
      
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

  async analyzeResume(resumeText: string, profileData: ProfileData | null): Promise<string> {
    if (!this.apiKey || this.apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
      throw new Error('Please add your Gemini API key in src/services/geminiService.ts');
    }

    const profileContext = profileData ? `
Target Profile:
- Field: ${profileData.fieldOfStudy} (${profileData.specialization})
- Career Goals: ${profileData.shortTermGoals} → ${profileData.longTermGoals}
- Skills: ${profileData.skills}
- Work Environment: ${profileData.workEnvironment}
- Location: ${profileData.locationPreference}
- Company Type: ${profileData.companyType}
` : '';

    const prompt = `You are an expert ATS-friendly resume analyzer. Analyze this resume and provide:

1. **Overall Rating (1-10)**: Rate the resume's effectiveness
2. **ATS Compatibility**: Check for ATS-friendly formatting
3. **Key Strengths**: What's working well
4. **Critical Issues**: Problems that need immediate fixing
5. **Missing Elements**: What should be added
6. **Keyword Analysis**: Industry-specific keywords to include
7. **Action Items**: Specific improvements needed
8. **Enhanced Version**: Provide 3-5 improved bullet points

${profileContext}

Resume Content:
${resumeText}

Provide detailed, actionable feedback focused on making this resume more effective for the target career path.`;

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

  async generateATSResume(profileData: ProfileData, experience: string, projects: string): Promise<string> {
    if (!this.apiKey || this.apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
      throw new Error('Please add your Gemini API key in src/services/geminiService.ts');
    }

    const prompt = `Create a professional, ATS-friendly resume based on this profile:

Profile Information:
- Name: ${profileData.name}
- Education: ${profileData.educationLevel} in ${profileData.fieldOfStudy} (${profileData.specialization})
- Skills: ${profileData.skills}
- Certifications: ${profileData.certifications}
- Career Goals: ${profileData.shortTermGoals} → ${profileData.longTermGoals}
- Work Environment: ${profileData.workEnvironment}
- Location: ${profileData.locationPreference}

Experience Details: ${experience}
Project Details: ${projects}

Create a complete ATS-optimized resume with:
1. Professional summary (3-4 lines)
2. Technical skills section
3. Education details
4. Experience section with strong action verbs
5. Projects section
6. Certifications (if any)

Format Guidelines:
- Use simple, clean formatting
- Include relevant keywords for ${profileData.fieldOfStudy}
- Strong action verbs (Led, Developed, Implemented, etc.)
- Quantifiable achievements where possible
- ATS-friendly section headers
- No graphics, tables, or special formatting

Make it tailored for ${profileData.shortTermGoals} roles in ${profileData.fieldOfStudy}.`;

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
            temperature: 0.4,
            topK: 40,
            topP: 0.8,
            maxOutputTokens: 2000,
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
      console.error('Resume Generation Error:', error);
      throw error;
    }
  }
}

export const geminiService = new GeminiService();