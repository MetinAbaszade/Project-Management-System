from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, Enum, ForeignKey
from Db.session import Base
from datetime import datetime
import enum

class DataType(enum.Enum):
    string = "string"
    number = "number"
    boolean = "boolean"
    json = "json"
    date = "date"

class AdminSetting(Base):
    __tablename__ = "admin_settings"

    setting_id = Column(Integer, primary_key=True, autoincrement=True)
    setting_key = Column(String(100), nullable=False, unique=True)
    setting_value = Column(Text)
    category = Column(String(50), nullable=False)
    description = Column(Text)
    is_encrypted = Column(Boolean, default=False)
    data_type = Column(Enum(DataType), default=DataType.string)
    validation_regex = Column(String(255))
    default_value = Column(Text)
    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    updated_by = Column(Integer, ForeignKey("users.user_id"), nullable=True)

    # Relationships
    updater = relationship("User", foreign_keys=[updated_by])
