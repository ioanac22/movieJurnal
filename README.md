# 🎬 Flickpick

A personal movie journal where you have to prove you actually watched the film.

## The idea

Anyone can rate a movie they never saw. Flickpick fixes that: before you can leave a rating or review, an AI generates 5 questions about specific scenes, dialogue, and plot details — the kind of thing you can't answer from a Wikipedia summary. Score at least 4/5 and the rating unlocks.

It also includes an AI chatbox strictly limited to cinema topics.

## Features

- 🔐 Authentication with Clerk
- 🔍 Movie search powered by TMDB
- 📓 Personal journal of watched films
- 🧠 AI-generated quiz, validated server-side
- ⭐ Ratings and reviews unlocked by passing the quiz
- 💬 Film-only AI chatbox

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) + TypeScript |
| Styling | TailwindCSS v4 |
| Auth | Clerk |
| Database | Neon (PostgreSQL) + Prisma |
| Movie data | TMDB API |
| AI | Google Gemini (gemini-2.0-flash) |

## Project structure

```
app/
  api/          # server routes (search, quiz, chat)
  search/       # search page
components/     # React components
lib/            # clients: prisma, tmdb, gemini
prisma/         # schema and migrations
```

## Security note

Quiz answer keys (`correctIndex`) never leave the server. The client receives only questions and options. Validation happens in `/api/quiz/submit`, and the `quizPassed` flag lives in the database — it can't be flipped from DevTools.

## Running locally

```bash
npm install
cp .env.example .env.local   # fill in your keys
npx prisma migrate dev
npm run dev
```

## Live demo

🔗 
