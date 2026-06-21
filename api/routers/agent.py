from fastapi import APIRouter, Form, HTTPException
from api.core.agent.test_case_generator import generate_test_cases
router = APIRouter()

@router.post("/generate-tests")
async def generate_tests(api_key: str = Form(...), requirement: str = Form(...)):
    try:
        test_cases = generate_test_cases(requirement, api_key)
        return {"success": True, "test_cases": test_cases}
    except Exception as e: raise HTTPException(status_code=500, detail=str(e))
