# Projects

Open Projects from Home or the sidebar (`#projects`). The approved discovery and detail concepts guide the layout. Existing theme variables, Button, CampusArt and StudentAvatar keep it consistent with StudyHive.

## Files

- `ProjectsPage.tsx`: browsing, filters, current screen, and in-memory project/request state.
- `ProjectCard.tsx`: a project summary.
- `ProjectDetail.tsx`: project brief, team, roles and join form.
- `CreateProjectForm.tsx`: a short creation form with validation.
- `ProjectArtwork.tsx`: four small SVG illustrations.
- `projectData.ts`: display types and fictional examples.
- `projects.css`: scoped responsive styles.

All feature files live in `src/features/projects`. No new packages are required.

## Preview limitations

No project API contract is present in this checkout. This UI makes no backend requests. Creating a project and requesting to join only update page memory; leaving Projects or reloading resets them. Nothing is published, sent to a lead, or saved to an account. The interface labels this explicitly.

Real use needs authenticated endpoints for browsing, creation and join requests. The backend must validate ownership, permissions, roles and duplicate requests. Request text is currently form state only and is not persisted.

## Verification

Run `npm run typecheck`, `npm run lint`, `npm run build`, and `npm run test:ui -- tests/projects.spec.ts tests/home.spec.ts tests/notifications.spec.ts`.
