# Latchwork — From first lead to locked-in work

**Latchwork** is an autonomous revenue agent for independent developers, designers, consultants, and small agencies. 

Freelancers do not just deliver work—they also have to research prospects, write tailored pitches, qualify leads, scope projects, negotiate deposits, create invoices, and chase payments. Latchwork turns that fragmented, time-consuming commercial workflow into a single, governed, and automated pipeline.

---

## 🚀 The Product

The point of Latchwork is **not** to build an auto-apply spam bot or a generic CRM. Instead, it is designed to:
> Help independent professionals turn a good portfolio into paid, clearly scoped work — with the deposit agreed and paid before work begins.

### The Autonomous Pipeline
```text
Freelancer Profile
   ↓
Campaign Activation (Funded client research)
   ↓
Agent Researches High-Fit Prospects (Via Linkup)
   ↓
Tailored Pitch & Proposal Generation (Via OpenAI)
   ↓
Scoped Milestone Plan & Project Terms
   ↓
Client-Approved Deposit Checkout (Via Dodo Payments)
   ↓
Deal and Payment State Tracked Live (Real-time updates)
```

---

## 👥 Core User Profile

### Primary Buyer
* **Independent software developers** & indie hackers offering client services.
* **Product & design freelancers** looking to streamline their business development.
* **Small development & design agencies** looking to scale client acquisition.
* **Technical consultants** who need structure around their pipeline and proposals.

### The Problem
Freelancers lose unpaid hours in two main areas:
1. **Pipeline Creation:** Finding relevant work, researching lead fit, writing tailored outreach repeatedly, and deciding which opportunities deserve attention.
2. **Commercial Execution:** Turning vague briefs into clear scopes, defining milestone payments, securing a commitment (deposit) before starting work, and tracking payment and project status.

### Core Outcome
With Latchwork, a freelancer can say:
> *"I gave Latchwork my portfolio and target client. It found relevant work, explained why each lead fit, drafted a pitch in my voice, then helped turn an accepted brief into a milestone plan and deposit checkout."*

---

## 🛠️ Technology Stack

* **Frontend:** [Next.js 16](https://nextjs.org/) (App Router, React 19)
* **Styling & Animations:** [TailwindCSS v4](https://tailwindcss.com/) & [Framer Motion](https://www.framer.com/motion/)
* **Database & Realtime Backend:** [Convex](https://convex.dev/)
* **Authentication:** [Clerk Auth](https://clerk.com/)
* **Payments:** [Dodo Payments](https://dodopayments.com/)
* **AI & Search Integrations:** [OpenAI API](https://openai.com/) & [Linkup Search](https://www.linkup.com/)
* **Testing:** [Vitest](https://vitest.dev/)

---

## 📁 Repository Structure

The codebase is split into frontend pages, domain models, and a real-time serverless backend:

```text
├── convex/                   # Convex backend (schema, queries, mutations, webhooks)
│   ├── schema.ts             # Convex Database schema (Freelancers, Campaigns, Prospects, Pitches, Deals, Milestones)
│   ├── paymentEvents.ts      # Immutable, idempotent payment audit logs
│   ├── campaigns.ts          # Campaign management and payment-based activation
│   ├── deals.ts              # Proposal/Deal creation, scoping, and state transitions
│   └── ...                   # Tables: freelancers, pitches, prospects, payments
├── src/
│   ├── app/                  # Next.js App Router (Layouts, Globals, Providers)
│   │   ├── (marketing)/      # Public landing page with premium animations
│   │   ├── (dashboard)/      # Protected workspace (Campaigns, Prospects, Deals)
│   │   ├── (public)/         # Client-facing interactive proposal review page
│   │   └── api/              # Webhook receivers (e.g. Dodo payment confirmation webhooks)
│   ├── domain/               # Core business constraints & state machine validation
│   │   ├── campaign.ts       # Campaign rules, pricing, state machine
│   │   └── deal.ts           # Deal milestone rules, state transitions, totals
│   └── lib/                  # External services integration (stubs/clients)
│       ├── dodo.ts           # Dodo checkout session creator
│       ├── openai.ts         # OpenAI integration for fit analysis and pitches
│       └── linkup.ts         # Linkup integration for web search/lead prospecting
├── package.json              # App scripts and dependencies
└── tsconfig.json             # TypeScript configuration
```

---

## ⚙️ Setting Up Local Development

### 1. Prerequisites
Ensure you have the following installed:
* [Node.js](https://nodejs.org/) (v20+ recommended)
* NPM or Yarn
* A [Convex](https://convex.dev/) account
* A [Clerk](https://clerk.com/) account
* A [Dodo Payments](https://dodopayments.com/) developer account

### 2. Configure Environment Variables
Create a local `.env.local` for the Next.js frontend:
```bash
# Convex variables (provided by CLI or dashboard)
NEXT_PUBLIC_CONVEX_URL=http://127.0.0.1:3210
NEXT_PUBLIC_CONVEX_SITE_URL=http://127.0.0.1:3211

# Clerk configuration
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your-clerk-publishable-key
CLERK_SECRET_KEY=your-clerk-secret-key
```

For the Convex backend, configure the secrets using the Convex dashboard or local `.dev.vars` (see `.dev.vars.example` for details):
```bash
DODO_PAYMENTS_API_KEY=your-dodo-api-key
DODO_ACTIVATION_PRODUCT_ID=your-dodo-activation-product-id
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Running the App
Start the Convex backend in a separate terminal:
```bash
npx convex dev
```

Start the Next.js development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 🧪 Testing

The repository uses [Vitest](https://vitest.dev/) for unit testing core domain models and integrations.

Run the test suite once:
```bash
npm run test
```

Run the tests in watch mode:
```bash
npm run test:watch
```
