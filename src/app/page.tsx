"use client";

import { useMutation } from "convex/react";
import { FormEvent, useState } from "react";

import { api } from "../../convex/_generated/api";

type OnboardingState = "editing" | "saving" | "ready" | "error";

const steps = [
  { label: "Freelancer profile", state: "complete" },
  { label: "Campaign brief", state: "current" },
  { label: "Activation payment", state: "locked" },
  { label: "Agent run", state: "locked" },
];

export default function Home() {
  const onboard = useMutation(api.campaigns.onboard);
  const [state, setState] = useState<OnboardingState>("editing");
  const [campaignId, setCampaignId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("saving");
    setError(null);

    const form = new FormData(event.currentTarget);

    try {
      const result = await onboard({
        name: String(form.get("name") ?? ""),
        email: String(form.get("email") ?? ""),
        role: String(form.get("role") ?? ""),
        primaryOffer: String(form.get("offer") ?? ""),
        idealClient: String(form.get("idealClient") ?? ""),
        objective: String(form.get("objective") ?? ""),
      });

      setCampaignId(result.campaignId);
      setState("ready");
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Latchwork could not create this campaign.",
      );
      setState("error");
    }
  }

  const isReady = state === "ready";

  return (
    <main className="shell">
      <header className="topbar">
        <a className="wordmark" href="#top" aria-label="Latchwork home">
          latchwork<span>.</span>
        </a>
        <div className="topbar-meta">
          <span className="presence-dot" aria-hidden="true" />
          <span>operator console</span>
          <span className="mono">IST / 12 JUL</span>
        </div>
      </header>

      <section className="workspace" id="top">
        <div className="intro">
          <p className="eyebrow">new revenue campaign</p>
          <h1>Find the right work.<br />Keep the signal clean.</h1>
          <p className="lede">
            Latchwork turns your offer into a research-backed outbound campaign,
            then keeps every human and payment decision visible.
          </p>
        </div>

        <div className="console-grid">
          <section className="onboarding-panel" aria-labelledby="campaign-title">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">01 / setup</p>
                <h2 id="campaign-title">Describe the work you want.</h2>
              </div>
              <span className="draft-chip">DRAFT</span>
            </div>

            <form className="campaign-form" onSubmit={handleSubmit}>
              <div className="field-grid two-up">
                <label>
                  <span>Your name</span>
                  <input name="name" required placeholder="Shagun Prasad" />
                </label>
                <label>
                  <span>Work email</span>
                  <input name="email" type="email" required placeholder="you@domain.com" />
                </label>
              </div>

              <label>
                <span>What do you do?</span>
                <input
                  name="role"
                  required
                  placeholder="Independent product and protocol engineer"
                />
              </label>

              <label>
                <span>Primary offer</span>
                <textarea
                  name="offer"
                  required
                  rows={3}
                  placeholder="I help teams ship privacy-first agentic commerce and payment infrastructure."
                />
              </label>

              <div className="field-grid two-up">
                <label>
                  <span>Ideal client</span>
                  <input
                    name="idealClient"
                    required
                    placeholder="AI-native fintechs, agent startups"
                  />
                </label>
                <label>
                  <span>Campaign objective</span>
                  <input
                    name="objective"
                    required
                    placeholder="Book three qualified discovery calls"
                  />
                </label>
              </div>

              <div className="form-footer">
                <p>
                  Your profile stays private. Latchwork asks before any outreach,
                  payment request, or client-facing action.
                </p>
                <button className="primary-button" disabled={state === "saving"} type="submit">
                  {state === "saving" ? "Creating campaign..." : "Create campaign"}
                  <span aria-hidden="true">↗</span>
                </button>
              </div>
              {error ? <p className="form-error">{error}</p> : null}
            </form>
          </section>

          <aside className="monitor-panel" aria-label="Campaign activation console">
            <div className="monitor-header">
              <div>
                <p className="eyebrow">campaign status</p>
                <h2>{isReady ? "Ready to activate" : "Awaiting brief"}</h2>
              </div>
              <span className={`status-light ${isReady ? "live" : ""}`} />
            </div>

            <div className="status-list">
              {steps.map((step, index) => {
                const resolvedState = isReady && index < 2 ? "complete" : step.state;
                return (
                  <div className="status-row" key={step.label}>
                    <span className={`step-marker ${resolvedState}`}>
                      {resolvedState === "complete" ? "✓" : String(index + 1).padStart(2, "0")}
                    </span>
                    <span>{step.label}</span>
                    <span className="step-state">
                      {resolvedState === "complete"
                        ? "verified"
                        : resolvedState === "current"
                          ? "in progress"
                          : "locked"}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="ledger-block">
              <div className="ledger-label">
                <span>ACTIVATION LEDGER</span>
                <span className="mono">₹199.00</span>
              </div>
              <div className="ledger-row">
                <span>Dodo payment</span>
                <strong>{isReady ? "AWAITING" : "NOT CREATED"}</strong>
              </div>
              <div className="ledger-row">
                <span>Human approval</span>
                <strong>REQUIRED</strong>
              </div>
              <div className="ledger-row">
                <span>Agent research</span>
                <strong>STANDBY</strong>
              </div>
            </div>

            <div className="reasoning-block">
              <p className="eyebrow">agent note</p>
              <p>
                {isReady
                  ? "Brief is stored. After activation, research begins with a visible source trail and a human review gate."
                  : "A complete brief gives the agent enough context to research without inventing your positioning."}
              </p>
              {campaignId ? <code>campaign/{campaignId.slice(-8)}</code> : null}
            </div>
          </aside>
        </div>
      </section>

      <footer className="footer-note">
        <span>Latchwork is an operating system for independent professionals.</span>
        <span className="mono">v0.1 / HUMAN-GATED</span>
      </footer>
    </main>
  );
}
