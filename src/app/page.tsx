'use client';

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Code2,
  Cpu,
  Database,
  Layers,
  Lock,
  Play,
  Rocket,
  Server,
  ShieldAlert,
  Sparkles,
  Terminal,
  Truck,
  Zap,
} from "lucide-react";

const featureCards = [
  {
    title: "Concurrency Mutex Lock",
    description: "Real-time blockage prevents double-booked vehicles and drivers before dispatch is confirmed.",
    body: (
      <div className="space-y-3">
        <div className="flex items-center justify-between rounded-2xl border border-cyan-500/20 bg-slate-950/90 px-4 py-3 text-sm text-slate-300">
          <span>Vehicle / Driver pair</span>
          <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-cyan-300">Locked</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-900">
          <div className="h-full w-[78%] rounded-full bg-linear-to-r from-cyan-400 to-violet-500" />
        </div>
      </div>
    ),
    icon: Lock,
  },
  {
    title: "Cargo Overload Shield",
    description: "A dynamic capacity monitor that flashes red when payload exceeds safe vehicle load thresholds.",
    body: (
      <div className="space-y-3">
        <div className="rounded-2xl border border-white/10 bg-slate-950/90 p-4 text-left text-sm text-slate-300">
          <div className="mb-2 flex items-center justify-between">
            <span>Payload</span>
            <span className="text-sm font-semibold text-rose-400">88%</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-white/5">
            <div className="h-full w-[88%] rounded-full bg-linear-to-r from-rose-500 via-orange-400 to-cyan-400" />
          </div>
        </div>
        <p className="text-xs uppercase tracking-[0.25em] text-rose-400">Core alert: capacity breach</p>
      </div>
    ),
    icon: ShieldAlert,
  },
  {
    title: "Autonomous Expiration Radar",
    description: "A live calendar scan flags expired licenses and certificates the instant a route is assembled.",
    body: (
      <div className="space-y-3">
        <div className="grid grid-cols-[1.2fr_0.8fr] gap-2 rounded-2xl border border-white/10 bg-slate-950/90 p-3 text-sm text-slate-300">
          <div className="space-y-1">
            <p className="font-semibold text-white">Driver license</p>
            <p className="text-xs text-slate-500">Status expired</p>
          </div>
          <div className="flex items-center justify-end rounded-2xl bg-rose-500/15 px-3 py-2 text-rose-300">01:12:34</div>
        </div>
        <div className="rounded-2xl border border-cyan-500/15 bg-slate-900/80 p-3 text-xs text-slate-400">
          <div className="mb-1 flex items-center justify-between text-slate-300">
            <span>Expired</span>
            <span>5</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/5">
            <div className="h-full w-full rounded-full bg-rose-500" />
          </div>
        </div>
      </div>
    ),
    icon: CalendarDays,
  },
  {
    title: "Automated Status Loop",
    description: "A real-time flow chart smoothly reverses state while preserving audit trail and recovery rules.",
    body: (
      <div className="space-y-3">
        <div className="grid gap-2 rounded-3xl border border-cyan-500/15 bg-slate-950/90 p-4 text-sm text-slate-300">
          {[
            { label: "Available", accent: "from-cyan-400 to-violet-500" },
            { label: "On Trip", accent: "from-violet-500 to-cyan-400" },
            { label: "In Shop", accent: "from-slate-500 to-rose-500" },
          ].map((step) => (
            <div key={step.label} className="flex items-center justify-between rounded-2xl bg-slate-900/70 px-3 py-2">
              <span>{step.label}</span>
              <span className={`inline-flex rounded-full bg-linear-to-r ${step.accent} px-2 py-1 text-[11px] uppercase tracking-[0.2em] text-white/90`}>active</span>
            </div>
          ))}
        </div>
        <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Loop refresh every 4s</p>
      </div>
    ),
    icon: Layers,
  },
];

