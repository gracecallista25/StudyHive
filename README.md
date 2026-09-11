# StudyHive
## Find the right people to study, build, and learn with at HITSZ.

StudyHive is a planned desktop-first collaboration platform for HITSZ students. Finding a study partner or project teammate often means asking across group chats and personal networks. StudyHive aims to bring that search into one place, helping students find study partners, small groups, project teammates, and seniors with relevant course experience.

**Current status: planning stage.** The repository is initialized, but contains no application code yet. All product features below are planned; there is no runnable demo.

## Why StudyHive?

Finding someone who takes the same course, is free at the same time, and studies in a compatible way takes effort. Finding teammates with the right project skills presents a similar problem.

StudyHive focuses on discovering people. Resources such as HITSZCS already help students find notes and past papers; the goal here is to help students find someone to learn or build with.

## Core Features

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

Runtime requirements, environment configuration, and install, run, test, build, and lint commands will be added with the application scaffold.

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
- [ ] Select the tech stack and scaffold the application.
- [ ] Document architecture and technical decisions.
- [ ] Implement Study Buddy and matching.
- [ ] Implement Study Groups.
- [ ] Implement project recruitment.
- [ ] Implement Ask a Senior.
- [ ] Implement request handling and persistence.
- [ ] Add business-logic tests and development checks.
- [ ] Complete desktop UI polish and capture screenshots.

## Contributors

- **Product + UI / Frontend:** Graciella Callista Edwardson
- **Backend / Core / Data:** Emil Aliyev
