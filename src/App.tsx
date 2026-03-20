import React, { useState, useEffect, useRef, useCallback } from "react";

interface RepoFallback {
  commits?: number;
  prs?: number;
  deployed?: boolean;
}

interface RepoMeta {
  name: string;
  ghName: string;
  fallback: RepoFallback;
}

interface RepoData {
  name: string;
  ghName: string;
  commits?: number;
  prs?: number | null;
  deployed?: boolean;
  stars?: number;
  language?: string;
  pushedAt?: string;
  openIssues?: number;
  live?: boolean;
}

interface GHContributor {
  contributions?: number;
}

function PLPLogo({ size = 24 }: { size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"
      width={size} height={size} style={{ display: "block" }}>
      <path fill="#FFFFFF" fillRule="evenodd"
        d="M256 0c-141.38 0-256 114.62-256 256s114.62 256 256 256 256-114.62 256-256S397.38 0 256 0zm0 462.4c-113.88 0-206.4-92.52-206.4-206.4S142.12 49.6 256 49.6s206.4 92.52 206.4 206.4S369.88 462.4 256 462.4z"/>
      <path fill="#C4956A"
        d="M256 169.6c-47.52 0-86.4 38.88-86.4 86.4h-49.6c0-75.12 60.88-136 136-136v49.6z"/>
    </svg>
  );
}

const GH_ORG = "thepennylaneproject";
const REPOS_META: RepoMeta[] = [
  { name: "Relevnt",   ghName: "Relevnt",   fallback: { commits: 678, prs: 162, deployed: true } },
  { name: "Codra",     ghName: "Codra",     fallback: { commits: 100, deployed: true } },
  { name: "Ready",     ghName: "Ready",     fallback: { commits: 30,  deployed: true } },
  { name: "FounderOS", ghName: "FounderOS", fallback: { commits: 63 } },
  { name: "Embr",      ghName: "Embr",      fallback: {} },
  { name: "Mythos",    ghName: "Mythos",    fallback: {} },
  { name: "Passagr",   ghName: "Passagr",   fallback: { deployed: true } },
  { name: "Advocera",  ghName: "Advocera",  fallback: {} },
];

function useGitHubStats() {
  const [repos, setRepos] = useState<RepoData[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [live, setLive] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function fetchAll() {
      try {
        const results = await Promise.all(
          REPOS_META.map(async (r) => {
            try {
              const res = await fetch(
                `https://api.github.com/repos/${GH_ORG}/${r.ghName}`,
                { headers: { Accept: "application/vnd.github.v3+json" } }
              );
              if (!res.ok) throw new Error(String(res.status));
              const data = await res.json();
              let commits = r.fallback.commits;
              try {
                const cr = await fetch(
                  `https://api.github.com/repos/${GH_ORG}/${r.ghName}/contributors?per_page=1&anon=true`,
                  { headers: { Accept: "application/vnd.github.v3+json" } }
                );
                if (cr.ok) {
                  const contribs: GHContributor[] = await cr.json();
                  if (Array.isArray(contribs) && contribs.length > 0)
                    commits = contribs.reduce((s, c) => s + (c.contributions ?? 0), 0);
                }
              } catch { /* ignore contributor fetch errors */ }
              return {
                name: r.name, ghName: r.ghName,
                commits, stars: data.stargazers_count || 0,
                language: data.language, pushedAt: data.pushed_at,
                openIssues: data.open_issues_count || 0,
                deployed: r.fallback.deployed ?? false,
                prs: r.fallback.prs ?? null,
                live: true,
              };
            } catch {
              return { name: r.name, ghName: r.ghName, ...r.fallback, live: false };
            }
          })
        );
        if (!cancelled) { setRepos(results); setLive(results.some((r) => r.live)); setLoading(false); }
      } catch {
        if (!cancelled) {
          setRepos(REPOS_META.map((r) => ({ name: r.name, ghName: r.ghName, ...r.fallback, live: false })));
          setLoading(false);
        }
      }
    }
    fetchAll();
    return () => { cancelled = true; };
  }, []);

  const totalCommits = repos ? repos.reduce((s, r) => s + (r.commits || 0), 0) : 871;
  return { repos, loading, live, totalCommits };
}

