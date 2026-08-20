import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, FileText, ListChecks, Mail } from "lucide-react";
import { AppShell, Pipeline } from "@/components/AppShell";
import { useWorkspace } from "@/lib/workspace";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AI Productivity Assistant — Meetings, Tasks & Emails" },
      {
        name: "description",
        content:
          "Turn meetings, ideas and tasks into organized action: summarize meeting notes, plan tasks, and write emails in one connected workspace.",
      },
      { property: "og:title", content: "AI Productivity Assistant" },
      {
        property: "og:description",
        content: "Turn meetings, ideas and tasks into organized action.",
      },
    ],
  }),
  component: Dashboard,
});

const TOOLS = [
  {
    to: "/summarizer",
    icon: FileText,
    title: "Meeting Notes Summarizer",
    body: "Turn your meeting notes into a short summary, the decisions made, and clear action items.",
    cta: "Open Summarizer",
  },
  {
    to: "/planner",
    icon: ListChecks,
    title: "AI Task Planner",
    body: "Turn a goal or task into a clear step-by-step plan you can track from start to finish.",
    cta: "Open Task Planner",
  },
  {
    to: "/email",
    icon: Mail,
    title: "Smart Email Generator",
    body: "Quickly write professional, natural-sounding emails about your work — in any tone.",
    cta: "Open Email Generator",
  },
] as const;

function Dashboard() {
  const { tasks, summary, hydrated } = useWorkspace();
  const completed = tasks.filter((t) => t.status === "Completed").length;
  const percent = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;

  return (
    <AppShell>
      <div className="space-y-10">
        <header className="space-y-3">
          <h1 className="text-3xl font-medium leading-tight tracking-tight text-balance">
            AI Productivity Assistant
          </h1>
          <p className="text-pretty text-base text-muted-foreground">
            Turn meetings, ideas and tasks into organized action.
          </p>
        </header>

        <Pipeline active="dashboard" />

        <section className="space-y-4">
          {TOOLS.map((tool) => (
            <div key={tool.to} className="space-y-4 rounded-xl bg-surface p-5 ring-1 ring-hairline">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <h2 className="text-sm font-semibold">{tool.title}</h2>
                  <p className="max-w-[46ch] text-sm text-muted-foreground">{tool.body}</p>
                </div>
                <span className="rounded-md bg-surface-2 p-2 ring-1 ring-hairline">
                  <tool.icon className="size-4 text-secondary-foreground" strokeWidth={1.75} />
                </span>
              </div>
              <Link
                to={tool.to}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand py-2.5 text-sm font-medium text-brand-foreground"
              >
                {tool.cta}
                <ArrowRight className="size-4" />
              </Link>
            </div>
          ))}
        </section>

        {hydrated && (tasks.length > 0 || summary) && (
          <section className="space-y-4 border-t border-hairline pt-8">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium">Where you left off</h2>
              {tasks.length > 0 && (
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <span>{percent}% complete</span>
                  <span className="h-1.5 w-16 overflow-hidden rounded-full bg-surface-2">
                    <span
                      className="block h-full rounded-full bg-brand"
                      style={{ width: `${percent}%` }}
                    />
                  </span>
                </div>
              )}
            </div>

            {summary && (
              <Link
                to="/summarizer"
                className="block rounded-xl bg-surface p-4 ring-1 ring-hairline"
              >
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Last summary
                </p>
                <p className="mt-1 text-sm font-medium">{summary.title || "Meeting summary"}</p>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{summary.summary}</p>
              </Link>
            )}

            {tasks.length > 0 && (
              <div className="divide-y divide-hairline overflow-hidden rounded-xl bg-surface ring-1 ring-hairline">
                {tasks.slice(0, 3).map((task) => (
                  <div key={task.id} className="flex items-center justify-between gap-3 p-4">
                    <span className="truncate text-sm font-medium">{task.title}</span>
                    <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {task.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {hydrated && tasks.length === 0 && !summary && (
          <p className="text-sm text-muted-foreground">
            Start with your meeting notes — the action items become tasks, and each task can become
            an email.
          </p>
        )}
      </div>
    </AppShell>
  );
}
