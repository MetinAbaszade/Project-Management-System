import uuid
from sqlalchemy import Column, String, Text, DateTime, Boolean, Enum, ForeignKey
from datetime import datetime
from Db.session import Base
import enum
from sqlalchemy.orm import relationship

class DataTypeEnum(enum.Enum):
    string = "string"
    number = "number"
    boolean = "boolean"
    json = "json"
    date = "date"

class AdminSetting(Base):
    __tablename__ = "AdminSettings"
    Id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    SettingKey = Column(String(100), nullable=False, unique=True)
    SettingValue = Column(Text)
    Category = Column(String(50), nullable=False)
    Description = Column(Text)
    IsEncrypted = Column(Boolean, default=False)
    DataType = Column(Enum(DataTypeEnum), default=DataTypeEnum.string)
    ValidationRegex = Column(String(255))
    DefaultValue = Column(Text)
    LastUpdated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    UpdatedBy = Column(String(36), ForeignKey("Users.Id"), nullable=True)
    
    
    Updater = relationship("User", foreign_keys=[UpdatedBy])
