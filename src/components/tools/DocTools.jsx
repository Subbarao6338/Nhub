import React, { useState, useEffect, useMemo, useRef } from 'react';
import { jsPDF } from 'jspdf';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { PDFDocument, rgb } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';
import mammoth from 'mammoth';
import JSZip from 'jszip';
import Tesseract from 'tesseract.js';
import API_BASE from '../../api';

// Setup PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

// --- TEXT TOOLS COMPONENTS ---

const LoremGenerator = ({ onResultChange, setInput }) => {
    const [count, setCount] = useState(3);
    const gen = () => {
        const text = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. ".repeat(10 * count);
        setInput(text);
        onResultChange({ text, filename: 'lorem.txt' });
    };
    return (
        <div className="card p-20 flex-gap glass-card">
            <input type="number" className="pill flex-1" value={count} onChange={e=>setCount(e.target.value)} min="1" max="50" />
            <button className="btn-primary flex-1" onClick={gen}>Generate</button>
        </div>
    );
};

const WordRankCalculator = ({ onResultChange }) => {
    const [word, setWord] = useState('NATURE');
    const [rank, setRank] = useState(null);

    const calculate = () => {
        const input = word.toUpperCase().replace(/[^A-Z]/g, '');
        if (!input) return;

        const factorial = (n) => {
            let res = BigInt(1);
            for (let i = 2n; i <= BigInt(n); i++) res *= i;
            return res;
        };

        const getFactorialDivisor = (counts) => {
            let divisor = BigInt(1);
            for (let key in counts) divisor *= factorial(counts[key]);
            return divisor;
        };

        const len = input.length;
        let currentRank = BigInt(1);
        let charCount = {};
        for (let ch of input) charCount[ch] = (charCount[ch] || 0) + 1;

        for (let i = 0; i < len; i++) {
            let countSmaller = 0;
            for (let key in charCount) {
                if (key < input[i]) countSmaller += charCount[key];
            }

            if (countSmaller > 0) {
                let waysAtThisPosition = BigInt(0);
                const uniqueChars = Object.keys(charCount).sort();
                for (let char of uniqueChars) {
                    if (char < input[i]) {
                        charCount[char]--;
                        waysAtThisPosition += factorial(len - 1 - i) / getFactorialDivisor(charCount);
                        charCount[char]++;
                    }
                }
                currentRank += waysAtThisPosition;
            }
            charCount[input[i]]--;
            if (charCount[input[i]] === 0) delete charCount[input[i]];
        }

        setRank(currentRank.toString());
        onResultChange({ text: `Rank of "${input}": ${currentRank}`, filename: 'word_rank.txt' });
    };

    return (
        <div className="card p-20 grid gap-15 glass-card">
            <div className="form-group">
                <label>Word (with or without duplicate letters)</label>
                <input className="pill" value={word} onChange={e => setWord(e.target.value.toUpperCase())} />
            </div>
            <button className="btn-primary" onClick={calculate}>Calculate Dictionary Rank</button>
            {rank && (
                <div className="tool-result text-center">
                    <div className="opacity-6 small">The rank of "{word}" is</div>
                    <div className="font-bold" style={{fontSize: '1.8rem', wordBreak: 'break-all'}}>{rank}</div>
                </div>
            )}
        </div>
    );
};

const FindReplace = ({ onResultChange, input, setInput }) => {
    const [find, setFind] = useState('');
    const [replace, setReplace] = useState('');
    const handleAction = () => {
        const res = input.replaceAll(find, replace);
        setInput(res);
        onResultChange({ text: res, filename: 'find_replace.txt' });
    };
    return (
        <div className="card p-15 grid gap-10 glass-card">
            <div className="flex-gap">
                <input className="pill flex-1" placeholder="Find..." value={find} onChange={e=>setFind(e.target.value)} />
                <input className="pill flex-1" placeholder="Replace..." value={replace} onChange={e=>setReplace(e.target.value)} />
            </div>
            <button className="btn-primary" onClick={handleAction}>Replace All</button>
        </div>
    );
};

