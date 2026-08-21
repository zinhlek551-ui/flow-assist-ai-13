# AI Productivity Assistant

A simple, professional web application that combines three AI-powered tools to help people save time and stay organized:

- **Meeting Notes Summarizer** – turn raw meeting notes into structured summaries with key points, decisions, and action items.
- **AI Task Planner** – convert goals into step-by-step task plans with priorities, deadlines, and progress tracking.
- **Smart Email Generator** – draft human-sounding emails in various tones based on recipient, subject, and details.

The tools are connected into a single workflow: meeting action items become tasks, and tasks can be turned into emails.

## Live demo

Published URL: https://flow-assist-ai-13.lovable.app

## Features

- Clean, modern, responsive design that works on mobile and desktop.
- Shared workspace state across tools.
- One-click hand-off from Meeting → Summary → Tasks → Email.
- Loading indicators, friendly error messages, and helpful instructions.
- AI responses are concise and never invent information beyond what the user provides.

## Tech stack

- [TanStack Start](https://tanstack.com/start)
- [React](https://react.dev)
- [TypeScript](https://www.typescriptlang.org)
- [Tailwind CSS](https://tailwindcss.com)
- [Lovable AI Gateway](https://docs.lovable.dev/features/ai-gateway)

## Getting started

Make sure you have [Node.js](https://nodejs.org) installed (preferably via [nvm](https://github.com/nvm-sh/nvm)).

```sh
# Clone the repository
git clone <repository-url>
cd <repository-name>

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be available at `http://localhost:8080`.

## Project structure

```
src/
  components/        # Shared UI components (AppShell, etc.)
  lib/               # Server functions and AI helpers
  routes/            # TanStack Start routes
  styles.css         # Global styles and design tokens
```

## Environment variables

The AI features use the Lovable AI Gateway. In a Lovable-managed environment these are configured automatically. For local development outside Lovable, set:

```sh
LOVABLE_API_KEY=your-lovable-api-key
```

## How the workflow works

1. Go to **Meeting Summarizer** and paste your notes.
2. Review the generated summary and action items, then click **Create Tasks**.
3. Open **Task Planner** to see the action items as tasks, edit them, or generate new plans from goals.
4. Select a task and click **Draft Email** to pre-fill the **Email Generator**.
5. Choose a tone and generate a ready-to-send email.

## License

This project is open source and available under the [MIT License](LICENSE).
