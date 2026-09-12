# StudyHive
## Find the right people to study, build, and learn with at HITSZ.

StudyHive is a planned desktop-first collaboration platform for HITSZ students. Finding a study partner or project teammate often means asking across group chats and personal networks. StudyHive aims to bring that search into one place, helping students find study partners, small groups, project teammates, and seniors with relevant course experience.

**Current status: runnable React + TypeScript frontend with API-connected login, registration, profile, Study Buddy, and Study Groups screens.** Set `VITE_API_BASE_URL` to your teammate's FastAPI server. Study Groups supports room search, creation with a chosen maximum membership, roster viewing, join requests, refresh, and host cancellation. The maximum includes the creator and is editable during creation only; the backend has no endpoint to edit it later. See [the rooms contract](docs/study-groups-api.md). Request management, Projects, and Ask a Senior remain for later. The separate fictional Study Buddy browser remains available for previews.

## Why StudyHive?

Finding someone who takes the same course, is free at the same time, and studies in a compatible way takes effort. Finding teammates with the right project skills presents a similar problem.

StudyHive focuses on discovering people. Resources such as HITSZCS already help students find notes and past papers; the goal here is to help students find someone to learn or build with.

## Product Direction

| Feature | Intended use |
| --- | --- |
| Study Buddy | Find individual students by course, availability, study preferences, and academic context. |
| Study Groups | Create or join small groups around a course or topic. |
| Projects | Post project ideas and find teammates with relevant skills. |
| Ask a Senior | Find students who have completed a course and are willing to help. |
| Requests | Send and manage study invitations and group or project join requests. |

## Matching — Planned

The proposed approach is an explainable, rule-based score using course, availability overlap, study style, year, major, and current study goal. The final factors and weights remain to be defined.

A rule-based approach makes results transparent, deterministic, and easy to test without requiring training data.

## Architecture and Principles

**“Separate what shows from what thinks.”** Keep presentation and interaction separate from matching, availability, request validation, and persistence logic.

- Focus on people discovery and simple study/project formation; resource hosting and chat are outside the initial scope.
- Prefer reliability over feature count. Every visible button should work or be removed.
- Keep the architecture understandable and document important decisions.
- Add dependencies or rebuild existing functionality only with a clear reason.

## Development

With Git installed, clone the repository and create a branch:

```sh
git clone https://github.com/gracecallista25/StudyHive.git
cd StudyHive
git switch -c feature/study-groups-ui
```

### Run the frontend

Use Node.js 22.12+ with npm. From this repository:

```sh
npm install
npm run dev
```

Open the local URL printed by Vite, normally http://127.0.0.1:5173. No backend setup is needed for the preview. To connect registration, copy `.env.example` to `.env.local`, set `VITE_API_BASE_URL` to your teammate’s API URL (for example `http://127.0.0.1:8000`), then restart Vite. Registration sends `grade` as a number and `degree` as `bachelor` or `master`. Login now calls POST /login when the API URL is configured and shows the returned outcome.

```sh
npm run typecheck
npm run lint
npm run build
npm run preview
```

Optional browser interaction tests:

```sh
npx playwright install chromium
npm run test:ui
```

With an existing Chrome installation, PowerShell users can instead run:

```powershell
$env:PLAYWRIGHT_CHANNEL = "chrome"
npm run test:ui
```

The demo uses four fictional students. Filters combine locally, Free Tonight uses sample availability, and study requests change React state only. Refreshing resets the demo. No one is contacted and no information is saved.

See [frontend-contract.md](docs/frontend-contract.md) for display fields, components, future backend responsibilities, and test coverage.

## Team Ownership

The intended two-person split is:

| Area | Responsibilities |
| --- | --- |
| Product + UI / Frontend | User experience, layouts, components, forms and modals, visual design, and desktop responsiveness. |
| Backend / Core / Data | Database and persistence, matching and availability logic, request validation, and business-logic testing. |

## Contributing

- Use a branch for each feature or fix and keep commits focused, such as `feat: add study group cards`.
- Do not commit secrets or credentials.
- Run available checks before opening a pull request and describe manual verification.
- Explain architectural changes and update documentation when behavior changes.

## Status and Roadmap

- [x] Initialize the repository.
- [x] Document the product direction and contribution expectations.
- [x] Scaffold the frontend with React, TypeScript, Vite, and Tailwind CSS.
- [x] Document frontend architecture and the backend handoff.
- [x] Implement the Study Buddy UI with local filtering and a mock profile/request modal.
- [ ] Implement real Study Buddy data and matching.
- [ ] Implement Study Groups.
- [ ] Implement project recruitment.
- [ ] Implement Ask a Senior.
- [ ] Implement request handling and persistence.
- [ ] Add business-logic tests and development checks.
- [ ] Complete desktop UI polish and capture screenshots.

## Contributors

- **Product + UI / Frontend:** Graciella Callista Edwardson
- **Backend / Core / Data:** Emil Aliyev

## Backend prototype

The supplied FastAPI registration/login code is now included in `backend/`. See [backend/README.md](backend/README.md) for Python setup, endpoint details, and existing prototype limitations. Backend ownership remains with the teammate.

## My Profile UI

After a successful login, select **Open my profile**, or use **My Profile** in the sidebar. Edit your description and picture URL, and choose up to three earned badges. Academic details are read-only. Login identity is kept in memory and clears on refresh. The supplied profile endpoints are now included in backend/main.py; see [frontend contract](docs/frontend-contract.md) for the attached backend's missing defaults and required fixes.

## Desktop display targets

The frontend is tested at browser viewports of **1920 x 1080** and **1366 x 768** CSS pixels (100% browser zoom). Playwright runs every browser test at both sizes. Login and registration primary buttons are checked for full visibility on the initial screen; Study Buddy and Profile allow normal vertical scrolling, with no horizontal page overflow. Existing small-screen CSS remains as a fallback, but mobile is not an acceptance target.