const ExtractTool = ({ onResultChange, input }) => {
    const [results, setResults] = useState([]);
    const extract = (type) => {
        let regex;
        if (type === 'email') regex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
        else if (type === 'url') regex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g;
        const found = input.match(regex) || [];
        setResults(found);
        onResultChange({ text: found.join('\n'), filename: `extracted_${type}s.txt` });
    };
    return (
        <div className="card p-15 grid gap-10 glass-card">
            <div className="flex-gap">
                <button className="pill flex-1" onClick={()=>extract('email')}>Extract Emails</button>
                <button className="pill flex-1" onClick={()=>extract('url')}>Extract URLs</button>
            </div>
            {results.length > 0 && (
                <div className="tool-result font-mono" style={{maxHeight: '150px', overflow: 'auto'}}>
                    {results.map((r, i) => <div key={i}>{r}</div>)}
                </div>
            )}
        </div>
    );
};

const HtmlEntities = ({ onResultChange, input, setInput }) => {
    const encode = () => {
        const el = document.createElement('div');
        el.textContent = input;
        const res = el.innerHTML;
        setInput(res);
        onResultChange({ text: res });
    };
    const decode = () => {
        const el = document.createElement('div');
        el.innerHTML = input;
        const res = el.textContent;
        setInput(res);
        onResultChange({ text: res });
    };
    return (
        <div className="flex-gap">
            <button className="btn-primary flex-1" onClick={encode}>Encode HTML</button>
            <button className="pill flex-1" onClick={decode}>Decode HTML</button>
        </div>
    );
};

const TextHub = ({ onResultChange, subtool }) => {
    const [input, setInput] = useState('');
    const [activeSub, setActiveSub] = useState(subtool || 'modify');

    const stats = useMemo(() => ({
        chars: input.length,
        words: input.trim() ? input.trim().split(/\s+/).length : 0,
        lines: input.split('\n').filter(l => l.trim()).length
    }), [input]);

    const handleAction = (type) => {
        let res = input;
        if (type === 'upper') res = input.toUpperCase();
        else if (type === 'lower') res = input.toLowerCase();
        else if (type === 'title') res = input.split(' ').map(w=>w.charAt(0).toUpperCase()+w.slice(1).toLowerCase()).join(' ');
        else if (type === 'reverse') res = input.split('').reverse().join('');
        else if (type === 'whitespace') res = input.replace(/\s+/g, ' ').trim();
        else if (type === 'dedupe') res = [...new Set(input.split('\n').filter(l => l.trim()))].join('\n');
        else if (type === 'sort') res = input.split('\n').filter(l => l.trim()).sort().join('\n');
        setInput(res);
        onResultChange({ text: res, filename: 'text_processed.txt' });
    };

    return (
        <div className="grid gap-20">
            <div className="pill-group scrollable-x">
                {['modify', 'stats', 'lorem', 'rank', 'find', 'extract', 'entities'].map(t => (
                    <button key={t} className={`pill ${activeSub === t ? 'active' : ''}`} onClick={() => setActiveSub(t)} style={{textTransform: 'capitalize'}}>
                        {t === 'entities' ? 'HTML Entities' : t === 'rank' ? 'Word Rank' : t}
                    </button>
                ))}
            </div>
            <textarea rows="8" className="pill w-full font-mono glass-card" placeholder="Enter text here..." value={input} onChange={e=>setInput(e.target.value)} />

            {activeSub === 'modify' && (
                <div className="grid gap-15">
                    <button className="btn-primary w-full" onClick={() => {
                        const utterance = new SpeechSynthesisUtterance(input);
                        window.speechSynthesis.speak(utterance);
                    }}>
                        <span className="material-icons mr-10">record_voice_over</span> Read Aloud (TTS)
                    </button>
                    <div className="pill-group scrollable-x">
                        <button className="btn-primary" onClick={()=>handleAction('upper')}>UPPERCASE</button>
                        <button className="pill" onClick={()=>handleAction('lower')}>lowercase</button>
                        <button className="pill" onClick={()=>handleAction('title')}>Title Case</button>
                        <button className="pill" onClick={()=>handleAction('reverse')}>Reverse</button>
                        <button className="pill" onClick={()=>handleAction('whitespace')}>Clean Whitespace</button>
                        <button className="pill" onClick={()=>handleAction('dedupe')}>Dedupe Lines</button>
                        <button className="pill" onClick={()=>handleAction('sort')}>Sort Lines</button>
                    </div>
                </div>
            )}

            {activeSub === 'stats' && (
                <div className="grid grid-3 gap-15">
                    <div className="card p-20 text-center glass-card">
                        <div className="font-bold" style={{fontSize: '2rem'}}>{stats.chars}</div>
                        <div className="opacity-6">Characters</div>
                    </div>
                    <div className="card p-20 text-center glass-card">
                        <div className="font-bold" style={{fontSize: '2rem'}}>{stats.words}</div>
                        <div className="opacity-6">Words</div>
                    </div>
                    <div className="card p-20 text-center glass-card">
                        <div className="font-bold" style={{fontSize: '2rem'}}>{stats.lines}</div>
                        <div className="opacity-6">Lines</div>
                    </div>
                </div>
            )}

            {activeSub === 'lorem' && <LoremGenerator onResultChange={onResultChange} setInput={setInput} />}
            {activeSub === 'rank' && <WordRankCalculator onResultChange={onResultChange} />}
            {activeSub === 'find' && <FindReplace onResultChange={onResultChange} input={input} setInput={setInput} />}
            {activeSub === 'extract' && <ExtractTool onResultChange={onResultChange} input={input} />}
            {activeSub === 'entities' && <HtmlEntities onResultChange={onResultChange} input={input} setInput={setInput} />}
        </div>
    );
};

