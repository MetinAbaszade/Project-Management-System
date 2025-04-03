from fastapi import APIRouter, Depends, HTTPException, Path
from typing import List
from Schemas.LanguageSchema import LanguageCreate, LanguageResponse
from Services.LanguageService import LanguageService

router = APIRouter(
    prefix="/languages",
    tags=["Languages"],
    responses={404: {"description": "Not found"}}
)

@router.post("/", response_model=LanguageResponse, summary="Create a new language")
def create_language(
    language_data: LanguageCreate,
    languageService: LanguageService = Depends()
):
    return languageService.AddLanguage(language_data)

@router.get("/", response_model=List[LanguageResponse], summary="Get all languages")
def list_languages(languageService: LanguageService = Depends()):
    return languageService.FetchAllLanguages()

@router.get("/{language_id}", response_model=LanguageResponse, summary="Get a specific language")
def retrieve_language(
    language_id: int = Path(description="The ID of the language to retrieve"),
    languageService: LanguageService = Depends()
):
    language = languageService.fetch_language_by_id(language_id)
    if not language:
        raise HTTPException(status_code=404, detail="Language not found")
    return language

@router.delete("/{language_id}", status_code=204, summary="Delete a language")
def delete_language(
    language_id: int = Path(description="The ID of the language to delete"),
    languageService: LanguageService = Depends()
):
    success = languageService.remove_language(language_id)
    if not success:
        raise HTTPException(status_code=404, detail="Language not found")
