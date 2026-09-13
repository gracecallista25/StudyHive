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
projects = {}
project_requests = {}
senior_profiles = {}
senior_questions = {}
conversations = {}
messages = {}

VALID_DEGREES = {"bachelor", "master"}
MAX_GRADE_BY_DEGREE = {"bachelor": 5, "master": 3}

BACHELOR_MAJORS = {
    "Computer Science",
    "Robot Engineering",
    "Architecture",
    "Electronic Engineering",
    "Business Administration",
    "Mechanical Engineering",
    "Economy",
    "Civil Engineering"
}

MASTER_MAJORS = {
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

MAJORS_BY_DEGREE = {
    "bachelor": BACHELOR_MAJORS,
    "master": MASTER_MAJORS,
}



VALID_COURSES = {
    "Pre-Calculus",
    "Calculus",
    "Linear Algebra",
    "College Physics IA",
    "Electric Circuits",
    "College Physics IB",
    "Fundamentals of Electronic Technology",
    "High-level Language Programming (C++)",
    "Computer Networks",
    "Probability and Statistics",
    "Life And Health Science",
    "Chinese Language"
}



Badges = {
    "setup_hive":    {"name": "Set up your Hive",  "description": "Complete your profile"},
    "meet_someone":  {"name": "Meet Someone",       "description": "Study together with a new student"},
    "study_group":   {"name": "Study Group",        "description": "Join or make a study group with 3+ members"},
    "help_junior":   {"name": "Help Junior",        "description": "Answer a question in Ask a Senior"},
    "find_teammate": {"name": "Find Teammate",      "description": "Join or recruit someone for a project"},
    "day_streak":    {"name": "Day Streak",         "description": "Keep your study streak going"},
}

PROJECT_TYPES = {"Class project", "Event", "Hackathon", "Research", "Startup idea", "Personal project", "Other"}

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


class RoleInput(BaseModel):
    role_name: str
    skills: List[str]


class CreateProjectRequest(BaseModel):
    user_id: str
    name: str
    summary: str
    description: str
    project_type: str
    roles: List[RoleInput]


class SendProjectJoinRequest(BaseModel):
    from_user_id: str
    desired_role: str
    message: Optional[str] = None


class RespondProjectRequest(BaseModel):
    action: str  # "accept" or "decline"


class BecomeSeniorRequest(BaseModel):
    user_id: str
    full_name: str
    major: str
    year_of_study: int
    courses: List[str]        # split from the comma-separated "Courses you can help with" field
    topics: List[str]         # split from the comma-separated "Help topics" field
    bio: str                  # "Why would you like to become a senior?"
    availability_text: str    # "When can you help?" — free text, e.g. "Weekday evenings"


class SetSeniorAvailabilityRequest(BaseModel):
    available: bool


class AskSeniorQuestionRequest(BaseModel):
    from_user_id: str
    topic: str
    question: str


class AnswerQuestionRequest(BaseModel):
    answer: str


class CreateConversationRequest(BaseModel):
    creator_id: str
    type: str              # "personal" or "group"
    member_ids: List[str]  # personal: exactly one other user; group: the other members
    name: Optional[str] = None  # required for group


class SendMessageRequest(BaseModel):
    from_user_id: str
    text: str






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
        "conversation_id": listing.get("conversation_id"),
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
        "conversation_id": group.get("conversation_id"),
        "created_by": {
            "id": creator["id"],
            "full_name": creator["full_name"],
            "major": creator["major"],
            "degree": creator["degree"],
            "grade": creator["grade"],
            "profile_picture": creator["profile_picture"]
        }
    }


def public_project(project_id: str) -> dict:
    project = projects[project_id]
    creator = public_user(project["creator_id"])

    roles_view = []
    for role in project["roles"]:
        roles_view.append({
            "role_name": role["role_name"],
            "skills": role["skills"],
            "filled": role["filled"]
        })

    members_view = []
    for member in project["members"]:
        member_user = public_user(member["user_id"])
        members_view.append({
            "user": member_user,
            "role_name": member["role_name"]
        })

    return {
        "id": project_id,
        "name": project["name"],
        "summary": project["summary"],
        "description": project["description"],
        "project_type": project["project_type"],
        "status": project["status"],
        "roles": roles_view,
        "open_roles_count": sum(1 for r in project["roles"] if not r["filled"]),
        "members": members_view,
        "conversation_id": project.get("conversation_id"),
        "created_by": {
            "id": creator["id"], "full_name": creator["full_name"], "major": creator["major"],
            "degree": creator["degree"], "grade": creator["grade"], "profile_picture": creator["profile_picture"]
        }
    }