// --- IMAGE TOOLS COMPONENTS ---

const FormatConverter = ({ imgRef, image, onResultChange }) => {
    const [target, setTarget] = useState('image/png');
    const convert = () => {
        const canvas = document.createElement('canvas');
        const img = imgRef.current;
        if (!img) return;
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        canvas.toBlob(blob => {
            onResultChange({ text: `Converted to ${target}`, blob, filename: `converted.${target.split('/')[1]}` });
        }, target);
    };
    return (
        <div className="card p-20 text-center glass-card">
            <div className="form-group">
                <label>Target Format</label>
                <select value={target} onChange={e => setTarget(e.target.value)} className="pill">
                    <option value="image/png">PNG (Lossless)</option>
                    <option value="image/jpeg">JPEG (Standard)</option>
                    <option value="image/webp">WEBP (Modern)</option>
                </select>
            </div>
            <button className="btn-primary w-full" onClick={convert}>Convert & Download</button>
        </div>
    );
};

const ResizeImage = ({ imgRef, image, onResultChange }) => {
    const [width, setWidth] = useState(0);
    const [height, setHeight] = useState(0);
    const [maintainAspect, setMaintainAspect] = useState(true);

    useEffect(() => {
        if (imgRef.current) {
            setWidth(imgRef.current.naturalWidth);
            setHeight(imgRef.current.naturalHeight);
        }
    }, [image]);

    const handleWidthChange = (val) => {
        const w = parseInt(val) || 0;
        setWidth(w);
        if (maintainAspect && imgRef.current) {
            const ratio = imgRef.current.naturalHeight / imgRef.current.naturalWidth;
            setHeight(Math.round(w * ratio));
        }
    };

    const handleHeightChange = (val) => {
        const h = parseInt(val) || 0;
        setHeight(h);
        if (maintainAspect && imgRef.current) {
            const ratio = imgRef.current.naturalWidth / imgRef.current.naturalHeight;
            setWidth(Math.round(h * ratio));
        }
    };

    const resize = () => {
        const canvas = document.createElement('canvas');
        const img = imgRef.current;
        if (!img) return;
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(blob => {
            onResultChange({ text: `Resized to ${width}x${height}`, blob, filename: 'resized.png' });
        });
    };

    return (
        <div className="card p-20 glass-card">
            <div className="grid grid-2-cols gap-10 mb-15">
                <div className="form-group">
                    <label>Width (px)</label>
                    <input type="number" value={width} onChange={e => handleWidthChange(e.target.value)} className="pill" />
                </div>
                <div className="form-group">
                    <label>Height (px)</label>
                    <input type="number" value={height} onChange={e => handleHeightChange(e.target.value)} className="pill" />
                </div>
            </div>
            <label className="flex-center gap-10 mb-20 cursor-pointer">
                <input type="checkbox" checked={maintainAspect} onChange={e => setMaintainAspect(e.target.checked)} />
                <span className="font-bold opacity-7">Maintain Aspect Ratio</span>
            </label>
            <button className="btn-primary w-full" onClick={resize}>Apply Resize</button>
        </div>
    );
};

