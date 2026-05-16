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
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute("SELECT * FROM profiles")
    rows = [dict(r) for r in c.fetchall()]
    conn.close()
    return rows

@app.post("/api/profiles")
def create_profile(name: str = Body(..., embed=True), icon: str = Body("person", embed=True)):
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    try:
        c.execute("INSERT INTO profiles (name, icon) VALUES (?, ?)", (name, icon))
        new_id = c.lastrowid
        conn.commit()
        return {"id": new_id, "name": name, "icon": icon}
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=400, detail="Profile already exists")
    finally:
        conn.close()

@app.get("/api/categories")
def get_categories(profile_id: int = 1):
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute("SELECT * FROM categories WHERE profile_id = ?", (profile_id,))
    rows = [dict(r) for r in c.fetchall()]
    conn.close()
    return rows

@app.post("/api/categories")
def create_category(name: str = Body(..., embed=True), icon: str = Body("folder", embed=True), profile_id: int = Body(1, embed=True)):
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute("INSERT INTO categories (name, icon, profile_id) VALUES (?, ?, ?)", (name, icon, profile_id))
    new_id = c.lastrowid
    conn.commit()
    conn.close()
    return {"id": new_id, "name": name, "icon": icon, "profile_id": profile_id}

DB_FILE = "data/database.sqlite"

def init_db():
    if not os.path.exists("data"):
        os.makedirs("data")
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()

    # Reset tables for clean seeding
    c.execute("DROP TABLE IF EXISTS links")
    c.execute("DROP TABLE IF EXISTS profiles")
    c.execute("DROP TABLE IF EXISTS categories")

    # Links Table
    c.execute('''CREATE TABLE IF NOT EXISTS links
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  title TEXT, url TEXT, category TEXT,
                  is_pinned BOOLEAN, urls TEXT, profile_id INTEGER,
                  icon TEXT, is_internal BOOLEAN)''')

    # Profiles Table
    c.execute('''CREATE TABLE IF NOT EXISTS profiles
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  name TEXT UNIQUE, icon TEXT)''')

    # Categories Table
    c.execute('''CREATE TABLE IF NOT EXISTS categories
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  name TEXT, icon TEXT, profile_id INTEGER)''')

    # Seed Profiles
    profiles_data = [
        ("Default", "home"),
        ("Private", "security"),
        ("Personal", "person")
    ]
    c.executemany("INSERT INTO profiles (name, icon) VALUES (?, ?)", profiles_data)

    # Load Source JSON Data
    try:
        with open("data/url_cat.json", "r") as f: default_cats = json.load(f)
        with open("data/url_links.json", "r") as f: default_links = json.load(f)
        with open("data/necs_cat.json", "r") as f: private_cats = json.load(f)
        with open("data/necs_links.json", "r") as f: private_links = json.load(f)
    except Exception as e:
        print(f"Error loading seed JSONs: {e}")
        default_cats, default_links, private_cats, private_links = {}, [], {}, []

    # Seed Categories for each profile
    def seed_cats(cats_dict, profile_id):
        for name, icon in cats_dict.items():
            c.execute("INSERT INTO categories (name, icon, profile_id) VALUES (?, ?, ?)", (name, icon, profile_id))

    seed_cats(default_cats, 1)
    seed_cats(private_cats, 2)
    # Combined categories for Personal
    combined_cats = {**default_cats, **private_cats}
    seed_cats(combined_cats, 3)

    # Seed Links for each profile
    def seed_links(links_list, profile_id):
        for l in links_list:
            c.execute("""INSERT INTO links
                         (title, url, category, is_pinned, urls, profile_id, icon, is_internal)
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
                      (l.get('title'), l.get('url'), l.get('category'),
                       l.get('is_pinned', False), json.dumps(l.get('urls')),
                       profile_id, l.get('icon') or l.get('optional_icon'), l.get('isInternal', False)))

    seed_links(default_links, 1)
    seed_links(private_links, 2)
    seed_links(default_links + private_links, 3)

    conn.commit()
    conn.close()

init_db()

class LinkModel(BaseModel):
    title: str
    url: str
    category: str
    is_pinned: bool = False
    urls: Optional[List[str]] = None
    profile_id: int = 1
    icon: Optional[str] = None
    is_internal: bool = False

@app.get("/api/links")
def get_links(profile_id: int = 1):
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute("SELECT * FROM links WHERE profile_id = ?", (profile_id,))
    rows = c.fetchall()
    links = []
    for row in rows:
        d = dict(row)
        d['is_pinned'] = bool(d['is_pinned'])
        d['is_internal'] = bool(d['is_internal'])
        if d['urls']:
            try:
                d['urls'] = json.loads(d['urls'])
            except:
                d['urls'] = [d['url']]
        links.append(d)
    conn.close()
    return links

@app.post("/api/links")
def create_link(link: LinkModel):
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute("INSERT INTO links (title, url, category, is_pinned, urls, profile_id, icon, is_internal) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
              (link.title, link.url, link.category, link.is_pinned, json.dumps(link.urls) if link.urls else None, link.profile_id, link.icon, link.is_internal))
    new_id = c.lastrowid
    conn.commit()
    conn.close()
    return {"id": new_id, **link.dict()}

@app.put("/api/links/{link_id}")
def update_link(link_id: int, link: dict = Body(...)):
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()

    # Get existing
    c.execute("SELECT * FROM links WHERE id = ?", (link_id,))
    existing = c.fetchone()
    if not existing:
        conn.close()
        raise HTTPException(status_code=404, detail="Link not found")

    fields = []
    values = []
    for k, v in link.items():
        if k == 'id': continue
        fields.append(f"{k} = ?")
        if k == 'urls' and v is not None:
            values.append(json.dumps(v))
        else:
            values.append(v)

    if fields:
        query = f"UPDATE links SET {', '.join(fields)} WHERE id = ?"
        values.append(link_id)
        c.execute(query, tuple(values))
        conn.commit()

    conn.close()
    return {"status": "success"}

@app.delete("/api/links/{link_id}")
def delete_link(link_id: int):
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute("DELETE FROM links WHERE id = ?", (link_id,))
    conn.commit()
    conn.close()
    return {"status": "deleted"}

@app.get("/api/links/categories")
def get_link_categories(profile_id: int = 1):
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute("SELECT DISTINCT category FROM links WHERE profile_id = ?", (profile_id,))
    cats = [r[0] for r in c.fetchall()]
    conn.close()
    return cats

@app.post("/api/debug/reset-db")
def reset_db():
    init_db()
    return {"status": "success", "message": "Database reset to defaults"}