def public_senior(user_id: str) -> dict:
    profile = senior_profiles[user_id]
    return {
        "user_id": user_id,
        "full_name": profile["full_name"],
        "major": profile["major"],
        "year_of_study": profile["year_of_study"],
        "courses": profile["courses"],
        "topics": profile["topics"],
        "bio": profile["bio"],
        "availability_text": profile["availability_text"],
        "available": profile["available"],
        "profile_picture": users[user_id]["profile_picture"]
    }



def get_or_create_personal_conversation(user_a: str, user_b: str) -> str:
    for conv_id, conv in conversations.items():
        if conv["type"] == "personal" and set(conv["member_ids"]) == {user_a, user_b}:
            return conv_id

    conv_id = str(uuid.uuid4())
    conversations[conv_id] = {
        "type": "personal",
        "name": None,
        "member_ids": [user_a, user_b],
        "created_at": datetime.utcnow().isoformat()
    }
    return conv_id


def create_group_conversation(name: str, creator_id: str) -> str:
    conv_id = str(uuid.uuid4())
    conversations[conv_id] = {
        "type": "group",
        "name": name,
        "member_ids": [creator_id],
        "created_at": datetime.utcnow().isoformat()
    }
    return conv_id


def get_last_message(conversation_id: str):
    conv_messages = [m for m in messages.values() if m["conversation_id"] == conversation_id]
    if not conv_messages:
        return None
    conv_messages.sort(key=lambda m: m["created_at"])
    last = conv_messages[-1]
    return {"from_user_id": last["from_user_id"], "text": last["text"], "created_at": last["created_at"]}


def public_conversation(conversation_id: str) -> dict:
    conv = conversations[conversation_id]
    return {
        "id": conversation_id,
        "type": conv["type"],
        "name": conv["name"],
        "members": [public_user(uid) for uid in conv["member_ids"]],
        "last_message": get_last_message(conversation_id)
    }



















# ---------- auth ----------

@app.post("/register")
def register(request: RegisterRequest):
    if len(request.password) < 8:
        return {"status": "failed", "reason": "Password needs to be at least 8 characters"}

    if request.degree not in VALID_DEGREES:
        return {"status": "failed", "reason": "Degree must be 'bachelor' or 'master'"}

    max_grade = MAX_GRADE_BY_DEGREE[request.degree]
    if not (1 <= request.grade <= max_grade):
        return {"status": "failed", "reason": f"Grade for {request.degree} must be between 1 and {max_grade}"}

    if request.major not in MAJORS_BY_DEGREE[request.degree]:
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
    if degree not in MAJORS_BY_DEGREE:
        return {"status": "failed", "reason": "Degree must be 'bachelor' or 'master'"}
    return {"status": "success", "majors": sorted(MAJORS_BY_DEGREE[degree])}









@app.get("/users")
def list_users(major: Optional[str] = Query(None), degree: Optional[str] = Query(None)):
    results = []
    for user_id, user in users.items():
        if major and user["major"] != major:
            continue
        if degree and user["degree"] != degree:
            continue
        results.append(public_user(user_id))

    return {"status": "success", "users": results}


















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



@app.get("/courses")
def get_courses():
    return {"status": "success", "courses": sorted(VALID_COURSES)}


@app.post("/study-buddy")
def create_study_buddy_listing(request: CreateStudyBuddyRequest):
    if request.user_id not in users:
        return {"status": "failed", "reason": "User not found"}
    if request.start_time >= request.end_time:
        return {"status": "failed", "reason": "start_time must be before end_time"}
    if request.course not in VALID_COURSES:
        return {"status": "failed", "reason": "Course not recognized"}

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
    
    # prevent duplicate pending requests from the same user to the same list
    for req in buddy_requests.values():
        if (req["listing_id"] == listing_id
                and req["from_user_id"] == request.from_user_id
                and req["status"] == "pending"):
            return {"status": "failed", "reason": "You already have a pending request for this listing"}

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
        conv_id = get_or_create_personal_conversation(req["from_user_id"], req["to_user_id"])
        study_buddy_listings[req["listing_id"]]["conversation_id"] = conv_id
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
    if request.course not in VALID_COURSES:
        return {"status": "failed", "reason": "Course not recognized"}

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
    conv_id = create_group_conversation(f"{request.course} Study Group", request.user_id)
    study_groups[group_id]["conversation_id"] = conv_id

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
        conv_id = group["conversation_id"]

        if req["from_user_id"] not in conversations[conv_id]["member_ids"]:
            conversations[conv_id]["member_ids"].append(req["from_user_id"])

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

    for request_id, req in project_requests.items():
        if req["to_user_id"] == user_id and req["status"] == "pending":
            inbox.append({
                "request_id": request_id,
                "type": "project_join",
                "from_user": public_user(req["from_user_id"]),
                "project": public_project(req["project_id"]),
                "desired_role": req["desired_role"],
                "message": req.get("message")
            })

    for question_id, q in senior_questions.items():
        if q["senior_id"] == user_id and q["status"] == "pending":
            inbox.append({
                "request_id": question_id,
                "type": "senior_question",
                "from_user": public_user(q["from_user_id"]),
                "topic": q["topic"],
                "question": q["question"]
            })

    return {"status": "success", "requests": inbox}



















