from fastapi import FastAPI
from Router.LanguageRouter import router as language_router
from Router.EmailRouter import router as email_router

from Db.session import engine, Base

Base.metadata.create_all(bind=engine)  # Initialize tables

app = FastAPI(title="FastAPI Language Service")

app.include_router(language_router)
app.include_router(email_router)

