# Engineering decisions

## Decision: React with TypeScript and Vite

### Chosen
The frontend uses React 19, TypeScript, and Vite, with Tailwind CSS and Lucide React.

### Why
This matches the existing implementation and keeps component state, typed feature models, and local development straightforward.

### Alternatives considered / rejected
None are recorded in the repository; this documents the implemented choice only.

## Decision: Feature-oriented frontend structure

### Chosen
Each product area has a page, nearby UI components, a data/API helper, and scoped CSS. Shared layout and controls live in `src/shared`.

### Why
Feature behavior stays discoverable, while common UI remains reusable without introducing a global state framework.

### Alternatives considered / rejected
The refactor history explicitly avoids Context, Redux, custom-hook architecture, service layers, and barrel files because they would add indirection without a demonstrated need.

## Decision: Optional connected mode with a local preview

### Chosen
`VITE_API_BASE_URL` selects between API-backed behavior and fictional/local preview behavior.

### Why
Students and reviewers can run the interface without a backend, while the same screens can exercise the FastAPI contracts when available.

### Alternatives considered / rejected
No alternative is documented as historically evaluated.

## Decision: FastAPI prototype with in-memory state

### Chosen
The backend branch uses FastAPI/Pydantic and Python dictionaries for domain state.

### Why
It provides explicit request models and quickly testable routes for the current prototype.

### Alternatives considered / rejected
The repository records no evidence of a different backend or database being evaluated. Durable storage remains a future deployment requirement.

## Decision: Explicit, server-validated discovery and request flows

### Chosen
Study Buddy, groups, projects, and senior questions use dedicated API operations; the backend validates ownership, capacity, overlap, and request state.

### Why
These rules affect multiple users and must not rely on browser-only checks. The UI maps responses and keeps presentation concerns local.

### Alternatives considered / rejected
The old documentation proposed a weighted matching score, but the implemented backend currently uses explicit filters and validation. No scoring algorithm is claimed here.

## Decision: Browser-memory identity for the current prototype

### Chosen
After login, the frontend retains the returned user ID in React memory and clears it on reload.

### Why
This matches the supplied backend, which does not issue a session or token, while avoiding storage of credentials.

### Alternatives considered / rejected
Persistent sessions and token authorization are not implemented and therefore are not presented as completed behavior.

## Decision: Playwright at two desktop viewports

### Chosen
Browser checks run at 1920×1080 and 1366×768, alongside TypeScript/build and ESLint checks.

### Why
Those are the project’s stated desktop acceptance targets and catch layout regressions in the main review sizes.

### Alternatives considered / rejected
Mobile rules exist, but mobile is not the primary acceptance target recorded by the test configuration.
