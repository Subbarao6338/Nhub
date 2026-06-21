from fastapi import APIRouter, HTTPException
import yt_dlp
from typing import Optional

router = APIRouter()

@router.get("/info")
async def get_video_info(url: str):
    ydl_opts = {'quiet': True, 'no_warnings': True}
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            return {
                "title": info.get('title'),
                "thumbnail": info.get('thumbnail'),
                "duration": info.get('duration'),
                "uploader": info.get('uploader'),
                "formats": [
                    {
                        "format_id": f.get('format_id'),
                        "ext": f.get('ext'),
                        "resolution": f.get('resolution'),
                        "filesize": f.get('filesize')
                    } for f in info.get('formats', []) if f.get('filesize')
                ]
            }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/download")
async def download_media(url: str, format_id: Optional[str] = None):
    # This would normally return a stream, for now we provide the direct URL
    ydl_opts = {'format': format_id if format_id else 'best'}
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            return {"url": info.get('url'), "filename": f"{info.get('title')}.{info.get('ext')}"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/sponsor-segments")
async def get_sponsors(video_id: str):
    # Integration with SponsorBlock API (functional equivalent of the astron_yt component)
    import requests
    try:
        res = requests.get(f"https://sponsor.ajay.app/api/skipSegments?videoID={video_id}")
        if res.status_code == 200:
            return {"success": True, "segments": res.json()}
        return {"success": False, "message": "No segments found"}
    except:
        return {"success": False, "message": "API error"}
