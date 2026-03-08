import { useState, useEffect, useRef, useCallback } from "react";

const C = {
  bg: "#08090A", bgAlt: "#0F1012", bgCard: "#141518",
  border: "#222328", borderLight: "#2A2B30",
  text: "#E8E6E1", textMuted: "#8A8880", textDim: "#5C5A54",
  accent: "#C4956A", accentDim: "rgba(196,149,106,0.12)",
  green: "#6B9E78", greenDim: "rgba(107,158,120,0.15)",
  red: "#C47070", redDim: "rgba(196,112,112,0.12)",
  blue: "#6A8EC4", blueDim: "rgba(106,142,196,0.12)",
  cyan: "#6AC4B8", yellow: "#C4B86A",
};

const GH_ORG = "thepennylaneproject";
const REPOS_META = [
  { name: "Relevnt", ghName: "Relevnt", fallback: { commits: 678, prs: 162, deployed: true } },
  { name: "codra", ghName: "codra", fallback: { commits: 100, deployed: true } },
  { name: "ready", ghName: "ready", fallback: { commits: 30, deployed: true } },
  { name: "FounderOS", ghName: "FounderOS", fallback: { commits: 63 } },
  { name: "embr", ghName: "embr", fallback: {} },
  { name: "Mythos", ghName: "Mythos", fallback: {} },
  { name: "Passagr", ghName: "Passagr", fallback: { deployed: true } },
  { name: "Advocera", ghName: "Advocera", fallback: {} },
];

