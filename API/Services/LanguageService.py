from fastapi import Depends
from Repositories.LanguageRepository import LanguageRepository
from Schemas.LanguageSchema import LanguageCreate

class LanguageService:
    def __init__(self, language_repository: LanguageRepository = Depends()):
        self.language_repository = language_repository  # Store instance

    def add_language(self, language_data: LanguageCreate):
        return self.language_repository.create_language(language_data)

    def fetch_all_languages(self):
        return self.language_repository.get_all_languages()

    def fetch_language_by_id(self, language_id: int):
        return self.language_repository.get_language_by_id(language_id)

    def remove_language(self, language_id: int):
        return self.language_repository.delete_language(language_id)
