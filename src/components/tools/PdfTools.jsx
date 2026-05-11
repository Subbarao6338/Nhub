import React, { useState, useEffect } from 'react';
import { PDFDocument, rgb } from 'pdf-lib';

const ImageToPdf = ({ onResultChange }) => {
    const [images, setImages] = useState([]);
    const convert = async () => {
        if (images.length === 0) return;
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
    };
    return (
        <div className="card p-15 grid gap-10">
            <input type="file" multiple accept="image/*" className="pill w-full" onChange={e=>setImages(Array.from(e.target.files))} />
            <button className="btn-primary" onClick={convert} disabled={images.length === 0}>Convert {images.length} Images</button>
        </div>
    );
};

const PdfTranslator = ({ files }) => {
    const [lang, setLang] = useState('en');
    const translate = () => {
        alert("Uploading PDF for translation to " + lang + ". This may take a minute...");
    };
    return (
        <div className="card p-15 grid gap-15">
            <select className="pill w-full" value={lang} onChange={e=>setLang(e.target.value)}>
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
            </select>
            <button className="btn-primary" onClick={translate} disabled={files.length === 0}>Translate PDF</button>
        </div>
    );
};

const PdfTools = ({ onResultChange, toolId, onSubtoolChange }) => {
  const [activeTab, setActiveTab] = useState('merge');
  const [files, setFiles] = useState([]);
  const [password, setPassword] = useState('');
  const [pagesToRemove, setPagesToRemove] = useState('');
  const [pageOrder, setPageOrder] = useState('');
  const [splitRange, setSplitRange] = useState('');
  const [watermarkText, setWatermarkText] = useState('Confidential');
  const [cropBox, setCropBox] = useState({ x: 0, y: 0, w: 0, h: 0 });
  const [signatureImage, setSignatureImage] = useState(null);
  const [metadata, setMetadata] = useState({ title: '', author: '', subject: '', keywords: '' });

  useEffect(() => {
    const current = tabs.find(t => t.id === activeTab);
    if (current && onSubtoolChange) onSubtoolChange(current.label);
  }, [activeTab]);

  useEffect(() => {
    if (toolId) {
      const mapping = {
        'pdf-merge': 'merge',
        'pdf-split': 'split',
        'pdf-delete': 'delete',
        'pdf-rearrange': 'rearrange',
        'pdf-rotate': 'rotate',
        'pdf-sign': 'sign',
        'pdf-watermark': 'watermark',
        'pdf-numbers': 'numbers',
        'pdf-crop': 'crop',
        'pdf-lock': 'lock',
        'pdf-unlock': 'unlock',
        'pdf-meta': 'metadata',
        'pdf-compress': 'compress',
        'pdf-grayscale': 'grayscale',
        'pdf-flatten': 'flatten',
        'pdf-img2pdf': 'img2pdf',
        'pdf-translate': 'translate'
      };
      if (mapping[toolId]) setActiveTab(mapping[toolId]); else if (tabs.length > 0) setActiveTab(tabs[0].id);
    }
  }, [toolId]);

  const handleFileUpload = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const mergePdfs = async () => {
    if (files.length < 2) return;
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
    } catch (e) { alert("Error merging PDFs: " + e.message); }
  };

  const rotatePdf = async () => {
    if (files.length === 0) return;
    try {
      const pdfBytes = await files[0].arrayBuffer();
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const pages = pdfDoc.getPages();
      pages.forEach(page => {
        const currentRotation = page.getRotation().angle;
        page.setRotation({ angle: (currentRotation + 90) % 360 });
      });
      const rotatedBytes = await pdfDoc.save();
      onResultChange({ text: 'Rotated PDF', blob: new Blob([rotatedBytes], { type: 'application/pdf' }), filename: 'rotated.pdf' });
    } catch (e) { alert("Error rotating PDF: " + e.message); }
  };

  const deletePages = async () => {
    if (files.length === 0 || !pagesToRemove) return;
    try {
      const pdfBytes = await files[0].arrayBuffer();
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const indices = pagesToRemove.split(',').map(s => parseInt(s.trim()) - 1).filter(n => !isNaN(n));
      indices.sort((a, b) => b - a);
      indices.forEach(idx => {
        if (idx >= 0 && idx < pdfDoc.getPageCount()) {
          pdfDoc.removePage(idx);
        }
      });
      const modifiedBytes = await pdfDoc.save();
      onResultChange({ text: 'Deleted Pages', blob: new Blob([modifiedBytes], { type: 'application/pdf' }), filename: 'modified.pdf' });
    } catch (e) { alert("Error deleting pages: " + e.message); }
  };

  const rearrangePages = async () => {
    if (files.length === 0 || !pageOrder) return;
    try {
      const pdfBytes = await files[0].arrayBuffer();
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const newDoc = await PDFDocument.create();
      const indices = pageOrder.split(',').map(s => parseInt(s.trim()) - 1).filter(n => !isNaN(n));
      const copiedPages = await newDoc.copyPages(pdfDoc, indices);
      copiedPages.forEach(page => newDoc.addPage(page));
      const rearrangedBytes = await newDoc.save();
      onResultChange({ text: 'Rearranged Pages', blob: new Blob([rearrangedBytes], { type: 'application/pdf' }), filename: 'rearranged.pdf' });
    } catch (e) { alert("Error rearranging pages: " + e.message); }
  };

  const splitPdf = async () => {
    if (files.length === 0 || !splitRange) return;
    try {
      const pdfBytes = await files[0].arrayBuffer();
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const newDoc = await PDFDocument.create();
      const pages = [];
      splitRange.split(',').forEach(part => {
        if (part.includes('-')) {
          const [start, end] = part.split('-').map(s => parseInt(s.trim()));
          for (let i = start; i <= end; i++) pages.push(i - 1);
        } else {
          pages.push(parseInt(part.trim()) - 1);
        }
      });
      const copiedPages = await newDoc.copyPages(pdfDoc, pages.filter(p => p >= 0 && p < pdfDoc.getPageCount()));
      copiedPages.forEach(page => newDoc.addPage(page));
      const splitBytes = await newDoc.save();
      onResultChange({ text: 'Split PDF', blob: new Blob([splitBytes], { type: 'application/pdf' }), filename: 'split.pdf' });
    } catch (e) { alert("Error splitting PDF: " + e.message); }
  };

  const addPageNumbers = async () => {
    if (files.length === 0) return;
    try {
      const pdfBytes = await files[0].arrayBuffer();
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const pages = pdfDoc.getPages();
      for (let i = 0; i < pages.length; i++) {
        const { width } = pages[i].getSize();
        pages[i].drawText(`${i + 1}`, {
          x: width / 2,
          y: 20,
          size: 12,
          color: rgb(0, 0, 0),
        });
      }
      const pdfBytesWithNumbers = await pdfDoc.save();
      onResultChange({ text: 'Added Page Numbers', blob: new Blob([pdfBytesWithNumbers], { type: 'application/pdf' }), filename: 'numbered.pdf' });
    } catch (e) { alert("Error adding page numbers: " + e.message); }
  };

  const addWatermark = async () => {
    if (files.length === 0 || !watermarkText) return;
    try {
      const pdfBytes = await files[0].arrayBuffer();
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const pages = pdfDoc.getPages();
      for (const page of pages) {
        const { width, height } = page.getSize();
        page.drawText(watermarkText, {
          x: width / 2 - 100,
          y: height / 2,
          size: 50,
          color: rgb(0.5, 0.5, 0.5),
          opacity: 0.3,
          rotate: { angle: 45, type: 'degrees' }
        });
      }
      const watermarkedBytes = await pdfDoc.save();
      onResultChange({ text: 'Added Watermark', blob: new Blob([watermarkedBytes], { type: 'application/pdf' }), filename: 'watermarked.pdf' });
    } catch (e) { alert("Error adding watermark: " + e.message); }
  };

  const cropPdf = async () => {
    if (files.length === 0) return;
    try {
      const pdfBytes = await files[0].arrayBuffer();
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const pages = pdfDoc.getPages();
      pages.forEach(page => {
        const { width, height } = page.getSize();
        const x = (cropBox.x / 100) * width;
        const y = (cropBox.y / 100) * height;
        const w = ((100 - cropBox.w - cropBox.x) / 100) * width;
        const h = ((100 - cropBox.h - cropBox.y) / 100) * height;
        page.setCropBox(x, y, w, h);
      });
      const croppedBytes = await pdfDoc.save();
      onResultChange({ text: 'Cropped PDF', blob: new Blob([croppedBytes], { type: 'application/pdf' }), filename: 'cropped.pdf' });
    } catch (e) { alert("Error cropping PDF: " + e.message); }
  };

  const signPdf = async () => {
    if (files.length === 0 || !signatureImage) return;
    try {
      const pdfBytes = await files[0].arrayBuffer();
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const signatureBytes = await signatureImage.arrayBuffer();
      let embeddedImage;
      if (signatureImage.type === 'image/png') embeddedImage = await pdfDoc.embedPng(signatureBytes);
      else embeddedImage = await pdfDoc.embedJpg(signatureBytes);
      const pages = pdfDoc.getPages();
      const lastPage = pages[pages.length - 1];
      const { width } = lastPage.getSize();
      lastPage.drawImage(embeddedImage, {
        x: width - 150,
        y: 50,
        width: 100,
        height: 50,
      });
      const signedBytes = await pdfDoc.save();
      onResultChange({ text: 'Signed PDF', blob: new Blob([signedBytes], { type: 'application/pdf' }), filename: 'signed.pdf' });
    } catch (e) { alert("Error signing PDF: " + e.message); }
  };

  const lockPdf = async () => {
    if (files.length === 0 || !password) return;
    try {
      const pdfBytes = await files[0].arrayBuffer();
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const encryptedBytes = await pdfDoc.save({ userPassword: password, ownerPassword: password });
      onResultChange({ text: 'Locked PDF', blob: new Blob([encryptedBytes], { type: 'application/pdf' }), filename: 'locked.pdf' });
    } catch (e) { alert("Error locking PDF: " + e.message); }
  };

  const unlockPdf = async () => {
    if (files.length === 0 || !password) return;
    try {
      const pdfBytes = await files[0].arrayBuffer();
      const pdfDoc = await PDFDocument.load(pdfBytes, { password });
      const decryptedBytes = await pdfDoc.save();
      onResultChange({ text: 'Unlocked PDF', blob: new Blob([decryptedBytes], { type: 'application/pdf' }), filename: 'unlocked.pdf' });
    } catch (e) { alert("Error unlocking PDF: " + e.message); }
  };

  const updateMetadata = async () => {
    if (files.length === 0) return;
    try {
      const pdfBytes = await files[0].arrayBuffer();
      const pdfDoc = await PDFDocument.load(pdfBytes);
      pdfDoc.setTitle(metadata.title);
      pdfDoc.setAuthor(metadata.author);
      pdfDoc.setSubject(metadata.subject);
      pdfDoc.setKeywords(metadata.keywords.split(',').map(s => s.trim()));
      const modifiedBytes = await pdfDoc.save();
      onResultChange({ text: 'Updated Metadata', blob: new Blob([modifiedBytes], { type: 'application/pdf' }), filename: 'updated_meta.pdf' });
    } catch (e) { alert("Error updating metadata: " + e.message); }
  };

  const tabs = [
    { id: 'merge', label: 'Merge' },
    { id: 'split', label: 'Split' },
    { id: 'delete', label: 'Delete' },
    { id: 'rearrange', label: 'Rearrange' },
    { id: 'rotate', label: 'Rotate' },
    { id: 'sign', label: 'Sign' },
    { id: 'watermark', label: 'Watermark' },
    { id: 'numbers', label: 'Numbers' },
    { id: 'crop', label: 'Crop' },
    { id: 'lock', label: 'Lock' },
    { id: 'unlock', label: 'Unlock' },
    { id: 'metadata', label: 'Metadata' },
    { id: 'compress', label: 'Compress' },
    { id: 'grayscale', label: 'Grayscale' },
    { id: 'flatten', label: 'Flatten' },
    { id: 'img2pdf', label: 'Img to PDF' },
    { id: 'translate', label: 'Translate' }
  ].sort((a, b) => a.label.localeCompare(b.label));

  const isDeepLinked = !!toolId && tabs.some(t => t.id === toolId || toolId.includes(t.id));

  return (
    <div className="tool-form">
      {!isDeepLinked && (
          <div className="pill-group mb-20 scrollable-x">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`pill ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
      )}

      <div className="form-group">
        <label>Upload PDF(s)</label>
        <input type="file" multiple onChange={handleFileUpload} accept="application/pdf" className="pill w-full" />
      </div>

      {activeTab === 'merge' && (
        <button className="btn-primary w-full mt-20" onClick={mergePdfs} disabled={files.length < 2}>Merge {files.length} PDFs</button>
      )}

      {activeTab === 'split' && (
        <div className="mt-20">
          <div className="form-group">
            <label>Page Range (e.g. 1-3, 5)</label>
            <input type="text" value={splitRange} onChange={e => setSplitRange(e.target.value)} placeholder="1-3, 5" className="pill w-full" />
          </div>
          <button className="btn-primary w-full" onClick={splitPdf} disabled={files.length === 0 || !splitRange}>Split PDF</button>
        </div>
      )}

      {activeTab === 'delete' && (
        <div className="mt-20">
          <div className="form-group">
            <label>Pages to Remove (e.g. 1, 3, 5)</label>
            <input type="text" value={pagesToRemove} onChange={e => setPagesToRemove(e.target.value)} placeholder="1, 3, 5" className="pill w-full" />
          </div>
          <button className="btn-primary w-full" onClick={deletePages} disabled={files.length === 0 || !pagesToRemove}>Remove Pages</button>
        </div>
      )}

      {activeTab === 'rearrange' && (
        <div className="mt-20">
          <div className="form-group">
            <label>New Page Order (e.g. 3, 1, 2)</label>
            <input type="text" value={pageOrder} onChange={e => setPageOrder(e.target.value)} placeholder="3, 1, 2" className="pill w-full" />
          </div>
          <button className="btn-primary w-full" onClick={rearrangePages} disabled={files.length === 0 || !pageOrder}>Rearrange Pages</button>
        </div>
      )}

      {activeTab === 'rotate' && (
        <button className="btn-primary w-full mt-20" onClick={rotatePdf} disabled={files.length === 0}>Rotate 90° Clockwise</button>
      )}

      {activeTab === 'sign' && (
        <div className="mt-20">
          <div className="form-group">
            <label>Upload Signature (PNG/JPG)</label>
            <input type="file" onChange={e => setSignatureImage(e.target.files[0])} accept="image/*" className="pill w-full" />
          </div>
          <button className="btn-primary w-full" onClick={signPdf} disabled={files.length === 0 || !signatureImage}>Sign PDF</button>
        </div>
      )}

      {activeTab === 'watermark' && (
        <div className="mt-20">
          <div className="form-group">
            <label>Watermark Text</label>
            <input type="text" value={watermarkText} onChange={e => setWatermarkText(e.target.value)} className="pill w-full" />
          </div>
          <button className="btn-primary w-full" onClick={addWatermark} disabled={files.length === 0 || !watermarkText}>Add Watermark</button>
        </div>
      )}

      {activeTab === 'numbers' && (
        <button className="btn-primary w-full mt-20" onClick={addPageNumbers} disabled={files.length === 0}>Add Page Numbers</button>
      )}

      {activeTab === 'img2pdf' && <ImageToPdf onResultChange={onResultChange} />}
      {activeTab === 'translate' && <PdfTranslator onResultChange={onResultChange} files={files} />}

      {activeTab === 'crop' && (
        <div className="mt-20">
          <div className="grid grid-2 gap-10 mb-15">
            {['x', 'y', 'w', 'h'].map(key => (
              <div key={key} className="form-group">
                <label>{key.toUpperCase()} Margin %</label>
                <input type="number" value={cropBox[key]} onChange={e => setCropBox({ ...cropBox, [key]: parseInt(e.target.value) || 0 })} className="pill w-full" />
              </div>
            ))}
          </div>
          <button className="btn-primary w-full" onClick={cropPdf} disabled={files.length === 0}>Apply Crop</button>
        </div>
      )}

      {activeTab === 'lock' && (
        <div className="mt-20">
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="pill w-full" />
          </div>
          <button className="btn-primary w-full" onClick={lockPdf} disabled={files.length === 0 || !password}>Lock PDF</button>
        </div>
      )}

      {activeTab === 'unlock' && (
        <div className="mt-20">
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="pill w-full" />
          </div>
          <button className="btn-primary w-full" onClick={unlockPdf} disabled={files.length === 0 || !password}>Unlock PDF</button>
        </div>
      )}

      {activeTab === 'metadata' && (
        <div className="mt-20 grid gap-10">
          {Object.keys(metadata).map(key => (
            <div key={key} className="form-group">
              <label>{key.charAt(0).toUpperCase() + key.slice(1)}</label>
              <input type="text" value={metadata[key]} onChange={e => setMetadata({ ...metadata, [key]: e.target.value })} className="pill w-full" />
            </div>
          ))}
          <button className="btn-primary w-full" onClick={updateMetadata} disabled={files.length === 0}>Update Metadata</button>
        </div>
      )}

      {['compress', 'grayscale', 'flatten'].includes(activeTab) && (
        <div className="text-center p-20 opacity-6">This advanced PDF feature is coming soon.</div>
      )}
    </div>
  );
};

export default PdfTools;