function useGitHubStats() {
  const [repos, setRepos] = useState(null);
  const [loading, setLoading] = useState(true);
  const [live, setLive] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function fetchAll() {
      try {
        const results = await Promise.all(
          REPOS_META.map(async (r) => {
            try {
              const res = await fetch(`https://api.github.com/repos/${GH_ORG}/${r.ghName}`, {
                headers: { Accept: "application/vnd.github.v3+json" },
              });
              if (!res.ok) throw new Error(res.status);
              const data = await res.json();
              // Get actual commit count from default branch
              let commits = r.fallback.commits;
              try {
                const contribRes = await fetch(
                  `https://api.github.com/repos/${GH_ORG}/${r.ghName}/contributors?per_page=1&anon=true`,
                  { headers: { Accept: "application/vnd.github.v3+json" } }
                );
                if (contribRes.ok) {
                  const contribs = await contribRes.json();
                  if (Array.isArray(contribs) && contribs.length > 0) {
                    commits = contribs.reduce((sum, c) => sum + (c.contributions || 0), 0);
                  }
                }
              } catch {}
              return {
                name: r.name,
                ghName: r.ghName,
                commits,
                stars: data.stargazers_count || 0,
                language: data.language,
                pushedAt: data.pushed_at,
                updatedAt: data.updated_at,
                description: data.description,
                openIssues: data.open_issues_count || 0,
                size: data.size,
                deployed: r.fallback.deployed || false,
                prs: r.fallback.prs || null,
                live: true,
              };
            } catch {
              return { name: r.name, ghName: r.ghName, ...r.fallback, live: false };
            }
          })
        );
        if (!cancelled) {
          setRepos(results);
          setLive(results.some((r) => r.live));
          setLoading(false);
        }
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

function timeAgo(dateStr) {
  if (!dateStr) return null;
  const now = Date.now(), then = new Date(dateStr).getTime();
  const diff = now - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

// ─── Product Data (unchanged from v0.4) ───
const PRODUCTS = {
  relevnt: {
    name: "Relevnt", color: C.accent, colorDim: C.accentDim,
    tagline: "The labor market extracts from workers.",
    intervention: "Give individuals the intelligence that platforms hoard.",
    market: "$47.5B", marketLabel: "HR Tech Market", cagr: "10.35%", marketProjection: "$76.4B by 2031",
    stats: [{ value: "2.2M", label: "ghost jobs / month" }, { value: "3%", label: "response rate" }, { value: "83d", label: "median time to offer" }],
    buildStats: [{ value: "678", label: "commits" }, { value: "106", label: "database tables" }, { value: "162", label: "pull requests" }, { value: "30+", label: "background jobs" }],
    description: "AI-powered career intelligence — job aggregation across 9+ ATS platforms (Lever, Greenhouse, Ashby, Workday, SmartRecruiters, Recruitee, BreezyHR, JazzHR, Personio), company intelligence, ghost job detection, skills-based matching, auto-apply infrastructure, admin observability, and ingestion healing. 106 database tables with RLS. Multi-provider AI routing.",
    techSignals: ["React 19 + Vite 7 + TypeScript", "106 Supabase tables with RLS", "30+ scheduled background jobs", "9+ ATS platform scrapers", "Ingestion healing system", "Auto-apply infrastructure", "CSRF + rate limiting", "Multi-provider AI router", "Admin observability", "162 PRs / 678 commits"],
    repo: "thepennylaneproject/Relevnt", status: "Alpha", firstCommit: "Nov 2025",
    research: ["30% of job postings are ghost jobs — BLS via Forbes, June 2025", "Job seekers submit 32–200+ applications for 0.1–2% success rate", "Columbia U: wage estimate errors range -98% to +400%; info → 1.28% higher pay", "NBER: 80,000 fake résumés → 9.5% callback gap by race; unchanged in 30 years", "72% of seekers report mental health damage — APA", "67% lower reemployment odds after depression onset"],
    extraction: "Platforms profit from opacity. Ghost jobs inflate metrics. Employer-first ranking buries candidates. Data flows up, never down.",
    correction: "Transparent intelligence. Verified postings. Skills-first matching. ATS-level scraping that bypasses platform gatekeeping.",
  },
  embr: {
    name: "Embr", color: C.green, colorDim: C.greenDim,
    tagline: "The creator economy extracts from creators.",
    intervention: "Give creators 85–90% of the value they generate.",
    market: "$200B+", marketLabel: "Creator Economy", cagr: "19.7%", marketProjection: "$1T+ by 2034",
    stats: [{ value: "45–80%", label: "value extracted" }, { value: "Top 1%", label: "capture all wealth" }, { value: "207M", label: "creators globally" }],
    buildStats: null,
    description: "Creator-owned social platform + freelance marketplace. Transparent algorithms, escrow-protected gigs, mutual aid, music streaming paying 3× Spotify rates.",
    techSignals: ["NestJS + Next.js monorepo", "Socket.io real-time", "Stripe Connect wallets", "Transparent algorithms", "Music streaming", "React Native mobile"],
    repo: "thepennylaneproject/embr", status: "Alpha", firstCommit: "Mar 2026",
    research: ["Creator economy: $212B → $894B–$1.07T by 2032–2034", "207M+ creators globally, 46.7% full-time", "Platforms extract 45–80%; top 1% capture nearly all", "Gig economy: $146.5B → $455.6B by 2035", "Social commerce: $2T → $8.5T by 2030", "Substack: $1.1B val. Whatnot: $11.5B. Ownership commands premium."],
    extraction: "Opaque algorithms decide who gets seen. 45–80% revenue extracted. Data locked in walled gardens.",
    correction: "85–90% revenue share. Open algorithm parameters. Portable identity. Escrow-protected work.",
  },
  codra: {
    name: "Codra", color: C.blue, colorDim: C.blueDim,
    tagline: "The software industry extracts from builders.",
    intervention: "Own your workflow instead of renting it piecemeal.",
    market: "$552B", marketLabel: "MarTech Market", cagr: "20.1%", marketProjection: "$2.38T by 2033",
    stats: [{ value: "$45B", label: "wasted on unused SaaS" }, { value: "275+", label: "avg apps / company" }, { value: "47%", label: "licenses unused" }],
    buildStats: [{ value: "100", label: "commits" }, { value: "18+", label: "database tables" }, { value: "33", label: "serverless endpoints" }],
    description: "Browser-based AI workspace — 7+ providers with fallback chains, visual node canvas, asset pipeline, contextual AI assistant (Lyra), full Stripe billing lifecycle.",
    techSignals: ["7+ AI providers + fallback", "33 serverless endpoints", "18+ tables with RLS", "Stripe billing lifecycle", "Encrypted credential vault", "XYFlow canvas", "Custom ESLint plugin", "Storybook docs"],
    repo: "thepennylaneproject/codra", status: "Alpha", firstCommit: "Dec 2025",
    research: ["SMBs spend 6–12% of revenue on SaaS", "Average company: 275+ SaaS apps", "$45B wasted on unused licenses annually", "47% of SaaS licenses unused", "41% SaaS churn from subscription fatigue", "AI captured 61% of global VC in 2025 — OECD"],
    extraction: "SaaS creates permanent tax. $500–$1,500/mo for fragmented tools. Vendor lock-in. No ownership.",
    correction: "Single owned workspace. Multi-provider AI. Platform-key model. Your data, your workflow.",
  },
};

const ECOSYSTEM = [
  { name: "Ready", desc: "AI career coaching & interview prep", color: C.accent, relation: "Extends Relevnt" },
  { name: "Mythos", desc: "AI marketing operations platform", color: C.blue, relation: "Extends Codra" },
  { name: "FounderOS", desc: "Operational command center", color: C.blue, relation: "Extends Codra" },
  { name: "Passagr", desc: "Human-verified immigration intelligence", color: C.green, relation: "Civic layer" },
  { name: "Advocera", desc: "Trauma-informed legal intake", color: C.green, relation: "Civic layer" },
];

const ORIGIN = [
  { label: "Necessity", title: "Medical Dashboard", year: "2026", body: "Personal health intelligence — extraction scripts, trend visualization, specialist-ready case presentation. Built under pressure when the system failed.", signal: "When institutions fail, build the tool yourself." },
  { label: "Opportunity", title: "Marketing Portfolio", year: "2025", body: "A decade distilled: 131,976 views, 300% over-goal recruitment, six-figure budgets. The bridge from strategy to code.", signal: "The same person who drove growth taught herself to build." },
  { label: "Analysis", title: "The Restoration Project", year: "2026", body: "Political publishing pairing institutional analysis with policy blueprints. Evidence → briefing → blueprint → action.", signal: "See where institutions hide power — then design the counter-architecture." },
  { label: "System", title: "The Penny Lane Project", year: "2025–now", body: "Eight interconnected products. One thesis. One builder.", signal: "Personal necessity became systemic intervention." },
];

// ─── Terminal (same command set as v0.4, abbreviated for space) ───
function processCmd(cmd) {
  const p = cmd.trim().toLowerCase().split(/\s+/), b = p[0], a = p[1];
  if (b === "clear") return "__CLEAR__";
  if (b === "help") return `  [accent]COMMANDS[/]\n  [green]thesis[/] [green]triangle[/] [green]ls[/] [green]ls -a[/]\n  [green]inspect[/] [cyan]<n>[/]  [green]market[/] [cyan]<n>[/]  [green]diff[/] [cyan]<n>[/]  [green]research[/] [cyan]<n>[/]\n  [green]schema relevnt[/]  [green]stack[/]  [green]git log[/]  [green]whoami[/]  [green]contact[/]  [green]clear[/]`;
  if (b === "thesis") return `  [accent]THE EXTRACTION THESIS[/]\n\n  Wherever an individual creates value — as a worker, a creator,\n  or a builder — a platform is extracting from them.\n\n  [red]Workers[/]   → [accent]Relevnt[/] [dim]678 commits. 106 tables. 30+ background jobs.[/]\n  [red]Creators[/]  → [green]Embr[/] [dim]85–90% revenue share. Transparent algorithms.[/]\n  [red]Builders[/]  → [blue]Codra[/] [dim]7+ AI providers. Single owned workspace.[/]\n\n  Three markets. $800B+ combined TAM. One structural argument.`;
  if (b === "triangle") return `  [accent]THE CORE TRIANGLE[/]\n\n  ┌───────────────────────────────────────────────┐\n  │            [accent]Relevnt[/]  ←  Workers              │\n  │           ╱  [dim]678 commits[/]  ╲     [accent]$800B+[/]      │\n  │          ╱    [dim]106 tables[/]   ╲    [dim]TAM[/]         │\n  │       [green]Embr[/]  ────────────── [blue]Codra[/]            │\n  │     Creators               Builders          │\n  └───────────────────────────────────────────────┘`;
  if (b === "ls") return a === "-a" ? `  [accent]CORE[/]\n  relevnt  [accent]●[/] Career intelligence   [accent]678 commits[/]\n  embr     [green]●[/] Creator platform\n  codra    [blue]●[/] AI workflow           [blue]100 commits[/]\n\n  [dim]ECOSYSTEM[/]\n  ready     [accent]○[/] Career coaching     [dim]→ Relevnt[/]\n  mythos    [blue]○[/] Marketing ops       [dim]→ Codra[/]\n  founderos [blue]○[/] Command center      [dim]→ Codra[/]\n  passagr   [green]○[/] Immigration intel   [dim]→ Civic[/]\n  advocera  [green]○[/] Legal intake        [dim]→ Civic[/]` : `  [accent]CORE[/]\n  relevnt  [accent]●[/] Career intelligence   [accent]678 commits[/]\n  embr     [green]●[/] Creator platform\n  codra    [blue]●[/] AI workflow           [blue]100 commits[/]\n\n  [dim]Use[/] [green]ls -a[/] [dim]for ecosystem[/]`;
  if (b === "schema" && a === "relevnt") return `  [accent]RELEVNT SCHEMA[/] [dim]106 tables[/]\n\n  [dim]User:[/] profiles, career_profiles, career_narratives, career_tracks, resumes\n  [dim]Jobs:[/] jobs, companies, company_targets, aggregator_sources, job_match_scores\n  [dim]Apps:[/] applications, application_events, cover_letters\n  [dim]Auto:[/] auto_apply_rules, auto_apply_queue, auto_apply_logs\n  [dim]ATS:[/]  Lever, Greenhouse, Ashby, Workday, SmartRecruiters, Recruitee, BreezyHR, JazzHR, Personio\n  [dim]Ingest:[/] ingestion_runs, ingestion_healing_log, daily_ingestion_metrics\n  [dim]AI:[/] ai_cache, ai_invocations, ai_model_configs, ai_usage_tracking\n  [dim]Obs:[/] analytics_events, admin_metrics, admin_alerts, failure_logs, audit_logs\n  [dim]Billing:[/] subscriptions, user_tiers, tier_usage`;
  if (b === "stack") return `  [accent]SHARED INFRASTRUCTURE[/]\n\n  [dim]Frontend[/]    React 18–19 · TypeScript 5 · Tailwind · Vite\n  [dim]Backend[/]     Netlify Functions · NestJS · Next.js 14\n  [dim]Database[/]    Supabase (Postgres + Auth + Storage + RLS)\n  [dim]AI[/]          OpenAI · Anthropic · Gemini · DeepSeek · Mistral · Cohere\n  [dim]Payments[/]    Stripe (checkout, webhooks, portal, Connect)\n  [dim]Analytics[/]   PostHog · Brave Search · Tavily\n  [dim]Testing[/]     Playwright · Vitest · Storybook\n  [dim]Security[/]    CSRF · rate limiting · RLS · admin auth`;
  if (b === "git" && a === "log") return `  [accent]COMMIT HISTORY[/]\n\n  [yellow]●[/] [dim]2025–now[/]  [accent]The Penny Lane Project[/]\n  │  8 products, 871+ commits, 1 builder\n  [yellow]●[/] [dim]2026[/]      [accent]The Restoration Project[/]\n  │  Political publishing + policy blueprints\n  [yellow]●[/] [dim]2025[/]      [accent]Marketing Portfolio[/]\n  │  131,976 views. 300% over-goal.\n  [yellow]●[/] [dim]2026[/]      [accent]Medical Dashboard[/]\n  │  Health intelligence under crisis pressure\n  [dim]──── origin ────[/]`;
  if (b === "whoami") return `  [accent]Sarah Sahl[/] · Founder\n\n  10+ yrs marketing & growth · Self-taught full-stack\n  Solo-built 8 products — 871+ commits\n  Lead product: 678 commits, 106 tables, 162 PRs`;
  if (b === "contact") return `  [accent]GET IN TOUCH[/]\n  [dim]Email[/]  sarah@thepennylaneproject.org\n  [dim]GitHub[/] github.com/${GH_ORG}`;
  if (["inspect","market","diff","research"].includes(b)) {
    const prod = PRODUCTS[a]; if (!prod) return `  [red]Not found.[/] Try: [cyan]relevnt[/], [cyan]embr[/], [cyan]codra[/]`;
    if (b === "inspect") return `  [accent]${prod.name}[/] — ${prod.description.split(".")[0]}.\n\n  [dim]STATUS[/]   ${prod.status}  [dim]MARKET[/]  ${prod.market} (${prod.cagr})\n  [dim]REPO[/]     github.com/${prod.repo}\n\n  ${prod.stats.map(s => `  ${s.value.padEnd(12)} ${s.label}`).join("\n")}\n\n  [dim]TECH[/]\n  ${prod.techSignals.map(t => `  [dim]•[/] ${t}`).join("\n")}`;
    if (b === "market") return `  [accent]MARKET: ${prod.name}[/]\n  TAM: ${prod.market}  CAGR: ${prod.cagr}  → ${prod.marketProjection}\n\n  ${prod.research.slice(0,3).map((r,i) => `  [dim]${i+1}.[/] ${r}`).join("\n")}`;
    if (b === "diff") return `  [red]EXTRACTION[/]\n  ${prod.extraction}\n\n  [green]CORRECTION (${prod.name})[/]\n  ${prod.correction}`;
    if (b === "research") return `  [accent]RESEARCH: ${prod.name}[/]\n\n  ${prod.research.map((r,i) => `  [dim]${i+1}.[/] ${r}`).join("\n\n")}`;
  }
  return `  [red]Unknown:[/] ${cmd}  —  [green]help[/] for commands`;
}

function colorize(t) {
  return t.replace(/\[accent\](.*?)\[\/\]/g, `<span style="color:${C.accent}">$1</span>`)
    .replace(/\[green\](.*?)\[\/\]/g, `<span style="color:${C.green}">$1</span>`)
    .replace(/\[blue\](.*?)\[\/\]/g, `<span style="color:${C.blue}">$1</span>`)
    .replace(/\[red\](.*?)\[\/\]/g, `<span style="color:${C.red}">$1</span>`)
    .replace(/\[cyan\](.*?)\[\/\]/g, `<span style="color:${C.cyan}">$1</span>`)
    .replace(/\[yellow\](.*?)\[\/\]/g, `<span style="color:${C.yellow}">$1</span>`)
    .replace(/\[dim\](.*?)\[\/\]/g, `<span style="color:${C.textDim}">$1</span>`);
}

// ─── Core Components ───
function useInView(th = 0.12) { const r = useRef(null); const [v, s] = useState(false); useEffect(() => { const e = r.current; if (!e) return; const o = new IntersectionObserver(([x]) => { if (x.isIntersecting) s(true); }, { threshold: th }); o.observe(e); return () => o.disconnect(); }, [th]); return [r, v]; }
function FadeIn({ children, delay = 0 }) { const [r, v] = useInView(); return <div ref={r} style={{ opacity: v ? 1 : 0, transform: v ? "translateY(0)" : "translateY(20px)", transition: `opacity 0.65s ease ${delay}s, transform 0.65s ease ${delay}s` }}>{children}</div>; }
function Divider() { return <div style={{ height: 1, background: `linear-gradient(to right, transparent, ${C.border}, transparent)`, margin: "0 48px" }} />; }

function Terminal({ isOpen, onToggle }) {
  const [hist, setHist] = useState([{ type: "sys", text: `  [dim]View Source Terminal v0.5 — Live GitHub data[/]\n  Type [green]help[/] for commands` }]);
  const [inp, setInp] = useState(""); const [ch, setCh] = useState([]); const [ci, setCi] = useState(-1);
  const eR = useRef(null), iR = useRef(null);
  useEffect(() => { eR.current?.scrollIntoView({ behavior: "smooth" }); }, [hist]);
  useEffect(() => { if (isOpen) iR.current?.focus(); }, [isOpen]);
  const run = useCallback(() => { if (!inp.trim()) return; setCh(h => [...h, inp.trim()]); setCi(-1); const res = processCmd(inp.trim()); if (res === "__CLEAR__") setHist([]); else setHist(h => [...h, { type: "cmd", text: inp.trim() }, { type: "out", text: res }]); setInp(""); }, [inp]);
  const onKey = useCallback((e) => { if (e.key === "Enter") { run(); return; } if (e.key === "ArrowUp") { e.preventDefault(); if (!ch.length) return; const n = ci === -1 ? ch.length-1 : Math.max(0,ci-1); setCi(n); setInp(ch[n]); } if (e.key === "ArrowDown") { e.preventDefault(); if (ci===-1) return; const n=ci+1; if (n>=ch.length){setCi(-1);setInp("")}else{setCi(n);setInp(ch[n])} } if (e.key === "Tab") { e.preventDefault(); const cmds = ["help","thesis","triangle","ls","inspect","market","diff","research","stack","schema","git log","whoami","contact","clear"]; const m = cmds.filter(c => c.startsWith(inp.toLowerCase())); if (m.length===1) setInp(m[0]); } }, [run, ch, ci, inp]);

  if (!isOpen) return <div onClick={onToggle} style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 200, background: "rgba(8,9,10,0.95)", backdropFilter: "blur(12px)", borderTop: `1px solid ${C.border}`, padding: "10px 32px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between" }}><span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: C.accent }}>{">"} view-source terminal</span><span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: C.textDim }}>click to open</span></div>;

  return (
    <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 200, background: "rgba(8,9,10,0.97)", backdropFilter: "blur(16px)", borderTop: `1px solid ${C.accent}40`, display: "flex", flexDirection: "column", height: "42vh", maxHeight: 440 }}>
      <div onClick={onToggle} style={{ padding: "8px 24px", borderBottom: `1px solid ${C.border}`, cursor: "pointer", display: "flex", justifyContent: "space-between", flexShrink: 0 }}><span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: C.accent }}>{">"} view-source terminal</span><span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: C.textDim }}>▾ collapse</span></div>
      <div onClick={() => iR.current?.focus()} style={{ flex: 1, overflow: "auto", padding: "12px 24px", fontFamily: "'JetBrains Mono', monospace", fontSize: 12, lineHeight: 1.7 }}>
        {hist.map((h, i) => <div key={i} style={{ marginBottom: 4 }}>{h.type === "cmd" ? <div><span style={{ color: C.accent }}>{">"}</span> {h.text}</div> : <pre style={{ margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word", fontFamily: "inherit", color: C.textMuted }} dangerouslySetInnerHTML={{ __html: colorize(h.text) }} />}</div>)}
        <div style={{ display: "flex", alignItems: "center" }}><span style={{ color: C.accent, marginRight: 8 }}>{">"}</span><input ref={iR} value={inp} onChange={e=>setInp(e.target.value)} onKeyDown={onKey} style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: C.text, fontFamily: "'JetBrains Mono', monospace", fontSize: 12, caretColor: C.accent }} spellCheck={false} autoComplete="off" /></div>
        <div ref={eR} />
      </div>
    </div>
  );
}

function Nav({ activeSection }) {
  const s = ["thesis","triangle","ecosystem","builder","source"];
  const l = { thesis:"Thesis", triangle:"Core", ecosystem:"Ecosystem", builder:"Builder", source:"Source" };
  return <nav style={{ position:"fixed",top:0,left:0,right:0,zIndex:100,background:"rgba(8,9,10,0.88)",backdropFilter:"blur(16px)",borderBottom:`1px solid ${C.border}`,padding:"0 32px",height:52,display:"flex",alignItems:"center",justifyContent:"space-between" }}><span style={{ fontFamily:"'JetBrains Mono', monospace",color:C.accent,fontSize:13,fontWeight:600,letterSpacing:1 }}>{">"} view-source</span><div style={{ display:"flex",gap:28 }}>{s.map(k=><a key={k} href={`#${k}`} style={{ fontFamily:"'JetBrains Mono', monospace",fontSize:10,letterSpacing:0.5,textTransform:"uppercase",textDecoration:"none",paddingBottom:2,color:activeSection===k?C.accent:C.textDim,borderBottom:activeSection===k?`1px solid ${C.accent}`:"1px solid transparent",transition:"color 0.3s" }}>{l[k]}</a>)}</div></nav>;
}

// ─── Sections ───
function Hero({ totalCommits }) {
  const s = [{ value: "8", label: "Products" }, { value: `${totalCommits}+`, label: "Commits" }, { value: "1", label: "Builder" }, { value: "$800B+", label: "TAM" }];
  return (
    <section style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", padding: "120px 48px 80px", maxWidth: 920, margin: "0 auto" }}>
      <FadeIn><p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, letterSpacing: 2, textTransform: "uppercase", color: C.accent, marginBottom: 24 }}>The Penny Lane Project</p></FadeIn>
      <FadeIn delay={0.1}><h1 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: "clamp(36px, 5.5vw, 64px)", fontWeight: 400, color: C.text, lineHeight: 1.08, marginBottom: 32, letterSpacing: -1 }}>Wherever an individual creates value — as a worker, a creator, or a builder — <span style={{ color: C.accent }}>a platform is extracting from them.</span></h1></FadeIn>
      <FadeIn delay={0.2}><p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 17, lineHeight: 1.7, color: C.textMuted, maxWidth: 580, marginBottom: 48 }}>Three core products. Three points of extraction. One thesis. Scroll the specification — or open the terminal and <span style={{ fontFamily: "'JetBrains Mono', monospace", color: C.green, fontSize: 14 }}>inspect</span> it yourself.</p></FadeIn>
      <FadeIn delay={0.3}><div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}><a href="#triangle" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: C.bg, background: C.accent, padding: "12px 24px", textDecoration: "none" }}>The core triangle →</a><a href="#source" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: C.accent, border: `1px solid ${C.accent}`, padding: "12px 24px", textDecoration: "none", background: "transparent" }}>View source</a></div></FadeIn>
      <FadeIn delay={0.4}><div style={{ display: "flex", gap: 2, marginTop: 80 }}>{s.map(x => <div key={x.label} style={{ flex: 1, background: C.bgCard, border: `1px solid ${C.border}`, padding: "20px 16px", textAlign: "center" }}><div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 24, color: C.text, lineHeight: 1, marginBottom: 6 }}>{x.value}</div><div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: C.textDim }}>{x.label}</div></div>)}</div></FadeIn>
    </section>
  );
}

