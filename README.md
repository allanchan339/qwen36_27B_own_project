# Command Center
<img width="1647" height="907" alt="image" src="https://github.com/user-attachments/assets/f4f3ad89-bcd5-480f-8076-e033ec869855" />

A personal productivity dashboard built with React + TypeScript + Vite + Tailwind. Dark-themed, zero dependencies beyond the core stack, all data persisted in localStorage.

## Features

- **Dashboard** — multi-timezone clocks, session uptime, JS heap memory, screen resolution
- **Notes** — split-pane editor with color-coded cards, live char/word count, confirm-on-delete
- **Tasks** — progress bar, all/active/done filters, confirm-on-delete
- **Bookmarks** — grid of saved links with auto-HTTPS, icon avatars, clickable URLs
- **Pomodoro** — 25/5 min focus/break timer with SVG progress ring, session counter
- **Settings** — custom greeting, timezone management, JSON backup/restore, danger zone
- **Collapsible sidebar** with live clock

## Tech Stack

- React 19 + TypeScript 5
- Vite 8 (HMR dev server, production build)
- Tailwind CSS 4
- Vitest + Testing Library (12 tests)
- localStorage persistence with reactive singleton stores

## Quick Start

```bash
npm install
npm run dev     # http://localhost:5173
npm run build   # production bundle in dist/
npm test        # run tests
```

## Architecture

```
src/
├── App.tsx                    # Router: maps TabId → page component
├── main.tsx                   # Entry point
├── index.css                  # Tailwind + CSS variables + animations
├── types.ts                   # Shared interfaces (Note, Task, Bookmark, TabId)
├── components/
│   └── Sidebar.tsx           # Collapsible nav + live clock, reads greeting from settings
├── hooks/
│   ├── useNotesStore.ts      # Reactive localStorage store (notes CRUD)
│   ├── useTasksStore.ts      # Reactive localStorage store (tasks CRUD)
│   ├── useBookmarksStore.ts  # Reactive localStorage store (bookmarks CRUD)
│   ├── usePomodoroStore.ts   # Singleton timer store with interval + listeners
│   ├── useSettingsStore.ts   # Singleton settings store (greeting, timezones, export/import)
│   └── useColorRotation.ts   # Interval-based color cycling
├── lib/
│   ├── storage.ts            # localStorage wrapper with JSON parse/set, uid generator
│   └── utils.ts              # escapeHtml, truncate, formatDate, formatTime
├── pages/
│   ├── Dashboard.tsx         # Timezone clocks, system stats, quick tips
│   ├── Notes.tsx             # Split-pane note editor
│   ├── Tasks.tsx             # Todo list with progress bar
│   ├── Bookmarks.tsx         # Bookmark grid
│   ├── Pomodoro.tsx          # Focus timer
│   └── Settings.tsx          # Greeting, timezone management, data backup
└── __tests__/
    └── App.test.tsx          # App-level component tests
```

All stores follow a reactive singleton pattern: external state object + listener set → `useEffect` subscribes → `notify()` pushes updates to all subscribers. This avoids duplicate intervals and ensures cross-component sync (e.g., changing a timezone in Settings immediately updates the Dashboard clocks).
