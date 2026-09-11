# Architecture

StudyHive is in the planning stage. This document describes the intended design; technology choices and concrete modules remain to be defined.

## Principle

**Separate what shows from what thinks.** UI code handles presentation and interaction. Domain logic handles matching, availability, and request rules. Persistence code handles storage and backend access.

## Intended Responsibilities

| Area | Responsibility |
| --- | --- |
| Presentation | Screens, components, forms, and interaction state. |
| Domain logic | Explainable matching, availability overlap, request validation, and membership rules. |
| Data access | Load and persist profiles, groups, projects, and requests. |
| Shared contracts | Define the data exchanged between these areas. |

These are conceptual boundaries, not existing subdirectories. Application code will live under `src/`; its internal structure will be chosen with the scaffold.

## Design Direction

- Focus on people discovery and study/project formation.
- Use the proposed deterministic, rule-based matching approach; define factors and weights before implementation.
- Keep business rules independently testable from UI and storage.
- Keep secrets out of the repository and document configuration in `.env.example`.

## Decisions to Make

- Frontend framework and development tooling.
- Backend, database, and authentication approach.
- Data contracts, request lifecycle, and membership rules.
- Matching factors, availability representation, and test tooling.

Record decisions and their reasons here as implementation progresses.
