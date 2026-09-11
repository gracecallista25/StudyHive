# Architecture

StudyHive now has a frontend-only Study Buddy demo. The backend architecture below remains planned and is owned by the backend teammate.

## Principle

**Separate what shows from what thinks.** UI code handles presentation and interaction. Domain logic handles matching, availability, and request rules. Persistence code handles storage and backend access.

## Intended Responsibilities

| Area | Responsibility |
| --- | --- |
| Presentation | Screens, components, forms, and interaction state. |
| Domain logic | Explainable matching, availability overlap, request validation, and membership rules. |
| Data access | Load and persist profiles, groups, projects, and requests. |
| Shared contracts | Define the data exchanged between these areas. |

The frontend lives in `src/ui/`, including layout, filters, students, reusable components, styles, and fictional data. `src/types/student.ts` contains display contracts. `src/App.tsx` and `src/main.tsx` provide application wiring. No core business logic or persistence layer is implemented. See [frontend-contract.md](frontend-contract.md).

## Design Direction

- Focus on people discovery and study/project formation.
- Use the proposed deterministic, rule-based matching approach; define factors and weights before implementation.
- Keep business rules independently testable from UI and storage.
- Keep secrets out of the repository and document configuration in `.env.example`.

## Decisions to Make

- Frontend chosen: React + TypeScript + Vite + Tailwind CSS, with ESLint and Playwright checks. System fonts and inline SVG keep the demo independent of external asset services.
- Backend, database, and authentication approach.
- Data contracts, request lifecycle, and membership rules.
- Matching factors, availability representation, and test tooling.

Record decisions and their reasons here as implementation progresses.
