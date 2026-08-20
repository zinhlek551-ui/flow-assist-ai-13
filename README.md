# ActionFlow AI

ROLE

Act as an experienced web developer, UI/UX designer, and AI product builder.

I want you to help me create a simple, professional, and easy-to-use web application called AI Productivity Assistant.

The main purpose of the app is to help people save time and stay organized by combining three useful AI tools:

Meeting Notes Summarizer

AI Task Planner

Smart Email Generator

The app should feel like one complete productivity tool, not three separate tools.

DESIGN

Create a clean, modern, and professional design that is easy for anyone to understand, even if they are not very good with technology.

Keep the design simple and avoid making the screen too busy.

The home page should have:

AI Productivity Assistant

"Turn meetings, ideas and tasks into organized action."

Show three main cards:

Meeting Notes Summarizer

Help users turn their meeting notes into a short summary, important decisions, and action items.

AI Task Planner

Help users turn their goals or tasks into a clear step-by-step plan.

Smart Email Generator

Help users quickly create professional and natural-sounding emails.

Each card should have a clear button to open the feature.

Use a simple navigation menu:

Dashboard

Meeting Summarizer

Task Planner

Email Generator

Make the app look good and work properly on both computers and phones.

REQUIREMENTS

1. Meeting Notes Summarizer

Let the user enter their meeting title, date, participants, and notes.

After clicking "Summarize Meeting", the AI should provide:

A short meeting summary

Key discussion points

Decisions that were made

Action items

Deadlines or important dates

The person responsible for each task, if mentioned

Make the results easy to read.

Add buttons for:

Copy Summary

Download Summary

Create Tasks

When the user clicks Create Tasks, the action items should automatically be sent to the Task Planner.

For example, if the notes say:

"John must finish the report by Friday."

The app should understand:

Task: Finish the report
Person: John
Deadline: Friday

Do not make up information that wasn't included in the meeting notes.

2. AI Task Planner

Let users enter a goal or something they need to accomplish.

For example:

"I need to complete my university assignment."

The AI should break it down into smaller and realistic steps.

Each task should show:

Task name

Short description

Priority

Estimated time

Deadline

Status

Use:

To Do → In Progress → Completed

Allow users to:

Add tasks

Edit tasks

Delete tasks

Mark tasks as completed

Change deadlines

Change priority

Update the task status

Show a simple progress bar so users can see how much of their plan they have completed.

3. Smart Email Generator

Create a simple form where users can explain what their email is about.

Ask for:

Who the email is for

What the email is about

Important information to include

Tone

Allow users to choose a tone such as:

Professional

Friendly

Formal

Apologetic

Persuasive

Short and direct

The user should then click "Generate Email".

The AI should create:

A suitable subject line

A natural and professional email

The email should sound like it was written by a real person, not like a robot.

Allow users to:

Edit the email

Copy it

Regenerate it

Clear the form

4. Make the Three Features Work Together

This is very important.

The app should connect the three features.

For example:

A user has a meeting and enters their notes.

The AI summarizes the meeting and finds the action items.

The user clicks Create Tasks.

Those action items automatically become tasks in the Task Planner.

After that, the user can use the Smart Email Generator to create an email about one of those tasks.

The main journey should be:

Meeting Notes → Summary → Action Items → Task Plan → Email

This should make the application feel useful and connected.

5. Make It Easy to Use

Keep everything simple and beginner-friendly.

Use:

Clear buttons

Helpful instructions

Simple language

Loading indicators while AI is working

Friendly error messages

Helpful empty states

For example, if someone tries to summarize without entering notes, show:

"Please enter your meeting notes first."

Do not overwhelm the user with too many options.

6. AI Requirements

The AI should provide answers that are:

Clear

Accurate

Concise

Useful

Practical

Natural sounding

Most importantly, never invent information.

If the user's notes don't mention a person, deadline, or decision, don't create one.

7. Final Goal

I want the finished app to feel like a real productivity application that someone would actually want to use.

It should be:

Professional

Simple

Fast

Easy to navigate

Mobile-friendly

Visually appealing

Fully functional

Before finishing, make sure the main features and the connection between them work correctly.

The most important experience is:

I enter my meeting notes → AI summarizes them → AI finds my tasks → I organize those tasks → I can create an email about them.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://flow-assist-ai-13.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/d385e69c-3ee4-490a-933a-89af350bbc0f).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
