import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

export type TaskStatus = "To Do" | "In Progress" | "Completed";
export type TaskPriority = "Low" | "Medium" | "High";

export type Task = {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  estimate: string;
  deadline: string;
  owner: string;
  status: TaskStatus;
  source: string;
};

export type MeetingSummary = {
  title: string;
  date: string;
  participants: string;
  summary: string;
  keyPoints: string[];
  decisions: string[];
  actionItems: Array<{ task: string; owner: string; deadline: string }>;
  dates: string[];
};

type EmailSeed = { subject: string; details: string; recipient: string } | null;

type WorkspaceValue = {
  tasks: Task[];
  summary: MeetingSummary | null;
  emailSeed: EmailSeed;
  setSummary: (s: MeetingSummary | null) => void;
  addTasks: (tasks: Array<Partial<Task> & { title: string }>) => number;
  updateTask: (id: string, patch: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  setEmailSeed: (seed: EmailSeed) => void;
  hydrated: boolean;
};

const WorkspaceContext = createContext<WorkspaceValue | null>(null);
const STORAGE_KEY = "ai-productivity-assistant-v1";

const newId = () => Math.random().toString(36).slice(2, 10);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [summary, setSummary] = useState<MeetingSummary | null>(null);
  const [emailSeed, setEmailSeed] = useState<EmailSeed>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { tasks?: Task[]; summary?: MeetingSummary | null };
        if (parsed.tasks) setTasks(parsed.tasks);
        if (parsed.summary) setSummary(parsed.summary);
      }
    } catch {
      /* ignore corrupted storage */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ tasks, summary }));
    } catch {
      /* storage unavailable */
    }
  }, [tasks, summary, hydrated]);

  const addTasks = useCallback((incoming: Array<Partial<Task> & { title: string }>) => {
    const created: Task[] = incoming.map((t) => ({
      id: newId(),
      title: t.title,
      description: t.description ?? "",
      priority: t.priority ?? "Medium",
      estimate: t.estimate ?? "",
      deadline: t.deadline ?? "",
      owner: t.owner ?? "",
      status: t.status ?? "To Do",
      source: t.source ?? "Added manually",
    }));
    setTasks((prev) => [...created, ...prev]);
    return created.length;
  }, []);

  const updateTask = useCallback((id: string, patch: Partial<Task>) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const value = useMemo(
    () => ({
      tasks,
      summary,
      emailSeed,
      setSummary,
      addTasks,
      updateTask,
      deleteTask,
      setEmailSeed,
      hydrated,
    }),
    [tasks, summary, emailSeed, addTasks, updateTask, deleteTask, hydrated],
  );

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error("useWorkspace must be used inside WorkspaceProvider");
  return ctx;
}