const PrivacyBlur = ({ imgRef, image, onResultChange }) => {
    const [intensity, setIntensity] = useState(10);
    const blur = () => {
        const canvas = document.createElement('canvas');
        const img = imgRef.current;
        if (!img) return;
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        ctx.filter = `blur(${intensity}px)`;
        ctx.drawImage(img, 0, 0);
        canvas.toBlob(blob => {
            onResultChange({ text: `Applied ${intensity}px Privacy Blur`, blob, filename: 'blurred.png' });
        });
    };
    return (
        <div className="card p-20 text-center glass-card">
            <div className="form-group mb-15">
                <label>Blur Intensity: {intensity}px</label>
                <input type="range" min="1" max="50" value={intensity} onChange={e=>setIntensity(e.target.value)} className="w-full" />
            </div>
            <button className="btn-primary w-full" onClick={blur}>Apply Blur</button>
        </div>
    );
};

const MetadataCleaner = ({ imgRef, image, onResultChange }) => {
    const clean = () => {
        const canvas = document.createElement('canvas');
        const img = imgRef.current;
        if (!img) return;
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        canvas.toBlob(blob => {
            onResultChange({ text: 'Stripped EXIF Metadata (Camera, Location, etc.)', blob, filename: 'clean.png' });
        });
    };
    return (
        <div className="card p-20 text-center glass-card">
            <p className="opacity-6 smallest mb-15">This tool re-renders the image on a canvas, which removes sensitive metadata like GPS coordinates and camera info.</p>
            <button className="btn-primary w-full" onClick={clean}>Remove All Metadata</button>
        </div>
    );
};