function ThesisSection() {
  return (
    <section id="thesis" style={{ padding: "120px 48px", maxWidth: 920, margin: "0 auto" }}>
      <FadeIn><p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: C.accent, marginBottom: 12 }}>01 — The Thesis</p><h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 400, color: C.text, lineHeight: 1.2, marginBottom: 16 }}>Extraction is the business model.<br />Correction is the market opportunity.</h2><p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 16, lineHeight: 1.7, color: C.textMuted, marginBottom: 56, maxWidth: 600 }}>The platforms that mediate work, creativity, and commerce extract value from the people who create it. Extractive models leave massive underserved segments — those segments are where the growth is.</p></FadeIn>
      {Object.values(PRODUCTS).map((p, i) => (
        <FadeIn key={p.name} delay={i * 0.08}><div style={{ background: C.bgCard, border: `1px solid ${C.border}`, padding: "28px 32px", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14, flexWrap: "wrap" }}><span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: 1, textTransform: "uppercase", color: p.color, background: p.colorDim, padding: "4px 10px" }}>{p.name}</span><span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 500, color: C.red }}>{p.tagline}</span></div>
          <div style={{ display: "flex", gap: 16, marginBottom: 16, flexWrap: "wrap" }}>{p.stats.map(s => <div key={s.label} style={{ background: C.bg, border: `1px solid ${C.border}`, padding: "10px 16px", textAlign: "center", minWidth: 100, flex: 1 }}><div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 22, color: C.text, lineHeight: 1, marginBottom: 4 }}>{s.value}</div><div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8, color: C.textDim }}>{s.label}</div></div>)}</div>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, lineHeight: 1.7, color: C.textDim, margin: "0 0 14px" }}>{p.extraction}</p>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: p.color, fontWeight: 500 }}>→ {p.intervention}</div>
        </div></FadeIn>
      ))}
    </section>
  );
}

