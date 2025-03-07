from sqlalchemy.orm import Session
from Models.Language import Language
from Schemas.LanguageSchema import LanguageCreate
from Db.session import SessionLocal  # Import session factory

class LanguageRepository:
    def __init__(self):
        # Create session when repository is initialized
        self.db = SessionLocal()

    def create_language(self, language_data: LanguageCreate):
        language = Language(**language_data.dict())
        self.db.add(language)
        self.db.commit()
        self.db.refresh(language)
        return language

    def get_all_languages(self):
        return self.db.query(Language).all()

    def get_language_by_id(self, language_id: int):
        return self.db.query(Language).filter(Language.language_id == language_id).first()

    def delete_language(self, language_id: int):
        language = self.db.query(Language).filter(Language.language_id == language_id).first()
        if language:
            self.db.delete(language)
            self.db.commit()
            return True
        return False

    def __del__(self):
        """Ensure the database session is closed when the repository is deleted."""
        self.db.close()