# ---------- projects ----------


@app.post("/projects")
def create_project(request: CreateProjectRequest):
    if request.user_id not in users:
        return {"status": "failed", "reason": "User not found"}
    if request.project_type not in PROJECT_TYPES:
        return {"status": "failed", "reason": f"project_type must be one of {sorted(PROJECT_TYPES)}"}
    if not request.roles or len(request.roles) == 0:
        return {"status": "failed", "reason": "At least one role is required"}

    project_id = str(uuid.uuid4())
    roles = []
    for role in request.roles:
        roles.append({
            "role_name": role.role_name,
            "skills": role.skills,
            "filled": False
        })

    projects[project_id] = {
        "creator_id": request.user_id,
        "name": request.name,
        "summary": request.summary,
        "description": request.description,
        "project_type": request.project_type,
        "roles": roles,
        "members": [],  # creator isn't auto-added as a "role member" — they're shown separately as owner
        "status": "open",  # open | full | cancelled
        "created_at": datetime.utcnow().isoformat()
    }
    conv_id = create_group_conversation(request.name, request.user_id)
    projects[project_id]["conversation_id"] = conv_id

    return {"status": "success", "project_id": project_id, "project": public_project(project_id)}


@app.get("/projects")
def browse_projects(
    viewer_id: Optional[str] = Query(None),
    skill: Optional[str] = Query(None),
    project_type: Optional[str] = Query(None),
    open_only: bool = Query(True),
):
    results = []
    for project_id, project in projects.items():
        if project["status"] == "cancelled":
            continue
        if open_only and project["status"] != "open":
            continue
        if viewer_id and project["creator_id"] == viewer_id:
            continue

        if project_type and project["project_type"] != project_type:
            continue
        if skill:
            skill_lower = skill.lower()
            has_skill = any(skill_lower in [s.lower() for s in role["skills"]] for role in project["roles"])
            if not has_skill:
                continue

        results.append(public_project(project_id))

    return {"status": "success", "projects": results}


@app.get("/projects/{project_id}")
def get_project(project_id: str):
    if project_id not in projects:
        return {"status": "failed", "reason": "Project not found"}
    return {"status": "success", "project": public_project(project_id)}


@app.delete("/projects/{project_id}")
def cancel_project(project_id: str, user_id: str):
    if project_id not in projects:
        return {"status": "failed", "reason": "Project not found"}

    project = projects[project_id]
    if project["creator_id"] != user_id:
        return {"status": "failed", "reason": "Only the creator can cancel this project"}

    project["status"] = "cancelled"
    return {"status": "success"}


@app.post("/projects/{project_id}/request")
def send_project_join_request(project_id: str, request: SendProjectJoinRequest):
    if project_id not in projects:
        return {"status": "failed", "reason": "Project not found"}

    project = projects[project_id]
    if project["status"] != "open":
        return {"status": "failed", "reason": "This project is not open to join requests"}
    if project["creator_id"] == request.from_user_id:
        return {"status": "failed", "reason": "You can't request to join your own project"}

    matching_role = next((r for r in project["roles"] if r["role_name"] == request.desired_role), None)
    if matching_role is None:
        return {"status": "failed", "reason": "That role does not exist on this project"}
    if matching_role["filled"]:
        return {"status": "failed", "reason": "That role has already been filled"}

    for req in project_requests.values():
        if (req["project_id"] == project_id and req["from_user_id"] == request.from_user_id
                and req["status"] == "pending"):
            return {"status": "failed", "reason": "You already have a pending request for this project"}

    request_id = str(uuid.uuid4())
    project_requests[request_id] = {
        "project_id": project_id,
        "from_user_id": request.from_user_id,
        "to_user_id": project["creator_id"],
        "desired_role": request.desired_role,
        "message": request.message,
        "status": "pending",
        "created_at": datetime.utcnow().isoformat()
    }

    return {"status": "success", "request_id": request_id}


