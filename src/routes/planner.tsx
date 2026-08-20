import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Mail, Plus, Trash2, ListChecks } from "lucide-react";
import { AppShell, Pipeline } from "@/components/AppShell";
import { Field, inputClass } from "./summarizer";
import { planGoal } from "@/lib/assistant.functions";
import { useWorkspace, type Task, type TaskPriority, type TaskStatus } from "@/lib/workspace";

export const Route = createFileRoute("/planner")({
  head: () => ({
    meta: [
      { title: "AI Task Planner — AI Productivity Assistant" },
      {
        name: "description",
        content:
          "Turn any goal into a realistic step-by-step plan with priorities, deadlines and progress tracking.",
      },
      { property: "og:title", content: "AI Task Planner" },
      {
        property: "og:description",
        content: "Break goals into clear steps and track them from To Do to Completed.",
      },
    ],
  }),
  component: PlannerPage,
});

const STATUSES: TaskStatus[] = ["To Do", "In Progress", "Completed"];
const PRIORITIES: TaskPriority[] = ["Low", "Medium", "High"];

function PlannerPage() {
  const { tasks, addTasks, updateTask, deleteTask, setEmailSeed, hydrated } = useWorkspace();
  const navigate = useNavigate();
  const plan = useServerFn(planGoal);
  const [goal, setGoal] = useState("");

  const mutation = useMutation({
    mutationFn: async () => plan({ data: { goal: goal.trim() } }),
    onSuccess: (result) => {
      const count = addTasks(
        (result.tasks ?? []).map((t) => ({
          title: t.title,
          description: t.description ?? "",
          priority: (t.priority ?? "Medium") as TaskPriority,
          estimate: t.estimate ?? "",
          deadline: t.deadline ?? "",
          source: "From a goal",
        })),
      );
      setGoal("");
      toast.success(`${count} step${count === 1 ? "" : "s"} added to your plan.`);
    },
    onError: (err: Error) => toast.error(err.message || "Something went wrong. Please try again."),
  });

  const handlePlan = () => {
    if (!goal.trim()) {
      toast.error("Please tell us what you want to accomplish first.");
      return;
    }
    mutation.mutate();
  };

  const completed = tasks.filter((t) => t.status === "Completed").length;
  const percent = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;

  const draftEmail = (task: Task) => {
    setEmailSeed({
      subject: task.title,
      recipient: task.owner,
      details: [task.description, task.deadline && `Deadline: ${task.deadline}`]
        .filter(Boolean)
        .join("\n"),
    });
    navigate({ to: "/email" });
  };

  return (
    <AppShell>
      <div className="space-y-8">
        <Pipeline active="planner" />

        <header className="space-y-2">
          <h1 className="text-2xl font-medium tracking-tight">AI Task Planner</h1>
          <p className="text-sm text-muted-foreground">
            Describe a goal and we'll break it into small, realistic steps you can track.
          </p>
        </header>

        <section className="space-y-3 rounded-xl bg-surface p-5 ring-1 ring-hairline">
          <Field label="What do you need to accomplish?">
            <textarea
              className={`${inputClass} min-h-24 resize-y`}
              placeholder="I need to complete my university assignment."
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
            />
          </Field>
          <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
            <button
              onClick={handlePlan}
              disabled={mutation.isPending}
              className="flex items-center justify-center gap-2 rounded-lg bg-brand py-2.5 text-sm font-medium text-brand-foreground disabled:opacity-60"
            >
              {mutation.isPending && <Loader2 className="size-4 animate-spin" />}
              {mutation.isPending ? "Building your plan…" : "Create a Plan"}
            </button>
            <button
              onClick={() => {
                addTasks([{ title: "New task", source: "Added manually" }]);
                toast.success("Empty task added — edit it below.");
              }}
              className="flex items-center justify-center gap-2 rounded-lg bg-surface-2 px-4 py-2.5 text-sm font-medium ring-1 ring-hairline"
            >
              <Plus className="size-4" /> Add task
            </button>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">Your plan</h2>
            {tasks.length > 0 && (
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <span>{percent}% complete</span>
                <span className="h-1.5 w-16 overflow-hidden rounded-full bg-surface-2">
                  <span
                    className="block h-full rounded-full bg-brand transition-all"
                    style={{ width: `${percent}%` }}
                  />
                </span>
              </div>
            )}
          </div>

          {hydrated && tasks.length === 0 && (
            <div className="rounded-xl border border-dashed border-border p-8 text-center">
              <ListChecks className="mx-auto size-6 text-muted-foreground" strokeWidth={1.5} />
              <p className="mt-3 text-sm font-medium">Nothing planned yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Add a goal above, or summarize a meeting and send its action items here.
              </p>
            </div>
          )}

          <div className="space-y-3">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onUpdate={(patch) => updateTask(task.id, patch)}
                onDelete={() => {
                  deleteTask(task.id);
                  toast.success("Task deleted.");
                }}
                onDraftEmail={() => draftEmail(task)}
              />
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}

const priorityDot: Record<TaskPriority, string> = {
  High: "bg-destructive",
  Medium: "bg-progress",
  Low: "bg-border",
};

function TaskCard({
  task,
  onUpdate,
  onDelete,
  onDraftEmail,
}: {
  task: Task;
  onUpdate: (patch: Partial<Task>) => void;
  onDelete: () => void;
  onDraftEmail: () => void;
}) {
  const [open, setOpen] = useState(false);
  const done = task.status === "Completed";

  return (
    <div className="rounded-xl bg-surface p-4 ring-1 ring-hairline">
      <div className="flex items-start gap-3">
        <button
          aria-label={done ? "Mark as to do" : "Mark as completed"}
          onClick={() => onUpdate({ status: done ? "To Do" : "Completed" })}
          className={`mt-0.5 size-4 shrink-0 rounded border ${done ? "border-brand bg-brand" : "border-border"}`}
        />
        <div className="min-w-0 flex-1 space-y-1">
          <input
            value={task.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
            className={`w-full bg-transparent text-sm font-medium outline-none ${done ? "text-muted-foreground line-through" : ""}`}
          />
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
            <span className={`inline-block size-2 rounded-full ${priorityDot[task.priority]}`} />
            <span>{task.priority} priority</span>
            {task.estimate && <span>• {task.estimate}</span>}
            {task.deadline && <span>• Due {task.deadline}</span>}
            {task.owner && <span>• {task.owner}</span>}
          </p>
          {task.description && !open && (
            <p className="text-xs text-muted-foreground">{task.description}</p>
          )}
        </div>
        <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {task.status}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          onClick={() => setOpen((v) => !v)}
          className="rounded-md bg-surface-2 px-3 py-1.5 text-xs font-medium ring-1 ring-hairline"
        >
          {open ? "Close" : "Edit"}
        </button>
        <button
          onClick={onDraftEmail}
          className="flex items-center gap-1.5 rounded-md bg-surface-2 px-3 py-1.5 text-xs font-medium ring-1 ring-hairline"
        >
          <Mail className="size-3.5" /> Draft email
        </button>
        <button
          onClick={onDelete}
          className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-destructive"
        >
          <Trash2 className="size-3.5" /> Delete
        </button>
      </div>

      {open && (
        <div className="mt-4 space-y-3 border-t border-hairline pt-4">
          <Field label="Short description">
            <textarea
              className={`${inputClass} min-h-16 resize-y`}
              value={task.description}
              onChange={(e) => onUpdate({ description: e.target.value })}
            />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Priority">
              <select
                className={inputClass}
                value={task.priority}
                onChange={(e) => onUpdate({ priority: e.target.value as TaskPriority })}
              >
                {PRIORITIES.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </Field>
            <Field label="Status">
              <select
                className={inputClass}
                value={task.status}
                onChange={(e) => onUpdate({ status: e.target.value as TaskStatus })}
              >
                {STATUSES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </Field>
            <Field label="Estimated time">
              <input
                className={inputClass}
                placeholder="2h"
                value={task.estimate}
                onChange={(e) => onUpdate({ estimate: e.target.value })}
              />
            </Field>
            <Field label="Deadline">
              <input
                className={inputClass}
                placeholder="Friday"
                value={task.deadline}
                onChange={(e) => onUpdate({ deadline: e.target.value })}
              />
            </Field>
          </div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{task.source}</p>
        </div>
      )}
    </div>
  );
}
