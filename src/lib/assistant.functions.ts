import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { callAiJson, NO_INVENT } from "./ai.server";

const summarizeInput = z.object({
  title: z.string().default(""),
  date: z.string().default(""),
  participants: z.string().default(""),
  notes: z.string().min(1),
});

export const summarizeMeeting = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => summarizeInput.parse(data))
  .handler(async ({ data }) => {
    const system = `You summarize meeting notes for a productivity app. ${NO_INVENT}
Return JSON exactly in this shape:
{"summary":string,"keyPoints":string[],"decisions":string[],"actionItems":[{"task":string,"owner":string,"deadline":string}],"dates":string[]}
"owner" and "deadline" must be "" when the notes do not say. Keep everything concise and plain-language.`;
    const user = `Meeting title: ${data.title || "(not given)"}
Date: ${data.date || "(not given)"}
Participants: ${data.participants || "(not given)"}

Notes:
${data.notes}`;
    return (await callAiJson(system, user)) as {
      summary: string;
      keyPoints: string[];
      decisions: string[];
      actionItems: Array<{ task: string; owner: string; deadline: string }>;
      dates: string[];
    };
  });

const planInput = z.object({ goal: z.string().min(1) });

export const planGoal = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => planInput.parse(data))
  .handler(async ({ data }) => {
    const system = `You break a goal into a realistic step-by-step plan for a productivity app. ${NO_INVENT}
Return JSON exactly in this shape:
{"tasks":[{"title":string,"description":string,"priority":"Low"|"Medium"|"High","estimate":string,"deadline":string}]}
Use 3-7 tasks. "estimate" is like "30m" or "2h". "deadline" is a relative or plain date only if the user's goal implies one, otherwise "".`;
    return (await callAiJson(system, `Goal: ${data.goal}`)) as {
      tasks: Array<{
        title: string;
        description: string;
        priority: "Low" | "Medium" | "High";
        estimate: string;
        deadline: string;
      }>;
    };
  });

const emailInput = z.object({
  recipient: z.string().default(""),
  subject: z.string().min(1),
  details: z.string().default(""),
  tone: z.string().default("Professional"),
});

export const generateEmail = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => emailInput.parse(data))
  .handler(async ({ data }) => {
    const system = `You write emails that sound like a thoughtful real person, never robotic. ${NO_INVENT}
Return JSON exactly in this shape: {"subject":string,"body":string}
Do not add placeholders like [Your Name] unless no name is given, in which case end simply with "Thanks,".`;
    const user = `Who the email is for: ${data.recipient || "(not given)"}
What it is about: ${data.subject}
Important information to include: ${data.details || "(none given)"}
Tone: ${data.tone}`;
    return (await callAiJson(system, user)) as { subject: string; body: string };
  });