function TriangleSection() {
  const [active, setActive] = useState("relevnt"); const [showRes, setShowRes] = useState(false);
  const p = PRODUCTS[active];
  return (
    <section id="triangle" style={{ padding: "120px 48px", maxWidth: 920, margin: "0 auto" }}>
      <FadeIn><p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: C.accent, marginBottom: 12 }}>02 — The Core Triangle</p><h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 400, color: C.text, lineHeight: 1.2, marginBottom: 16 }}>Workers. Creators. Builders.<br />Three interventions. One architecture.</h2><p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 16, lineHeight: 1.7, color: C.textMuted, marginBottom: 56, maxWidth: 600 }}>Each product addresses a different point in the extraction cycle. Together they form a single thesis about individual economic agency.</p></FadeIn>
      <FadeIn delay={0.1}><div style={{ display: "flex", gap: 2, marginBottom: 2 }}>{Object.entries(PRODUCTS).map(([k, tp]) => <button key={k} onClick={() => { setActive(k); setShowRes(false); }} style={{ flex: 1, padding: "16px 12px", border: "none", cursor: "pointer", background: active === k ? C.bgCard : C.bgAlt, borderBottom: active === k ? `2px solid ${tp.color}` : "2px solid transparent" }}><div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 600, color: active === k ? tp.color : C.textDim }}>{tp.name}</div><div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: C.textDim, marginTop: 4 }}>{tp.market} {tp.marketLabel}</div></button>)}</div></FadeIn>
      <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderTop: "none", padding: 32 }}>
        {p.buildStats && <div style={{ display: "flex", gap: 2, marginBottom: 20 }}>{p.buildStats.map(s => <div key={s.label} style={{ flex: 1, background: C.bg, border: `1px solid ${C.border}`, padding: "14px 12px", textAlign: "center" }}><div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 24, color: p.color, lineHeight: 1, marginBottom: 4 }}>{s.value}</div><div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8, color: C.textDim }}>{s.label}</div></div>)}</div>}
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, lineHeight: 1.8, color: C.textMuted, marginBottom: 20 }}>{p.description}</p>
        <div style={{ display: "flex", gap: 20, marginBottom: 20, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 240 }}><div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, letterSpacing: 1, textTransform: "uppercase", color: C.textDim, marginBottom: 10 }}>Tech</div><div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>{p.techSignals.map(t => <span key={t} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: C.textMuted, background: C.bg, border: `1px solid ${C.border}`, padding: "3px 7px" }}>{t}</span>)}</div></div>
          <div style={{ minWidth: 160 }}><div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, letterSpacing: 1, textTransform: "uppercase", color: C.textDim, marginBottom: 10 }}>Market</div><div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32, color: p.color, lineHeight: 1 }}>{p.market}</div><div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: C.textDim, marginTop: 4 }}>{p.cagr} → {p.marketProjection}</div></div>
        </div>
        <div style={{ background: C.bg, border: `1px solid ${C.border}`, padding: "16px 20px", marginBottom: 16 }}><div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, letterSpacing: 1, textTransform: "uppercase", color: C.textDim, marginBottom: 8 }}>Extraction → Correction</div><div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}><div style={{ flex: 1, minWidth: 200 }}><p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, lineHeight: 1.6, color: C.red, margin: 0 }}>{p.extraction}</p></div><div style={{ flex: 1, minWidth: 200 }}><p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, lineHeight: 1.6, color: C.green, margin: 0 }}>{p.correction}</p></div></div></div>
        <button onClick={() => setShowRes(!showRes)} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: C.accent, background: C.accentDim, border: `1px solid ${C.accent}30`, padding: "8px 16px", cursor: "pointer", width: "100%", textAlign: "left" }}>{showRes ? "▾" : "▸"} Research ({p.research.length} sources)</button>
        {showRes && <div style={{ padding: "16px 0 0" }}>{p.research.map((r, i) => <div key={i} style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, lineHeight: 1.6, color: C.textMuted, padding: "6px 0", borderBottom: `1px solid ${C.border}` }}><span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: C.textDim, marginRight: 8 }}>{String(i+1).padStart(2,"0")}</span>{r}</div>)}</div>}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, paddingTop: 16, marginTop: 16, borderTop: `1px solid ${C.border}` }}><div style={{ display: "flex", gap: 8 }}><span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: C.green, background: C.greenDim, padding: "3px 8px" }}>Alpha</span>{p.firstCommit && <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: C.textDim }}>since {p.firstCommit}</span>}</div><span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: p.color }}>github.com/{p.repo}</span></div>
      </div>
    </section>
  );
}

