import React, { useState, useEffect, useMemo, useRef } from 'react';
import { PDFDocument, rgb } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';
import mammoth from 'mammoth';
import JSZip from 'jszip';
import Tesseract from 'tesseract.js';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const DocTools = ({ onResultChange, toolId, onSubtoolChange }) => {
  const [activeTab, setActiveTab] = useState('doc');
  const [activeSubTab, setActiveSubTab] = useState('md-editor');
  const mainTabs = [{ id:'doc', label:'Documents', icon:'description' }, { id:'pdf', label:'PDF Hub', icon:'picture_as_pdf' }, { id:'text', label:'Text Utils', icon:'text_fields' }, { id:'image', label:'Image Hub', icon:'image' }];

  useEffect(() => {
    if (toolId) {
        if (['md-editor', 'doc-translator'].includes(toolId)) { setActiveTab('doc'); setActiveSubTab(toolId); }
        else if (toolId.startsWith('pdf-')) { setActiveTab('pdf'); setActiveSubTab(toolId.replace('pdf-', '')); }
        else if (['case-converter', 'word-counter', 'lorem-ipsum', 'text-cleaner', 'remove-duplicates', 'list-sorter', 'find-replace', 'extract-pii', 'html-entities', 'word-rank'].includes(toolId)) { setActiveTab('text'); setActiveSubTab(toolId); }
        else if (toolId.startsWith('img-')) { setActiveTab('image'); setActiveSubTab(toolId.replace('img-', '')); }
    }
  }, [toolId]);

  return (
    <div className="tool-form">
      <div className="pill-group mb-20 scrollable-x" style={{justifyContent: 'center'}}>
        {mainTabs.map(tab => (
          <button key={tab.id} className={`pill ${activeTab === tab.id ? 'active' : ''}`} onClick={() => { setActiveTab(tab.id); setActiveSubTab(''); }}>
            <span className="material-icons" style={{fontSize: '1.2rem'}}>{tab.icon}</span>{tab.label}
          </button>
        ))}
      </div>
      <div className="hub-content animate-fadeIn">
        {activeTab === 'doc' && <DocumentHub activeSubTab={activeSubTab} setActiveSubTab={setActiveSubTab} onResultChange={onResultChange} onSubtoolChange={onSubtoolChange} />}
        {activeTab === 'pdf' && <PdfHub activeSubTab={activeSubTab} setActiveSubTab={setActiveSubTab} onResultChange={onResultChange} onSubtoolChange={onSubtoolChange} />}
        {activeTab === 'text' && <TextHub activeSubTab={activeSubTab} setActiveSubTab={setActiveSubTab} onResultChange={onResultChange} onSubtoolChange={onSubtoolChange} />}
        {activeTab === 'image' && <ImageHub activeSubTab={activeSubTab} setActiveSubTab={setActiveSubTab} onResultChange={onResultChange} onSubtoolChange={onSubtoolChange} />}
      </div>
    </div>
  );
};

const DocumentHub = ({ activeSubTab, setActiveSubTab, onResultChange, onSubtoolChange }) => {
    const tabs = [{ id: 'md-editor', label: 'Markdown Editor' }, { id: 'doc-translator', label: 'Translator' }];
    useEffect(() => { if(!activeSubTab) setActiveSubTab('md-editor'); }, []);
    useEffect(() => { const t = tabs.find(x => x.id === activeSubTab); if(t && onSubtoolChange) onSubtoolChange(t.label); }, [activeSubTab]);
    return (
        <div className="grid gap-15">
            <div className="pill-group scrollable-x">{tabs.map(t => <button key={t.id} className={`pill ${activeSubTab === t.id ? 'active' : ''}`} onClick={() => setActiveSubTab(t.id)}>{t.label}</button>)}</div>
            {activeSubTab === 'md-editor' && <MarkdownEditor onResultChange={onResultChange} />}
            {activeSubTab === 'doc-translator' && <DocTranslator onResultChange={onResultChange} />}
        </div>
    );
};

