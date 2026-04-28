# Aiyedrix — AI Interview Copilot

A dark-themed, real-time AI interview copilot website. Inspired by the Verve AI
Interview Copilot UI but built from scratch as a static site you can host
anywhere (GitHub Pages, Vercel, Netlify, S3, or `python -m http.server`).

## What's inside

```
.
├── index.html              # Marketing landing page
├── app.html                # In-app dashboard (Home)
├── pages/
│   ├── copilot.html        # AI Interview Copilot — 3-step wizard + live screen
│   ├── mock.html           # AI Mock Interview launcher
│   ├── questions.html      # Question Bank (filter + search)
│   ├── profiles.html       # Interview Profiles
│   ├── reports.html        # Interview Reports (scoring + study plan)
│   ├── knowledge.html      # Knowledge Base
│   ├── playground.html     # Single-question playground
│   ├── tools.html          # AI Tools (resume, cover letter, negotiation…)
│   └── settings.html       # Account, audio, privacy
└── assets/
    ├── css/main.css        # Marketing styles + design tokens
    ├── css/app.css         # In-app shell (sidebar, topbar, tiles, wizard, live)
    ├── js/app.js           # Sidebar navigation + shared shell
    ├── js/copilot.js       # Wizard step state + live transcript/answer demo
    └── img/favicon.svg
```

## Features mirrored from the reference

- Dark theme with purple/cyan gradient accents
- Sidebar with grouped headings (`INTERVIEW`, `PREPARE`, `REVIEW`)
- "Try Our Desktop App" promo card + user card pinned to bottom
- 3-step setup wizard (`STEP 1 / 3` pill) for the AI Interview Copilot
- Tile cards with `CORE` badges (All-In-One, Coding, Calls on Another Device)
- Live copilot screen with transcript + AI suggestion + Short/Full/Bullets toggle
- Question bank, mock interview, profiles, reports, knowledge base, playground

## Run locally

```
python3 -m http.server 8080
# then open http://localhost:8080
```

No build step — pure HTML/CSS/JS.
