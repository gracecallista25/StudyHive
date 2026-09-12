from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uuid
from datetime import datetime

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

users = {}
study_buddy_listings = {}
buddy_requests = {}
study_groups = {}
group_requests = {}

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
    "Civil Engineering"
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

Badges = {
    "setup_hive":    {"name": "Set up your Hive",  "description": "Complete your profile"},
    "meet_someone":  {"name": "Meet Someone",       "description": "Study together with a new student"},
    "study_group":   {"name": "Study Group",        "description": "Join or make a study group with 3+ members"},
    "help_junior":   {"name": "Help Junior",        "description": "Answer a question in Ask a Senior"},
    "find_teammate": {"name": "Find Teammate",      "description": "Join or recruit someone for a project"},
    "day_streak":    {"name": "Day Streak",         "description": "Keep your study streak going"},
}

MAX_DISPLAYED_BADGES = 3
STUDY_GROUP_BADGE_THRESHOLD = 3


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


class UpdateProfileRequest(BaseModel):
    description: Optional[str] = None
    profile_picture: Optional[str] = None


class SetDisplayedBadgesRequest(BaseModel):
    badge_ids: List[str]


class CreateStudyBuddyRequest(BaseModel):
    user_id: str
    course: str
    date: str
    start_time: str
    end_time: str
    location: str
    notes: Optional[str] = None


class SendBuddyRequest(BaseModel):
    from_user_id: str


class RespondBuddyRequest(BaseModel):
    action: str  # "accept" or "decline"


class CreateStudyGroupRequest(BaseModel):
    user_id: str
    course: str
    date: str
    start_time: str
    end_time: str
    location: str
    max_members: int
    notes: Optional[str] = None


class SendGroupJoinRequest(BaseModel):
    from_user_id: str


class RespondGroupRequest(BaseModel):
    action: str  # "accept" or "decline"


# ---------- helpers ----------

def public_user(user_id: str) -> dict:
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


def _award_badge(user_id: str, badge_id: str):
    if user_id in users and badge_id in Badges:
        if badge_id not in users[user_id]["badges_earned"]:
            users[user_id]["badges_earned"].append(badge_id)


def times_overlap(a_start: str, a_end: str, b_start: str, b_end: str) -> bool:
    return a_start < b_end and b_start < a_end


def public_listing(listing_id: str) -> dict:
    listing = study_buddy_listings[listing_id]
    creator = public_user(listing["user_id"])
    return {
        "id": listing_id,
        "course": listing["course"],
        "date": listing["date"],
        "start_time": listing["start_time"],
        "end_time": listing["end_time"],
        "location": listing["location"],
        "notes": listing["notes"],
        "status": listing["status"],
        "created_by": {
            "id": creator["id"],
            "full_name": creator["full_name"],
            "major": creator["major"],
            "degree": creator["degree"],
            "grade": creator["grade"],
            "profile_picture": creator["profile_picture"]
        }
    }


def public_group(group_id: str) -> dict:
    group = study_groups[group_id]
    creator = public_user(group["creator_id"])
    return {
        "id": group_id,
        "course": group["course"],
        "date": group["date"],
        "start_time": group["start_time"],
        "end_time": group["end_time"],
        "location": group["location"],
        "notes": group["notes"],
        "status": group["status"],
        "max_members": group["max_members"],
        "member_count": len(group["members"]),
        "members": [public_user(uid) for uid in group["members"]],
        "created_by": {
            "id": creator["id"],
            "full_name": creator["full_name"],
            "major": creator["major"],
            "degree": creator["degree"],
            "grade": creator["grade"],
            "profile_picture": creator["profile_picture"]
        }
    }


# ---------- auth ----------

