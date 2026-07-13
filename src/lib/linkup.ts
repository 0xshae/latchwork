/**
 * Linkup API client for prospect research.
 *
 * Linkup provides company/opportunity search APIs
 * used by the research agent to find high-fit prospects.
 *
 * Docs: https://linkup.so
 */

export type LinkupConfig = {
  apiKey: string;
};

export type LinkupSearchResult = {
  companyName: string;
  companyUrl?: string;
  contactName?: string;
  sourceUrl?: string;
  summary: string;
};

export function getLinkupConfig(
  environment: Record<string, string | undefined> = process.env,
): LinkupConfig {
  const apiKey = environment.LINKUP_API_KEY;

  if (!apiKey) throw new Error("LINKUP_API_KEY is required");

  return { apiKey };
}

/**
 * Search for prospects matching a freelancer's ideal client profile.
 *
 * This is a stub — will be implemented with actual Linkup API calls
 * in the agent phase. The research agent (Convex action) will call
 * this to power prospect discovery.
 */
export async function searchProspects(
  _config: LinkupConfig,
  _query: string,
  _count: number = 5,
): Promise<LinkupSearchResult[]> {
  // TODO: Implement with actual Linkup API
  // The Linkup API provides deep web search for company/opportunity research.
  // This will be called from a Convex action in convex/agent/research.ts
  throw new Error("Linkup search not yet implemented — Phase 2");
}