@app.post("/project-requests/{request_id}/respond")
def respond_to_project_request(request_id: str, request: RespondProjectRequest):
    if request_id not in project_requests:
        return {"status": "failed", "reason": "Request not found"}

    req = project_requests[request_id]
    if req["status"] != "pending":
        return {"status": "failed", "reason": "This request has already been handled"}

    project = projects[req["project_id"]]

    if request.action == "accept":
        matching_role = next((r for r in project["roles"] if r["role_name"] == req["desired_role"]), None)
        if matching_role is None or matching_role["filled"]:
            return {"status": "failed", "reason": "That role is no longer available"}

        req["status"] = "accepted"
        matching_role["filled"] = True
        project["members"].append({"user_id": req["from_user_id"], "role_name": req["desired_role"]})
        conv_id = project["conversation_id"]

        if req["from_user_id"] not in conversations[conv_id]["member_ids"]:
            conversations[conv_id]["member_ids"].append(req["from_user_id"])

        _award_badge(req["from_user_id"], "find_teammate")
        _award_badge(project["creator_id"], "find_teammate")

        if all(r["filled"] for r in project["roles"]):
            project["status"] = "full"

    elif request.action == "decline":
        req["status"] = "declined"
    else:
        return {"status": "failed", "reason": "action must be 'accept' or 'decline'"}

    return {"status": "success", "request": req}




















# ---------- ask a senior ----------

@app.post("/seniors")
def become_senior(request: BecomeSeniorRequest):
    """Create or update a senior profile — acts as an upsert,
    so re-submitting the form (e.g. to edit courses/topics) just overwrites it."""
    if request.user_id not in users:
        return {"status": "failed", "reason": "User not found"}
    if request.year_of_study < 1:
        return {"status": "failed", "reason": "year_of_study must be at least 1"}
    if not request.courses:
        return {"status": "failed", "reason": "List at least one course you can help with"}
    for course in request.courses:
        if course not in VALID_COURSES:
            return {"status": "failed", "reason": f"'{course}' is not a recognized course"}    

    senior_profiles[request.user_id] = {
        "full_name": request.full_name,
        "major": request.major,
        "year_of_study": request.year_of_study,
        "courses": request.courses,
        "topics": request.topics,
        "bio": request.bio,
        "availability_text": request.availability_text,
        "available": True  # defaults to available as soon as they sign up
    }

    return {"status": "success", "senior": public_senior(request.user_id)}


@app.get("/seniors")
def browse_seniors(
    course: Optional[str] = Query(None),
    major: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    available_only: bool = Query(False),
):
    results = []
    for user_id, profile in senior_profiles.items():
        if available_only and not profile["available"]:
            continue
        if major and profile["major"].lower() != major.lower():
            continue
        if course:
            course_lower = course.lower()
            if not any(course_lower in c.lower() for c in profile["courses"]):
                continue
        if search:
            search_lower = search.lower()
            haystack = " ".join([
                profile["full_name"],
                profile["bio"],
                " ".join(profile["courses"]),
                " ".join(profile["topics"])
            ]).lower()
            if search_lower not in haystack:
                continue

        results.append(public_senior(user_id))

    return {"status": "success", "seniors": results}


@app.get("/seniors/{user_id}")
def get_senior(user_id: str):
    if user_id not in senior_profiles:
        return {"status": "failed", "reason": "This user is not a senior"}
    return {"status": "success", "senior": public_senior(user_id)}


@app.patch("/seniors/{user_id}/availability")
def set_senior_availability(user_id: str, request: SetSeniorAvailabilityRequest):
    if user_id not in senior_profiles:
        return {"status": "failed", "reason": "This user is not a senior"}

    senior_profiles[user_id]["available"] = request.available
    return {"status": "success", "senior": public_senior(user_id)}


@app.post("/seniors/{user_id}/questions")
def ask_senior_question(user_id: str, request: AskSeniorQuestionRequest):
    if user_id not in senior_profiles:
        return {"status": "failed", "reason": "This user is not a senior"}
    if request.from_user_id not in users:
        return {"status": "failed", "reason": "User not found"}
    if request.from_user_id == user_id:
        return {"status": "failed", "reason": "You can't ask yourself a question"}

    question_id = str(uuid.uuid4())
    senior_questions[question_id] = {
        "senior_id": user_id,
        "from_user_id": request.from_user_id,
        "topic": request.topic,
        "question": request.question,
        "answer": None,
        "status": "pending",  # pending | answered
        "created_at": datetime.utcnow().isoformat()
    }

    return {"status": "success", "question_id": question_id}


