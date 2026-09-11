# Contributing to StudyHive

See [README.md](README.md) for the product scope and development status, and [architecture.md](docs/architecture.md) for the intended boundaries.

## Workflow

1. Create a branch for each feature or fix, such as `feature/study-groups-ui` or `fix/request-validation`.
2. Keep changes and commits focused. Use clear messages such as `feat: add study group cards`.
3. Run relevant checks when available and describe manual verification in the pull request.
4. Explain architectural changes and update documentation when behavior changes.

## Expectations

- Keep business logic separate from UI components.
- Coordinate changes to shared data contracts with your teammate.
- Add dependencies only when they serve a clear need.
- Never commit secrets. Add configuration names and safe placeholders to `.env.example` as needed.
- Prefer small, reliable features with working interactions.

Setup and check commands will be documented in the README when the application tooling is added.
