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

# Add to Services/ProjectService.py
def UpdateProject(self, userId: UUID, projectId: UUID, projectData: 'ProjectUpdate'):
    """
    Update an existing project. Only the project owner can update a project.
    """
    # Step 1: Check if project exists
    project = self.db.query(Project).filter(
        Project.Id == str(projectId),
        Project.IsDeleted == False
    ).first()
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Step 2: Check if user is the owner
    if str(project.OwnerId) != str(userId):
        raise HTTPException(status_code=403, detail="Only the project owner can update the project")
    
    # Step 3: Update project
    updateData = projectData.dict(exclude_unset=True)
    return ProjectRepository.UpdateProject(self.db, projectId, updateData)