@app.post("/questions/{question_id}/answer")
def answer_question(question_id: str, request: AnswerQuestionRequest):
    if question_id not in senior_questions:
        return {"status": "failed", "reason": "Question not found"}

    q = senior_questions[question_id]
    if q["status"] == "answered":
        return {"status": "failed", "reason": "This question has already been answered"}

    q["answer"] = request.answer
    q["status"] = "answered"

    _award_badge(q["senior_id"], "help_junior")

    return {"status": "success", "question": q}


@app.get("/questions/asked/{user_id}")
def get_my_asked_questions(user_id: str):
    """Lets an asker check on questions they've sent, since there's no messaging yet."""
    results = []
    for question_id, q in senior_questions.items():
        if q["from_user_id"] == user_id:
            results.append({
                "question_id": question_id,
                "senior": public_senior(q["senior_id"]),
                "topic": q["topic"],
                "question": q["question"],
                "answer": q["answer"],
                "status": q["status"]
            })

    return {"status": "success", "questions": results}




@app.get("/seniors/{user_id}/questions")
def get_received_questions(user_id: str):
    if user_id not in senior_profiles:
        return {"status": "failed", "reason": "This user is not a senior"}

    results = []
    for question_id, q in senior_questions.items():
        if q["senior_id"] == user_id:
            results.append({
                "question_id": question_id,
                "from_user": public_user(q["from_user_id"]),
                "topic": q["topic"],
                "question": q["question"],
                "answer": q["answer"],
                "status": q["status"]
            })

    return {"status": "success", "questions": results}















# ---------- messages ----------

@app.post("/conversations")
def create_conversation(request: CreateConversationRequest):
    if request.creator_id not in users:
        return {"status": "failed", "reason": "User not found"}

    if request.type == "personal":
        if len(request.member_ids) != 1:
            return {"status": "failed", "reason": "Personal chat needs exactly one other member"}
        other_id = request.member_ids[0]
        if other_id not in users:
            return {"status": "failed", "reason": "User not found"}

        conv_id = get_or_create_personal_conversation(request.creator_id, other_id)
        return {"status": "success", "conversation": public_conversation(conv_id)}

    elif request.type == "group":
        if not request.name:
            return {"status": "failed", "reason": "Group chat needs a name"}
        for uid in request.member_ids:
            if uid not in users:
                return {"status": "failed", "reason": f"User {uid} not found"}

        conv_id = str(uuid.uuid4())
        all_members = list(dict.fromkeys([request.creator_id] + request.member_ids))  # de-dupe, keep order
        conversations[conv_id] = {
            "type": "group",
            "name": request.name,
            "member_ids": all_members,
            "created_at": datetime.utcnow().isoformat()
        }
        return {"status": "success", "conversation": public_conversation(conv_id)}

    else:
        return {"status": "failed", "reason": "type must be 'personal' or 'group'"}


@app.get("/conversations/{user_id}")
def get_conversations(user_id: str, search: Optional[str] = Query(None)):
    if user_id not in users:
        return {"status": "failed", "reason": "User not found"}

    results = []
    for conv_id, conv in conversations.items():
        if user_id not in conv["member_ids"]:
            continue

        if search:
            search_lower = search.lower()
            display_name = conv["name"] or ""
            member_names = " ".join(users[uid]["full_name"] for uid in conv["member_ids"])
            if search_lower not in (display_name + " " + member_names).lower():
                continue

        results.append(public_conversation(conv_id))

    results.sort(key=lambda c: c["last_message"]["created_at"] if c["last_message"] else "", reverse=True)
    return {"status": "success", "conversations": results}


@app.post("/conversations/{conversation_id}/messages")
def send_message(conversation_id: str, request: SendMessageRequest):
    if conversation_id not in conversations:
        return {"status": "failed", "reason": "Conversation not found"}

    conv = conversations[conversation_id]
    if request.from_user_id not in conv["member_ids"]:
        return {"status": "failed", "reason": "You're not a member of this conversation"}
    if not request.text.strip():
        return {"status": "failed", "reason": "Message text cannot be empty"}

    message_id = str(uuid.uuid4())
    messages[message_id] = {
        "conversation_id": conversation_id,
        "from_user_id": request.from_user_id,
        "text": request.text,
        "created_at": datetime.utcnow().isoformat()
    }

    return {"status": "success", "message_id": message_id, "message": messages[message_id]}


