from fastapi import FastAPI, HTTPException, Body, Query, BackgroundTasks, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel, Field
from typing import List, Optional
import sqlite3
import os
import json
import uuid
import sys
import shutil
import tempfile
import zipfile
import subprocess
import socket
import dns.resolver
import yt_dlp
import yaml
import docx
import PyPDF2
from bs4 import BeautifulSoup
from deep_translator import GoogleTranslator

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    return JSONResponse(status_code=500, content={"detail": str(exc)})

@app.get("/api/health")
def health():
    return {"status": "healthy"}

@app.get("/api/networking/ping")
def ping_host(host: str = Query(...)):
    try:
        socket.gethostbyname(host)
        return {"output": f"Host {host} is reachable (DNS resolved)."}
    except:
        raise HTTPException(status_code=400, detail="Host unreachable")

@app.get("/api/networking/dns")
def dns_lookup(domain: str = Query(...)):
    results = {}
    for t in ['A', 'MX', 'TXT']:
        try:
            answers = dns.resolver.resolve(domain, t)
            results[t] = [str(r) for r in answers]
        except: continue
    return results

@app.get("/api/networking/whois")
def whois_lookup(domain: str = Query(...)):
    try:
        output = subprocess.check_output(["whois", domain], stderr=subprocess.STDOUT, universal_newlines=True)
        return {"output": output}
    except:
        return {"output": "WHOIS command failed in this environment."}

@app.post("/api/docs/translate")
async def translate_doc(file: UploadFile = File(...), target_lang: str = Form("en")):
    suffix = os.path.splitext(file.filename)[1].lower()
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp.write(await file.read())
        tmp_path = tmp.name
    try:
        text = ""
        if suffix == ".pdf":
            reader = PyPDF2.PdfReader(tmp_path)
            text = "\n".join([p.extract_text() for p in reader.pages if p.extract_text()])
        elif suffix == ".docx":
            doc = docx.Document(tmp_path)
            text = "\n".join([p.text for p in doc.paragraphs])
        elif suffix in [".txt", ".md"]:
            with open(tmp_path, 'r', encoding='utf-8') as f: text = f.read()

        if not text: raise HTTPException(status_code=400, detail="Empty document")
        translated = GoogleTranslator(source='auto', target=target_lang).translate(text[:2000])
        return {"translated_text": translated}
    finally:
        if os.path.exists(tmp_path): os.remove(tmp_path)

@app.get("/api/profiles")
def get_profiles():
    return [{"id": 1, "name": "Default", "icon": "home"}]
