# Study Buddy integration

The connected frontend targets the FastAPI code supplied in the conversation. It does not modify or install that backend on another branch.

Set `VITE_API_BASE_URL=http://127.0.0.1:8000` in `.env.local` (or use your backend origin), run the supplied backend, and restart Vite. With no API URL the original fictional demo is shown. Connected mode never falls back to fictional results after an API error.

## Connected flow

Log in, open Study Buddy from Home, choose a course, and search. Browse open listings one at a time with Back and Next. Study Together sends a request only after login and displays success only when the API returns a request ID. Requests are keyed by listing, so two listings by one student remain separate.

Create a study listing asks for course, date, start/end time, location, and optional notes. Publishing uses the current login ID. Your own listings are excluded from discovery, as required by the backend; use another account to discover them. A fresh backend starts with no listings. Mock profiles are not uploaded. Backend data is held in memory and resets when the backend restarts.

| Action | Endpoint | Payload/query |
| --- | --- | --- |
| Search | GET /study-buddy | course, optional major/date/start_time/end_time/location, viewer_id when logged in |
| Publish | POST /study-buddy | user_id, course, date, start_time, end_time, location, notes |
| Request | POST /study-buddy/{listing_id}/request | from_user_id |

The backend performs substring course matching. The frontend additionally checks exact course names, open status, and creator ID before displaying results. This prevents Calculus searches including Pre-Calculus. The 13-course picker is retained.

The supplied API has no study-mode or online-presence fields. Connected mode therefore shows the returned date, time, and location without claiming online status or filtering by mode. The API does not specify a timezone; times are displayed as returned.

Requests inbox/respond and listing cancellation endpoints are not connected to new screens in this change. The existing Requests navigation remains unchanged. Login identity remains in React memory and clears on refresh. The backend does not issue authentication tokens or support request idempotency; disabling repeated submission in this view does not prevent duplicate requests after a refresh or an ambiguous network failure.

Validation: `npm.cmd run build`, `npm.cmd run lint`, and `npm.cmd run test:ui -- tests/study-buddy-api.spec.ts tests/study-buddy.spec.ts tests/home.spec.ts tests/auth.spec.ts`. API tests intercept responses following the supplied contract; they do not prove a deployed backend is running.

## Expanded search filters

The connected search form now includes Major (registration's combined major catalogue), Date, Start time, End time, and Location. Empty optional fields are omitted from GET /study-buddy. Both times must be supplied together, with start before end; the backend applies overlap matching. Major is exact, date is exact, and location uses the backend's case-insensitive substring match. Changing or refreshing results preserves the selected filters. Clear optional filters leaves the selected course intact.

Creation still sends user_id, course, date, start_time, end_time, location and notes only. The backend derives the creator's major from their profile. The fictional example browser remains explicitly separate; it does not pretend to apply real listing date/location filters. No backend code was changed.
