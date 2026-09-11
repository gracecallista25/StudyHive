from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uuid

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

users = {}

Valid_Degrees = {"bachelor", "master"}
MAX_GRADE_BY_DEGREE = {"bachelor": 5, "master": 3}

Bachelor_Majors = {
    "Computer Science",
    "Robot Engineering",
    "Architecture",
    "Electronic Engineering",
    "Business Administration",
    "Mechanical Engineering",
    "Economy",
    "Civil Engineering",
}

Master_Majors = {
    "Computer Technology",
    "Communication Engineering",
    "Architecture",
    "Electronic Engineering",
    "Business Administration",
    "Mechanical Engineering",
    "Economy",
    "Civil Engineering",
    "Environmental Engineering",
    "Power Engineering",
    "Biomedical Engineering",
    "Chemistry",
    "Urban-Rural Planning",
}

Majors_by_degree = {
    "bachelor": Bachelor_Majors,
    "master": Master_Majors,
}


class RegisterRequest(BaseModel):
    full_name: str
    student_id: str
    password: str
    email: str
    major: str
    degree: str
    grade: int


class LoginRequest(BaseModel):
    student_id: str
    password: str


@app.post("/register")
def register(request: RegisterRequest):
    if len(request.password) < 8:
        return {"status": "failed", "reason": "Password needs to be at least 8 characters"}

    if request.degree not in Valid_Degrees:
        return {"status": "failed", "reason": "Degree must be 'bachelor' or 'master'"}

    max_grade = MAX_GRADE_BY_DEGREE[request.degree]
    if not (1 <= request.grade <= max_grade):
        return {
            "status": "failed",
            "reason": f"Grade for {request.degree} must be between 1 and {max_grade}",
        }

    valid_majors_for_degree = Majors_by_degree[request.degree]
    if request.major not in valid_majors_for_degree:
        return {
            "status": "failed",
            "reason": f"Major not recognized for {request.degree} students",
        }

    for user in users.values():
        if user["student_id"] == request.student_id:
            return {"status": "failed", "reason": "Student ID already registered"}

    user_id = str(uuid.uuid4())
    users[user_id] = {
        "full_name": request.full_name,
        "student_id": request.student_id,
        "password": request.password,
        "email": request.email,
        "major": request.major,
        "degree": request.degree,
        "grade": request.grade,
    }

    return {
        "status": "success",
        "user_id": user_id,
        "user": {
            "id": user_id,
            "full_name": request.full_name,
            "student_id": request.student_id,
            "email": request.email,
            "major": request.major,
            "degree": request.degree,
            "grade": request.grade,
        },
    }


@app.post("/login")
def login(request: LoginRequest):
    for user_id, user in users.items():
        if user["student_id"] == request.student_id and user["password"] == request.password:
            return {
                "status": "success",
                "user_id": user_id,
                "user": {
                    "id": user_id,
                    "full_name": user["full_name"],
                    "student_id": user["student_id"],
                    "email": user["email"],
                    "major": user["major"],
                    "degree": user["degree"],
                    "grade": user["grade"],
                },
            }
    return {"status": "failed", "reason": "Either student ID or password is incorrect"}


@app.get("/users/{user_id}")
def get_user(user_id: str):
    if user_id not in users:
        return {"status": "failed", "reason": "User not found"}
    return {"status": "success", "user": users[user_id]}


@app.get("/majors/{degree}")
def get_majors(degree: str):
    if degree not in Majors_by_degree:
        return {"status": "failed", "reason": "Degree must be 'bachelor' or 'master'"}
    return {"status": "success", "majors": sorted(Majors_by_degree[degree])}


# Profile API supplied by the backend teammate.

from typing import List, Optional


Badges = {
    "setup_hive":   {"name": "Set up your Hive",  "description": "Complete your profile"},
    "meet_someone": {"name": "Meet Someone",       "description": "Study together with a new student"},
    "study_group":  {"name": "Study Group",        "description": "Join or make a study group with 3+ members"},
    "help_junior":  {"name": "Help Junior",        "description": "Answer a question in Ask a Senior"},
    "find_teammate":{"name": "Find Teammate",      "description": "Join or recruit someone for a project"},
    "day_streak":   {"name": "Day Streak",         "description": "Keep your study streak going"},
}


MAX_DISPLAYED_BADGES = 3


class UpdateProfileRequest(BaseModel):
    description: Optional[str] = None
    profile_picture: Optional[str] = None  # URL or base64, frontend's call


class SetDisplayedBadgesRequest(BaseModel):
    badge_ids: List[str]


@app.patch("/profile/{user_id}")
def update_profile(user_id: str, request: UpdateProfileRequest):
    if user_id not in users:
        return {"status": "failed", "reason": "User not found"}

    user = users[user_id]

    if request.description is not None:
        user["description"] = request.description
    if request.profile_picture is not None:
        user["profile_picture"] = request.profile_picture

    # Auto-award "setup_hive" once picture + description are both filled in
    if user["profile_picture"] and user["description"] and "setup_hive" not in user["badges_earned"]:
        user["badges_earned"].append("setup_hive")

    return {"status": "success", "user": public_user(user_id)}


@app.get("/badges")
def get_Badges():
    return {"status": "success", "badges": Badges}


@app.post("/profile/{user_id}/badges/{badge_id}")
def award_badge(user_id: str, badge_id: str):
    """Called by other feature endpoints when a user earns a badge
    (e.g. after joining a 3+ member group, answering a senior question, etc.)"""
    if user_id not in users:
        return {"status": "failed", "reason": "User not found"}

    if badge_id not in Badges:
        return {"status": "failed", "reason": "Badge does not exist"}

    user = users[user_id]

    if badge_id not in user["badges_earned"]:
        user["badges_earned"].append(badge_id)

    return {"status": "success", "badges_earned": user["badges_earned"]}


@app.put("/profile/{user_id}/displayed-badges")
def set_displayed_badges(user_id: str, request: SetDisplayedBadgesRequest):
    """The 'customize' button — user picks which of their earned badges show on their profile."""
    if user_id not in users:
        return {"status": "failed", "reason": "User not found"}

    if len(request.badge_ids) > MAX_DISPLAYED_BADGES:
        return {"status": "failed", "reason": f"You can display up to {MAX_DISPLAYED_BADGES} badges"}

    user = users[user_id]

    for badge_id in request.badge_ids:
        if badge_id not in user["badges_earned"]:
            return {"status": "failed", "reason": f"Badge '{badge_id}' has not been earned yet"}

    user["badges_displayed"] = request.badge_ids

    return {"status": "success", "badges_displayed": user["badges_displayed"]}


def public_user(user_id: str) -> dict:
    """Returns a user dict without the password field."""
    user = users[user_id]
    return {
        "id": user_id,
        "full_name": user["full_name"],
        "student_id": user["student_id"],
        "email": user["email"],
        "major": user["major"],
        "degree": user["degree"],
        "grade": user["grade"],
        "description": user["description"],
        "profile_picture": user["profile_picture"],
        "badges_earned": user["badges_earned"],
        "badges_displayed": user["badges_displayed"]
    }
