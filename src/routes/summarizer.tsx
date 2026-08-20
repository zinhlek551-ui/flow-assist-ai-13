import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Copy, Download, ListPlus, Loader2, FileText } from "lucide-react";
import { AppShell, Pipeline } from "@/components/AppShell";
import { summarizeMeeting } from "@/lib/assistant.functions";
import { useWorkspace } from "@/lib/workspace";

export const Route = createFileRoute("/summarizer")({
  head: () => ({
    meta: [
      { title: "Meeting Notes Summarizer — AI Productivity Assistant" },
      {
        name: "description",
        content:
          "Paste your meeting notes and get a short summary, decisions, action items and deadlines you can turn into tasks.",
      },
      { property: "og:title", content: "Meeting Notes Summarizer" },
      {
        property: "og:description",
        content: "Turn raw meeting notes into a clear summary with owners and deadlines.",
      },
    ],
  }),
  component: SummarizerPage,
});

function SummarizerPage() {
  const { summary, setSummary, addTasks } = useWorkspace();
  const navigate = useNavigate();
  const summarize = useServerFn(summarizeMeeting);

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [participants, setParticipants] = useState("");
  const [notes, setNotes] = useState("");

  const mutation = useMutation({
    mutationFn: async () =>
      summarize({ data: { title, date, participants, notes: notes.trim() } }),
    onSuccess: (result) => {
      setSummary({ title, date, participants, ...result });
      toast.success("Your meeting summary is ready.");
    },
    onError: (err: Error) => toast.error(err.message || "Something went wrong. Please try again."),
  });

  const handleSubmit = () => {
    if (!notes.trim()) {
      toast.error("Please enter your meeting notes first.");
      return;
    }
    mutation.mutate();
  };

  const plainText = summary
    ? [
        summary.title || "Meeting summary",
        summary.date && `Date: ${summary.date}`,
        summary.participants && `Participants: ${summary.participants}`,
        "",
        "Summary:",
        summary.summary,
        "",
        summary.keyPoints?.length ? "Key points:" : "",
        ...(summary.keyPoints ?? []).map((p) => `- ${p}`),
        summary.decisions?.length ? "\nDecisions:" : "",
        ...(summary.decisions ?? []).map((p) => `- ${p}`),
        summary.actionItems?.length ? "\nAction items:" : "",
        ...(summary.actionItems ?? []).map(
          (a) =>
            `- ${a.task}${a.owner ? ` (${a.owner})` : ""}${a.deadline ? ` — due ${a.deadline}` : ""}`,
        ),
        summary.dates?.length ? "\nImportant dates:" : "",
        ...(summary.dates ?? []).map((p) => `- ${p}`),
      ]
        .filter(Boolean)
        .join("\n")
    : "";

  const copy = async () => {
    await navigator.clipboard.writeText(plainText);
    toast.success("Summary copied.");
  };

  const download = () => {
    const blob = new Blob([plainText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(summary?.title || "meeting-summary").replace(/\s+/g, "-").toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const createTasks = () => {
    const items = summary?.actionItems ?? [];
    if (!items.length) {
      toast.error("This summary has no action items to send to your plan.");
      return;
    }
    const count = addTasks(
      items.map((a) => ({
        title: a.task,
        owner: a.owner ?? "",
        deadline: a.deadline ?? "",
        description: summary?.title ? `From meeting: ${summary.title}` : "",
        source: "From meeting notes",
      })),
    );
    toast.success(`${count} task${count === 1 ? "" : "s"} added to your Task Planner.`);
    navigate({ to: "/planner" });
  };

  return (
    <AppShell>
      <div className="space-y-8">
        <Pipeline active="summarizer" />

        <header className="space-y-2">
          <h1 className="text-2xl font-medium tracking-tight">Meeting Notes Summarizer</h1>
          <p className="text-sm text-muted-foreground">
            Paste what was said in the meeting. You'll get a short summary, the decisions, and who
            needs to do what.
          </p>
        </header>

        <section className="space-y-4 rounded-xl bg-surface p-5 ring-1 ring-hairline">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Meeting title">
              <input
                className={inputClass}
                placeholder="Weekly team sync"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </Field>
            <Field label="Date">
              <input
                type="date"
                className={inputClass}
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </Field>
          </div>
          <Field label="Participants">
            <input
              className={inputClass}
              placeholder="John, Sarah, Marcus"
              value={participants}
              onChange={(e) => setParticipants(e.target.value)}
            />
          </Field>
          <Field label="Meeting notes" hint="Required">
            <textarea
              className={`${inputClass} min-h-40 resize-y`}
              placeholder="John must finish the report by Friday. We agreed to launch in March…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </Field>
          <button
            onClick={handleSubmit}
            disabled={mutation.isPending}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand py-2.5 text-sm font-medium text-brand-foreground disabled:opacity-60"
          >
            {mutation.isPending && <Loader2 className="size-4 animate-spin" />}
            {mutation.isPending ? "Reading your notes…" : "Summarize Meeting"}
          </button>
        </section>

        {!summary && !mutation.isPending && (
          <div className="rounded-xl border border-dashed border-border p-8 text-center">
            <FileText className="mx-auto size-6 text-muted-foreground" strokeWidth={1.5} />
            <p className="mt-3 text-sm font-medium">No summary yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Add your notes above and we'll pull out the important parts.
            </p>
          </div>
        )}

        {summary && (
          <section className="space-y-6 border-t border-hairline pt-8">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium">{summary.title || "Meeting summary"}</h2>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Result
              </span>
            </div>

            <div className="space-y-6 rounded-xl bg-surface p-6 ring-1 ring-hairline">
              <Block title="Summary">
                <p className="text-sm leading-relaxed text-secondary-foreground">
                  {summary.summary}
                </p>
              </Block>

              {!!summary.keyPoints?.length && (
                <Block title="Key discussion points">
                  <BulletList items={summary.keyPoints} />
                </Block>
              )}

              {!!summary.decisions?.length && (
                <Block title="Decisions made">
                  <BulletList items={summary.decisions} />
                </Block>
              )}

              {!!summary.actionItems?.length && (
                <Block title="Action items">
                  <ul className="space-y-3">
                    {summary.actionItems.map((a, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="mt-1 size-4 shrink-0 rounded border border-border" />
                        <span className="text-sm">
                          <span className="block font-medium">{a.task}</span>
                          {(a.owner || a.deadline) && (
                            <span className="block text-muted-foreground">
                              {[a.owner && `Assigned to ${a.owner}`, a.deadline && `Due ${a.deadline}`]
                                .filter(Boolean)
                                .join(" • ")}
                            </span>
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                </Block>
              )}

              {!!summary.dates?.length && (
                <Block title="Deadlines & important dates">
                  <BulletList items={summary.dates} />
                </Block>
              )}

              <div className="flex flex-col gap-2 pt-2">
                <button
                  onClick={createTasks}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand py-2.5 text-sm font-medium text-brand-foreground"
                >
                  <ListPlus className="size-4" />
                  Create {summary.actionItems?.length ?? 0} Task
                  {(summary.actionItems?.length ?? 0) === 1 ? "" : "s"}
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={copy}
                    className="flex items-center justify-center gap-2 rounded-lg bg-surface-2 py-2 text-sm font-medium ring-1 ring-hairline"
                  >
                    <Copy className="size-4" /> Copy Summary
                  </button>
                  <button
                    onClick={download}
                    className="flex items-center justify-center gap-2 rounded-lg bg-surface-2 py-2 text-sm font-medium ring-1 ring-hairline"
                  >
                    <Download className="size-4" /> Download
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </AppShell>
  );
}

export const inputClass =
  "w-full rounded-lg border border-border bg-canvas px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:border-brand focus:ring-2 focus:ring-brand/15";

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="flex items-center justify-between text-xs font-medium text-muted-foreground">
        {label}
        {hint && <span className="text-[10px] uppercase tracking-wider">{hint}</span>}
      </span>
      {children}
    </label>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h3>
      {children}
    </div>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1.5">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2 text-sm text-secondary-foreground">
          <span className="mt-2 size-1 shrink-0 rounded-full bg-brand" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