function timeAgo(dateStr: string | null | undefined): string | null {
  if (!dateStr) return null;
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

const C = {
  bg: "#08090A", bgAlt: "#0F1012", bgCard: "#141518", bgHover: "#1A1B1F",
  border: "#222328", borderLight: "#2A2B30",
  text: "#E8E6E1", textMuted: "#8A8880", textDim: "#5C5A54",
  accent: "#C4956A", accentDim: "rgba(196,149,106,0.12)",
  green: "#6B9E78", greenDim: "rgba(107,158,120,0.15)",
  red: "#C47070", redDim: "rgba(196,112,112,0.12)",
  blue: "#6A8EC4", blueDim: "rgba(106,142,196,0.12)",
  cyan: "#6AC4B8", yellow: "#C4B86A", purple: "#9E6AC4",
};

const PRODUCTS = {
  relevnt: {
    name: "Relevnt", color: C.accent, colorDim: C.accentDim,
    tagline: "The labor market extracts from workers.",
    intervention: "Give individuals the intelligence that platforms hoard.",
    market: "$47.5B", marketLabel: "HR Tech Market", cagr: "10.35%", marketProjection: "$76.4B by 2031",
    stats: [
      { value: "2.2M", label: "ghost jobs / month" },
      { value: "3%", label: "response rate" },
      { value: "83d", label: "median time to offer" },
    ],
    buildStats: [
      { value: "678", label: "commits" },
      { value: "106", label: "database tables" },
      { value: "162", label: "pull requests" },
      { value: "30+", label: "background jobs" },
    ],
    description: "AI-powered career intelligence — job aggregation across 9+ ATS platforms (Lever, Greenhouse, Ashby, Workday, SmartRecruiters, Recruitee, BreezyHR, JazzHR, Personio), company intelligence, ghost job detection, skills-based matching, auto-apply infrastructure, admin observability, and ingestion healing. 106 database tables with RLS. Multi-provider AI routing (OpenAI, Anthropic, Gemini, DeepSeek). The most mature product in the portfolio.",
    techSignals: ["React 19 + Vite 7 + TypeScript", "106 Supabase tables with RLS", "30+ scheduled background jobs", "9+ ATS platform scrapers", "Ingestion healing system", "Auto-apply infrastructure", "CSRF + rate limiting", "Multi-provider AI router", "Admin observability dashboard", "162 PRs / 678 commits"],
    repo: "thepennylaneproject/Relevnt", status: "Alpha", commits: 678, firstCommit: "Nov 2025",
    research: [
      "30% of job postings are ghost jobs — BLS via Forbes, June 2025",
      "Job seekers submit 32–200+ applications for 0.1–2% success rate",
      "Columbia U: wage estimate errors range -98% to +400%; info intervention → 1.28% higher pay per 1% info gained",
      "NBER: 80,000 fake résumés → 9.5% callback gap by race; unchanged in 30 years",
      "72% of seekers report mental health damage from search process — APA",
      "Adults who became depressed after job loss had 67% lower odds of reemployment within 4 years",
    ],
    extraction: "Platforms profit from opacity. Ghost jobs inflate engagement metrics. Employer-first ranking buries qualified candidates. Data flows up, never down.",
    correction: "Transparent intelligence. Verified postings. Skills-first matching. Compensation data that reaches the people who need it. ATS-level scraping that bypasses platform gatekeeping.",
  },
  embr: {
    name: "Embr", color: C.green, colorDim: C.greenDim,
    tagline: "The creator economy extracts from creators.",
    intervention: "Give creators 85–90% of the value they generate.",
    market: "$200B+", marketLabel: "Creator Economy", cagr: "19.7%", marketProjection: "$1T+ by 2034",
    stats: [
      { value: "45–80%", label: "value extracted" },
      { value: "Top 1%", label: "capture all wealth" },
      { value: "207M", label: "creators globally" },
    ],
    buildStats: null,
    description: "Creator-owned social platform + freelance marketplace. Transparent algorithms, escrow-protected gigs, mutual aid, music streaming paying artists 3× Spotify rates. Full-stack NestJS + Next.js monorepo with real-time messaging, wallet system, and mobile-ready architecture.",
    techSignals: ["NestJS + Next.js monorepo", "Socket.io real-time", "Stripe Connect wallets", "Transparent algorithms", "Music streaming vertical", "React Native mobile"],
    repo: "thepennylaneproject/embr", status: "Alpha", commits: null, firstCommit: "Mar 2026",
    research: [
      "Creator economy: $212B in 2024, projected $894B–$1.07T by 2032–2034 — Goldman Sachs, Market.us",
      "207M+ creators globally, 46.7% full-time — industry data",
      "Platforms extract 45–80% of creator value; top 1% capture nearly all wealth",
      "Gig economy: $146.5B (2026) → $455.6B (2035) at 13.5% CAGR",
      "Social commerce: $2T → $8.5T by 2030 at 26.2% CAGR",
      "Substack: $1.1B valuation. Whatnot: $11.5B. Creator ownership commands premium.",
    ],
    extraction: "Opaque algorithms decide who gets seen. Platform takes 45–80% of revenue. Creator data locked inside walled gardens. No portability, no transparency, no recourse.",
    correction: "85–90% revenue share. Open algorithm parameters. Portable creator identity. Escrow-protected work. Community-governed moderation.",
  },
  codra: {
    name: "Codra", color: C.blue, colorDim: C.blueDim,
    tagline: "The software industry extracts from builders.",
    intervention: "Own your workflow instead of renting it piecemeal.",
    market: "$552B", marketLabel: "MarTech Market", cagr: "20.1%", marketProjection: "$2.38T by 2033",
    stats: [
      { value: "$45B", label: "wasted on unused SaaS" },
      { value: "275+", label: "avg apps / company" },
      { value: "47%", label: "licenses unused" },
    ],
    buildStats: [
      { value: "100", label: "commits" },
      { value: "18+", label: "database tables" },
      { value: "33", label: "serverless endpoints" },
    ],
    description: "Browser-based AI workspace — 7+ providers with fallback chains, visual node canvas, asset pipeline via Cloudinary, and Lyra, a contextual AI assistant that reads project state and suggests next steps. 100 commits in 12 weeks. 18+ database tables. 33 serverless endpoints. Full Stripe billing with production-grade idempotency.",
    techSignals: ["7+ AI providers + fallback chains", "33 serverless endpoints", "18+ tables with RLS", "Stripe billing lifecycle", "Encrypted credential vault", "XYFlow visual canvas", "Custom ESLint plugin", "Storybook docs", "Lyra contextual assistant (frontend live, backend in build)"],
    repo: "thepennylaneproject/codra", status: "Alpha", commits: 100, firstCommit: "Dec 2025",
    research: [
      "SMBs spend 6–12% of revenue on SaaS — highest of any company size",
      "Average company: 275+ SaaS apps; SMBs: 25–55 apps — industry data",
      "$45B wasted globally on unused SaaS licenses annually",
      "47% of SaaS licenses unused; 35% underused — benchmarking data",
      "41% of SaaS churn driven by subscription fatigue, not product dissatisfaction",
      "AI captured 61% of global VC in 2025 — $258.7B of $427.1B total — OECD",
    ],
    extraction: "SaaS model creates permanent tax. $500–$1,500/mo for fragmented tools. Vendor lock-in. Proprietary data formats. No ownership, no portability, no leverage.",
    correction: "Single owned workspace. Multi-provider AI routing. Consolidated tooling. Platform-key model absorbs API costs. Your data, your workflow, your infrastructure.",
  },
};

const ECOSYSTEM = [
  { name: "Ready", desc: "AI career coaching & interview prep — the access layer between Relevnt's intelligence and the individual.", color: C.accent, relation: "Extends Relevnt" },
  { name: "Mythos", desc: "AI marketing operations — campaign creation, content generation, social publishing, CRM, unified.", color: C.blue, relation: "Extends Codra" },
  { name: "FounderOS", desc: "Domain management, email marketing, inbox triage, CRM, and workflow automation in one owned command center.", color: C.blue, relation: "Extends Codra" },
  { name: "Passagr", desc: "Human-verified immigration intelligence for 20+ countries. 46 database migrations. Deployed with production API.", color: C.green, relation: "Civic layer" },
  { name: "Advocera", desc: "Trauma-informed legal intake and attorney matching for people navigating time-sensitive situations under stress.", color: C.green, relation: "Civic layer" },
];

const ORIGIN = [
  { label: "Necessity", title: "Medical Dashboard", year: "2026", body: "Personal health intelligence system — extraction scripts, trend visualization, specialist-ready case presentation. Built under time pressure when the healthcare system failed to present a coherent picture.", signal: "When institutions fail the individual, build the tool yourself." },
  { label: "Opportunity", title: "Marketing Portfolio", year: "2025", body: "A decade of digital marketing distilled: 131,976 video views, 300% over-goal recruitment, six-figure budgets. The bridge between strategic execution and technical capability.", signal: "The same person who drove measurable growth taught herself to build." },
  { label: "Analysis", title: "The Restoration Project", year: "2026", body: "Political publishing that documents institutional failure and pairs analysis with policy blueprints. Next.js, Substack integration, Sentry, Netlify. Evidence → briefing → blueprint → action.", signal: "See where institutions hide power — then design the counter-architecture." },
  { label: "System", title: "The Penny Lane Project", year: "2025–now", body: "Eight interconnected products. One thesis. ~12 weeks. One builder. 871+ combined commits.", signal: "Personal necessity became systemic intervention." },
];

// ─── Terminal ───
const HELP = `
  [accent]AVAILABLE COMMANDS[/]

  [dim]Navigation[/]
  [green]thesis[/]             The core investment thesis
  [green]triangle[/]           The three core products
  [green]ls[/]                 List core products
  [green]ls -a[/]              List all products with ecosystem

  [dim]Deep Inspection[/]
  [green]inspect[/] [cyan]<name>[/]     Deep dive (relevnt, embr, codra)
  [green]market[/] [cyan]<name>[/]      Market size, TAM, growth data
  [green]diff[/] [cyan]<name>[/]        Extraction vs. intervention
  [green]research[/] [cyan]<name>[/]    Research citations with sources
  [green]stack[/]              Shared technical infrastructure
  [green]schema relevnt[/]     Database architecture detail

  [dim]Origin[/]
  [green]git log[/]            The builder's commit history
  [green]whoami[/]             About the founder
  [green]contact[/]            Get in touch

  [dim]Utility[/]
  [green]clear[/]              Clear terminal
  [green]help[/]               This message
`;

function processCmd(cmd: string) {
  const p = cmd.trim().toLowerCase().split(/\s+/);
  const b = p[0], a = p[1];
  if (b === "help") return HELP;
  if (b === "clear") return "__CLEAR__";

  if (b === "thesis") return `
  [accent]THE EXTRACTION THESIS[/]

  Wherever an individual creates value — as a worker, a creator,
  or a builder — a platform is extracting from them.

  [red]Workers[/]   → Job platforms profit from opacity and ghost jobs.
              [accent]Relevnt[/] intervenes. [dim]678 commits. 106 tables. 30+ background jobs.[/]

  [red]Creators[/]  → Social platforms extract 45–80% of value.
              [green]Embr[/] intervenes. [dim]85–90% revenue share. Transparent algorithms.[/]

  [red]Builders[/]  → SaaS subscriptions bleed founders dry.
              [blue]Codra[/] intervenes. [dim]7+ AI providers. Single owned workspace.[/]

  Three markets. $800B+ combined TAM. One structural argument.`;

  if (b === "triangle") return `
  [accent]THE CORE TRIANGLE[/]

  ┌─────────────────────────────────────────────────────┐
  │                                                     │
  │              [accent]Relevnt[/]  ←  Workers                  │
  │             ╱  [dim]678 commits[/] ╲                        │
  │            ╱    [dim]106 tables[/]  ╲      [accent]$800B+[/]          │
  │           ╱     [dim]30+ jobs[/]     ╲     [dim]combined TAM[/]     │
  │          ╱                   ╲                      │
  │       [green]Embr[/]  ─────────────── [blue]Codra[/]                  │
  │     Creators                 Builders               │
  │   [dim]85–90% share[/]           [dim]7+ AI providers[/]         │
  │                                                     │
  └─────────────────────────────────────────────────────┘

  [dim]Try:[/] [green]inspect relevnt[/] · [green]diff embr[/] · [green]market codra[/]`;

  if (b === "ls") {
    if (a === "-a") return `
  [accent]CORE TRIANGLE[/]
  relevnt    [accent]●[/]  AI career intelligence          [dim]Alpha[/]  [accent]678 commits[/]
  embr       [green]●[/]  Creator-owned social platform   [dim]Alpha[/]
  codra      [blue]●[/]  AI workflow platform            [dim]Alpha[/]  [blue]100 commits[/]

  [dim]EXPANDING ECOSYSTEM[/]
  ready      [accent]○[/]  AI career coaching             [dim]Alpha  → Extends Relevnt[/]
  mythos     [blue]○[/]  AI marketing operations         [dim]Alpha  → Extends Codra[/]
  founderos  [blue]○[/]  Operational command center      [dim]Alpha  → Extends Codra[/]
  passagr    [green]○[/]  Immigration intelligence        [dim]Alpha  → Civic layer[/]
  advocera   [green]○[/]  Legal intake platform           [dim]Alpha  → Civic layer[/]`;
    return `
  [accent]CORE TRIANGLE[/]
  relevnt    [accent]●[/]  AI career intelligence          [dim]Alpha[/]  [accent]678 commits[/]
  embr       [green]●[/]  Creator-owned social platform   [dim]Alpha[/]
  codra      [blue]●[/]  AI workflow platform            [dim]Alpha[/]  [blue]100 commits[/]

  [dim]Use[/] [green]ls -a[/] [dim]to include ecosystem[/]`;
  }

  if (b === "schema" && a === "relevnt") return `
  [accent]RELEVNT DATABASE ARCHITECTURE[/]  [dim]106 tables[/]

  [dim]Core User Data[/]
  profiles, career_profiles, career_narratives, career_tracks,
  resumes, resume_sections, resume_skills

  [dim]Job Intelligence[/]
  jobs, companies, company_targets, aggregator_sources,
  job_collections, collection_jobs, saved_jobs, job_match_scores

  [dim]Application Pipeline[/]
  applications, application_events, job_applications,
  cover_letters, job_application_artifacts

  [dim]Auto-Apply System[/]
  auto_apply_rules, auto_apply_settings, auto_apply_queue,
  auto_apply_logs

  [dim]ATS Detection & Scraping[/]
  ats_detection_queue, ats_detection_cache
  [dim]Scrapers:[/] Lever, Greenhouse, Ashby, Workday, SmartRecruiters,
  Recruitee, BreezyHR, JazzHR, Personio

  [dim]Ingestion Infrastructure[/]
  ingestion_runs, ingestion_activity_log, ingestion_healing_log,
  daily_ingestion_metrics, discovery_runs

  [dim]AI System[/]
  ai_cache, ai_interactions, ai_invocations, ai_model_configs,
  ai_usage_log, ai_usage_logs, ai_usage_tracking

  [dim]Analytics & Observability[/]
  analytics_events, analytics_daily_summaries, admin_metrics,
  admin_alerts, admin_audit_log, admin_config,
  audit_logs, critical_operations_audit, failure_logs,
  constraint_violations, data_cleanup_audit, cache_invalidation_log

  [dim]Monetization[/]
  subscriptions, user_tiers, tier_usage
  [dim]Tiers:[/] Starter (free), Starter-Edu, Pro, Premium

  [dim]All tables use Row Level Security (RLS)[/]`;

  if (b === "inspect" || b === "market" || b === "diff" || b === "research") {
    const prod = PRODUCTS[a as keyof typeof PRODUCTS];
    if (!prod) return `  [red]Not found.[/] Try: [cyan]relevnt[/], [cyan]embr[/], or [cyan]codra[/]`;

    if (b === "inspect") {
      const extra = a === "relevnt" ? `
  [dim]FIRST COMMIT[/]   Nov 14, 2025  [dim](earliest in portfolio)[/]
  [dim]COMMITS[/]        678 across 162 pull requests
  [dim]TABLES[/]         106 with Row Level Security
  [dim]BACKGROUND[/]     30+ scheduled jobs (ingestion, healing, scraping, cleanup)
  [dim]ATS SCRAPERS[/]   Lever, Greenhouse, Ashby, Workday, SmartRecruiters,
                 Recruitee, BreezyHR, JazzHR, Personio
  [dim]API ENDPOINTS[/]  17 user-facing + 12 admin + 30+ scheduled
  [dim]SECURITY[/]       CSRF tokens, rate limiting, admin auth, RLS on all tables` :
      a === "codra" ? `
  [dim]FIRST COMMIT[/]   Dec 14, 2025
  [dim]COMMITS[/]        100 in 12 weeks
  [dim]TABLES[/]         18+ with Row Level Security
  [dim]ENDPOINTS[/]      33 serverless functions
  [dim]BILLING[/]        Full Stripe lifecycle with idempotent webhooks` : `
  [dim]ARCHITECTURE[/]   NestJS + Next.js monorepo
  [dim]REAL-TIME[/]      Socket.io messaging
  [dim]PAYMENTS[/]       Stripe Connect wallet system
  [dim]MOBILE[/]         React Native ready`;

      return `
  [${a === "relevnt" ? "accent" : a === "embr" ? "green" : "blue"}]${prod.name}[/] — ${prod.description.split(".")[0]}.

  [dim]STATUS[/]       ${prod.status}
  [dim]MARKET[/]       ${prod.market} ${prod.marketLabel} (${prod.cagr} CAGR)
  [dim]PROJECTION[/]   ${prod.marketProjection}
  [dim]REPO[/]         github.com/${prod.repo}
${extra}

  [dim]PROBLEM METRICS[/]
  ${prod.stats.map(s => `  ${s.value.padEnd(12)} ${s.label}`).join("\n")}

  [dim]TECH STACK[/]
  ${prod.techSignals.map(t => `  [dim]•[/] ${t}`).join("\n")}

  [dim]See also:[/] [green]market ${a}[/] · [green]diff ${a}[/] · [green]research ${a}[/]${a === "relevnt" ? ` · [green]schema relevnt[/]` : ""}`;
    }

    if (b === "market") return `
  [accent]MARKET: ${prod.name}[/]

  ┌────────────────────────────────────────┐
  │  TAM            ${prod.market.padEnd(22)}│
  │  CAGR           ${prod.cagr.padEnd(22)}│
  │  Projection     ${prod.marketProjection.padEnd(22)}│
  └────────────────────────────────────────┘

  [dim]KEY DATA[/]
  ${prod.research.slice(0, 3).map((r, i) => `  [dim]${i + 1}.[/] ${r}`).join("\n")}

  [dim]PROBLEM METRICS[/]
  ${prod.stats.map(s => `  [red]${s.value}[/] — ${s.label}`).join("\n")}`;

    if (b === "diff") return `
  [red]── EXTRACTION (current system) ──[/]
  ${prod.extraction}

  [green]── CORRECTION (${prod.name}) ──[/]
  ${prod.correction}

  [dim]The gap between these two is the market opportunity.[/]`;

    if (b === "research") return `
  [accent]RESEARCH: ${prod.name}[/]
  [dim]Sources: BLS, NBER, SHRM, Goldman Sachs, OECD, NIH/PMC, APA, WEF[/]

  ${prod.research.map((r, i) => `  [dim]${String(i + 1).padStart(2)}.[/] ${r}`).join("\n\n")}`;
  }

  if (b === "stack") return `
  [accent]SHARED INFRASTRUCTURE[/]

  [dim]Frontend[/]       React 18–19 · TypeScript 5 · Tailwind CSS · Vite
  [dim]Backend[/]        Netlify Functions · NestJS (Embr) · Next.js 14 (FounderOS)
  [dim]Database[/]       Supabase (PostgreSQL + Auth + Storage + RLS)
  [dim]AI Providers[/]   OpenAI · Anthropic · Gemini · DeepSeek · Mistral · Cohere
  [dim]Search[/]         Brave Search · Tavily (RAG retrieval)
  [dim]Payments[/]       Stripe (checkout, webhooks, portal, Connect)
  [dim]Media[/]          Cloudinary (asset pipeline + transforms)
  [dim]Analytics[/]      PostHog (product analytics + feature flags)
  [dim]State[/]          Zustand · React Query / TanStack Query · Zod
  [dim]Real-time[/]      Socket.io (Embr messaging)
  [dim]Testing[/]        Playwright E2E · Vitest · Storybook
  [dim]Security[/]       CSRF tokens · rate limiting · RLS · admin auth
  [dim]Mobile[/]         React Native (Embr)
  [dim]CI/CD[/]          GitHub Actions · Netlify Deploy · Husky + lint-staged`;

  if (b === "git" && a === "log") return `
  [accent]COMMIT HISTORY[/]

  [yellow]●[/] [dim]2025–present[/]  [accent]The Penny Lane Project[/]
  │  8 products, ~12 weeks, 871+ combined commits
  │  Personal necessity → systemic intervention
  │
  [yellow]●[/] [dim]2026[/]          [accent]The Restoration Project[/]
  │  Political publishing. Institutional analysis.
  │  Evidence → briefing → blueprint → action
  │
  [yellow]●[/] [dim]2025[/]          [accent]Marketing Portfolio[/]
  │  131,976 views. 300% over-goal. Six-figure budgets.
  │  Strategic execution meets technical capability
  │
  [yellow]●[/] [dim]2026[/]          [accent]Medical Dashboard[/]
  │  Health intelligence built under crisis pressure
  │  When institutions fail, build the tool yourself
  │
  [dim]──── origin ────[/]`;

  if (b === "whoami") return `
  [accent]Sarah Sahl[/]  ·  Founder, The Penny Lane Project

  10+ years digital marketing & growth strategy
  Self-taught full-stack development
  Solo-built 8 products — 871+ commits in ~12 weeks
  Lead product (Relevnt): 678 commits, 106 tables, 162 PRs

  [dim]"I don't just market technology. I build it."[/]
  [dim]"When I see systemic gaps, I build the tools to solve them."[/]`;

  if (b === "contact") return `
  [accent]GET IN TOUCH[/]

  [dim]Email[/]    sarah@thepennylaneproject.org
  [dim]GitHub[/]   github.com/thepennylaneproject
  [dim]Site[/]     thepennylaneproject.org`;

  if (b === "lyra") return `
  [accent]LYRA — Contextual AI Intelligence[/]

  Lyra is not a chatbot. She is the contextual intelligence layer
  that connects The Penny Lane Project ecosystem.

  [dim]THE PATTERN[/]
  Every product in this portfolio uses the same AI principle:
  understand the user's context, then suggest the next step
  instead of waiting to be asked.

  [dim]IN CODRA (primary implementation)[/]
  Embedded sidebar assistant with three states:
  • [green]Suggestion[/]    — proactive next-step guidance based on project state
  • [cyan]Clarification[/] — asks for context when the path is ambiguous
  • [dim]Idle[/]           — watches without interrupting

  [dim]ARCHITECTURE[/]
  Client:   [green]useLyraSuggestion[/] hook → reads project state, desk context,
            active specification, recent AI outputs
  Backend:  [yellow]/api/lyra/suggest[/] — contextual reasoning endpoint [dim](in build)[/]
  Router:   Multi-provider with fallback chain
            aimlapi → openai → deepseek → gemini

  [dim]ACROSS THE ECOSYSTEM[/]
  [accent]Relevnt[/]  → AI that reads your career profile, resume, and saved jobs
            to surface matches you'd miss and flag ghost postings
  [green]Embr[/]     → Transparent algorithm layer — creators see why content
            is surfaced, not just what gets shown
  [blue]Codra[/]    → Lyra: embedded assistant that learns your project context
            and guides workflow without being asked
  [accent]Ready[/]   → AI coaching that adapts to your skill gaps, interview
            history, and target roles

  [dim]THE PRINCIPLE[/]
  Most AI tools wait for a prompt. Lyra watches your context
  and offers guidance at the moment it's useful. The difference
  between a search engine and an advisor.

  [dim]STATUS[/]
  Frontend:  [green]Implemented[/]  (suggestion/clarification/idle states)
  Backend:   [yellow]In build[/]     (/api/lyra/suggest endpoint)
  Ecosystem: [yellow]Architected[/]  (shared AI routing pattern deployed)

  [dim]See also:[/] [green]inspect codra[/] · [green]stack[/]
`;

  return `  [red]Command not found:[/] ${cmd}\n  Type [green]help[/] for available commands.`;
}

function colorize(t: string) {
  return t.replace(/\[accent\](.*?)\[\/\]/g, `<span style="color:${C.accent}">$1</span>`)
    .replace(/\[green\](.*?)\[\/\]/g, `<span style="color:${C.green}">$1</span>`)
    .replace(/\[blue\](.*?)\[\/\]/g, `<span style="color:${C.blue}">$1</span>`)
    .replace(/\[red\](.*?)\[\/\]/g, `<span style="color:${C.red}">$1</span>`)
    .replace(/\[cyan\](.*?)\[\/\]/g, `<span style="color:${C.cyan}">$1</span>`)
    .replace(/\[yellow\](.*?)\[\/\]/g, `<span style="color:${C.yellow}">$1</span>`)
    .replace(/\[dim\](.*?)\[\/\]/g, `<span style="color:${C.textDim}">$1</span>`);
}

function useInView(th = 0.12) {
  const r = useRef<HTMLDivElement>(null); const [v, sV] = useState(false);
  useEffect(() => { const e = r.current; if (!e) return; const o = new IntersectionObserver(([x]) => { if (x.isIntersecting) sV(true); }, { threshold: th }); o.observe(e); return () => o.disconnect(); }, [th]);
  return [r, v] as const;
}
function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const [r, v] = useInView();
  return <div ref={r} style={{ opacity: v ? 1 : 0, transform: v ? "translateY(0)" : "translateY(20px)", transition: `opacity 0.65s ease ${delay}s, transform 0.65s ease ${delay}s` }}>{children}</div>;
}

