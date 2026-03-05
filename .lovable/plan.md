

## Enhancement Plan for PATHFINDERS Modules

### Current State Summary
All four modules exist and function. The dashboard layout (4 cards in a 2x2 grid on `MainDashboard.tsx`) will remain unchanged. Enhancements are internal only.

---

### MODULE 1: Career Guidance -- Internal Enhancements

**Current flow:** Form (4 fields) → AI recommendations → Career cards with "Start Journey"

**Enhanced flow:** Form → AI recommendations → **Select a career** → Skill Gap Analysis → Personalized Roadmap → Internship/Project Suggestions

**Changes:**

1. **Update `CareerAnalyzer.tsx`** to add a multi-step post-selection flow:
   - When user clicks a career card, instead of immediately navigating to `/career-growth`, show an expanded detail view within the same page
   - Add state: `selectedCareerDetail` and `currentStep` ('recommendations' | 'skillGap' | 'roadmap' | 'suggestions')

2. **Skill Gap Analyzer panel** (new section in CareerAnalyzer):
   - Compare user's `profileData.skills` (parsed into array) against the career's `required_skills`
   - Display three columns: Current Skills (green), Required Skills (blue), Missing Skills (red)
   - Show a match percentage bar

3. **Personalized Roadmap panel** (new section):
   - Call `generate-career-roadmap` edge function for the selected career
   - Display a year-by-year structured timeline (Year 1-4 format)
   - Each year shows: focus area, key activities, milestones

4. **Internship & Project Suggestions panel** (new section):
   - Extend the AI prompt in `generate-career-recommendations` to also return `projects`, `internships`, `certifications`, `competitions` arrays
   - Display these as categorized card lists
   - If AI doesn't return them, use a fallback mapping based on career name

5. **Navigation:** Add "Start This Journey" button at the end of the flow that navigates to Career Growth Path (existing behavior, just moved to end of flow)

**Files modified:** `src/components/CareerAnalyzer.tsx`, `supabase/functions/generate-career-recommendations/index.ts`

---

### MODULE 2: Resume Analyzer -- Enhanced Intelligence

**Current:** Upload → AI analysis → Score display + Roadmap generator

**Enhanced:** Upload → AI analysis → **Resume Score Card (0-100)** → Missing Skills → ATS Compatibility → Career Alignment → Improvement Suggestions

**Changes:**

1. **Update `CareerScoreDisplay.tsx`** to show a prominent Resume Score (0-100) gauge at the top, computed from ATS score and other factors

2. **Add new sections** to the score display:
   - **Resume Score** -- large circular gauge (0-100)
   - **ATS Compatibility** -- detailed breakdown with specific issues
   - **Missing Skills** -- already exists, enhance with severity indicators
   - **Career Alignment Feedback** -- new section showing how the resume aligns with the user's chosen career from Career Guidance
   - **Suggested Improvements** -- numbered actionable items (already partially exists as "Quick Fixes")

3. **Update `analyze-resume` edge function prompt** to request career alignment feedback and a numerical resume score (0-100) in addition to existing fields

4. **Add back navigation** button to Resume Analyzer page header

**Files modified:** `src/components/CareerScoreDisplay.tsx`, `src/pages/ResumeAnalyzer.tsx`, `supabase/functions/analyze-resume/index.ts`

---

### MODULE 3: Career Growth Path -- Enhanced Learning Tracking

**Current:** Career selection → Roadmap with tasks → Quizzes → Assignments → Badges → Streaks

**Enhanced:** Add skill progress visualization and completed modules tracking

**Changes:**

1. **Update `RoadmapView.tsx`** to add a "Skill Progress" tab:
   - Parse completed tasks to extract skill categories
   - Display skill progress bars (e.g., Python 80%, SQL 40%, Communication 70%)
   - Calculate progress based on completed roadmap steps tagged with those skills

2. **Add "Completed Modules" counter** to the roadmap header stats section

3. **Enhance streak display** with visual calendar/heatmap showing activity days

**Files modified:** `src/components/RoadmapView.tsx`

---

### MODULE 4: Career Health Score -- Central Dashboard

**Current:** Score calculation (3 components) → Breakdown cards → Suggestions → PDF download

**Enhanced:** Add Skill Progress Overview, Activity Tracking, AI Recommendations sections

**Changes:**

1. **Update `CareerHealthScore.tsx`** to add three new sections below the existing breakdown:

2. **Skill Progress Overview:**
   - Fetch career progress roadmap data and calculate per-skill completion
   - Display skill bars with recharts `BarChart` component
   - Show top 5-6 skills with progress percentages

3. **Activity Tracking section:**
   - New card with metrics: Quizzes Completed, Projects Built, Modules Completed, Internships Applied
   - Fetch counts from `user_mcq_responses`, `career_progress` (roadmap_data completed tasks)
   - Display as a 2x2 grid of stat cards

4. **AI Recommendations section:**
   - Enhance `generateSuggestions()` to be more specific and actionable
   - Cross-reference data from all three modules
   - Display as prioritized action items with icons

**Files modified:** `src/components/CareerHealthScore.tsx`

---

### Database Changes
No schema changes required. All enhancements use existing tables and data structures. Skill progress is derived from `career_progress.roadmap_data` (JSONB). Activity metrics come from existing tables.

### Edge Function Changes
- `generate-career-recommendations`: Extend prompt to return projects, internships, certifications, competitions
- `analyze-resume`: Extend prompt to return resume score (0-100) and career alignment feedback

### Summary of Files to Modify
1. `src/components/CareerAnalyzer.tsx` -- multi-step career detail flow
2. `src/components/CareerScoreDisplay.tsx` -- enhanced resume score display
3. `src/pages/ResumeAnalyzer.tsx` -- layout improvements
4. `src/components/RoadmapView.tsx` -- skill progress tab
5. `src/components/CareerHealthScore.tsx` -- activity tracking + skill viz + AI recs
6. `supabase/functions/generate-career-recommendations/index.ts` -- extended prompt
7. `supabase/functions/analyze-resume/index.ts` -- extended prompt

