import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Routers
from Router.LanguageRouter import router as language_router
from Router.EmailRouter import router as email_router
from Router.AuthRouter import router as auth_router

# Database
from Db.session import engine, Base

app = FastAPI(
    title="Taskup API",
    version="1.0",
    description="Backend API for Task Management System"
)

# ✅ Enable CORS (for frontend running on localhost:5500)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5500"],  # VSCode Live Server or other local frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Create DB tables on app startup
def init_db():
    Base.metadata.create_all(bind=engine)

@app.on_event("startup")
def on_startup():
    init_db()

# ✅ Root route (for health check)
@app.get("/")
def root():
    return {"message": "FastAPI is running 🚀"}

# ✅ Include Routers
app.include_router(language_router)
app.include_router(email_router)
app.include_router(auth_router, prefix="/auth")  # Auth route is namespaced

# ✅ Only run uvicorn if executing directly
if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
