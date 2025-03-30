from fastapi import Depends
from Repositories.LanguageRepository import LanguageRepository
from Schemas.LanguageSchema import LanguageCreate

class LanguageService:
    def __init__(self, languageRepository: LanguageRepository = Depends()):
        self.languageRepository = languageRepository  # Store instance

    def AddLanguage(self, language_data: LanguageCreate):
        return self.languageRepository.CreateLanguage(language_data)

    def FetchAllLanguages(self):
        return self.languageRepository.GetAllLanguages()

    def FetchLanguageById(self, languageId: int):
        return self.languageRepository.GetLanguageById(languageId)

    def RemoveLanguage(self, languageId: int):
        return self.languageRepository.DeleteLanguage(languageId)