function Terminal({ isOpen, onToggle }: { isOpen: boolean; onToggle: () => void }) {
  const [hist, setHist] = useState([{ type: "sys", text: `  [dim]View Source Terminal v0.4[/]\n  Type [green]help[/] for commands. Try: [green]inspect relevnt[/] · [green]schema relevnt[/] · [green]diff embr[/]` }]);
  const [inp, setInp] = useState("");
  const [ch, setCh] = useState<string[]>([]);
  const [ci, setCi] = useState(-1);
  const eR = useRef<HTMLDivElement>(null), iR = useRef<HTMLInputElement>(null);
  useEffect(() => { eR.current?.scrollIntoView({ behavior: "smooth" }); }, [hist]);
  useEffect(() => { if (isOpen) iR.current?.focus(); }, [isOpen]);

  const run = useCallback(() => {
    if (!inp.trim()) return;
    setCh(h => [...h, inp.trim()]); setCi(-1);
    const res = processCmd(inp.trim());
    if (res === "__CLEAR__") setHist([]);
    else setHist(h => [...h, { type: "cmd", text: inp.trim() }, { type: "out", text: res }]);
    setInp("");
  }, [inp]);

  const onKey = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") { run(); return; }
    if (e.key === "ArrowUp") { e.preventDefault(); if (!ch.length) return; const n = ci === -1 ? ch.length - 1 : Math.max(0, ci - 1); setCi(n); setInp(ch[n]); }
    if (e.key === "ArrowDown") { e.preventDefault(); if (ci === -1) return; const n = ci + 1; if (n >= ch.length) { setCi(-1); setInp(""); } else { setCi(n); setInp(ch[n]); } }
    if (e.key === "Tab") { e.preventDefault(); const cmds = ["help","thesis","triangle","ls","inspect","market","diff","research","stack","schema","git log","whoami","contact","clear","lyra"]; const m = cmds.filter(c => c.startsWith(inp.toLowerCase())); if (m.length === 1) setInp(m[0]); }
  }, [run, ch, ci, inp]);

  if (!isOpen) return (
    <div onClick={onToggle} style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 200, background: "rgba(8,9,10,0.95)", backdropFilter: "blur(12px)", borderTop: `1px solid ${C.border}`, padding: "10px 32px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: C.accent, display: "flex", alignItems: "center", gap: 8 }}><PLPLogo size={16} /><span>view-source terminal</span></span>
      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: C.textDim }}>click to open · type <span style={{ color: C.green }}>help</span> for commands</span>
    </div>
  );

  return (
    <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 200, background: "rgba(8,9,10,0.97)", backdropFilter: "blur(16px)", borderTop: `1px solid ${C.accent}40`, display: "flex", flexDirection: "column", height: "42vh", maxHeight: 440 }}>
      <div onClick={onToggle} style={{ padding: "8px 24px", borderBottom: `1px solid ${C.border}`, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: C.accent, display: "flex", alignItems: "center", gap: 8 }}><PLPLogo size={16} /><span>view-source terminal</span></span>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: C.textDim }}>▾ collapse</span>
      </div>
      <div onClick={() => iR.current?.focus()} style={{ flex: 1, overflow: "auto", padding: "12px 24px", fontFamily: "'JetBrains Mono', monospace", fontSize: 12, lineHeight: 1.7 }}>
        {hist.map((h, i) => (
          <div key={i} style={{ marginBottom: 4 }}>
            {h.type === "cmd" && <div><span style={{ color: C.accent }}>{">"}</span> <span style={{ color: C.text }}>{h.text}</span></div>}
            {(h.type === "out" || h.type === "sys") && <pre style={{ margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word", fontFamily: "inherit", fontSize: "inherit", lineHeight: "inherit", color: C.textMuted }} dangerouslySetInnerHTML={{ __html: colorize(h.text) }} />}
          </div>
        ))}
        <div style={{ display: "flex", alignItems: "center" }}>
          <span style={{ color: C.accent, marginRight: 8 }}>{">"}</span>
          <input ref={iR} value={inp} onChange={e => setInp(e.target.value)} onKeyDown={onKey} style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: C.text, fontFamily: "'JetBrains Mono', monospace", fontSize: 12, caretColor: C.accent }} spellCheck={false} autoComplete="off" />
        </div>
        <div ref={eR} />
      </div>
    </div>
  );
}

