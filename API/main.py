import uvicorn
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from Router.LanguageRouter import router as language_router
from Router.EmailRouter import router as email_router
from Router.AuthRouter import router as auth_router  # Auth router for login system
from Db.session import engine, Base
from pydantic import BaseModel

app = FastAPI(title="Process Management API", version="1.0")

# ✅ Fix CORS Issues (Allow frontend requests)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5500"],  # Frontend on 5500 (VS Code Live Server)
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
)

# ✅ Ensure database tables are initialized
def init_db():
    Base.metadata.create_all(bind=engine)

@app.on_event("startup")
def startup():
    init_db()

# ✅ Check if the server is running
@app.get("/")
def home():
    return {"message": "FastAPI is running successfully!"}

# ✅ Ensure `/login` is registered correctly
class LoginRequest(BaseModel):
    email: str
    password: str

@app.post("/login")  # ✅ Directly register login route
def login(request: LoginRequest):
    if request.email == "test@example.com" and request.password == "123456":
        return {"access_token": "fake_token", "token_type": "bearer"}
    else:
        raise HTTPException(status_code=401, detail="Invalid credentials")

# ✅ Include all routers (Make sure auth_router has `prefix="/auth"`)
app.include_router(language_router)
app.include_router(email_router)
app.include_router(auth_router, prefix="/auth")  # ✅ Ensure routes are namespaced

# ✅ Ensure server runs on `8000` (matching frontend requests)
if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000, reload=True)