@app.post("/register")
def register(request: RegisterRequest):
    if len(request.password) < 8:
        return {"status": "failed", "reason": "Password needs to be at least 8 characters"}

    if request.degree not in Valid_Degrees:
        return {"status": "failed", "reason": "Degree must be 'bachelor' or 'master'"}

    max_grade = MAX_GRADE_BY_DEGREE[request.degree]
    if not (1 <= request.grade <= max_grade):
        return {"status": "failed", "reason": f"Grade for {request.degree} must be between 1 and {max_grade}"}

    if request.major not in Majors_by_degree[request.degree]:
        return {"status": "failed", "reason": f"Major not recognized for {request.degree} students"}

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
        "description": "",
        "profile_picture": "",
        "badges_earned": [],
        "badges_displayed": []
    }

    return {"status": "success", "user_id": user_id, "user": public_user(user_id)}


@app.post("/login")
def login(request: LoginRequest):
    for user_id, user in users.items():
        if user["student_id"] == request.student_id and user["password"] == request.password:
            return {"status": "success", "user_id": user_id, "user": public_user(user_id)}

    return {"status": "failed", "reason": "Either student ID or password is incorrect"}


@app.get("/users/{user_id}")
def get_user(user_id: str):
    if user_id not in users:
        return {"status": "failed", "reason": "User not found"}
    return {"status": "success", "user": public_user(user_id)}


@app.get("/majors/{degree}")
def get_majors(degree: str):
    if degree not in Majors_by_degree:
        return {"status": "failed", "reason": "Degree must be 'bachelor' or 'master'"}
    return {"status": "success", "majors": sorted(Majors_by_degree[degree])}


# ---------- profile ----------

@app.patch("/profile/{user_id}")
def update_profile(user_id: str, request: UpdateProfileRequest):
    if user_id not in users:
        return {"status": "failed", "reason": "User not found"}

    user = users[user_id]
    if request.description is not None:
        user["description"] = request.description
    if request.profile_picture is not None:
        user["profile_picture"] = request.profile_picture

    if user["profile_picture"] and user["description"]:
        _award_badge(user_id, "setup_hive")

    return {"status": "success", "user": public_user(user_id)}


@app.get("/badges")
def get_badges():
    return {"status": "success", "badges": Badges}


@app.post("/profile/{user_id}/badges/{badge_id}")
def award_badge(user_id: str, badge_id: str):
    if user_id not in users:
        return {"status": "failed", "reason": "User not found"}
    if badge_id not in Badges:
        return {"status": "failed", "reason": "Badge does not exist"}

    _award_badge(user_id, badge_id)
    return {"status": "success", "badges_earned": users[user_id]["badges_earned"]}


@app.put("/profile/{user_id}/displayed-badges")
def set_displayed_badges(user_id: str, request: SetDisplayedBadgesRequest):
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


# ---------- study buddy ----------

@app.post("/study-buddy")
def create_study_buddy_listing(request: CreateStudyBuddyRequest):
    if request.user_id not in users:
        return {"status": "failed", "reason": "User not found"}
    if request.start_time >= request.end_time:
        return {"status": "failed", "reason": "start_time must be before end_time"}

    listing_id = str(uuid.uuid4())
    study_buddy_listings[listing_id] = {
        "user_id": request.user_id,
        "course": request.course,
        "date": request.date,
        "start_time": request.start_time,
        "end_time": request.end_time,
        "location": request.location,
        "notes": request.notes,
        "status": "open",
        "created_at": datetime.utcnow().isoformat()
    }

    return {"status": "success", "listing_id": listing_id, "listing": public_listing(listing_id)}


@app.get("/study-buddy")
def browse_study_buddy(
    viewer_id: Optional[str] = Query(None),
    major: Optional[str] = Query(None),
    course: Optional[str] = Query(None),
    date: Optional[str] = Query(None),
    start_time: Optional[str] = Query(None),
    end_time: Optional[str] = Query(None),
    location: Optional[str] = Query(None),
):
    results = []
    for listing_id, listing in study_buddy_listings.items():
        if listing["status"] != "open":
            continue
        if viewer_id and listing["user_id"] == viewer_id:
            continue

        creator = users[listing["user_id"]]
        if major and creator["major"] != major:
            continue
        if course and course.lower() not in listing["course"].lower():
            continue
        if date and listing["date"] != date:
            continue
        if location and location.lower() not in listing["location"].lower():
            continue
        if start_time and end_time:
            if not times_overlap(listing["start_time"], listing["end_time"], start_time, end_time):
                continue

        results.append(public_listing(listing_id))

    return {"status": "success", "listings": results}