function Nav({ activeSection }: { activeSection: string }) {
  const s = ["thesis","triangle","ecosystem","builder","source"] as const;
  const l: Record<string, string> = { thesis: "Thesis", triangle: "Core", ecosystem: "Ecosystem", builder: "Builder", source: "Source" };
  return (
    <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: "rgba(8,9,10,0.88)", backdropFilter: "blur(16px)", borderBottom: `1px solid ${C.border}`, padding: "0 32px", height: 52, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <span style={{ fontFamily: "'JetBrains Mono', monospace", color: C.accent, fontSize: 13, fontWeight: 600, letterSpacing: 1 }}>{">"} view-source</span>
      <div style={{ display: "flex", gap: 28 }}>
        {s.map(k => <a key={k} href={`#${k}`} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: 0.5, textTransform: "uppercase", textDecoration: "none", paddingBottom: 2, color: activeSection === k ? C.accent : C.textDim, borderBottom: activeSection === k ? `1px solid ${C.accent}` : "1px solid transparent", transition: "color 0.3s" }}>{l[k]}</a>)}
      </div>
    </nav>
  );
}

function Divider() { return <div style={{ height: 1, background: `linear-gradient(to right, transparent, ${C.border}, transparent)`, margin: "0 48px" }} />; }

function Hero({ totalCommits }: { totalCommits: number }) {
  const s = [{ value: "8", label: "Products" }, { value: `${totalCommits}+`, label: "Commits" }, { value: "1", label: "Builder" }, { value: "$800B+", label: "TAM" }];
  return (
    <section style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", padding: "120px 48px 80px", maxWidth: 920, margin: "0 auto" }}>
      <FadeIn><div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}><PLPLogo size={28} /><p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, letterSpacing: 2, textTransform: "uppercase", color: C.accent, margin: 0 }}>The Penny Lane Project</p></div></FadeIn>
      <FadeIn delay={0.1}><h1 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: "clamp(36px, 5.5vw, 64px)", fontWeight: 400, color: C.text, lineHeight: 1.08, marginBottom: 32, letterSpacing: -1 }}>Wherever an individual creates value — as a worker, a creator, or a builder — <span style={{ color: C.accent }}>a platform is extracting from them.</span></h1></FadeIn>
      <FadeIn delay={0.2}><p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 17, lineHeight: 1.7, color: C.textMuted, maxWidth: 580, marginBottom: 48 }}>Three core products. Three points of extraction. One thesis. Scroll to read the specification — or open the terminal and <span style={{ fontFamily: "'JetBrains Mono', monospace", color: C.green, fontSize: 14 }}>inspect</span> it yourself.</p></FadeIn>
      <FadeIn delay={0.3}>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <a href="#triangle" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, letterSpacing: 0.5, color: C.bg, background: C.accent, padding: "12px 24px", textDecoration: "none" }}>The core triangle →</a>
          <a href="#source" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, letterSpacing: 0.5, color: C.accent, border: `1px solid ${C.accent}`, padding: "12px 24px", textDecoration: "none", background: "transparent" }}>View source</a>
        </div>
      </FadeIn>
      <FadeIn delay={0.4}>
        <div style={{ display: "flex", gap: 2, marginTop: 80 }}>
          {s.map(x => <div key={x.label} style={{ flex: 1, background: C.bgCard, border: `1px solid ${C.border}`, padding: "20px 16px", textAlign: "center" }}><div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 24, color: C.text, lineHeight: 1, marginBottom: 6 }}>{x.value}</div><div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: C.textDim }}>{x.label}</div></div>)}
        </div>
      </FadeIn>
    </section>
  );
}