function EcosystemSection() {
  return <section id="ecosystem" style={{ padding: "120px 48px", maxWidth: 920, margin: "0 auto" }}><FadeIn><p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: C.accent, marginBottom: 12 }}>03 — The Expanding Ecosystem</p><h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 400, color: C.text, lineHeight: 1.2, marginBottom: 16 }}>The triangle is the thesis.<br />The ecosystem is the vision.</h2><p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 16, lineHeight: 1.7, color: C.textMuted, marginBottom: 56, maxWidth: 600 }}>Five additional products extend the core into career access, marketing operations, immigration intelligence, and legal advocacy.</p></FadeIn>{ECOSYSTEM.map((p, i) => <FadeIn key={p.name} delay={i * 0.06}><div style={{ background: C.bgAlt, border: `1px solid ${C.border}`, padding: "20px 28px", marginBottom: 2, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}><div style={{ flex: 1, minWidth: 240 }}><div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}><span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 600, color: p.color }}>{p.name}</span><span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: C.textDim, background: C.bg, border: `1px solid ${C.border}`, padding: "2px 6px" }}>{p.relation}</span></div><p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, lineHeight: 1.6, color: C.textMuted, margin: 0 }}>{p.desc}</p></div><span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: C.green, background: C.greenDim, padding: "3px 8px" }}>Alpha</span></div></FadeIn>)}</section>;
}

