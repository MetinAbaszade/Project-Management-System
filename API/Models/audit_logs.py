from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from Db.session import Base
from datetime import datetime

class AuditLog(Base):
    __tablename__ = "audit_logs"

    log_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=True)
    action_type = Column(String(50), nullable=False)
    entity_type = Column(String(50), nullable=False)
    entity_id = Column(Integer)
    action_time = Column(DateTime, default=datetime.utcnow)
    ip_address = Column(String(45))
    user_agent = Column(Text)
    request_method = Column(String(10))
    request_path = Column(String(255))
    changes_made = Column(Text)
    status_code = Column(Integer)

    # Relationships
    user = relationship("User", foreign_keys=[user_id])