function ThesisSection() {
  const prods = Object.values(PRODUCTS);
  return (
    <section id="thesis" style={{ padding: "120px 48px", maxWidth: 920, margin: "0 auto" }}>
      <FadeIn>
        <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: C.accent, marginBottom: 12 }}>01 — The Thesis</p>
        <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 400, color: C.text, lineHeight: 1.2, marginBottom: 16 }}>Extraction is the business model.<br />Correction is the market opportunity.</h2>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 16, lineHeight: 1.7, color: C.textMuted, marginBottom: 56, maxWidth: 600 }}>The platforms that mediate work, creativity, and commerce are architecturally designed to extract value from the people who create it. But extractive models leave massive underserved segments — and those segments are where the growth is.</p>
      </FadeIn>
      {prods.map((p, i) => (
        <FadeIn key={p.name} delay={i * 0.08}>
          <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, padding: "28px 32px", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: 1, textTransform: "uppercase", color: p.color, background: p.colorDim, padding: "4px 10px" }}>{p.name}</span>
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 500, color: C.red }}>{p.tagline}</span>
            </div>
            <div style={{ display: "flex", gap: 16, marginBottom: 16, flexWrap: "wrap" }}>
              {p.stats.map(s => (
                <div key={s.label} style={{ background: C.bg, border: `1px solid ${C.border}`, padding: "10px 16px", textAlign: "center", minWidth: 100, flex: 1 }}>
                  <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 22, color: C.text, lineHeight: 1, marginBottom: 4 }}>{s.value}</div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8, color: C.textDim }}>{s.label}</div>
                </div>
              ))}
            </div>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, lineHeight: 1.7, color: C.textDim, margin: "0 0 14px" }}>{p.extraction}</p>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: p.color, fontWeight: 500 }}>→ {p.intervention}</div>
          </div>
        </FadeIn>
      ))}
    </section>
  );
}