const ImageHub = ({ onResultChange, subtool }) => {
    const [activeSub, setActiveSub] = useState(subtool || 'format');
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const imgRef = useRef(null);

    const handleUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            const reader = new FileReader();
            reader.onload = (ev) => setPreview(ev.target.result);
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="grid gap-20">
            <div className="pill-group scrollable-x">
                {['format', 'resize', 'blur', 'metadata', 'filters', 'b64'].map(t => (
                    <button key={t} className={`pill ${activeSub === t ? 'active' : ''}`} onClick={() => setActiveSub(t)} style={{textTransform: 'capitalize'}}>
                        {t === 'b64' ? 'Base64' : t}
                    </button>
                ))}
            </div>
            <div className="card p-20 text-center glass-card">
                <input type="file" id="img-hub-upload" onChange={handleUpload} accept="image/*" style={{ display: 'none' }} />
                <label htmlFor="img-hub-upload" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    <span className="material-icons">upload_file</span>
                    {image ? 'Change Image' : 'Select Image'}
                </label>
            </div>
            {preview && (
                <div className="card p-10 text-center glass-card" style={{ maxWidth: '400px', margin: '0 auto' }}>
                    <img ref={imgRef} src={preview} alt="Preview" style={{ maxWidth: '100%', maxHeight: '250px', borderRadius: '16px', display: 'block' }} />
                </div>
            )}
            {image && (
                <div className="animate-fadeIn">
                    {activeSub === 'format' && <FormatConverter imgRef={imgRef} image={image} onResultChange={onResultChange} />}
                    {activeSub === 'resize' && <ResizeImage imgRef={imgRef} image={image} onResultChange={onResultChange} />}
                    {activeSub === 'blur' && <PrivacyBlur imgRef={imgRef} image={image} onResultChange={onResultChange} />}
                    {activeSub === 'metadata' && <MetadataCleaner imgRef={imgRef} image={image} onResultChange={onResultChange} />}
                    {activeSub === 'b64' && <button className="btn-primary w-full" onClick={() => {
                        const reader = new FileReader();
                        reader.onload = (e) => onResultChange({ text: e.target.result, filename: 'image_b64.txt' });
                        reader.readAsDataURL(image);
                    }}>Generate Base64</button>}
                </div>
            )}
        </div>
    );
};

// --- PDF TOOLS COMPONENTS ---

const ImageToPdf = ({ onResultChange }) => {
    const [images, setImages] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);

    const convert = async () => {
        if (images.length === 0) return;
        setIsProcessing(true);
        try {
            const pdfDoc = await PDFDocument.create();
            for (const file of images) {
                const bytes = await file.arrayBuffer();
                let img;
                if (file.type === 'image/png') img = await pdfDoc.embedPng(bytes);
                else img = await pdfDoc.embedJpg(bytes);
                const page = pdfDoc.addPage([img.width, img.height]);
                page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
            }
            const pdfBytes = await pdfDoc.save();
            onResultChange({ text: 'Converted Images to PDF', blob: new Blob([pdfBytes], { type: 'application/pdf' }), filename: 'converted.pdf' });
        } catch (e) {
            alert("Error: " + e.message);
        } finally {
            setIsProcessing(false);
        }
    };
    return (
        <div className="card p-15 grid gap-10 glass-card">
            <input type="file" multiple accept="image/*" className="pill w-full" onChange={e=>setImages(Array.from(e.target.files))} />
            <button className="btn-primary" onClick={convert} disabled={images.length === 0 || isProcessing}>
                {isProcessing ? 'Converting...' : `Convert ${images.length} Images`}
            </button>
        </div>
    );
};

