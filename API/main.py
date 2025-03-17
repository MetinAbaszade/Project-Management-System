import uvicorn
from fastapi import FastAPI
from Router.LanguageRouter import router as language_router
from Router.EmailRouter import router as email_router
from Router.AuthRouter import router as auth_router  # New auth router

from Db.session import engine, Base

app = FastAPI(title="Process Management API", version="1.0")

@app.get("/")
def home():
    return {"message": "FastAPI is running successfully!"}

# Initialize database tables
def init_db():
    Base.metadata.create_all(bind=engine)

# app = FastAPI(title="FastAPI Language Service")

# Run database initialization on startup
@app.on_event("startup")
def startup():
    init_db()

# Include existing routers
app.include_router(language_router)
app.include_router(email_router)
app.include_router(auth_router)  # Include authentication endpoints

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5007)