@app.get("/study-buddy/{listing_id}")
def get_study_buddy_listing(listing_id: str):
    if listing_id not in study_buddy_listings:
        return {"status": "failed", "reason": "Listing not found"}
    return {"status": "success", "listing": public_listing(listing_id)}


@app.delete("/study-buddy/{listing_id}")
def cancel_study_buddy_listing(listing_id: str, user_id: str):
    if listing_id not in study_buddy_listings:
        return {"status": "failed", "reason": "Listing not found"}

    listing = study_buddy_listings[listing_id]
    if listing["user_id"] != user_id:
        return {"status": "failed", "reason": "Only the creator can cancel this listing"}

    listing["status"] = "cancelled"
    return {"status": "success"}


@app.post("/study-buddy/{listing_id}/request")
def send_buddy_request(listing_id: str, request: SendBuddyRequest):
    if listing_id not in study_buddy_listings:
        return {"status": "failed", "reason": "Listing not found"}

    listing = study_buddy_listings[listing_id]
    if listing["status"] != "open":
        return {"status": "failed", "reason": "This listing is no longer open"}
    if listing["user_id"] == request.from_user_id:
        return {"status": "failed", "reason": "You can't request your own listing"}

    request_id = str(uuid.uuid4())
    buddy_requests[request_id] = {
        "listing_id": listing_id,
        "from_user_id": request.from_user_id,
        "to_user_id": listing["user_id"],
        "status": "pending",
        "created_at": datetime.utcnow().isoformat()
    }

    return {"status": "success", "request_id": request_id}


@app.post("/requests/{request_id}/respond")
def respond_to_request(request_id: str, request: RespondBuddyRequest):
    if request_id not in buddy_requests:
        return {"status": "failed", "reason": "Request not found"}

    req = buddy_requests[request_id]
    if req["status"] != "pending":
        return {"status": "failed", "reason": "This request has already been handled"}

    if request.action == "accept":
        req["status"] = "accepted"
        study_buddy_listings[req["listing_id"]]["status"] = "matched"
        _award_badge(req["from_user_id"], "meet_someone")
        _award_badge(req["to_user_id"], "meet_someone")
    elif request.action == "decline":
        req["status"] = "declined"
    else:
        return {"status": "failed", "reason": "action must be 'accept' or 'decline'"}

    return {"status": "success", "request": req}


# ---------- study group ----------

@app.post("/study-groups")
def create_study_group(request: CreateStudyGroupRequest):
    if request.user_id not in users:
        return {"status": "failed", "reason": "User not found"}
    if request.start_time >= request.end_time:
        return {"status": "failed", "reason": "start_time must be before end_time"}
    if request.max_members < 2:
        return {"status": "failed", "reason": "max_members must be at least 2"}

    group_id = str(uuid.uuid4())
    study_groups[group_id] = {
        "creator_id": request.user_id,
        "course": request.course,
        "date": request.date,
        "start_time": request.start_time,
        "end_time": request.end_time,
        "location": request.location,
        "max_members": request.max_members,
        "members": [request.user_id],  # creator auto-joins
        "notes": request.notes,
        "status": "open",  # open | full | cancelled
        "created_at": datetime.utcnow().isoformat()
    }

    return {"status": "success", "group_id": group_id, "group": public_group(group_id)}


@app.get("/study-groups")
def browse_study_groups(
    viewer_id: Optional[str] = Query(None),
    major: Optional[str] = Query(None),
    course: Optional[str] = Query(None),
    date: Optional[str] = Query(None),
    start_time: Optional[str] = Query(None),
    end_time: Optional[str] = Query(None),
    location: Optional[str] = Query(None),
):
    results = []
    for group_id, group in study_groups.items():
        if group["status"] != "open":
            continue
        if viewer_id and viewer_id in group["members"]:
            continue  # already a member, or it's your own group

        creator = users[group["creator_id"]]
        if major and creator["major"] != major:
            continue
        if course and course.lower() not in group["course"].lower():
            continue
        if date and group["date"] != date:
            continue
        if location and location.lower() not in group["location"].lower():
            continue
        if start_time and end_time:
            if not times_overlap(group["start_time"], group["end_time"], start_time, end_time):
                continue

        results.append(public_group(group_id))

    return {"status": "success", "groups": results}