function TriangleSection() {
  const [active, setActive] = useState<keyof typeof PRODUCTS>("relevnt");
  const [showRes, setShowRes] = useState(false);
  const p = PRODUCTS[active];
  return (
    <section id="triangle" style={{ padding: "120px 48px", maxWidth: 920, margin: "0 auto" }}>
      <FadeIn>
        <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: C.accent, marginBottom: 12 }}>02 — The Core Triangle</p>
        <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 400, color: C.text, lineHeight: 1.2, marginBottom: 16 }}>Workers. Creators. Builders.<br />Three interventions. One architecture.</h2>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 16, lineHeight: 1.7, color: C.textMuted, marginBottom: 56, maxWidth: 600 }}>Each product addresses a different point in the extraction cycle. Together they form a single thesis about individual economic agency.</p>
      </FadeIn>
      <FadeIn delay={0.1}>
        <div style={{ display: "flex", gap: 2, marginBottom: 2 }}>
          {Object.entries(PRODUCTS).map(([k, tp]) => (
            <button key={k} onClick={() => { setActive(k as keyof typeof PRODUCTS); setShowRes(false); }} style={{ flex: 1, padding: "16px 12px", border: "none", cursor: "pointer", background: active === k ? C.bgCard : C.bgAlt, borderBottom: active === k ? `2px solid ${tp.color}` : "2px solid transparent", transition: "all 0.3s" }}>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 600, color: active === k ? tp.color : C.textDim }}>{tp.name}</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: C.textDim, marginTop: 4 }}>{tp.market} {tp.marketLabel}</div>
            </button>
          ))}
        </div>
      </FadeIn>
      <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderTop: "none", padding: 32 }}>
        {p.buildStats && (
          <div style={{ display: "flex", gap: 2, marginBottom: 20 }}>
            {p.buildStats.map(s => (
              <div key={s.label} style={{ flex: 1, background: C.bg, border: `1px solid ${C.border}`, padding: "14px 12px", textAlign: "center" }}>
                <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 24, color: p.color, lineHeight: 1, marginBottom: 4 }}>{s.value}</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8, color: C.textDim }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}
        <div style={{ display: "flex", gap: 2, marginBottom: 20 }}>
          {p.stats.map(s => (
            <div key={s.label} style={{ flex: 1, background: C.bg, border: `1px solid ${C.border}`, padding: "14px 12px", textAlign: "center" }}>
              <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 22, color: C.text, lineHeight: 1, marginBottom: 4 }}>{s.value}</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8, color: C.textDim }}>{s.label}</div>
            </div>
          ))}
        </div>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, lineHeight: 1.8, color: C.textMuted, marginBottom: 20 }}>{p.description}</p>
        <div style={{ display: "flex", gap: 20, marginBottom: 20, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 240 }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, letterSpacing: 1, textTransform: "uppercase", color: C.textDim, marginBottom: 10 }}>Technical Signals</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {p.techSignals.map(t => <span key={t} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: C.textMuted, background: C.bg, border: `1px solid ${C.border}`, padding: "3px 7px" }}>{t}</span>)}
            </div>
          </div>
          <div style={{ minWidth: 160 }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, letterSpacing: 1, textTransform: "uppercase", color: C.textDim, marginBottom: 10 }}>Market</div>
            <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32, color: p.color, lineHeight: 1 }}>{p.market}</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: C.textDim, marginTop: 4 }}>{p.cagr} → {p.marketProjection}</div>
          </div>
        </div>
        <div style={{ background: C.bg, border: `1px solid ${C.border}`, padding: "16px 20px", marginBottom: 16 }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, letterSpacing: 1, textTransform: "uppercase", color: C.textDim, marginBottom: 8 }}>Extraction → Correction</div>
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 200 }}><p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, lineHeight: 1.6, color: C.red, margin: 0 }}>{p.extraction}</p></div>
            <div style={{ flex: 1, minWidth: 200 }}><p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, lineHeight: 1.6, color: C.green, margin: 0 }}>{p.correction}</p></div>
          </div>
        </div>
        <button onClick={() => setShowRes(!showRes)} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: C.accent, background: C.accentDim, border: `1px solid ${C.accent}30`, padding: "8px 16px", cursor: "pointer", width: "100%", textAlign: "left" }}>
          {showRes ? "▾" : "▸"} Research citations ({p.research.length} sources)
        </button>
        {showRes && <div style={{ padding: "16px 0 0" }}>{p.research.map((r, i) => <div key={i} style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, lineHeight: 1.6, color: C.textMuted, padding: "6px 0", borderBottom: `1px solid ${C.border}` }}><span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: C.textDim, marginRight: 8 }}>{String(i + 1).padStart(2, "0")}</span>{r}</div>)}</div>}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, paddingTop: 16, marginTop: 16, borderTop: `1px solid ${C.border}` }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: C.green, background: C.greenDim, padding: "3px 8px" }}>Alpha</span>
            {p.firstCommit && <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: C.textDim }}>since {p.firstCommit}</span>}
          </div>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: p.color }}>github.com/{p.repo}</span>
        </div>
      </div>
    </section>
  );
}