const PdfHub = ({ activeSubTab, setActiveSubTab, onResultChange, onSubtoolChange }) => {
    const tabs = [{ id: 'merge', label: 'Merge' }, { id: 'split', label: 'Split' }, { id: 'rotate', label: 'Rotate' }, { id: 'sign', label: 'Sign' }, { id: 'watermark', label: 'Watermark' }, { id: 'scan', label: 'OCR Scan' }, { id: 'to-text', label: 'Extract Text' }];
    useEffect(() => { if(!activeSubTab) setActiveSubTab('merge'); }, []);
    useEffect(() => { const t = tabs.find(x => x.id === activeSubTab); if(t && onSubtoolChange) onSubtoolChange(`PDF ${t.label}`); }, [activeSubTab]);
    return (
        <div className="grid gap-15">
            <div className="pill-group scrollable-x">{tabs.map(t => <button key={t.id} className={`pill ${activeSubTab === t.id ? 'active' : ''}`} onClick={() => setActiveSubTab(t.id)}>{t.label}</button>)}</div>
            <PdfCore activeTab={activeSubTab} onResultChange={onResultChange} />
        </div>
    );
};

const TextHub = ({ activeSubTab, setActiveSubTab, onResultChange, onSubtoolChange }) => {
    const tabs = [{ id:'case-converter', label:'Case' }, { id:'word-counter', label:'Stats' }, { id:'lorem-ipsum', label:'Lorem' }, { id:'find-replace', label:'Find' }, { id:'word-rank', label:'Rank' }];
    useEffect(() => { if(!activeSubTab) setActiveSubTab('case-converter'); }, []);
    useEffect(() => { const t = tabs.find(x => x.id === activeSubTab); if(t && onSubtoolChange) onSubtoolChange(t.label); }, [activeSubTab]);
    return (
        <div className="grid gap-15">
            <div className="pill-group scrollable-x">{tabs.map(t => <button key={t.id} className={`pill ${activeSubTab === t.id ? 'active' : ''}`} onClick={() => setActiveSubTab(t.id)}>{t.label}</button>)}</div>
            <TextCore activeTab={activeSubTab} onResultChange={onResultChange} />
        </div>
    );
};

const ImageHub = ({ activeSubTab, setActiveSubTab, onResultChange, onSubtoolChange }) => {
    const tabs = [{ id:'blur', label:'Blur' }, { id:'bw', label:'B&W' }, { id:'sepia', label:'Sepia' }, { id:'invert', label:'Invert' }, { id:'crop', label:'Crop' }];
    useEffect(() => { if(!activeSubTab) setActiveSubTab('blur'); }, []);
    useEffect(() => { const t = tabs.find(x => x.id === activeSubTab); if(t && onSubtoolChange) onSubtoolChange(`Image ${t.label}`); }, [activeSubTab]);
    return (
        <div className="grid gap-15">
            <div className="pill-group scrollable-x">{tabs.map(t => <button key={t.id} className={`pill ${activeSubTab === t.id ? 'active' : ''}`} onClick={() => setActiveSubTab(t.id)}>{t.label}</button>)}</div>
            <ImageCore activeTab={activeSubTab} onResultChange={onResultChange} />
        </div>
    );
};

// --- LOGIC ---
const MarkdownEditor = ({ onResultChange }) => {
    const [md, setMd] = useState('# Nature Document\n\nStart typing your content...');
    const html = useMemo(() => DOMPurify.sanitize(marked.parse(md)), [md]);
    const exportPdf = () => { const doc = new jsPDF(); doc.text(doc.splitTextToSize(md, 180), 10, 10); onResultChange({ text: 'PDF Exported', blob: doc.output('blob'), filename: 'doc.pdf' }); };
    return (
        <div className="grid gap-15">
            <div className="grid grid-2-cols gap-15">
                <textarea className="pill font-mono" rows="12" value={md} onChange={e=>setMd(e.target.value)} />
                <div className="card p-20 about-content glass-card overflow-auto" style={{height:'300px'}} dangerouslySetInnerHTML={{__html:html}} />
            </div>
            <button className="btn-primary" onClick={exportPdf}>Export to PDF</button>
        </div>
    );
};

const DocTranslator = ({ onResultChange }) => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const run = async () => {
        if(!file) return; setLoading(true);
        const fd = new FormData(); fd.append('file', file); fd.append('target_lang', 'te');
        try {
            const r = await fetch('/api/docs/translate', { method: 'POST', body: fd });
            const d = await r.json(); onResultChange({ text: d.translated_text, filename: 'translated.txt' });
        } catch(e) { alert("Error"); }
        finally { setLoading(false); }
    };
    return <div className="card p-20 grid gap-15 glass-card"><input type="file" onChange={e=>setFile(e.target.files[0])} className="pill w-full" /><button className="btn-primary" onClick={run} disabled={loading}>{loading?'Translating...':'Translate to Telugu'}</button></div>;
};

