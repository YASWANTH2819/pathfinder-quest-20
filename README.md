# Career Growth & Guidance Platform

A comprehensive AI-powered career development platform built with React, TypeScript, Vite, and Supabase. This application helps users explore career paths, analyze resumes, generate personalized roadmaps, and track their professional growth journey.

## 🚀 Features

- **Career Guidance**: AI-powered career path recommendations based on user profiles
- **Resume Analyzer**: Upload and analyze resumes with AI-driven insights
- **Career Roadmap Generator**: Generate personalized learning paths with milestones
- **Daily MCQ Challenges**: Test knowledge with daily quizzes
- **Weekly Assignments**: Complete tasks to enhance skills
- **Progress Tracking**: Monitor career health scores, streaks, and achievements
- **Multilingual Support**: Available in English, Hindi, and Telugu
- **Gamification**: Earn badges and track progress with an engaging UI

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- **npm** (comes with Node.js)
- **Git** (for cloning the repository)
- **Supabase Account** (for backend services) - [Sign up here](https://supabase.com)

## 🛠️ Local Setup Instructions

### 1. Clone the Repository

```bash
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Open `.env` and update with your Supabase credentials:
   - Go to your [Supabase Dashboard](https://supabase.com/dashboard)
   - Select your project
   - Navigate to **Settings** → **API**
   - Copy the following values:
     - `VITE_SUPABASE_PROJECT_ID`: Your project ID
     - `VITE_SUPABASE_URL`: Your project URL
     - `VITE_SUPABASE_PUBLISHABLE_KEY`: Your anon/public key

3. Your `.env` file should look like:
```env
VITE_SUPABASE_PROJECT_ID="wuqgpitfmlulrfrqumaz"
VITE_SUPABASE_URL="https://wuqgpitfmlulrfrqumaz.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGci..."
```

### 4. Set Up Supabase Backend

This project requires Supabase Edge Functions and secrets to be configured:

#### Configure API Secrets

The application uses AI services through Supabase Edge Functions. You need to add the following secret:

1. Go to your Supabase project dashboard
2. Navigate to **Edge Functions** → **Secrets**
3. Add the following secret:
   - `LOVABLE_API_KEY`: Get this from your Lovable account settings

Or use the Supabase CLI:
```bash
supabase secrets set LOVABLE_API_KEY=your_key_here
```

#### Deploy Edge Functions

The project includes several edge functions:

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref wuqgpitfmlulrfrqumaz

# Deploy all edge functions
supabase functions deploy chat-with-ai
supabase functions deploy analyze-resume
supabase functions deploy generate-roadmap
supabase functions deploy generate-career-roadmap
```

### 5. Run the Development Server

```bash
npm run dev
```

The application will start at `http://localhost:8080`

## 📂 Project Structure

```
├── src/
│   ├── components/          # React components
│   │   ├── ui/             # shadcn-ui components
│   │   ├── Auth/           # Authentication components
│   │   └── ...             # Feature components
│   ├── pages/              # Route pages
│   ├── contexts/           # React contexts (Auth, Language)
│   ├── hooks/              # Custom React hooks
│   ├── services/           # API service layers
│   ├── utils/              # Utility functions
│   ├── types/              # TypeScript type definitions
│   ├── i18n/               # Internationalization files
│   ├── data/               # Static data (courses, roles)
│   └── integrations/       # Third-party integrations
│       └── supabase/       # Supabase client & types
├── supabase/
│   ├── functions/          # Edge functions
│   └── config.toml         # Supabase configuration
├── public/                 # Static assets
├── .env.example            # Environment variables template
├── vite.config.ts          # Vite configuration
├── tailwind.config.ts      # Tailwind CSS configuration
└── package.json            # Dependencies and scripts
```

## 🔧 Available Scripts

- `npm run dev` - Start development server (port 8080)
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint for code quality

## 🎨 Technology Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with shadcn-ui components
- **Backend**: Supabase (Database, Auth, Edge Functions, Storage)
- **AI Integration**: Lovable AI Gateway (Gemini models)
- **State Management**: React Context API, TanStack Query
- **Routing**: React Router DOM
- **Form Handling**: React Hook Form with Zod validation
- **Animations**: Framer Motion
- **Charts**: Recharts
- **PDF Parsing**: PDF.js, Mammoth
- **Internationalization**: Custom i18n implementation

## 🔐 Authentication

The app uses Supabase Authentication with:
- Email/Password sign-up and login
- Protected routes for authenticated users
- User profile management

To enable authentication providers:
1. Go to Supabase Dashboard → **Authentication** → **Providers**
2. Enable desired providers (Email, Google, etc.)
3. Configure provider settings

## 🗄️ Database Schema

The application uses the following main tables:
- `profiles` - User profile information
- `resumes` - Resume analysis results
- `user_progress` - Career progress tracking
- `roadmaps` - Generated career roadmaps

Check the `supabase/migrations/` directory for the complete schema.

## 🚀 Deployment

### Deploy to Lovable

1. Go to your [Lovable Project](https://lovable.dev/projects/ab145cbd-8e6f-4e32-b7ff-547f1a3d12f0)
2. Click **Share** → **Publish**
3. Your app will be deployed automatically

### Deploy to Vercel/Netlify

1. Build the project:
```bash
npm run build
```

2. The `dist/` folder contains the production build

3. Deploy the `dist/` folder to your hosting provider

4. Set environment variables in your hosting dashboard

## 🐛 Troubleshooting

### Port Already in Use

If port 8080 is already in use, modify `vite.config.ts`:
```typescript
server: {
  port: 3000, // Change to any available port
}
```

### Module Resolution Issues

If you encounter import errors:
1. Ensure all dependencies are installed: `npm install`
2. Clear node_modules and reinstall: `rm -rf node_modules && npm install`
3. Check that TypeScript paths are configured correctly in `tsconfig.json`

### Supabase Connection Errors

1. Verify your `.env` file has correct credentials
2. Check that your Supabase project is active
3. Ensure Edge Functions are deployed
4. Verify API secrets are set correctly

### Edge Function Errors

1. Check edge function logs in Supabase Dashboard
2. Ensure all required secrets are configured
3. Verify JWT verification settings in `supabase/config.toml`

## 📝 Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_PROJECT_ID` | Supabase project identifier | Yes |
| `VITE_SUPABASE_URL` | Supabase API endpoint | Yes |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anonymous key | Yes |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is built with [Lovable](https://lovable.dev) and is available for personal and commercial use.

## 🔗 Useful Links

- [Lovable Documentation](https://docs.lovable.dev/)
- [Supabase Documentation](https://supabase.com/docs)
- [shadcn-ui Documentation](https://ui.shadcn.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Vite Documentation](https://vitejs.dev/)

## 📞 Support

For issues and questions:
- Check the [Lovable Discord Community](https://discord.com/channels/1119885301872070706/1280461670979993613)
- Review [Lovable Documentation](https://docs.lovable.dev/)
- Open an issue in this repository

---

**Built with ❤️ using [Lovable](https://lovable.dev)**
