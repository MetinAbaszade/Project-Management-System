from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from Models import *


# Routers
from Router.LanguageRouter import router as language_router
from Router.EmailRouter import router as email_router
from Router.AuthRouter import router as auth_router
from Router.ProjectRouter import router as project_router  # ✅ New import

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
    allow_origins=["http://127.0.0.1:5500"],  # Update if frontend runs elsewhere
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
app.include_router(language_router)
app.include_router(email_router)
app.include_router(auth_router)
app.include_router(project_router)  # ✅ Add this!

# ✅ Run app
if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8001, reload=True)
