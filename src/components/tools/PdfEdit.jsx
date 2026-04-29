import React, { useState, useEffect } from 'react';
import { PDFDocument, rgb } from 'pdf-lib';

const PdfEdit = ({ onResultChange, toolId }) => {
  const [activeTab, setActiveTab] = useState('merge');
  const [files, setFiles] = useState([]);

  useEffect(() => {
    if (toolId) {
        if (toolId === 'pdf-split') setActiveTab('split');
        else if (toolId === 'pdf-delete') setActiveTab('delete');
        else if (toolId === 'pdf-rearrange') setActiveTab('rearrange');
        else if (toolId === 'pdf-rotate') setActiveTab('rotate');
        else if (toolId === 'pdf-sign') setActiveTab('sign');
        else if (toolId === 'pdf-watermark') setActiveTab('watermark');
        else if (toolId === 'pdf-numbers') setActiveTab('numbers');
        else if (toolId === 'pdf-bookmarks') setActiveTab('bookmarks');
        else if (toolId === 'pdf-crop') setActiveTab('crop');
        else setActiveTab(toolId);
    }
  }, [toolId]);

  const handleFileUpload = (e) => {
      setFiles(Array.from(e.target.files));
  };

  const [pagesToRemove, setPagesToRemove] = useState('');
  const [pageOrder, setPageOrder] = useState('');
  const [splitRange, setSplitRange] = useState('');
  const [watermarkText, setWatermarkText] = useState('Confidential');

  const [cropBox, setCropBox] = useState({ x: 0, y: 0, w: 0, h: 0 });
  const [signatureImage, setSignatureImage] = useState(null);

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
              // Apply crop from edges (percentage-based)
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
          const { width, height } = lastPage.getSize();

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

  return (
    <div className="tool-form">
      {!toolId && (<div className="pill-group scrollable-x" style={{ marginBottom: '20px' }}>
        <button className={`pill ${activeTab === 'merge' ? 'active' : ''}`} onClick={() => setActiveTab('merge')}>Merge</button>
        <button className={`pill ${activeTab === 'split' ? 'active' : ''}`} onClick={() => setActiveTab('split')}>Split</button>
        <button className={`pill ${activeTab === 'rotate' ? 'active' : ''}`} onClick={() => setActiveTab('rotate')}>Rotate</button>
        <button className={`pill ${activeTab === 'delete' ? 'active' : ''}`} onClick={() => setActiveTab('delete')}>Delete Pages</button>
        <button className={`pill ${activeTab === 'rearrange' ? 'active' : ''}`} onClick={() => setActiveTab('rearrange')}>Rearrange</button>
        <button className={`pill ${activeTab === 'numbers' ? 'active' : ''}`} onClick={() => setActiveTab('numbers')}>Page Numbers</button>
        <button className={`pill ${activeTab === 'watermark' ? 'active' : ''}`} onClick={() => setActiveTab('watermark')}>Watermark</button>
        <button className={`pill ${activeTab === 'crop' ? 'active' : ''}`} onClick={() => setActiveTab('crop')}>Crop</button>
        <button className={`pill ${activeTab === 'sign' ? 'active' : ''}`} onClick={() => setActiveTab('sign')}>Sign</button>
      </div>)}

      <div className="form-group">
        <label>Upload PDF(s)</label>
        <input type="file" multiple onChange={handleFileUpload} accept="application/pdf" className="pill" style={{ width: '100%' }} />
        {files.length > 0 && <div style={{ fontSize: '0.8rem', opacity: 0.6, marginTop: '5px' }}>{files.length} file(s) selected</div>}
      </div>

      {activeTab === 'merge' && (
          <div style={{ marginTop: '20px' }}>
              <button className="btn-primary w-full" onClick={mergePdfs} disabled={files.length < 2}>Merge {files.length} PDFs</button>
          </div>
      )}

      {activeTab === 'rotate' && (
          <div style={{ marginTop: '20px' }}>
              <button className="btn-primary w-full" onClick={rotatePdf} disabled={files.length === 0}>Rotate 90° Clockwise</button>
          </div>
      )}

      {activeTab === 'delete' && (
          <div style={{ marginTop: '20px' }}>
              <div className="form-group">
                  <label>Pages to Remove (e.g. 1, 3, 5)</label>
                  <input type="text" value={pagesToRemove} onChange={e => setPagesToRemove(e.target.value)} placeholder="1, 3, 5" className="pill w-full" />
              </div>
              <button className="btn-primary w-full" onClick={deletePages} disabled={files.length === 0 || !pagesToRemove}>Remove Pages</button>
          </div>
      )}

      {activeTab === 'rearrange' && (
          <div style={{ marginTop: '20px' }}>
              <div className="form-group">
                  <label>New Page Order (e.g. 3, 1, 2)</label>
                  <input type="text" value={pageOrder} onChange={e => setPageOrder(e.target.value)} placeholder="3, 1, 2" className="pill w-full" />
              </div>
              <button className="btn-primary w-full" onClick={rearrangePages} disabled={files.length === 0 || !pageOrder}>Rearrange Pages</button>
          </div>
      )}

      {activeTab === 'split' && (
          <div style={{ marginTop: '20px' }}>
              <div className="form-group">
                  <label>Page Range (e.g. 1-3, 5)</label>
                  <input type="text" value={splitRange} onChange={e => setSplitRange(e.target.value)} placeholder="1-3, 5" className="pill w-full" />
              </div>
              <button className="btn-primary w-full" onClick={splitPdf} disabled={files.length === 0 || !splitRange}>Split PDF</button>
          </div>
      )}

      {activeTab === 'crop' && (
          <div style={{ marginTop: '20px' }}>
              <div className="grid grid-2 gap-10 mb-15">
                  <div className="form-group">
                      <label>Left Margin %</label>
                      <input type="number" value={cropBox.x} onChange={e => setCropBox({...cropBox, x: parseInt(e.target.value) || 0})} className="pill w-full" />
                  </div>
                  <div className="form-group">
                      <label>Top Margin %</label>
                      <input type="number" value={cropBox.y} onChange={e => setCropBox({...cropBox, y: parseInt(e.target.value) || 0})} className="pill w-full" />
                  </div>
                  <div className="form-group">
                      <label>Right Margin %</label>
                      <input type="number" value={cropBox.w} onChange={e => setCropBox({...cropBox, w: parseInt(e.target.value) || 0})} className="pill w-full" />
                  </div>
                  <div className="form-group">
                      <label>Bottom Margin %</label>
                      <input type="number" value={cropBox.h} onChange={e => setCropBox({...cropBox, h: parseInt(e.target.value) || 0})} className="pill w-full" />
                  </div>
              </div>
              <button className="btn-primary w-full" onClick={cropPdf} disabled={files.length === 0}>Apply Crop</button>
          </div>
      )}

      {activeTab === 'sign' && (
          <div style={{ marginTop: '20px' }}>
              <div className="form-group">
                  <label>Upload Signature (PNG/JPG)</label>
                  <input type="file" onChange={e => setSignatureImage(e.target.files[0])} accept="image/*" className="pill w-full" />
              </div>
              <p className="opacity-6 mb-15" style={{ fontSize: '0.8rem' }}>Signature will be placed on the bottom right of the last page.</p>
              <button className="btn-primary w-full" onClick={signPdf} disabled={files.length === 0 || !signatureImage}>Sign PDF</button>
          </div>
      )}

      {activeTab === 'numbers' && (
          <div style={{ marginTop: '20px' }}>
              <button className="btn-primary w-full" onClick={addPageNumbers} disabled={files.length === 0}>Add Page Numbers</button>
          </div>
      )}

      {activeTab === 'watermark' && (
          <div style={{ marginTop: '20px' }}>
              <div className="form-group">
                  <label>Watermark Text</label>
                  <input type="text" value={watermarkText} onChange={e => setWatermarkText(e.target.value)} placeholder="Confidential" className="pill w-full" />
              </div>
              <button className="btn-primary w-full" onClick={addWatermark} disabled={files.length === 0 || !watermarkText}>Add Watermark</button>
          </div>
      )}

      {(activeTab === 'bookmarks') && <div style={{ textAlign: 'center', opacity: 0.6, marginTop: '20px' }}>This advanced PDF feature is coming soon.</div>}
    </div>
  );
};

export default PdfEdit;