@app.get("/conversations/{conversation_id}/messages")
def get_messages(conversation_id: str, viewer_id: Optional[str] = Query(None)):
    if conversation_id not in conversations:
        return {"status": "failed", "reason": "Conversation not found"}
    if viewer_id and viewer_id not in conversations[conversation_id]["member_ids"]:
        return {"status": "failed", "reason": "You're not a member of this conversation"}

    conv_messages = [m for m in messages.values() if m["conversation_id"] == conversation_id]
    conv_messages.sort(key=lambda m: m["created_at"])

    return {"status": "success", "messages": conv_messages}



















# ---------- fake demo data ----------

def seed_data():
    # ---------- fake users ----------

    alice_id = str(uuid.uuid4())
    bob_id = str(uuid.uuid4())
    carol_id = str(uuid.uuid4())
    david_id = str(uuid.uuid4())
    emma_id = str(uuid.uuid4())
    frank_id = str(uuid.uuid4())
    grace_id = str(uuid.uuid4())
    henry_id = str(uuid.uuid4())

    users[alice_id] = {
        "full_name": "Alice Zhang",
        "student_id": "22S000001",
        "password": "demo1234",
        "email": "alice@hitsz.edu.cn",
        "major": "Computer Science",
        "degree": "bachelor",
        "grade": 3,
        "description": "CS junior who enjoys programming and solving difficult problems.",
        "profile_picture": "",
        "badges_earned": ["setup_hive"],
        "badges_displayed": ["setup_hive"]
    }

    users[bob_id] = {
        "full_name": "Bob Chen",
        "student_id": "22S000002",
        "password": "demo1234",
        "email": "bob@hitsz.edu.cn",
        "major": "Electronic Engineering",
        "degree": "bachelor",
        "grade": 2,
        "description": "Trying to survive Electric Circuits and build something useful.",
        "profile_picture": "",
        "badges_earned": [],
        "badges_displayed": []
    }

    users[carol_id] = {
        "full_name": "Carol Wu",
        "student_id": "22S000003",
        "password": "demo1234",
        "email": "carol@hitsz.edu.cn",
        "major": "Computer Technology",
        "degree": "master",
        "grade": 1,
        "description": "First-year master's student interested in networks and statistics.",
        "profile_picture": "",
        "badges_earned": ["setup_hive"],
        "badges_displayed": ["setup_hive"]
    }

    users[david_id] = {
        "full_name": "David Li",
        "student_id": "23S000004",
        "password": "demo1234",
        "email": "david@hitsz.edu.cn",
        "major": "Robot Engineering",
        "degree": "bachelor",
        "grade": 2,
        "description": "Robotics student who spends too much time building things.",
        "profile_picture": "",
        "badges_earned": [],
        "badges_displayed": []
    }

    users[emma_id] = {
        "full_name": "Emma Wang",
        "student_id": "24S000005",
        "password": "demo1234",
        "email": "emma@hitsz.edu.cn",
        "major": "Architecture",
        "degree": "bachelor",
        "grade": 4,
        "description": "Architecture student looking for people to study with.",
        "profile_picture": "",
        "badges_earned": ["setup_hive"],
        "badges_displayed": ["setup_hive"]
    }

    users[frank_id] = {
        "full_name": "Frank Huang",
        "student_id": "24S000006",
        "password": "demo1234",
        "email": "frank@hitsz.edu.cn",
        "major": "Mechanical Engineering",
        "degree": "bachelor",
        "grade": 3,
        "description": "Mechanical engineering student. Always looking for a good study group.",
        "profile_picture": "",
        "badges_earned": [],
        "badges_displayed": []
    }

    users[grace_id] = {
        "full_name": "Grace Liu",
        "student_id": "25S000007",
        "password": "demo1234",
        "email": "grace@hitsz.edu.cn",
        "major": "Biomedical Engineering",
        "degree": "master",
        "grade": 2,
        "description": "Biomedical engineering student interested in science and research.",
        "profile_picture": "",
        "badges_earned": [],
        "badges_displayed": []
    }

    users[henry_id] = {
        "full_name": "Henry Zhao",
        "student_id": "25S000008",
        "password": "demo1234",
        "email": "henry@hitsz.edu.cn",
        "major": "Business Administration",
        "degree": "bachelor",
        "grade": 1,
        "description": "Freshman trying to make friends and keep up with classes.",
        "profile_picture": "",
        "badges_earned": [],
        "badges_displayed": []
    }


    # ---------- fake study buddy listings ----------

    listing_id = str(uuid.uuid4())
    study_buddy_listings[listing_id] = {
        "user_id": alice_id,
        "course": "Calculus",
        "date": "2026-09-20",
        "start_time": "14:00",
        "end_time": "17:00",
        "location": "Library 3F",
        "notes": "Reviewing integration techniques before the upcoming quiz.",
        "status": "open",
        "created_at": datetime.utcnow().isoformat()
    }

    listing_id = str(uuid.uuid4())
    study_buddy_listings[listing_id] = {
        "user_id": bob_id,
        "course": "Electric Circuits",
        "date": "2026-09-20",
        "start_time": "18:00",
        "end_time": "20:00",
        "location": "Building C, Room 204",
        "notes": "Going through circuit analysis exercises together.",
        "status": "open",
        "created_at": datetime.utcnow().isoformat()
    }

    listing_id = str(uuid.uuid4())
    study_buddy_listings[listing_id] = {
        "user_id": david_id,
        "course": "Linear Algebra",
        "date": "2026-09-21",
        "start_time": "15:00",
        "end_time": "17:00",
        "location": "Library 2F",
        "notes": "Need some help with eigenvalues and matrix transformations.",
        "status": "open",
        "created_at": datetime.utcnow().isoformat()
    }

    listing_id = str(uuid.uuid4())
    study_buddy_listings[listing_id] = {
        "user_id": emma_id,
        "course": "Chinese Language",
        "date": "2026-09-22",
        "start_time": "16:00",
        "end_time": "18:00",
        "location": "Student Center",
        "notes": "Practicing speaking and reviewing vocabulary together.",
        "status": "open",
        "created_at": datetime.utcnow().isoformat()
    }

    listing_id = str(uuid.uuid4())
    study_buddy_listings[listing_id] = {
        "user_id": frank_id,
        "course": "College Physics IA",
        "date": "2026-09-23",
        "start_time": "19:00",
        "end_time": "21:00",
        "location": "Building D, Room 301",
        "notes": "Working through mechanics problem sets.",
        "status": "open",
        "created_at": datetime.utcnow().isoformat()
    }

    listing_id = str(uuid.uuid4())
    study_buddy_listings[listing_id] = {
        "user_id": henry_id,
        "course": "Pre-Calculus",
        "date": "2026-09-24",
        "start_time": "13:00",
        "end_time": "15:00",
        "location": "Library 1F",
        "notes": "Looking for someone to review functions and trigonometry.",
        "status": "open",
        "created_at": datetime.utcnow().isoformat()
    }


    # ---------- fake study groups ----------

    group_id = str(uuid.uuid4())
    conv_id = create_group_conversation(
        "Linear Algebra Study Group",
        bob_id
    )

    study_groups[group_id] = {
        "creator_id": bob_id,
        "course": "Linear Algebra",
        "date": "2026-09-21",
        "start_time": "18:00",
        "end_time": "20:00",
        "location": "Building C, Room 302",
        "max_members": 4,
        "members": [bob_id],
        "notes": "Going over eigenvalues and matrix transformations.",
        "status": "open",
        "created_at": datetime.utcnow().isoformat(),
        "conversation_id": conv_id
    }

    group_id = str(uuid.uuid4())
    conv_id = create_group_conversation(
        "Programming Practice",
        alice_id
    )

    study_groups[group_id] = {
        "creator_id": alice_id,
        "course": "High-level Language Programming (C++)",
        "date": "2026-09-22",
        "start_time": "17:00",
        "end_time": "19:00",
        "location": "Library 4F",
        "max_members": 5,
        "members": [alice_id],
        "notes": "Practice C++ problems and help each other debug code.",
        "status": "open",
        "created_at": datetime.utcnow().isoformat(),
        "conversation_id": conv_id
    }

    group_id = str(uuid.uuid4())
    conv_id = create_group_conversation(
        "Probability Review",
        carol_id
    )

    study_groups[group_id] = {
        "creator_id": carol_id,
        "course": "Probability and Statistics",
        "date": "2026-09-23",
        "start_time": "18:30",
        "end_time": "20:30",
        "location": "Building B, Room 205",
        "max_members": 4,
        "members": [carol_id],
        "notes": "Reviewing probability distributions and statistics exercises.",
        "status": "open",
        "created_at": datetime.utcnow().isoformat(),
        "conversation_id": conv_id
    }

    group_id = str(uuid.uuid4())
    conv_id = create_group_conversation(
        "Physics Problem Solving",
        frank_id
    )

    study_groups[group_id] = {
        "creator_id": frank_id,
        "course": "College Physics IB",
        "date": "2026-09-25",
        "start_time": "15:00",
        "end_time": "17:00",
        "location": "Building D, Room 205",
        "max_members": 6,
        "members": [frank_id],
        "notes": "Solving problems together and preparing for the next test.",
        "status": "open",
        "created_at": datetime.utcnow().isoformat(),
        "conversation_id": conv_id
    }


    # ---------- fake projects ----------

    project_id = str(uuid.uuid4())
    conv_id = create_group_conversation(
        "Campus Connect",
        carol_id
    )

    projects[project_id] = {
        "creator_id": carol_id,
        "name": "Campus Connect",
        "summary": "A platform that helps students discover campus communities.",
        "description": "A simple place for students to discover events, find communities, and make plans together.",
        "project_type": "Class project",
        "roles": [
            {
                "role_name": "Frontend developer",
                "skills": ["C++"],
                "filled": False
            },
            {
                "role_name": "UI designer",
                "skills": ["Architecture"],
                "filled": False
            }
        ],
        "members": [],
        "status": "open",
        "created_at": datetime.utcnow().isoformat(),
        "conversation_id": conv_id
    }

    project_id = str(uuid.uuid4())
    conv_id = create_group_conversation(
        "Smart Campus Robot",
        david_id
    )

    projects[project_id] = {
        "creator_id": david_id,
        "name": "Smart Campus Robot",
        "summary": "Build a small robot to help students navigate campus.",
        "description": "A student robotics project focused on navigation and useful campus assistance.",
        "project_type": "Personal project",
        "roles": [
            {
                "role_name": "Mechanical engineer",
                "skills": ["Mechanical Engineering"],
                "filled": False
            },
            {
                "role_name": "Electronics member",
                "skills": ["Electronic Engineering"],
                "filled": False
            }
        ],
        "members": [],
        "status": "open",
        "created_at": datetime.utcnow().isoformat(),
        "conversation_id": conv_id
    }

    project_id = str(uuid.uuid4())
    conv_id = create_group_conversation(
        "Student Research Project",
        grace_id
    )

    projects[project_id] = {
        "creator_id": grace_id,
        "name": "Student Research Project",
        "summary": "Explore applications of biomedical engineering in daily life.",
        "description": "A small research project looking at how engineering can improve healthcare and student life.",
        "project_type": "Research",
        "roles": [
            {
                "role_name": "Research assistant",
                "skills": ["Probability and Statistics"],
                "filled": False
            },
            {
                "role_name": "Project member",
                "skills": ["Life And Health Science"],
                "filled": False
            }
        ],
        "members": [],
        "status": "open",
        "created_at": datetime.utcnow().isoformat(),
        "conversation_id": conv_id
    }


    # ---------- fake senior profiles ----------

    senior_profiles[carol_id] = {
        "full_name": "Carol Wu",
        "major": "Computer Technology",
        "year_of_study": 1,
        "courses": [
            "Computer Networks",
            "Probability and Statistics"
        ],
        "topics": [
            "Course planning",
            "Exam prep",
            "Study strategies"
        ],
        "bio": "Happy to help with Computer Networks and Probability and Statistics.",
        "availability_text": "Weekday evenings",
        "available": True
    }

    senior_profiles[alice_id] = {
        "full_name": "Alice Zhang",
        "major": "Computer Science",
        "year_of_study": 3,
        "courses": [
            "Calculus",
            "High-level Language Programming (C++)"
        ],
        "topics": [
            "Programming",
            "Calculus",
            "Exam prep"
        ],
        "bio": "Can help with C++ programming and Calculus. Always happy to explain things.",
        "availability_text": "Tuesday and Thursday afternoons",
        "available": True
    }

    senior_profiles[emma_id] = {
        "full_name": "Emma Wang",
        "major": "Architecture",
        "year_of_study": 4,
        "courses": [
            "Chinese Language",
            "Life And Health Science"
        ],
        "topics": [
            "Course planning",
            "Campus life"
        ],
        "bio": "Fourth-year student. Happy to share my experience with new students.",
        "availability_text": "Weekend afternoons",
        "available": True
    }

    senior_profiles[frank_id] = {
        "full_name": "Frank Huang",
        "major": "Mechanical Engineering",
        "year_of_study": 3,
        "courses": [
            "College Physics IA",
            "College Physics IB",
            "Linear Algebra"
        ],
        "topics": [
            "Physics",
            "Problem solving",
            "Exam prep"
        ],
        "bio": "I can help with Physics and Linear Algebra problem solving.",
        "availability_text": "Monday and Wednesday evenings",
        "available": True
    }

@app.on_event("startup")
def on_startup():
    seed_data()