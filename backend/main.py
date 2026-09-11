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
