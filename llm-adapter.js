"use strict";

/**
 * ReplyPilot LLM adapter (STUB, not used by default).
 *
 * The extension ships with the offline template engine in
 * template-engine.js and works with no API key. This file is the single,
 * clearly separated plug point for an optional future LLM pass.
 *
 * Contract for a future implementation:
 *   input:  { emailText, intent, policy, templateDraft }
 *   output: { draft, needsInfo } with the SAME grounding rule as the
 *           template engine: facts may only come from the policy object or
 *           the customer's email, and anything missing must stay a
 *           [NEEDS INFO: ...] placeholder. A model rewrite must be checked
 *           against templateDraft before it is shown to the seller, and the
 *           human seller always sends the final email.
 *
 * Until a provider is wired in, generateWithLLM always reports that it is
 * unavailable so callers fall back to the template engine.
 */

async function generateWithLLM(/* { emailText, intent, policy, templateDraft } */) {
  return {
    available: false,
    reason:
      "No LLM provider is configured in this build. ReplyPilot is running on the offline template engine instead.",
    draft: null,
    needsInfo: [],
  };
}

const llmApi = { generateWithLLM };
if (typeof module !== "undefined" && module.exports) module.exports = llmApi;
if (typeof window !== "undefined") window.ReplyPilotLLM = llmApi;
