import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Copy, Loader2, Mail, RefreshCw, Eraser } from "lucide-react";
import { AppShell, Pipeline } from "@/components/AppShell";
import { Field, inputClass } from "./summarizer";
import { generateEmail } from "@/lib/assistant.functions";
import { useWorkspace } from "@/lib/workspace";

export const Route = createFileRoute("/email")({
  head: () => ({
    meta: [
      { title: "Smart Email Generator — AI Productivity Assistant" },
      {
        name: "description",
        content:
          "Describe your email in a few words and get a natural, professional message with a subject line, in the tone you choose.",
      },
      { property: "og:title", content: "Smart Email Generator" },
      {
        property: "og:description",
        content: "Write clear, human-sounding emails about your tasks in seconds.",
      },
    ],
  }),
  component: EmailPage,
});

const TONES = ["Professional", "Friendly", "Formal", "Apologetic", "Persuasive", "Short & direct"];

function EmailPage() {
  const { emailSeed, setEmailSeed, tasks } = useWorkspace();
  const generate = useServerFn(generateEmail);

  const [recipient, setRecipient] = useState("");
  const [subject, setSubject] = useState("");
  const [details, setDetails] = useState("");
  const [tone, setTone] = useState("Professional");
  const [draftSubject, setDraftSubject] = useState("");
  const [draftBody, setDraftBody] = useState("");

  useEffect(() => {
    if (!emailSeed) return;
    setRecipient(emailSeed.recipient);
    setSubject(emailSeed.subject);
    setDetails(emailSeed.details);
    setEmailSeed(null);
    toast.success("Task details loaded into the form.");
  }, [emailSeed, setEmailSeed]);

  const mutation = useMutation({
    mutationFn: async () => generate({ data: { recipient, subject: subject.trim(), details, tone } }),
    onSuccess: (result) => {
      setDraftSubject(result.subject);
      setDraftBody(result.body);
      toast.success("Your email is ready.");
    },
    onError: (err: Error) => toast.error(err.message || "Something went wrong. Please try again."),
  });

  const handleGenerate = () => {
    if (!subject.trim()) {
      toast.error("Please tell us what the email is about first.");
      return;
    }
    mutation.mutate();
  };

  const clear = () => {
    setRecipient("");
    setSubject("");
    setDetails("");
    setTone("Professional");
    setDraftSubject("");
    setDraftBody("");
  };

  const copy = async () => {
    await navigator.clipboard.writeText(`Subject: ${draftSubject}\n\n${draftBody}`);
    toast.success("Email copied.");
  };

  const openTasks = tasks.filter((t) => t.status !== "Completed").slice(0, 3);

  return (
    <AppShell>
      <div className="space-y-8">
        <Pipeline active="email" />

        <header className="space-y-2">
          <h1 className="text-2xl font-medium tracking-tight">Smart Email Generator</h1>
          <p className="text-sm text-muted-foreground">
            Explain what you want to say. We'll write it so it sounds like you, not a robot.
          </p>
        </header>

        {openTasks.length > 0 && !subject && (
          <section className="space-y-2 rounded-xl bg-surface p-4 ring-1 ring-hairline">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Write about a task
            </h2>
            <div className="flex flex-wrap gap-2">
              {openTasks.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setSubject(t.title);
                    setRecipient(t.owner);
                    setDetails(
                      [t.description, t.deadline && `Deadline: ${t.deadline}`]
                        .filter(Boolean)
                        .join("\n"),
                    );
                  }}
                  className="rounded-md bg-surface-2 px-3 py-1.5 text-xs font-medium ring-1 ring-hairline"
                >
                  {t.title}
                </button>
              ))}
            </div>
          </section>
        )}

        <section className="space-y-4 rounded-xl bg-surface p-5 ring-1 ring-hairline">
          <Field label="Who is the email for?">
            <input
              className={inputClass}
              placeholder="My lecturer, Dr. Naidoo"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
            />
          </Field>
          <Field label="What is the email about?" hint="Required">
            <input
              className={inputClass}
              placeholder="Asking for a short extension on my assignment"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </Field>
          <Field label="Important information to include">
            <textarea
              className={`${inputClass} min-h-24 resize-y`}
              placeholder="Due Friday, I've finished two of three sections…"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
            />
          </Field>
          <div className="space-y-2">
            <span className="text-xs font-medium text-muted-foreground">Tone</span>
            <div className="flex flex-wrap gap-2">
              {TONES.map((t) => (
                <button
                  key={t}
                  onClick={() => setTone(t)}
                  className={
                    tone === t
                      ? "rounded-md bg-brand px-3 py-1.5 text-xs font-medium text-brand-foreground"
                      : "rounded-md bg-surface-2 px-3 py-1.5 text-xs font-medium ring-1 ring-hairline"
                  }
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
            <button
              onClick={handleGenerate}
              disabled={mutation.isPending}
              className="flex items-center justify-center gap-2 rounded-lg bg-brand py-2.5 text-sm font-medium text-brand-foreground disabled:opacity-60"
            >
              {mutation.isPending && <Loader2 className="size-4 animate-spin" />}
              {mutation.isPending ? "Writing your email…" : "Generate Email"}
            </button>
            <button
              onClick={clear}
              className="flex items-center justify-center gap-2 rounded-lg bg-surface-2 px-4 py-2.5 text-sm font-medium ring-1 ring-hairline"
            >
              <Eraser className="size-4" /> Clear form
            </button>
          </div>
        </section>

        {!draftBody && !mutation.isPending && (
          <div className="rounded-xl border border-dashed border-border p-8 text-center">
            <Mail className="mx-auto size-6 text-muted-foreground" strokeWidth={1.5} />
            <p className="mt-3 text-sm font-medium">No email yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Fill in the form above and we'll draft it for you. You can edit it afterwards.
            </p>
          </div>
        )}

        {draftBody && (
          <section className="space-y-4 border-t border-hairline pt-8">
            <h2 className="text-lg font-medium">Your draft</h2>
            <div className="space-y-3 rounded-xl bg-surface p-5 ring-1 ring-hairline">
              <Field label="Subject line">
                <input
                  className={inputClass}
                  value={draftSubject}
                  onChange={(e) => setDraftSubject(e.target.value)}
                />
              </Field>
              <Field label="Email">
                <textarea
                  className={`${inputClass} min-h-64 resize-y leading-relaxed`}
                  value={draftBody}
                  onChange={(e) => setDraftBody(e.target.value)}
                />
              </Field>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={copy}
                  className="flex items-center gap-1.5 rounded-md bg-brand px-3 py-1.5 text-xs font-medium text-brand-foreground"
                >
                  <Copy className="size-3.5" /> Copy email
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={mutation.isPending}
                  className="flex items-center gap-1.5 rounded-md bg-surface-2 px-3 py-1.5 text-xs font-medium ring-1 ring-hairline disabled:opacity-60"
                >
                  <RefreshCw className="size-3.5" /> Regenerate
                </button>
              </div>
            </div>
          </section>
        )}
      </div>
    </AppShell>
  );
}
