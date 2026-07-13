/**
 * OpenAI client wrapper for Latchwork agent tasks.
 *
 * Used for:
 * - Fit scoring (prospect vs freelancer profile)
 * - Pitch generation (tailored outreach)
 * - Scope generation (SOW from accepted brief)
 */

export type OpenAIConfig = {
  apiKey: string;
  model: string;
};

export function getOpenAIConfig(
  environment: Record<string, string | undefined> = process.env,
): OpenAIConfig {
  const apiKey = environment.OPENAI_API_KEY;

  if (!apiKey) throw new Error("OPENAI_API_KEY is required");

  return {
    apiKey,
    model: environment.OPENAI_MODEL ?? "gpt-4o",
  };
}

/**
 * Score how well a prospect fits a freelancer's ideal client profile.
 *
 * Returns a structured response with score and reasoning.
 * Stub — implemented in Phase 2.
 */
export type FitScoreResult = {
  score: number; // 0-100
  reasoning: string;
};

/**
 * Generate a tailored pitch for a prospect.
 *
 * Uses the freelancer's voice, prospect research, and fit reasoning
 * to draft personalized outreach.
 * Stub — implemented in Phase 2.
 */
export type PitchResult = {
  subject: string;
  body: string;
};

/**
 * Generate a scope-of-work from a project brief.
 *
 * Creates a clear, professional scope with deliverables
 * and suggests a milestone-based payment plan.
 * Stub — implemented in Phase 2.
 */
export type ScopeResult = {
  scope: string;
  suggestedTotal: number;
  currency: "INR" | "USD";
};