const techStack = [
  {
    title: "Supabase PostgreSQL",
    description: "Immutable relational core with real-time row security and locked transaction snapshots.",
    icon: Database,
  },
  {
    title: "Prisma ORM Locks",
    description: "Transactional guardrails with optimistic updates, constraint enforcement, and schema-driven safety.",
    icon: Code2,
  },
  {
    title: "Serverless Edge Handlers",
    description: "Fast global dispatch routing with microsecond cold starts and predictable compute flows.",
    icon: Server,
  },
  {
    title: "Vercel Edge Speeds",
    description: "Instant UI hydration and edge caching for mission-critical transport operations.",
    icon: Rocket,
  },
];

export default function Home() {
  const [isDispatched, setIsDispatched] = useState(false);
  const [animatedRoi, setAnimatedRoi] = useState(0);
  const [isHeaderShrunk, setIsHeaderShrunk] = useState(false);

  useEffect(() => {
    if (!isDispatched) return;
    let frame: number;
    const start = performance.now();
    const duration = 900;
    const target = 28.4;

    const animate = (time: number) => {
      const progress = Math.min((time - start) / duration, 1);
      setAnimatedRoi(parseFloat((target * progress).toFixed(1)));
      if (progress < 1) {
        frame = requestAnimationFrame(animate);
      }
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [isDispatched]);

  useEffect(() => {
    const onScroll = () => {
      setIsHeaderShrunk(window.scrollY > 20);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const stackCards = useMemo(
    () =>
      techStack.map((item) => (
        <div key={item.title} className="group relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-slate-950/80 p-6 transition duration-300 hover:-translate-y-1 hover:border-cyan-400/40 hover:bg-slate-900/90">
          <div className="absolute inset-x-4 top-0 h-20 bg-linear-to-br from-cyan-500/10 via-transparent to-violet-500/0 blur-2xl opacity-80" />
          <div className="relative z-10 space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-3xl border border-cyan-400/20 bg-white/5 text-cyan-300">
              <item.icon className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold text-white">{item.title}</h3>
            <p className="text-sm leading-6 text-slate-400">{item.description}</p>
          </div>
        </div>
      )),
    []
  );

  return (
    <main className="relative overflow-hidden bg-[#090A0F] text-slate-100">
      <div className="pointer-events-none absolute inset-0 animate-drift bg-[radial-gradient(circle_at_top,rgba(0,240,255,0.08),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(139,92,246,0.08),transparent_25%)]" />
      <div className="pointer-events-none absolute inset-0 animate-drift bg-[linear-gradient(180deg,rgba(10,13,22,0.42),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(255,255,255,0.02),rgba(255,255,255,0.02) 1px,transparent 1px,transparent 24px)] mix-blend-overlay opacity-10" />

      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0f121b]/95 backdrop-blur-xl transition-all duration-300 animate-fade-in-up" style={{ animationDelay: "0.08s" }}>
        <div className={`mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 transition-[height,gap] duration-300 ${isHeaderShrunk ? "h-16 gap-4" : "h-20 gap-8"}`}>
          <Link href="/" className={`flex items-center gap-3 ${isHeaderShrunk ? "text-[0.75rem]" : "text-sm"} font-semibold uppercase tracking-[0.28em] text-cyan-300 transition-all duration-300`}>
            <span className={`${isHeaderShrunk ? "h-9 w-9" : "h-11 w-11"} grid place-items-center rounded-2xl border border-cyan-400/20 bg-cyan-500/10 text-cyan-200 shadow-[0_0_24px_-10px_rgba(0,240,255,0.7)] animate-glow transition-all duration-300`}>
              <Truck className={isHeaderShrunk ? "h-4 w-4" : "h-5 w-5"} />
            </span>
            <span className="text-white">TranSync</span>
          </Link>

          <nav className={`hidden items-center justify-center gap-6 text-xs uppercase tracking-[0.28em] text-slate-400 md:flex animate-fade-in-up ${isHeaderShrunk ? "opacity-90" : "opacity-100"}`} style={{ animationDelay: "0.16s" }}>
            <a href="#features" className="transition hover:text-cyan-200">Features</a>
            <a href="#architecture" className="transition hover:text-cyan-200">Architecture</a>
            <a href="#security" className="transition hover:text-cyan-200">Security</a>
            <a href="#live-demo" className="transition hover:text-cyan-200">Live Demo</a>
          </nav>

          <div className={`flex items-center gap-3 animate-fade-in-up ${isHeaderShrunk ? "text-xs" : "text-sm"}`} style={{ animationDelay: "0.22s" }}>
            <Link href="/login" className={`inline-flex items-center justify-center rounded-full border border-cyan-400/30 bg-cyan-500/10 ${isHeaderShrunk ? "px-4 py-2" : "px-5 py-3"} font-semibold text-cyan-100 shadow-[0_0_30px_-14px_rgba(0,240,255,0.75)] transition duration-300 hover:border-cyan-300/60 hover:bg-cyan-500/20 hover:-translate-y-0.5`}>
              Login
            </Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden px-4 pb-20 pt-10 sm:px-6 lg:px-8 lg:pt-14">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-center transition-all duration-300">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-3 rounded-full border border-cyan-400/15 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.28em] text-cyan-200 shadow-[0_0_30px_-20px_rgba(0,240,255,0.5)]">
              <Sparkles className="h-4 w-4 text-cyan-300" />
              Unified fleet operations
            </div>
            <div className="space-y-6 animate-fade-in-up" style={{ animationDelay: "0.18s" }}>
              <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-[-0.03em] text-white sm:text-5xl lg:text-6xl">
                One platform for dispatch, maintenance, compliance, and asset control.
              </h1>
              <p className="max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
                TranSync connects vehicles, drivers, trips, fuel, and maintenance into a single command center for transport teams, with live rules, audit trails, and real-time operational visibility.
              </p>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center animate-fade-in-up" style={{ animationDelay: "0.28s" }}>
              <button className="inline-flex items-center justify-center gap-2 rounded-full bg-violet-500 px-6 py-4 text-sm font-semibold text-white shadow-[0_20px_65px_-40px_rgba(139,92,246,0.9)] transition duration-300 hover:-translate-y-0.5 hover:bg-violet-400 animate-glow">
                Demo
                <Play className="h-4 w-4" />
              </button>
              <Link href="/login" className="inline-flex items-center justify-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-6 py-4 text-sm font-semibold text-cyan-100 shadow-[0_0_30px_-14px_rgba(0,240,255,0.75)] transition duration-300 hover:border-cyan-300/60 hover:bg-cyan-500/20 hover:-translate-y-0.5">
                Login
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { label: "Immutable rules", value: "100%" },
                { label: "Downtime saved", value: "32h/mo" },
                { label: "Compliance hits", value: "99.8%" },
              ].map((item) => (
                <div key={item.label} className="rounded-3xl border border-white/10 bg-slate-950/70 p-5 text-sm text-slate-300 shadow-[0_0_60px_-30px_rgba(0,240,255,0.25)]">
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-500">{item.label}</p>
                  <p className="mt-3 text-2xl font-semibold text-white">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-x-0 top-10 -z-10 h-105 rounded-5xl bg-linear-to-b from-cyan-500/10 via-transparent to-transparent blur-3xl" />
            <div className="relative overflow-hidden rounded-4xl border border-white/10 bg-slate-950/80 p-5 shadow-[0_40px_120px_-60px_rgba(0,240,255,0.35)] backdrop-blur-xl animate-fade-in-up" style={{ animationDelay: "0.42s" }}>
              <div className="mb-6 flex items-center justify-between rounded-3xl border border-cyan-500/20 bg-slate-900/80 px-4 py-3 text-sm text-slate-300 animate-glow">
                <span className="text-cyan-200">Fleet Bento Matrix</span>
                <span className="rounded-full bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.25em] text-cyan-100">Live</span>
              </div>
              <div className="grid gap-4 sm:grid-cols-[0.74fr_0.26fr]">
                <div className="space-y-4 rounded-[1.75rem] border border-white/10 bg-slate-950/90 p-4 shadow-[inset_0_0_60px_-40px_rgba(0,255,255,0.12)]">
                  <div className="flex items-center justify-between text-sm text-slate-400">
                    <span>Active vehicles</span>
                    <span className="font-semibold text-white">42</span>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {[
                      { label: "Route density", value: "89%" },
                      { label: "Blocked alerts", value: "12" },
                    ].map((item) => (
                      <div key={item.label} className="rounded-3xl border border-white/10 bg-[#08101e]/90 p-4 text-sm">
                        <p className="text-slate-500">{item.label}</p>
                        <p className="mt-2 text-lg font-semibold text-white">{item.value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-slate-900/80 p-4">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,240,255,0.14),transparent_35%)]" />
                    <div className="relative space-y-4">
                      <div className="h-2 rounded-full bg-slate-800">
                        <div className="h-full w-3/4 rounded-full bg-linear-to-r from-cyan-400 to-violet-500 shadow-[0_0_20px_rgba(0,240,255,0.4)]" />
                      </div>
                      <div className="grid gap-2 text-xs text-slate-400 sm:grid-cols-3">
                        <span>Vehicles</span>
                        <span>Routes</span>
                        <span>Alerts</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="relative grid gap-4">
                  {[
                    { label: "Engine load", value: "73%" },
                    { label: "Dispatch heat", value: "58%" },
                    { label: "Compliance", value: "99.8%" },
                  ].map((item) => (
                    <div key={item.label} className="rounded-[1.75rem] border border-white/10 bg-[#08101e]/90 p-4 text-sm text-slate-300">
                      <p className="text-slate-500">{item.label}</p>
                      <p className="mt-3 text-2xl font-semibold text-white">{item.value}</p>
                    </div>
                  ))}
                  <div className="rounded-[1.75rem] border border-cyan-500/20 bg-slate-950/90 p-4 text-sm">
                    <p className="text-slate-400">Sparklines</p>
                    <div className="mt-4 grid gap-3">
                      {["w-8/12","w-6/12","w-10/12"].map((width, idx) => (
                        <div key={idx} className={`h-2 rounded-full bg-slate-800 ${width}`} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {[
                  { label: "Latency", value: "12ms" },
                  { label: "Audit trails", value: "100%" },
                  { label: "Uptime", value: "99.99%" },
                ].map((item) => (
                  <div key={item.label} className="rounded-3xl border border-white/10 bg-slate-900/80 p-4 text-center text-sm">
                    <p className="text-xs uppercase tracking-[0.25em] text-slate-500">{item.label}</p>
                    <p className="mt-3 text-xl font-semibold text-white">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="relative px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 max-w-2xl space-y-4">
            <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">The rule engine</p>
            <h2 className="text-4xl font-semibold tracking-[-0.03em] text-white sm:text-5xl">A high-density command grid for the four hard architectural pillars.</h2>
            <p className="text-base leading-7 text-slate-400">Each pillar is designed to remove manual coordination and enforce safe, compliant dispatch by default.</p>
          </div>
          <div className="grid gap-5 lg:grid-cols-2">
            {featureCards.map((item, index) => (
              <article key={item.title} className="group relative overflow-hidden rounded-4xl border border-white/10 bg-slate-950/80 p-7 shadow-[0_40px_120px_-70px_rgba(0,240,255,0.35)] transition duration-300 hover:-translate-y-1 hover:border-cyan-400/30 hover:bg-slate-900/95 animate-fade-in-up" style={{ animationDelay: `${0.32 + index * 0.08}s` }}>
                <div className="absolute inset-x-0 top-0 h-24 bg-linear-to-b from-cyan-500/10 to-transparent opacity-80" />
                <div className="relative z-10 space-y-5">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="grid h-12 w-12 place-items-center rounded-3xl border border-cyan-400/20 bg-cyan-500/10 text-cyan-300">
                        <item.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-white">{item.title}</h3>
                        <p className="mt-2 text-sm text-slate-400">{item.description}</p>
                      </div>
                    </div>
                    <span className="inline-flex rounded-full border border-cyan-400/30 bg-cyan-500/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-cyan-200">Live</span>
                  </div>
                  {item.body}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="live-demo" className="relative border-t border-white/10 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.95fr_0.7fr]">
          <div className="space-y-6">
            <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">Try it live</p>
            <h2 className="text-4xl font-semibold tracking-[-0.03em] text-white sm:text-5xl">Trigger dispatch, watch the console compute real ROI.</h2>
            <p className="max-w-2xl text-base leading-7 text-slate-400">Click the dispatch control and see the fleet manifest slide in while the system calculates a mock 28.4% ROI surge in real time.</p>

            <div className="rounded-4xl border border-white/10 bg-slate-950/80 p-6 shadow-[0_40px_80px_-60px_rgba(0,240,255,0.2)]">
              <div className="grid gap-5 sm:grid-cols-[0.85fr_0.45fr]">
                <div className="space-y-4">
                  <div className="rounded-3xl border border-cyan-400/20 bg-slate-900/90 p-5 text-sm text-slate-300">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-white">Dispatch simulator</p>
                      <span className="text-xs uppercase tracking-[0.2em] text-cyan-300">Interactive</span>
                    </div>
                    <p className="mt-4 text-sm text-slate-400">Build a route, fire the dispatch action, and observe the ROI engine trigger assets into optimized flow.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsDispatched(true)}
                    className="inline-flex w-full items-center justify-center gap-3 rounded-full bg-cyan-400 px-6 py-4 text-sm font-semibold text-slate-950 transition duration-300 hover:-translate-y-0.5 hover:bg-cyan-300"
                  >
                    Dispatch Fleet
                    <Zap className="h-4 w-4" />
                  </button>
                </div>
                <div className="rounded-3xl border border-white/10 bg-slate-900/90 p-5 text-center text-slate-300">
                  <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Estimated uplift</p>
                  <p className="mt-3 text-5xl font-semibold text-white">{animatedRoi.toFixed(1)}%</p>
                  <p className="mt-3 text-sm leading-6 text-slate-400">Fleet utilization ROI surge computed instantly upon dispatch.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-4xl border border-white/10 bg-slate-950/90 p-6 shadow-[0_40px_100px_-70px_rgba(139,92,246,0.35)]">
            <span className="absolute left-6 top-6 inline-flex rounded-full bg-cyan-400/10 px-3 py-1 text-xs uppercase tracking-[0.28em] text-cyan-200">Operational manifest</span>
            <div className="mt-8 grid gap-4">
              <div className="space-y-4 rounded-4xl border border-white/10 bg-[#0f1725]/95 p-5 text-sm text-slate-300">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Route prediction</span>
                  <span className="text-cyan-300">Active</span>
                </div>
                <div className="grid gap-2">
                  {[
                    "Dispatch queue cleared",
                    "Driver assignments locked",
                    "Cargo shield engaged",
                    "Compliance token minted",
                  ].map((step) => (
                    <div key={step} className="flex items-center gap-3 rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3">
                      <span className="grid h-8 w-8 place-items-center rounded-2xl bg-cyan-500/10 text-cyan-200">✓</span>
                      <span className="text-sm text-slate-300">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className={`rounded-4xl border border-white/10 bg-slate-950/95 p-5 transition-transform duration-500 ${isDispatched ? "translate-x-0 opacity-100" : "translate-x-6 opacity-0"}`}>
                <div className="flex items-center justify-between text-sm text-slate-400">
                  <span>Pipeline</span>
                  <span className="rounded-full bg-cyan-500/10 px-2 py-1 text-cyan-200">Live</span>
                </div>
                <div className="mt-4 space-y-3">
                  {[
                    "Compute / transactional lock",
                    "Audit metadata attached",
                    "Route validated against compliance",
                    "ROI indicator published",
                  ].map((item) => (
                    <div key={item} className="rounded-2xl border border-white/10 bg-[#08101e]/90 px-4 py-3 text-sm text-slate-300">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="pointer-events-none absolute bottom-6 right-6 h-24 w-24 rounded-full bg-violet-500/10 blur-3xl animate-float" />
          </div>
        </div>
      </section>

      <section id="architecture" className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 max-w-2xl space-y-4">
            <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">Architecture & tech stack visualizer</p>
            <h2 className="text-4xl font-semibold tracking-[-0.03em] text-white sm:text-5xl">Enterprise engine power built for rapid fleet orchestration.</h2>
            <p className="text-base leading-7 text-slate-400">A clean matrix of database, ORM, serverless, and edge tooling designed for transport teams that need reliability without sacrifice.</p>
          </div>
          <div className="grid gap-5 lg:grid-cols-4">
            {stackCards}
          </div>
        </div>
      </section>

      <section id="contact-us" className="relative px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.2fr_0.9fr] lg:items-start">
          <div className="rounded-4xl border border-white/10 bg-slate-950/90 p-10 shadow-[0_20px_90px_-50px_rgba(0,240,255,0.14)]">
            <p className="text-sm uppercase tracking-[0.28em] text-cyan-300">Ready for rollout</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.03em] text-white sm:text-5xl">A complete route from dispatch to audit-ready delivery.</h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-400">TranSync delivers end-to-end fleet orchestration with secure audit trails, automated dispatch, and integrated maintenance workflows.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/login" className="inline-flex items-center justify-center rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300">Open dashboard</Link>
              <a href="#contact-us" className="inline-flex items-center justify-center rounded-full border border-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:border-cyan-300">Contact sales</a>
            </div>
          </div>

          <div className="rounded-4xl border border-white/10 bg-slate-950/90 p-10 shadow-[0_20px_90px_-50px_rgba(0,240,255,0.14)]">
            <p className="text-sm uppercase tracking-[0.28em] text-cyan-300">Contact us</p>
            <h3 className="mt-4 text-3xl font-semibold text-white">Get in touch</h3>
            <p className="mt-3 text-sm leading-7 text-slate-400">Share your fleet requirements, integration needs, and deployment timeline so we can route you to the right operations team.</p>
            <form className="mt-6 grid gap-4">
              <input type="text" placeholder="Your name" className="rounded-3xl border border-white/10 bg-[#08101e] px-4 py-3 text-sm text-slate-100 outline-none focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/20" />
              <input type="email" placeholder="Your email" className="rounded-3xl border border-white/10 bg-[#08101e] px-4 py-3 text-sm text-slate-100 outline-none focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/20" />
              <textarea rows={4} placeholder="How can we help?" className="rounded-3xl border border-white/10 bg-[#08101e] px-4 py-3 text-sm text-slate-100 outline-none focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/20" />
              <button type="submit" className="inline-flex items-center justify-center rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300">Send message</button>
            </form>
          </div>
        </div>
      </section>

      <footer id="security" className="border-t border-white/10 bg-[#05070d] px-4 py-12 sm:px-6 lg:px-8 animate-fade-in-up" style={{ animationDelay: "0.12s" }}>
        <div className="mx-auto max-w-7xl space-y-10">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-3 text-sm uppercase tracking-[0.28em] text-cyan-300">
                <span className="h-2 w-2 rounded-full bg-cyan-300" />
                Command hub
              </div>
              <p className="max-w-xl text-2xl font-semibold tracking-[-0.02em] text-white">A unified landing point for fleet operations, compliance, and live dispatch control.</p>
              <p className="max-w-2xl text-sm leading-7 text-slate-400">TranSync brings dispatch, maintenance, fuel, expenses, and driver workflows into one secure, audit-ready operational platform.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">Product</h3>
                <ul className="mt-4 space-y-3 text-sm text-slate-300">
                  <li><a href="#features" className="transition hover:text-cyan-200">Command engine</a></li>
                  <li><a href="#architecture" className="transition hover:text-cyan-200">Tech stack</a></li>
                  <li><a href="#live-demo" className="transition hover:text-cyan-200">Live simulator</a></li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">Resources</h3>
                <ul className="mt-4 space-y-3 text-sm text-slate-300">
                  <li><a href="#security" className="transition hover:text-cyan-200">Compliance</a></li>
                  <li><a href="/login" className="transition hover:text-cyan-200">Login</a></li>
                  <li><a href="#features" className="transition hover:text-cyan-200">Developer docs</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-sm text-slate-500 sm:flex-row">
            <p>© 2026 TranSync — Built for mission-critical transport operations.</p>
            <div className="flex flex-wrap items-center gap-4 text-slate-400">
              <Link href="#security" className="transition hover:text-cyan-200">Privacy</Link>
              <Link href="#security" className="transition hover:text-cyan-200">Terms</Link>
              <Link href="/login" className="transition hover:text-cyan-200">Login</Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
