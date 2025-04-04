from sqlalchemy.orm import Session
from Models.Language import Language
from Schemas.LanguageSchema import LanguageCreate
from Db.session import SessionLocal

class LanguageRepository:
    def __init__(self):
        self.db = SessionLocal()

    def CreateLanguage(self, languageData: LanguageCreate):
        language = Language(**languageData.dict())
        self.db.add(language)
        self.db.commit()
        self.db.refresh(language)
        return language

    def GetAllLanguages(self):
        print(self.db.query(Language).all())
        return self.db.query(Language).all()

    def GetLanguageById(self, languageId: int):
        return self.db.query(Language).filter(Language.Id == languageId).first()

    def DeleteLanguage(self, languageId: int):
        language = self.db.query(Language).filter(Language.Id == languageId).first()
        if language:
            self.db.delete(language)
            self.db.commit()
            return True
        return False

    def __del__(self):
        self.db.close()