function BuilderSection() {
  return <section id="builder" style={{ padding: "120px 48px", maxWidth: 920, margin: "0 auto" }}><FadeIn><p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: C.accent, marginBottom: 12 }}>04 — The Builder</p><h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 400, color: C.text, lineHeight: 1.2, marginBottom: 16 }}>Built from necessity.<br />Scaled by conviction.</h2><p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 16, lineHeight: 1.7, color: C.textMuted, marginBottom: 56, maxWidth: 600 }}>Every product traces back to institutional failure — and a decision to build the thing that should have existed.</p></FadeIn><div style={{ position: "relative", marginBottom: 64 }}><div style={{ position: "absolute", left: 23, top: 0, bottom: 0, width: 1, background: `linear-gradient(to bottom, ${C.accent}, ${C.border})` }} />{ORIGIN.map((s, i) => <FadeIn key={s.title} delay={i * 0.1}><div style={{ display: "flex", gap: 28, marginBottom: 40, position: "relative" }}><div style={{ flexShrink: 0, width: 48 }}><div style={{ width: 48, height: 48, borderRadius: "50%", background: C.bgCard, border: `2px solid ${i === ORIGIN.length-1 ? C.accent : C.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: i === ORIGIN.length-1 ? C.accent : C.textDim, position: "relative", zIndex: 2 }}>{String(i+1).padStart(2,"0")}</div></div><div style={{ flex: 1 }}><div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, flexWrap: "wrap" }}><span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: 1, textTransform: "uppercase", color: C.accent, background: C.accentDim, padding: "3px 8px" }}>{s.label}</span><span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: C.textDim }}>{s.year}</span></div><h3 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 17, fontWeight: 600, color: C.text, margin: "0 0 8px" }}>{s.title}</h3><p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, lineHeight: 1.7, color: C.textMuted, margin: "0 0 10px" }}>{s.body}</p><p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: C.accent, margin: 0 }}>→ {s.signal}</p></div></div></FadeIn>)}</div></section>;
}

function SourceSection({ ghData }) {
  const { repos, loading, live } = ghData;
  const displayRepos = repos || REPOS_META.map(r => ({ name: r.name, ghName: r.ghName, ...r.fallback, live: false }));

  return (
    <section id="source" style={{ padding: "120px 48px 200px", maxWidth: 920, margin: "0 auto" }}>
      <FadeIn><p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: C.accent, marginBottom: 12 }}>05 — View Source</p><h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 400, color: C.text, lineHeight: 1.2, marginBottom: 16 }}>Transparency is the product.</h2><p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 16, lineHeight: 1.7, color: C.textMuted, marginBottom: 48, maxWidth: 600 }}>Every claim is backed by code that exists and infrastructure that's live. Open the terminal and verify it yourself.</p></FadeIn>

      <FadeIn delay={0.1}>
        <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, padding: 28, marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: C.textDim, letterSpacing: 1, textTransform: "uppercase" }}>Repositories</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: live ? C.green : C.textDim, display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: live ? C.green : C.textDim, display: "inline-block", animation: live ? "pulse 2s infinite" : "none" }} />
              {loading ? "fetching..." : live ? "live from GitHub" : "cached data"}
            </span>
          </div>
          {displayRepos.map(r => (
            <div key={r.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${C.border}`, padding: "10px 0", fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>
              <a href={`https://github.com/${GH_ORG}/${r.ghName}`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                <span style={{ color: C.textDim }}>{GH_ORG}/</span>
                <span style={{ color: C.accent }}>{r.name}</span>
              </a>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                {r.language && <span style={{ fontSize: 9, color: C.textDim }}>{r.language}</span>}
                {r.deployed && <span style={{ fontSize: 9, color: C.green, background: C.greenDim, padding: "2px 6px" }}>deployed</span>}
                {r.pushedAt && <span style={{ fontSize: 9, color: C.textDim }}>{timeAgo(r.pushedAt)}</span>}
                {r.prs && <span style={{ fontSize: 10, color: C.textDim }}>{r.prs} PRs</span>}
                {r.commits && <span style={{ fontSize: 10, color: r.live ? C.text : C.textDim }}>{r.commits}{r.live ? "" : ""}</span>}
                {r.stars > 0 && <span style={{ fontSize: 10, color: C.yellow }}>★ {r.stars}</span>}
              </div>
            </div>
          ))}
        </div>
      </FadeIn>

      <FadeIn delay={0.15}>
        <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, padding: 28, marginBottom: 20 }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: C.textDim, marginBottom: 16, letterSpacing: 1, textTransform: "uppercase" }}>Shared Infrastructure</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            {["React 18–19","TypeScript 5","Supabase","Netlify Functions","Tailwind CSS","Vite","Stripe","OpenAI","Anthropic","Gemini","DeepSeek","Mistral","Cohere","Brave Search","Tavily","Cloudinary","PostHog","Zustand","TanStack Query","Zod","Playwright","Vitest","Storybook","NestJS","Next.js 14","Socket.io"].map(t => <span key={t} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: C.textMuted, background: C.bg, border: `1px solid ${C.border}`, padding: "3px 7px" }}>{t}</span>)}
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={0.2}>
        <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 48, marginTop: 32, textAlign: "center" }}>
          <p style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 26, color: C.text, lineHeight: 1.4, marginBottom: 8, fontWeight: 400 }}>"When I see systemic gaps, I build the tools to solve them."</p>
          <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: C.textDim, marginBottom: 32 }}>— Sarah Sahl, Founder</p>
          <a href="mailto:sarah@thepennylaneproject.org" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: C.bg, background: C.accent, padding: "14px 32px", textDecoration: "none", display: "inline-block" }}>Start a conversation →</a>
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
      <Divider />
      <EcosystemSection />
      <Divider />
      <BuilderSection />
      <Divider />
      <SourceSection ghData={ghData} />
      <footer style={{ borderTop: `1px solid ${C.border}`, padding: "20px 48px", display: "flex", justifyContent: "space-between", fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: C.textDim }}><span>© 2026 The Penny Lane Project</span><span>view-source v0.5</span></footer>
      <Terminal isOpen={to} onToggle={() => setTo(!to)} />
    </div>
  );
}