const PdfHub = ({ onResultChange, subtool }) => {
    const [activeSub, setActiveSub] = useState(subtool || 'merge');
    const [files, setFiles] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [password, setPassword] = useState('');
    const [watermark, setWatermark] = useState('Confidential');

    const handleFileUpload = (e) => setFiles(Array.from(e.target.files));

    const mergePdfs = async () => {
        if (files.length < 2) return;
        setIsProcessing(true);
        try {
            const mergedPdf = await PDFDocument.create();
            for (const file of files) {
                const pdfBytes = await file.arrayBuffer();
                const pdf = await PDFDocument.load(pdfBytes);
                const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
                copiedPages.forEach((page) => mergedPdf.addPage(page));
            }
            const mergedPdfBytes = await mergedPdf.save();
            onResultChange({ text: 'Merged PDFs', blob: new Blob([mergedPdfBytes], { type: 'application/pdf' }), filename: 'merged.pdf' });
        } catch (e) { alert("Error: " + e.message); }
        finally { setIsProcessing(false); }
    };

    const rotatePdf = async () => {
        if (files.length === 0) return;
        setIsProcessing(true);
        try {
            const pdfBytes = await files[0].arrayBuffer();
            const pdfDoc = await PDFDocument.load(pdfBytes);
            pdfDoc.getPages().forEach(p => p.setRotation({ angle: (p.getRotation().angle + 90) % 360 }));
            onResultChange({ text: 'Rotated PDF', blob: new Blob([await pdfDoc.save()], { type: 'application/pdf' }), filename: 'rotated.pdf' });
        } catch (e) { alert("Error: " + e.message); }
        finally { setIsProcessing(false); }
    };

    return (
        <div className="grid gap-20">
            <div className="pill-group scrollable-x">
                {['merge', 'split', 'rotate', 'lock', 'unlock', 'img2pdf', 'pdf2img', 'word2pdf', 'ocr'].map(t => (
                    <button key={t} className={`pill ${activeSub === t ? 'active' : ''}`} onClick={() => setActiveSub(t)} style={{textTransform: 'capitalize'}}>
                        {t === 'img2pdf' ? 'Images to PDF' : t === 'pdf2img' ? 'PDF to Image' : t === 'word2pdf' ? 'Word to PDF' : t === 'ocr' ? 'OCR Scan' : t}
                    </button>
                ))}
            </div>
            <div className="form-group">
                <label>Upload PDF(s)</label>
                <input type="file" multiple onChange={handleFileUpload} accept="application/pdf" className="pill w-full glass-card" />
            </div>

            {isProcessing && (
                <div className="progress-bar-container" style={{background: 'var(--border)', height: '8px', borderRadius: '4px', overflow: 'hidden'}}>
                    <div style={{width: `${progress}%`, height: '100%', background: 'var(--primary)', transition: 'width 0.3s'}}></div>
                </div>
            )}

            <div className="animate-fadeIn">
                {activeSub === 'merge' && <button className="btn-primary w-full" onClick={mergePdfs} disabled={files.length < 2 || isProcessing}>Merge {files.length} PDFs</button>}
                {activeSub === 'rotate' && <button className="btn-primary w-full" onClick={rotatePdf} disabled={files.length === 0 || isProcessing}>Rotate 90°</button>}
                {activeSub === 'lock' && (
                    <div className="grid gap-10">
                        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" className="pill w-full" />
                        <button className="btn-primary w-full" onClick={async () => {
                            setIsProcessing(true);
                            try {
                                const pdf = await PDFDocument.load(await files[0].arrayBuffer());
                                const bytes = await pdf.save({ userPassword: password, ownerPassword: password });
                                onResultChange({ text: 'Locked PDF', blob: new Blob([bytes], { type: 'application/pdf' }), filename: 'locked.pdf' });
                            } catch(e) { alert(e.message); }
                            finally { setIsProcessing(false); }
                        }} disabled={!files.length || !password}>Lock PDF</button>
                    </div>
                )}
                {activeSub === 'img2pdf' && <ImageToPdf onResultChange={onResultChange} />}
                {activeSub === 'word2pdf' && (
                    <div className="card p-20 text-center glass-card">
                        <input type="file" accept=".docx" onChange={async (e) => {
                            const file = e.target.files[0];
                            if(!file) return;
                            setIsProcessing(true);
                            try {
                                const result = await mammoth.convertToHtml({ arrayBuffer: await file.arrayBuffer() });
                                const container = document.createElement('div');
                                container.style.padding = '40px'; container.style.width = '800px'; container.style.background = 'white';
                                container.style.position = 'absolute'; container.style.left = '-9999px';
                                container.innerHTML = result.value;
                                document.body.appendChild(container);
                                const canvas = await html2canvas(container);
                                document.body.removeChild(container);
                                const pdf = new jsPDF('p', 'mm', 'a4');
                                pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, 210, (canvas.height*210)/canvas.width);
                                onResultChange({ text: 'Word to PDF', blob: pdf.output('blob'), filename: 'converted.pdf' });
                            } catch(e) { alert(e.message); }
                            finally { setIsProcessing(false); }
                        }} className="pill w-full" />
                    </div>
                )}
            </div>
        </div>
    );
};

