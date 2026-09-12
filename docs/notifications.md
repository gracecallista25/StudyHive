# Notifications

Open Notifications from Home or the sidebar (`#notifications`).

This is a frontend preview using fictional data. Read state and request decisions live in React state and reset when the page unmounts. Accept and Decline do not change real study-group membership. The page labels this limitation visibly.

- `src/features/notifications/NotificationsPage.tsx` handles filters, selection, read state and preview decisions.
- `src/features/notifications/notificationData.ts` defines the display type and example data.
- `src/features/notifications/notifications.css` uses existing global theme variables and responsive layout rules.

The page reuses Button and StudentAvatar. No new dependencies were added. There is no notification backend contract in this repository yet; real notifications, persisted read state and authorized membership decisions need backend integration before production use.

Verification: `npm run typecheck`, `npm run lint`, `npm run build`, and `npm run test:ui -- tests/notifications.spec.ts tests/home.spec.ts`.
