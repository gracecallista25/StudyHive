# StudyHive backend prototype

This is the teammate-provided FastAPI code, with Python indentation restored and message-formatting escapes removed. Its behavior is unchanged. Backend development remains the teammate's responsibility.

## Run locally on Windows

From the repository root, with Python installed:

```powershell
py -m venv backend/.venv
backend/.venv/Scripts/python.exe -m pip install -r backend/requirements.txt
backend/.venv/Scripts/python.exe -m uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
```

API documentation: http://127.0.0.1:8000/docs

To connect registration, copy the root .env.example to .env.local, set:

```dotenv
VITE_API_BASE_URL=http://127.0.0.1:8000
```

Restart the frontend with `npm run dev` in another terminal. Frontend login displays the POST /login result when connected.

## Included endpoints

- POST /register: full_name, student_id, password, email, major, degree, grade.
- POST /login: student_id and password.
- GET /users/{user_id}: lookup by user ID.
- GET /majors/{degree}: sorted degree-specific majors.

Degree is bachelor or master. Grade is numeric year of study: 1–5 for bachelor, 1–3 for master.

## Existing prototype limitations

Use fictional accounts for local testing. Users exist only in process memory and disappear on restart/reload. Passwords are stored as plaintext, and the supplied /users/{user_id} endpoint returns them without authentication. Login issues no session or token. These behaviors are preserved from the supplied code and need teammate changes before real account use. The frontend does not call the user lookup endpoint.
