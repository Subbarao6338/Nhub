from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import StreamingResponse
import cv2, numpy as np, io
from api.core.doc_adv.detect import detect_face, blur_image
router = APIRouter()

@router.post("/blur-faces")
async def blur_faces(file: UploadFile = File(...)):
    try:
        nparr = np.frombuffer(await file.read(), np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        img = blur_image(img, detect_face(cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)))
        _, im_png = cv2.imencode(".png", img)
        return StreamingResponse(io.BytesIO(im_png.tobytes()), media_type="image/png")
    except Exception as e: raise HTTPException(status_code=500, detail=str(e))