function LyraSection() {
  const [expanded, setExpanded] = useState(false);

  return (
    <section style={{ padding: "80px 48px", maxWidth: 920, margin: "0 auto" }}>
      <FadeIn>
        <div style={{
          background: C.bgCard,
          border: `1px solid ${C.borderLight}`,
          padding: 32,
          position: "relative",
          overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", left: 0, top: 0, bottom: 0, width: 3,
            background: `linear-gradient(to bottom, ${C.accent}, ${C.blue}, ${C.green})`,
          }} />

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <span style={{
                  fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: 2,
                  textTransform: "uppercase", color: C.accent,
                }}>
                  Lyra
                </span>
                <span style={{
                  fontFamily: "'JetBrains Mono', monospace", fontSize: 9,
                  color: C.textDim, background: C.bg, border: `1px solid ${C.border}`,
                  padding: "2px 8px",
                }}>
                  Contextual AI Intelligence
                </span>
              </div>
              <h3 style={{
                fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 28,
                fontWeight: 400, color: C.text, lineHeight: 1.3, marginBottom: 12,
              }}>
                AI that understands your context<br />
                and suggests the next step —<br />
                <span style={{ color: C.accent }}>before you ask.</span>
              </h3>
            </div>
            <div style={{
              display: "flex", flexDirection: "column", gap: 6,
              fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
            }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: C.green, display: "inline-block" }} />
                <span style={{ color: C.textMuted }}>Frontend implemented</span>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: C.yellow, display: "inline-block" }} />
                <span style={{ color: C.textMuted }}>Backend in build</span>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: C.blue, display: "inline-block" }} />
                <span style={{ color: C.textMuted }}>Ecosystem architected</span>
              </div>
            </div>
          </div>

          <p style={{
            fontFamily: "'DM Sans', sans-serif", fontSize: 14, lineHeight: 1.7,
            color: C.textMuted, margin: "16px 0 20px", maxWidth: 620,
          }}>
            Most AI tools wait for a prompt. Lyra watches your context — your project state,
            your recent outputs, your current task — and offers guidance at the moment it's useful.
            The difference between a search engine and an advisor.
          </p>

          <div style={{ display: "flex", gap: 2, marginBottom: 20 }}>
            {[
              { product: "Relevnt", color: C.accent, desc: "Reads your career profile, resume, and saved jobs to surface matches you'd miss and flag ghost postings" },
              { product: "Embr", color: C.green, desc: "Transparent algorithm layer — creators see why content is surfaced, not just what gets shown" },
              { product: "Codra", color: C.blue, desc: "Embedded assistant that learns your project context and guides workflow without being asked" },
            ].map(item => (
              <div key={item.product} style={{
                flex: 1, background: C.bg, border: `1px solid ${C.border}`,
                padding: "14px 16px", borderTop: `2px solid ${item.color}`,
              }}>
                <div style={{
                  fontFamily: "'JetBrains Mono', monospace", fontSize: 11,
                  color: item.color, fontWeight: 600, marginBottom: 6,
                }}>
                  {item.product}
                </div>
                <p style={{
                  fontFamily: "'DM Sans', sans-serif", fontSize: 11, lineHeight: 1.5,
                  color: C.textDim, margin: 0,
                }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

          <button onClick={() => setExpanded(!expanded)} style={{
            fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: C.accent,
            background: C.accentDim, border: `1px solid ${C.accent}30`, padding: "8px 16px",
            cursor: "pointer", width: "100%", textAlign: "left",
          }}>
            {expanded ? "▾" : "▸"} Architecture detail
          </button>

          {expanded && (
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${C.border}` }}>
              <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 240 }}>
                  <div style={{
                    fontFamily: "'JetBrains Mono', monospace", fontSize: 9,
                    letterSpacing: 1, textTransform: "uppercase", color: C.textDim, marginBottom: 10,
                  }}>
                    Codra Implementation
                  </div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, lineHeight: 2, color: C.textMuted }}>
                    <div><span style={{ color: C.green }}>Client</span> → useLyraSuggestion hook</div>
                    <div><span style={{ color: C.green }}>States</span> → suggestion · clarification · idle</div>
                    <div><span style={{ color: C.yellow }}>Backend</span> → /api/lyra/suggest <span style={{ color: C.textDim }}>(in build)</span></div>
                    <div><span style={{ color: C.green }}>Context</span> → project state, desk, specification, recent outputs</div>
                    <div><span style={{ color: C.green }}>Router</span> → aimlapi → openai → deepseek → gemini</div>
                  </div>
                </div>
                <div style={{ flex: 1, minWidth: 240 }}>
                  <div style={{
                    fontFamily: "'JetBrains Mono', monospace", fontSize: 9,
                    letterSpacing: 1, textTransform: "uppercase", color: C.textDim, marginBottom: 10,
                  }}>
                    The Shared Principle
                  </div>
                  <p style={{
                    fontFamily: "'DM Sans', sans-serif", fontSize: 13, lineHeight: 1.7,
                    color: C.textMuted, margin: 0,
                  }}>
                    Every product in this ecosystem implements the same AI pattern:
                    ingest user context continuously, reason about what they need next,
                    and surface guidance proactively. Lyra is the name for that pattern
                    in its most complete form — an embedded intelligence that turns
                    raw AI capability into contextual advice.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </FadeIn>
    </section>
  );
}

function EcosystemSection() {
  return (
    <section id="ecosystem" style={{ padding: "120px 48px", maxWidth: 920, margin: "0 auto" }}>
      <FadeIn>
        <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: C.accent, marginBottom: 12 }}>03 — The Expanding Ecosystem</p>
        <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 400, color: C.text, lineHeight: 1.2, marginBottom: 16 }}>The triangle is the thesis.<br />The ecosystem is the vision.</h2>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 16, lineHeight: 1.7, color: C.textMuted, marginBottom: 56, maxWidth: 600 }}>Five additional products extend the core into career access, marketing operations, immigration intelligence, and legal advocacy.</p>
      </FadeIn>
      {ECOSYSTEM.map((p, i) => (
        <FadeIn key={p.name} delay={i * 0.06}>
          <div style={{ background: C.bgAlt, border: `1px solid ${C.border}`, padding: "20px 28px", marginBottom: 2, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 240 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 600, color: p.color }}>{p.name}</span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: C.textDim, background: C.bg, border: `1px solid ${C.border}`, padding: "2px 6px" }}>{p.relation}</span>
              </div>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, lineHeight: 1.6, color: C.textMuted, margin: 0 }}>{p.desc}</p>
            </div>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: C.green, background: C.greenDim, padding: "3px 8px" }}>Alpha</span>
          </div>
        </FadeIn>
      ))}
    </section>
  );
}

function BuilderSection() {
  return (
    <section id="builder" style={{ padding: "120px 48px", maxWidth: 920, margin: "0 auto" }}>
      <FadeIn>
        <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: C.accent, marginBottom: 12 }}>04 — The Builder</p>
        <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 400, color: C.text, lineHeight: 1.2, marginBottom: 16 }}>Built from necessity.<br />Scaled by conviction.</h2>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 16, lineHeight: 1.7, color: C.textMuted, marginBottom: 56, maxWidth: 600 }}>Every product traces back to a personal encounter with institutional failure — and a decision to build the thing that should have existed.</p>
      </FadeIn>
      <div style={{ position: "relative", marginBottom: 64 }}>
        <div style={{ position: "absolute", left: 23, top: 0, bottom: 0, width: 1, background: `linear-gradient(to bottom, ${C.accent}, ${C.border})` }} />
        {ORIGIN.map((s, i) => (
          <FadeIn key={s.title} delay={i * 0.1}>
            <div style={{ display: "flex", gap: 28, marginBottom: 40, position: "relative" }}>
              <div style={{ flexShrink: 0, width: 48 }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: C.bgCard, border: `2px solid ${i === ORIGIN.length - 1 ? C.accent : C.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: i === ORIGIN.length - 1 ? C.accent : C.textDim, position: "relative", zIndex: 2 }}>{String(i + 1).padStart(2, "0")}</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: 1, textTransform: "uppercase", color: C.accent, background: C.accentDim, padding: "3px 8px" }}>{s.label}</span>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: C.textDim }}>{s.year}</span>
                </div>
                <h3 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 17, fontWeight: 600, color: C.text, margin: "0 0 8px" }}>{s.title}</h3>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, lineHeight: 1.7, color: C.textMuted, margin: "0 0 10px" }}>{s.body}</p>
                <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: C.accent, margin: 0 }}>→ {s.signal}</p>
              </div>
            </div>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}