@app.get("/study-groups/{group_id}")
def get_study_group(group_id: str):
    if group_id not in study_groups:
        return {"status": "failed", "reason": "Group not found"}
    return {"status": "success", "group": public_group(group_id)}


@app.delete("/study-groups/{group_id}")
def cancel_study_group(group_id: str, user_id: str):
    if group_id not in study_groups:
        return {"status": "failed", "reason": "Group not found"}

    group = study_groups[group_id]
    if group["creator_id"] != user_id:
        return {"status": "failed", "reason": "Only the creator can cancel this group"}

    group["status"] = "cancelled"
    return {"status": "success"}


@app.post("/study-groups/{group_id}/request")
def send_group_join_request(group_id: str, request: SendGroupJoinRequest):
    if group_id not in study_groups:
        return {"status": "failed", "reason": "Group not found"}

    group = study_groups[group_id]
    if group["status"] != "open":
        return {"status": "failed", "reason": "This group is not open to join requests"}
    if request.from_user_id in group["members"]:
        return {"status": "failed", "reason": "You're already a member of this group"}
    if len(group["members"]) >= group["max_members"]:
        return {"status": "failed", "reason": "This group is full"}

    # prevent duplicate pending requests from the same user to the same group
    for req in group_requests.values():
        if (req["group_id"] == group_id
                and req["from_user_id"] == request.from_user_id
                and req["status"] == "pending"):
            return {"status": "failed", "reason": "You already have a pending request for this group"}

    request_id = str(uuid.uuid4())
    group_requests[request_id] = {
        "group_id": group_id,
        "from_user_id": request.from_user_id,
        "to_user_id": group["creator_id"],
        "status": "pending",
        "created_at": datetime.utcnow().isoformat()
    }

    return {"status": "success", "request_id": request_id}


@app.post("/group-requests/{request_id}/respond")
def respond_to_group_request(request_id: str, request: RespondGroupRequest):
    if request_id not in group_requests:
        return {"status": "failed", "reason": "Request not found"}

    req = group_requests[request_id]
    if req["status"] != "pending":
        return {"status": "failed", "reason": "This request has already been handled"}

    group = study_groups[req["group_id"]]

    if request.action == "accept":
        if len(group["members"]) >= group["max_members"]:
            return {"status": "failed", "reason": "This group is now full"}

        req["status"] = "accepted"
        group["members"].append(req["from_user_id"])

        if len(group["members"]) >= group["max_members"]:
            group["status"] = "full"

        if len(group["members"]) >= STUDY_GROUP_BADGE_THRESHOLD:
            for member_id in group["members"]:
                _award_badge(member_id, "study_group")

    elif request.action == "decline":
        req["status"] = "declined"
    else:
        return {"status": "failed", "reason": "action must be 'accept' or 'decline'"}

    return {"status": "success", "request": req}


# ---------- unified request inbox ----------

@app.get("/requests/{user_id}")
def get_inbox(user_id: str):
    if user_id not in users:
        return {"status": "failed", "reason": "User not found"}

    inbox = []

    for request_id, req in buddy_requests.items():
        if req["to_user_id"] == user_id and req["status"] == "pending":
            inbox.append({
                "request_id": request_id,
                "type": "study_buddy",
                "from_user": public_user(req["from_user_id"]),
                "listing": public_listing(req["listing_id"])
            })

    for request_id, req in group_requests.items():
        if req["to_user_id"] == user_id and req["status"] == "pending":
            inbox.append({
                "request_id": request_id,
                "type": "study_group",
                "from_user": public_user(req["from_user_id"]),
                "group": public_group(req["group_id"])
            })

    return {"status": "success", "requests": inbox}