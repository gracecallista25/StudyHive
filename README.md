# StudyHive
## Find the right people to study, build, and learn with at HITSZ.

StudyHive is a planned desktop-first collaboration platform for HITSZ students. Finding a study partner or project teammate often means asking across group chats and personal networks. StudyHive aims to bring that search into one place, helping students find study partners, small groups, project teammates, and seniors with relevant course experience.

**Current status: frontend demo.** A runnable React + TypeScript + Vite + Tailwind CSS Study Buddy page is available. It includes local filters, fictional student profiles, and a profile modal with demo-only request feedback. The other product areas and all backend functionality remain planned.

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

Open the local URL printed by Vite, normally http://127.0.0.1:5173. No environment variables, credentials, or backend setup are needed.

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