function SourceSection({ ghData }: { ghData: ReturnType<typeof useGitHubStats> }) {
  const { repos, loading, live } = ghData;
  const displayRepos: RepoData[] = repos ?? REPOS_META.map((r): RepoData => ({ name: r.name, ghName: r.ghName, ...r.fallback, live: false }));
  return (
    <section id="source" style={{ padding: "120px 48px 200px", maxWidth: 920, margin: "0 auto" }}>
      <FadeIn>
        <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: C.accent, marginBottom: 12 }}>05 — View Source</p>
        <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 400, color: C.text, lineHeight: 1.2, marginBottom: 16 }}>Transparency is the product.</h2>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 16, lineHeight: 1.7, color: C.textMuted, marginBottom: 48, maxWidth: 600 }}>Every claim is backed by code that exists, research that's cited, and infrastructure that's live. Open the terminal and verify it yourself.</p>
      </FadeIn>
      <FadeIn delay={0.1}>
        <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, padding: 28, marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: C.textDim, letterSpacing: 1, textTransform: "uppercase" }}>Repositories</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: live ? C.green : C.textDim, display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: live ? C.green : C.textDim, display: "inline-block", animation: live ? "pulse 2s infinite" : "none" }} />
              {loading ? "fetching..." : live ? "live from GitHub" : "cached data"}
            </span>
          </div>
          {displayRepos.map((r) => (
            <div key={r.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${C.border}`, padding: "10px 0", fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>
              <a href={`https://github.com/${GH_ORG}/${r.ghName}`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                <span style={{ color: C.textDim }}>{GH_ORG}/</span><span style={{ color: C.accent }}>{r.name}</span>
              </a>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                {r.language && <span style={{ fontSize: 9, color: C.textDim }}>{r.language}</span>}
                {r.deployed && <span style={{ fontSize: 9, color: C.green, background: C.greenDim, padding: "2px 6px" }}>deployed</span>}
                {r.pushedAt && <span style={{ fontSize: 9, color: C.textDim }}>{timeAgo(r.pushedAt)}</span>}
                {r.prs && <span style={{ fontSize: 10, color: C.textDim }}>{r.prs} PRs</span>}
                {r.commits && <span style={{ fontSize: 10, color: r.live ? C.text : C.textDim }}>{r.commits} commits</span>}
                {(r.stars ?? 0) > 0 && <span style={{ fontSize: 10, color: C.yellow }}>★ {r.stars}</span>}
              </div>
            </div>
          ))}
        </div>
      </FadeIn>
      <FadeIn delay={0.15}>
        <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, padding: 28, marginBottom: 20 }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: C.textDim, marginBottom: 16, letterSpacing: 1, textTransform: "uppercase" }}>Shared Infrastructure</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            {["React 18–19","TypeScript 5","Supabase","Netlify Functions","Tailwind CSS","Vite","Stripe","OpenAI","Anthropic","Gemini","DeepSeek","Mistral","Cohere","Brave Search","Tavily","Cloudinary","PostHog","Zustand","TanStack Query","Zod","Playwright","Vitest","Storybook","NestJS","Next.js 14","Socket.io","Husky + lint-staged"].map(t => <span key={t} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: C.textMuted, background: C.bg, border: `1px solid ${C.border}`, padding: "3px 7px" }}>{t}</span>)}
          </div>
        </div>
      </FadeIn>
      <FadeIn delay={0.2}>
        <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, padding: 28, marginBottom: 64 }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: C.textDim, marginBottom: 16, letterSpacing: 1, textTransform: "uppercase" }}>Research Foundation</div>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, lineHeight: 1.7, color: C.textMuted, margin: "0 0 16px" }}>Each product backed by dedicated market research with primary sources: BLS, NBER, SHRM, World Bank, NIH/PMC, Goldman Sachs, WEF, OECD, LSC, APA.</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            {["Relevnt","Embr","Codra","Ready","Mythos","FounderOS","Passagr","Advocera"].map(n => <span key={n} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: C.accent, background: C.accentDim, padding: "3px 8px" }}>{n} brief</span>)}
          </div>
        </div>
      </FadeIn>
      <FadeIn delay={0.25}>
        <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 48, textAlign: "center" }}>
          <p style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 26, color: C.text, lineHeight: 1.4, marginBottom: 8, fontWeight: 400 }}>"When I see systemic gaps, I build the tools to solve them."</p>
          <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: C.textDim, marginBottom: 32, letterSpacing: 1 }}>— Sarah Sahl, Founder</p>
          <a href="mailto:sarah@thepennylaneproject.org" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, letterSpacing: 0.5, color: C.bg, background: C.accent, padding: "14px 32px", textDecoration: "none", display: "inline-block" }}>Start a conversation →</a>
        </div>
      </FadeIn>
    </section>
  );
}

export default function ViewSource() {
  const [as, setAs] = useState("thesis");
  const [to, setTo] = useState(false);
  const ghData = useGitHubStats();
  useEffect(() => { const l = document.createElement("link"); l.href = "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Instrument+Serif&family=JetBrains+Mono:wght@400;500;600&display=swap"; l.rel = "stylesheet"; document.head.appendChild(l); }, []);
  useEffect(() => { const h = () => { for (const s of ["source","builder","ecosystem","triangle","thesis"]) { const el = document.getElementById(s); if (el && el.getBoundingClientRect().top < 200) { setAs(s); break; } } }; window.addEventListener("scroll", h, { passive: true }); return () => window.removeEventListener("scroll", h); }, []);

  return (
    <div style={{ background: C.bg, color: C.text, minHeight: "100vh", fontFamily: "'DM Sans', sans-serif", paddingBottom: to ? "42vh" : 40 }}>
      <style>{`*{margin:0;padding:0;box-sizing:border-box}html{scroll-behavior:smooth}body{background:${C.bg}}::selection{background:${C.accent};color:${C.bg}}::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:${C.bg}}::-webkit-scrollbar-thumb{background:${C.border}}button:hover{opacity:0.92}a:hover{opacity:0.88}@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}@media(max-width:640px){section{padding-left:20px!important;padding-right:20px!important}nav{padding:0 12px!important}nav>div:last-child{gap:12px!important}nav>div:last-child a{font-size:8px!important}}`}</style>
      <Nav activeSection={as} />
      <Hero totalCommits={ghData.totalCommits} />
      <Divider />
      <ThesisSection />
      <Divider />
      <TriangleSection />
      <LyraSection />
      <Divider />
      <EcosystemSection />
      <Divider />
      <BuilderSection />
      <Divider />
      <SourceSection ghData={ghData} />
      <footer style={{ borderTop: `1px solid ${C.border}`, padding: "20px 48px", display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: C.textDim }}><div style={{ display: "flex", alignItems: "center", gap: 8 }}><PLPLogo size={14} /><span>© 2026 The Penny Lane Project</span></div><span>view-source v0.6</span></footer>
      <Terminal isOpen={to} onToggle={() => setTo(!to)} />
    </div>
  );
}