import uvicorn
from fastapi import FastAPI
from Router.LanguageRouter import router as language_router
from Router.EmailRouter import router as email_router

from Db.session import engine, Base

# Initialize tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="FastAPI Language Service")

app.include_router(language_router)
app.include_router(email_router)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5007)