// --- MAIN DOC TOOLS COMPONENT ---

const DocTranslator = ({ onResultChange }) => {
    const [file, setFile] = useState(null);
    const [targetLang, setTargetLang] = useState('te');
    const [isProcessing, setIsProcessing] = useState(false);
    const [result, setResult] = useState('');

    const handleTranslate = async () => {
        if (!file) return;
        setIsProcessing(true);
        setResult('');

        const isServerless = API_BASE === 'JSON-MODE';

        if (isServerless) {
            setTimeout(() => {
                const mockResults = {
                    'te': 'ఇది ప్రదర్శన ప్రయోజనాల కోసం ఒక నకిలీ అనువాదం.',
                    'hi': 'यह प्रदर्शन उद्देश्यों के लिए एक नकली अनुवाद है।',
                    'es': 'Esta es una traducción simulada para fines de demostración.',
                    'fr': 'Ceci est une fausse traduction à des fins de démonstration.',
                    'en': 'This is a mock translation for demonstration purposes.'
                };
                const translatedText = mockResults[targetLang] || 'Mock translation result.';
                setResult(translatedText);
                onResultChange({
                    text: translatedText,
                    blob: new Blob([translatedText], { type: 'text/plain' }),
                    filename: `translated_${file.name}.txt`
                });
                setIsProcessing(false);
            }, 1500);
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('target_lang', targetLang);

        try {
            const response = await fetch(`${API_BASE}/docs/translate`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.detail || 'Translation failed');
            }

            const data = await response.json();
            const translatedText = data.translated_text || '';
            setResult(translatedText);

            const blob = new Blob([translatedText], { type: 'text/plain' });
            onResultChange({
                text: 'Translation complete',
                blob,
                filename: `translated_${file.name}.txt`
            });
        } catch (e) {
            alert("Error: " + e.message);
        } finally {
            setIsProcessing(false);
        }
    };

    const isServerless = API_BASE === 'JSON-MODE';

    return (
        <div className="grid gap-15">
            {isServerless && (
                <div className="danger-box" style={{ padding: '10px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className="material-icons" style={{ fontSize: '1.2rem' }}>cloud_off</span>
                    <span><b>Backend Required:</b> Document translation requires server-side processing. Showing simulated results.</span>
                </div>
            )}
            <div className="card no-animation p-20 glass-card grid gap-15">
                <div className="form-group">
                    <label>Select Document (PDF, DOCX, EPUB, HTML, MD, TXT)</label>
                    <input
                        type="file"
                        className="pill w-full"
                        onChange={e => setFile(e.target.files[0])}
                        accept=".pdf,.docx,.epub,.html,.htm,.mhtml,.md,.txt"
                    />
                </div>
                <div className="form-group">
                    <label>Target Language</label>
                    <select
                        className="pill w-full"
                        value={targetLang}
                        onChange={e => setTargetLang(e.target.value)}
                    >
                        <option value="te">Telugu</option>
                        <option value="en">English</option>
                        <option value="hi">Hindi</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                    </select>
                </div>
                <button
                    className="btn-primary w-full"
                    onClick={handleTranslate}
                    disabled={!file || isProcessing}
                >
                    {isProcessing ? 'Translating...' : 'Translate Document'}
                </button>
            </div>

            {result && (
                <div className="card no-animation p-20 glass-card">
                    <div className="flex-between mb-10">
                        <span className="font-bold uppercase smallest opacity-6">Translated Text</span>
                    </div>
                    <textarea
                        className="pill w-full font-mono text-small"
                        rows="10"
                        readOnly
                        value={result}
                    />
                </div>
            )}
        </div>
    );
};

const MarkdownEditor = ({ onResultChange }) => {
  const [md, setMd] = useState('# New Document\n\nStart typing...');
  const html = useMemo(() => DOMPurify.sanitize(marked.parse(md)), [md]);

  const stats = useMemo(() => ({
    words: md.trim() ? md.trim().split(/\s+/).length : 0,
    chars: md.length
  }), [md]);

  const exportPdf = () => {
    const doc = new jsPDF();
    const lines = doc.splitTextToSize(md, 180);
    doc.text(lines, 10, 10);
    const blob = doc.output('blob');
    onResultChange({ text: 'Exported Markdown to PDF', blob, filename: 'document.pdf' });
  };

  const exportHtml = () => {
      const blob = new Blob([`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Document</title><style>body{font-family:sans-serif;padding:40px;line-height:1.6;max-width:800px;margin:0 auto;}</style></head><body>${html}</body></html>`], { type: 'text/html' });
      onResultChange({ text: 'Exported Markdown to HTML', blob, filename: 'document.html' });
  };

  return (
    <div className="grid gap-15">
      <div className="grid grid-2-cols gap-15">
        <div className="flex-column gap-10">
            <textarea
              className="pill font-mono glass-card"
              rows="15"
              style={{height: '400px'}}
              value={md}
              onChange={e => setMd(e.target.value)}
              placeholder="Write markdown here..."
            />
            <div className="flex-center gap-15 opacity-6 smallest uppercase font-bold">
                <span>{stats.words} Words</span>
                <span>{stats.chars} Characters</span>
            </div>
        </div>
        <div className="card p-20 about-content overflow-auto glass-card" style={{ height: '400px' }} dangerouslySetInnerHTML={{ __html: html }} />
      </div>
      <div className="flex-gap">
          <button className="btn-primary flex-1" onClick={exportPdf}>Export to PDF</button>
          <button className="pill flex-1" onClick={exportHtml}>Export to HTML</button>
      </div>
    </div>
  );
};

const DocTools = ({ onResultChange, toolId, onSubtoolChange }) => {
  const tabs = [
    { id: 'pdf', label: 'PDF Hub' },
    { id: 'image', label: 'Image Hub' },
    { id: 'text', label: 'Text Hub' },
    { id: 'md-editor', label: 'Markdown Editor' },
    { id: 'doc-translator', label: 'Doc Translator' }
  ].sort((a, b) => a.label.localeCompare(b.label));

  const [activeTab, setActiveTab] = useState('pdf');

  useEffect(() => {
    const current = tabs.find(t => t.id === activeTab);
    if (current && onSubtoolChange) onSubtoolChange(current.label);
  }, [activeTab]);

  useEffect(() => {
    if (toolId) {
        if (['pdf-merge', 'pdf-split', 'pdf-rotate'].includes(toolId)) setActiveTab('pdf');
        else if (['img-format', 'img-resize', 'img-blur'].includes(toolId)) setActiveTab('image');
        else if (['case-converter', 'word-counter'].includes(toolId)) setActiveTab('text');
        else if (toolId === 'md-editor') setActiveTab('md-editor');
        else if (toolId === 'doc-translator') setActiveTab('doc-translator');
    }
  }, [toolId]);

  return (
    <div className="tool-form">
      <div className="pill-group mb-20 scrollable-x">
        {tabs.map(tab => (
          <button key={tab.id} className={`pill ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="hub-content">
          {activeTab === 'pdf' && <PdfHub onResultChange={onResultChange} subtool={toolId} />}
          {activeTab === 'image' && <ImageHub onResultChange={onResultChange} subtool={toolId} />}
          {activeTab === 'text' && <TextHub onResultChange={onResultChange} subtool={toolId} />}
          {activeTab === 'md-editor' && <MarkdownEditor onResultChange={onResultChange} />}
          {activeTab === 'doc-translator' && <DocTranslator onResultChange={onResultChange} />}
      </div>
    </div>
  );
};

export default DocTools;
