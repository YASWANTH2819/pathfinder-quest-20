

## Performance Optimization Plan

### Problem
The career guidance flow is slow because:
1. Roadmap generation only starts when user navigates to the "roadmap" step (sequential)
2. No caching — identical career+skill combos always trigger new AI calls
3. Static loading screen with no progressive feedback
4. Edge functions use `google/gemini-2.5-flash` with large prompts and high `max_tokens`

### Changes

#### 1. Parallel & Background Processing (CareerAnalyzer.tsx)

**Start roadmap generation immediately when user selects a career** (line 341-345), not when they click "Next" to reach the roadmap step. While they view the Skill Gap Analysis screen, the roadmap generates in the background.

Also pre-compute suggestions in parallel:
```
handleSelectCareer(career) {
  setSelectedCareer(career);
  setCurrentStep('skillGap');
  // Fire roadmap generation immediately in background
  generateRoadmap(career);  // don't await
}
```

Remove the lazy trigger in `handleNextStep` (line 353-354) since roadmap is already loading.

#### 2. Progressive Loading Messages (CareerAnalyzer.tsx)

Replace the static spinner on the roadmap step (lines 503-507) with rotating status messages:
- "Analyzing your skills..." (0-2s)
- "Identifying career gaps..." (2-4s)  
- "Building your personalized roadmap..." (4-6s)
- "Preparing growth recommendations..." (6s+)

Use a `useEffect` with `setInterval` that cycles through messages while `isLoadingRoadmap` is true.

#### 3. Result Caching (CareerAnalyzer.tsx)

Add a `useRef<Map<string, RoadmapYear[]>>` cache keyed by `careerName`. Before calling the edge function, check the cache. After receiving results, store them. This prevents re-fetching if the user navigates back and selects the same career again.

#### 4. Prompt Optimization (generate-career-roadmap edge function)

- Trim the system prompt: remove the detailed JSON schema explanation, use a shorter format instruction
- Reduce `max_tokens` from 8000 to 4000 (the fallback handles truncation anyway)
- Switch to `google/gemini-2.5-flash-lite` for faster responses (roadmaps don't need deep reasoning)
- Only send the 3 most relevant profile fields (skills, education, interests) — already mostly done, just ensure no extra data leaks through

#### 5. Response Streaming for Roadmap (New)

Convert `generate-career-roadmap` to support streaming. The edge function will stream SSE chunks. The client will parse partial JSON and display roadmap years as they arrive (Year 1 appears first, then Year 2, etc.).

**However**, structured JSON streaming is complex and fragile. A simpler approach: split the roadmap into two calls — a fast "years overview" call (small prompt, ~1000 tokens) and a detailed "milestones" call in background. The years overview appears in ~1-2 seconds.

**Recommended approach**: Use a lighter prompt for the "years" data only (4 items), which generates in ~1-2s. Then optionally fetch detailed milestones in background for the Career Growth Path module.

#### 6. Edge Function: Two-Tier Response

Modify `generate-career-roadmap` to accept an optional `mode` parameter:
- `mode: "quick"` — returns only the 4-year overview (small prompt, ~1000 max_tokens, `gemini-2.5-flash-lite`)
- `mode: "full"` (default) — returns full milestones + years (existing behavior)

The CareerAnalyzer calls `mode: "quick"` for the roadmap step. The CareerGrowthPath page calls `mode: "full"` when the user starts the journey.

### Summary of File Changes

| File | Change |
|------|--------|
| `src/components/CareerAnalyzer.tsx` | Pre-fetch roadmap on career select, add cache, progressive loading messages |
| `supabase/functions/generate-career-roadmap/index.ts` | Add `mode` parameter, lighter prompt for quick mode, use `flash-lite` for quick mode |

### What stays unchanged
- Dashboard layout (4 modules, no new cards)
- Roadmap remains fully AI-generated and dynamic
- All existing UI components and styling
- Edge function API contract (backward compatible — `mode` is optional)