const PdfCore = ({ activeTab, onResultChange }) => {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const run = async () => {
        if(!files.length) return; setLoading(true);
        try {
            if(activeTab === 'merge') {
                const doc = await PDFDocument.create();
                for(const f of files) { const p = await PDFDocument.load(await f.arrayBuffer()); (await doc.copyPages(p, p.getPageIndices())).forEach(pg=>doc.addPage(p.addPage(pg))); }
                onResultChange({ text: 'Merged', blob: new Blob([await doc.save()], {type:'application/pdf'}), filename:'merged.pdf' });
            } else if(activeTab === 'rotate') {
                const doc = await PDFDocument.load(await files[0].arrayBuffer()); doc.getPages().forEach(p=>p.setRotation({angle:(p.getRotation().angle+90)%360}));
                onResultChange({ text: 'Rotated', blob: new Blob([await doc.save()], {type:'application/pdf'}), filename:'rotated.pdf' });
            } else if(activeTab === 'scan') {
                const pdf = await pdfjsLib.getDocument({data: await files[0].arrayBuffer()}).promise;
                const worker = await Tesseract.createWorker('eng'); let full = "";
                for(let i=1; i<=pdf.numPages; i++) {
                    const pg = await pdf.getPage(i); const vp = pg.getViewport({scale:2}); const canv = document.createElement('canvas');
                    canv.width=vp.width; canv.height=vp.height; await pg.render({canvasContext:canv.getContext('2d'), viewport:vp}).promise;
                    full += (await worker.recognize(canv)).data.text + "\n";
                }
                await worker.terminate(); onResultChange({ text: full, filename:'ocr.txt' });
            }
        } catch(e) { alert("Failed"); }
        finally { setLoading(false); }
    };
    return <div className="card p-20 grid gap-15 glass-card"><input type="file" multiple onChange={e=>setFiles(Array.from(e.target.files))} className="pill w-full" /><button className="btn-primary" onClick={run} disabled={loading}>{loading?'Processing...':'Run PDF Action'}</button></div>;
};

const TextCore = ({ activeTab, onResultChange }) => {
    const [val, setVal] = useState('');
    const run = (t) => {
        let r = val; if(t==='u') r=val.toUpperCase(); else if(t==='l') r=val.toLowerCase(); else if(t==='cl') r=val.replace(/\s+/g,' ').trim();
        setVal(r); onResultChange({text:r});
    };
    return (
        <div className="grid gap-15">
            <textarea className="pill font-mono" rows="6" value={val} onChange={e=>setVal(e.target.value)} placeholder="Text content..." />
            {activeTab === 'case-converter' && <div className="flex-gap"><button className="btn-primary flex-1" onClick={()=>run('u')}>UPPER</button><button className="pill flex-1" onClick={()=>run('l')}>lower</button></div>}
            {activeTab === 'word-counter' && <div className="tool-result h2 text-center">{val.trim()?val.trim().split(/\s+/).length:0} Words</div>}
        </div>
    );
};

const ImageCore = ({ activeTab, onResultChange }) => {
    const [img, setImg] = useState(null); const ref = useRef();
    const run = () => {
        const c = document.createElement('canvas'); const i = ref.current; c.width=i.naturalWidth; c.height=i.naturalHeight;
        const ctx = c.getContext('2d'); if(activeTab==='bw') ctx.filter='grayscale(100%)'; else if(activeTab==='sepia') ctx.filter='sepia(100%)'; ctx.drawImage(i,0,0);
        c.toBlob(b => onResultChange({text:'Image Processed', blob:b, filename:'image.png'}));
    };
    return (
        <div className="card p-20 grid gap-15 glass-card text-center">
            <input type="file" onChange={e=>{const f=e.target.files[0]; if(f){const r=new FileReader(); r.onload=ev=>setImg(ev.target.result); r.readAsDataURL(f);}}} className="pill w-full" />
            {img && <><img ref={ref} src={img} style={{maxWidth:'100%', maxHeight:'200px', borderRadius:'12px'}} className="mb-15" /><button className="btn-primary w-full" onClick={run}>Apply {activeTab}</button></>}
        </div>
    );
};

export default DocTools;
