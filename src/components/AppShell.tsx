import { Link } from "@tanstack/react-router";
import { LayoutDashboard, FileText, ListChecks, Mail } from "lucide-react";
import type { ReactNode } from "react";

const NAV = [
  { to: "/", label: "Dashboard", short: "Home", icon: LayoutDashboard },
  { to: "/summarizer", label: "Meeting Summarizer", short: "Notes", icon: FileText },
  { to: "/planner", label: "Task Planner", short: "Tasks", icon: ListChecks },
  { to: "/email", label: "Email Generator", short: "Email", icon: Mail },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-canvas text-foreground antialiased">
      <nav className="sticky top-0 z-50 border-b border-hairline bg-canvas/80 px-4 py-3 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-6">
          <Link to="/" className="flex shrink-0 items-center gap-2">
            <span className="flex size-6 items-center justify-center rounded-md bg-brand">
              <span className="size-2 rounded-full bg-brand-foreground" />
            </span>
            <span className="text-sm font-semibold tracking-tight">AI Productivity Assistant</span>
          </Link>
          <div className="hidden items-center gap-1 md:flex">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.to === "/" }}
                className="rounded-full px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                activeProps={{ className: "bg-brand text-brand-foreground hover:text-brand-foreground" }}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-2xl px-4 py-8 pb-28 md:pb-12">{children}</main>

      <div className="fixed inset-x-0 bottom-0 z-50 flex items-center justify-between border-t border-hairline bg-canvas/90 px-6 py-3 backdrop-blur-lg md:hidden">
        {NAV.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            activeOptions={{ exact: item.to === "/" }}
            className="flex flex-col items-center gap-1 text-muted-foreground"
            activeProps={{ className: "text-brand" }}
          >
            <item.icon className="size-5" strokeWidth={1.75} />
            <span className="text-[10px] font-medium">{item.short}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function Pipeline({ active }: { active: "dashboard" | "summarizer" | "planner" | "email" }) {
  const steps = [
    { id: "dashboard", label: "Dashboard" },
    { id: "summarizer", label: "Summarizer" },
    { id: "planner", label: "Planner" },
    { id: "email", label: "Email" },
  ] as const;
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2">
      {steps.map((step, i) => (
        <div key={step.id} className="flex shrink-0 items-center gap-2">
          {i > 0 && <span className="size-1 shrink-0 rounded-full bg-border" />}
          <span
            className={
              step.id === active
                ? "shrink-0 rounded-full bg-brand px-3 py-1.5 text-xs font-medium text-brand-foreground"
                : "shrink-0 rounded-full border border-hairline bg-surface px-3 py-1.5 text-xs font-medium text-muted-foreground"
            }
          >
            {step.label}
          </span>
        </div>
      ))}
    </div>
  );
}
