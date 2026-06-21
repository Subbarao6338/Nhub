from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Optional
import os, time, shutil
from api.core.notion.notion_engine import NotionEngine
from api.core.notion.parsers import process_uploaded_document
from api.core.notion.scraper import run_scraper
from notion_client import Client

router = APIRouter()
UPLOAD_FOLDER = "api/temp_cache"

@router.post("/validate")
async def validate_notion(token: str, workspace_id: Optional[str] = None):
    try:
        notion = Client(auth=token); notion.users.me()
        return {"valid": True}
    except Exception as e: return {"valid": False, "error": str(e)}

@router.post("/upload")
async def upload_document(token: str = Form(...), workspace_id: str = Form(...), file: UploadFile = File(...)):
    if not os.path.exists(UPLOAD_FOLDER): os.makedirs(UPLOAD_FOLDER)
    file_path = os.path.join(UPLOAD_FOLDER, f"{int(time.time())}_{file.filename}")
    with open(file_path, "wb") as b: shutil.copyfileobj(file.file, b)
    try:
        _, ext = os.path.splitext(file.filename)
        chunks = process_uploaded_document(file_path, ext)
        engine = NotionEngine(token, workspace_id)
        entry_id = engine.ingest_content(file.filename, chunks, {"path": file.filename})
        return {"success": True, "page_id": entry_id}
    except Exception as e: raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(file_path): os.remove(file_path)

@router.post("/scrape")
async def scrape_to_notion(url: str = Form(...), token: str = Form(...), workspace_id: str = Form(...)):
    try:
        title = run_scraper(url, token, workspace_id)
        return {"success": True, "title": title}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
