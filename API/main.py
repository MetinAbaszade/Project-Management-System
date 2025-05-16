from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from Models import *


# Routers
from Router.EmailRouter import router as email_router
from Router.AuthRouter import router as auth_router
from Router.TeamRouter import router as team_router
from Router.ProjectRouter import router as project_router
from Router.TaskRouter import router as task_router
from Router.ProjectScopeRouter import router as project_scope_router
from Router.UserRouter import router as user_router
from Router.RiskRouter import router as risk_router
from Router.ResourcesRouter import router as resource_router
from Router.AttachmentRouter import router as attachment_router
from Router.StakeholderRouter import router as stakeholder_router

# Database
from Db.session import engine, Base

app = FastAPI(
    title="Taskup API",
    version="1.0",
    description="Backend API for Task Management System"
)

# ✅ CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Update if frontend runs elsewhere
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Create tables
def init_db():
    Base.metadata.create_all(bind=engine)

@app.on_event("startup")
def on_startup():
    init_db()

# ✅ Health check route
@app.get("/")
def root():
    return {"message": "FastAPI is running 🚀"}

# ✅ Register routers
app.include_router(email_router)
app.include_router(auth_router)
app.include_router(project_router)
app.include_router(project_scope_router)
app.include_router(team_router)
app.include_router(task_router)
app.include_router(user_router)
app.include_router(risk_router)
app.include_router(resource_router)
app.include_router(attachment_router)
app.include_router(stakeholder_router)

# ✅ Run app
if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8001, reload=True)
