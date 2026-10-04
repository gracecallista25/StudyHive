from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI();
users = {}

class StudentRequest(BaseModel):
    name: str
    age: int

@app.post("/student")
def student(request: StudentRequest):
    return {"status": "success", "name": request.name, "age": request.age}

