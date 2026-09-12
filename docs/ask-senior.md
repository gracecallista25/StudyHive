# Ask a Senior

Open the section from Home or the sidebar (`#ask-senior`).

The feature lives in `src/features/ask-senior`:

- `AskSeniorPage.tsx`: search, combined filters, selected senior and saved preview questions.
- `SeniorCard.tsx`: a senior summary with profile and question actions.
- `SeniorProfile.tsx`: background, topics, suggested questions and the question form.
- `seniorData.ts`: display types and fictional profiles.
- `askSenior.css`: scoped responsive styles using the existing theme.

The implementation reuses Button, StudentAvatar and AcademicArt. No dependencies were added.

This is a frontend preview, not backend integration. Senior availability is fictional. Saved questions keep their topic and text only while this page is mounted. They can be reviewed and edited; leaving Ask a Senior or refreshing clears them. No messages are sent and no replies are generated. Unavailable seniors cannot receive preview questions.

A production version needs authenticated endpoints for senior discovery, availability, question submission and replies. No such contract is currently present in this checkout.

Checks: `npm run typecheck`, `npm run lint`, `npm run build`, and `npm run test:ui -- tests/ask-senior.spec.ts tests/home.spec.ts tests/projects.spec.ts tests/notifications.spec.ts`.
