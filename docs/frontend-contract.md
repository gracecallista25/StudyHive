# Frontend demo and future handoff

The Study Buddy page currently uses four fictional profiles and local React state. It makes no network calls, stores no data, and sends no messages. Free Tonight uses an explicit fixture flag; it does not calculate real availability.

## Frontend structure

- `src/ui/`: layout, filters, cards, modal, styles, and fictional fixtures.
- `src/types/student.ts`: display types expected by this page.
- `src/App.tsx` and `src/main.tsx`: minimal application wiring.

The warm campus palette is centralized in `src/ui/styles/global.css`. Inline SVG artwork and avatars avoid external image services. UI uses system sans-serif fonts and Georgia for the editorial headline, so it works offline.

## Teammate-owned future integration

Agree on these interfaces before replacing fixtures; no backend contract is implemented or enforced by this demo:

- Load study buddies from course, availability, study style, entry year, major, and Free Tonight filters. Return profiles, result count, and pagination.
- Load a student's full profile by ID.
- Send a study request and return its identifier and current status. Define authentication, eligibility, duplicate handling, privacy, and persistence on the backend.
- Return user-facing errors and expose loading states through an asynchronous adapter when connected.

The current display model includes ID, name, major, entry year, course label, availability label, study style label, personality tags, quote, bio, study goal, preferred study place, and an illustration variant. UI-only illustration fields need not be database columns. The backend owns real availability representation, date/time interpretation, filtering semantics, and validation.

Study Groups, Projects, Ask a Senior, Requests management, and My Profile are visibly marked Soon and are not interactive navigation links. The modal's Send Study Request is a local prototype only and resets on refresh.

## Verification

Run `npm run typecheck`, `npm run lint`, and `npm run build`.
For browser tests, run `npx playwright install chromium` once, then `npm run test:ui`.
Tests cover combined filters, empty/reset states, Free Tonight, modal open/close, keyboard focus return, request feedback, refresh behavior, and desktop/mobile overflow.
