# Frontend demo and future handoff

The Study Buddy page currently uses four fictional profiles and local React state. It makes no network calls, stores no data, and sends no messages. Free Tonight uses an explicit fixture flag; it does not calculate real availability.

## Frontend structure

- `src/ui/`: layout, filters, cards, modal, styles, and fictional fixtures.
- `src/types/student.ts`: display types expected by this page.
- `src/App.tsx` and `src/main.tsx`: minimal application wiring.

The warm campus palette is centralized in `src/ui/styles/global.css`. Inline SVG artwork and avatars avoid external image services. UI uses system sans-serif fonts and Georgia for the editorial headline, so it works offline.

## Teammate-owned future integration

Agree on these interfaces before replacing fixtures; no backend contract is implemented or enforced by this demo:

- Load study buddies from course, availability, year of study, major, and Free Tonight filters. Return profiles, result count, and pagination.
- Load a student's full profile by ID.
- Send a study request and return its identifier and current status. Define authentication, eligibility, duplicate handling, privacy, and persistence on the backend.
- Return user-facing errors and expose loading states through an asynchronous adapter when connected.

The current display model includes ID, name, major, year of study, course label, lookingFor description, personality tags, quote, bio, study goal, preferred study place, and an illustration variant. UI-only illustration fields need not be database columns. The lookingFor field is a short plain-text description of what the student wants to do with a buddy. Detailed recurring schedules and study-style categories are no longer displayed. Broad availability filters remain optional, demo-only controls. The backend owns real availability representation, date/time interpretation, filtering semantics, and validation.

Study Groups, Projects, Ask a Senior, Requests management, and My Profile are visibly marked Soon and are not interactive navigation links. The modal's Send Study Request is a local prototype only and resets on refresh.

## Verification

Run `npm run typecheck`, `npm run lint`, and `npm run build`.
For browser tests, run `npx playwright install chromium` once, then `npm run test:ui`.
Tests cover combined filters, empty/reset states, Free Tonight, modal open/close, keyboard focus return, request feedback, refresh behavior, and desktop/mobile overflow.


## Login and registration UI

Login uses student ID and password and calls POST /login when the API URL is configured. Registration now supports POST /register when VITE_API_BASE_URL is configured. With no URL, it displays a preview notice and sends nothing. Explore demo remains public; no session or protected route is implemented.

Registration sends exactly full_name, student_id, password, email, major, degree, and grade. The UI calls grade **Year of study**, but sends a number, not a string or entry year. Confirm password is checked only in the form and never sent. No username is collected.

- Bachelor's uses bachelor, years 1–5, and the eight supplied bachelor majors.
- Master's uses master, years 1–3, and the thirteen supplied master majors.
- Degree changes clear major and year selections. Exact sorted major names live in src/ui/data/registrationOptions.ts; these mirror the supplied API catalogue. GET /majors/{degree} is available on the backend but is not fetched by this version.
- src/ui/auth/registrationApi.ts is a small frontend HTTP adapter. It handles HTTP errors, status: failed responses (including HTTP 200), unavailable servers, and unconfirmed success responses. A pending submission disables the form. Successful registration clears the form; it does not sign the user in.
- No passwords or user records are stored in browser storage. Registration responses are not persisted. The frontend never calls /users/{user_id}.

To connect, copy .env.example to .env.local, set VITE_API_BASE_URL to the teammate's API origin (for example http://127.0.0.1:8000), and restart Vite. Do not put secrets in VITE variables. The teammate owns the running API, validation, password handling, persistence and future sessions. The teammate-provided backend is included in backend/main.py with its original behavior; see backend/README.md for setup and prototype limitations. Both forms show explicit success or failure feedback. Login verifies credentials only: no session, protected routes or persistent signed-in state is created.

Browser tests use intercepted API responses to verify payload types, success, rejection, HTTP errors and connection failure; they do not establish that a live backend is running.
