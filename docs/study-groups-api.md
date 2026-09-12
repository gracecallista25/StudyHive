# Study rooms frontend

Study Groups uses the teammate backend in StudyHive-backend. No backend implementation was changed.

- GET /study-groups: optional course, major, date, start_time, end_time, location, viewer_id. Both times must be supplied together. Search excludes rooms the viewer belongs to on the server.
- POST /study-groups: user_id, course, date, start_time, end_time, location, notes, max_members (integer, minimum 2, includes creator). Returns group.
- GET /study-groups/{id}: refresh details and roster.
- POST /study-groups/{id}/request: from_user_id. A successful request is pending approval, not membership.
- DELETE /study-groups/{id}?user_id=...: creator cancels the room.

Cards show course, date, times, location, notes, creator, member_count/max_members and members. Capacity is editable during creation only. The backend currently has no update endpoint. To support editing published capacity, the teammate needs an owner-authorized PATCH endpoint accepting max_members and returning the updated group, validating an integer >= 2 and >= current membership, and handling full/open status consistently. This proposed endpoint is not called by the UI.

Request approval UI and a persistent My Rooms listing are left for later. Current search excludes memberships; a freshly created room is shown immediately, but is not a persisted client-side room list. Rooms form teams; they do not provide chat or hosted sessions.
