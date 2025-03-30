from Db.session import SessionLocal

def GetDb():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
