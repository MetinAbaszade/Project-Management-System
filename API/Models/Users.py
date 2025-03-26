from sqlalchemy import Column, Integer, String, Boolean, DateTime
from datetime import datetime, timezone
from Db.session import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(50), index=True, nullable=False)  # ✅ ADDED LENGTH
    last_name = Column(String(50), index=True, nullable=False)   # ✅ ADDED LENGTH
    email = Column(String(100), unique=True, index=True, nullable=False)  # ✅ ADDED LENGTH
    hashed_password = Column(String(255), nullable=False)  # ✅ ADDED LENGTH

    is_active = Column(Boolean, default=True, nullable=False)
    image_url = Column(String(255), nullable=True)  # ✅ ADDED LENGTH

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc)) 
    last_login = Column(DateTime, nullable=True)

    reset_token = Column(String(255), nullable=True, unique=True)  # ✅ ADDED LENGTH
    reset_token_expires = Column(DateTime, nullable=True)
