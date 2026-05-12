import React, { useState, useEffect } from 'react';
import { PDFDocument, rgb } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';
import mammoth from 'mammoth';
import JSZip from 'jszip';
import Tesseract from 'tesseract.js';

// Setup PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

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
        <div className="card p-15 grid gap-10">
            <input type="file" multiple accept="image/*" className="pill w-full" onChange={e=>setImages(Array.from(e.target.files))} />
            <button className="btn-primary" onClick={convert} disabled={images.length === 0 || isProcessing}>
                {isProcessing ? 'Converting...' : `Convert ${images.length} Images`}
            </button>
        </div>
    );
};

const PdfTools = ({ onResultChange, toolId, onSubtoolChange }) => {
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
    { id: 'pdf-to-img', label: 'PDF to Img' },
    { id: 'word-to-pdf', label: 'Word to PDF' },
    { id: 'excel-to-pdf', label: 'Excel to PDF' },
    { id: 'pdf-to-word', label: 'PDF to Word' },
    { id: 'pdf-to-text', label: 'PDF to Text' },
    { id: 'pdf-to-zip', label: 'PDF to ZIP' },
    { id: 'pdf-extract', label: 'Extract Assets' },
    { id: 'pdf-scan', label: 'Scan PDF (OCR)' },
    { id: 'ppt-to-pdf', label: 'PPT to PDF' },
    { id: 'pdf-translate', label: 'Translate PDF' }
  ].sort((a, b) => a.label.localeCompare(b.label));

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
    const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

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
        'pdf-metadata': 'metadata',
        'pdf-compress': 'compress',
        'pdf-grayscale': 'grayscale',
        'pdf-flatten': 'flatten',
        'pdf-img2pdf': 'img2pdf',
        'img-to-pdf': 'img2pdf',
        'pdf-to-img': 'pdf-to-img',
        'word-to-pdf': 'word-to-pdf',
        'excel-to-pdf': 'excel-to-pdf',
        'pdf-to-word': 'pdf-to-word',
        'pdf-to-text': 'pdf-to-text',
        'pdf-to-zip': 'pdf-to-zip',
        'pdf-extract': 'pdf-extract',
        'pdf-scan': 'pdf-scan',
        'ppt-to-pdf': 'ppt-to-pdf',
        'pdf-translate': 'pdf-translate'
      };
      if (mapping[toolId]) setActiveTab(mapping[toolId]); else if (tabs.length > 0) setActiveTab(tabs[0].id);
    }
  }, [toolId]);


  const pdfToText = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    try {
      const arrayBuffer = await files[0].arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        fullText += `--- Page ${i} ---\n${pageText}\n\n`;
        setProgress(Math.round((i / pdf.numPages) * 100));
      }
      onResultChange({ text: fullText, filename: 'extracted_text.txt' });
    } catch (e) {
      alert("Error: " + e.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const pdfToImg = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    try {
      const arrayBuffer = await files[0].arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 2 });
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const context = canvas.getContext('2d');
      await page.render({ canvasContext: context, viewport }).promise;
      canvas.toBlob((blob) => {
        onResultChange({ text: 'PDF to Image (Page 1)', blob, filename: 'page1.png' });
      });
    } catch (e) {
      alert("Error: " + e.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const wordToPdf = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    try {
      const arrayBuffer = await files[0].arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer });
      const html = result.value;
      const container = document.createElement('div');
      container.style.padding = '40px';
      container.style.width = '800px';
      container.style.background = 'white';
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.innerHTML = html;
      document.body.appendChild(container);
      const canvas = await html2canvas(container);
      document.body.removeChild(container);
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      onResultChange({ text: 'Word to PDF', blob: pdf.output('blob'), filename: 'converted.pdf' });
    } catch (e) {
      alert("Error: " + e.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const excelToPdf = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    try {
      const arrayBuffer = await files[0].arrayBuffer();
      const workbook = XLSX.read(arrayBuffer);
      const html = XLSX.utils.sheet_to_html(workbook.Sheets[workbook.SheetNames[0]]);
      const container = document.createElement('div');
      container.style.padding = '20px';
      container.style.background = 'white';
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.innerHTML = html;
      document.body.appendChild(container);
      const canvas = await html2canvas(container);
      document.body.removeChild(container);
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('l', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      onResultChange({ text: 'Excel to PDF', blob: pdf.output('blob'), filename: 'converted.pdf' });
    } catch (e) {
      alert("Error: " + e.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const pdfToWord = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    try {
      const arrayBuffer = await files[0].arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        fullText += textContent.items.map(item => item.str).join(' ') + "\n\n";
      }
      const blob = new Blob(['\ufeff', fullText], { type: 'application/msword' });
      onResultChange({ text: 'PDF to Word (Text-only)', blob, filename: 'converted.doc' });
    } catch (e) {
      alert("Error: " + e.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const pdfToZip = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    try {
      const zip = new JSZip();
      const arrayBuffer = await files[0].arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2 });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
        const imgBlob = await new Promise(r => canvas.toBlob(r, 'image/jpeg', 0.8));
        zip.file(`page_${i}.jpg`, imgBlob);
        setProgress(Math.round((i / pdf.numPages) * 100));
      }
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      onResultChange({ text: 'PDF Pages to ZIP', blob: zipBlob, filename: 'pages.zip' });
    } catch (e) {
      alert("Error: " + e.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const extractAssets = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    try {
      const zip = new JSZip();
      const arrayBuffer = await files[0].arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let imgCount = 0;
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const ops = await page.getOperatorList();
        for (let j = 0; j < ops.fnArray.length; j++) {
          if (ops.fnArray[j] === pdfjsLib.OPS.paintImageXObject || ops.fnArray[j] === pdfjsLib.OPS.paintInlineImageXObject) {
            const name = ops.argsArray[j][0];
            try {
                const img = await page.objs.get(name);
                if (img && img.data) {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width; canvas.height = img.height;
                    const ctx = canvas.getContext('2d');
                    const imageData = ctx.createImageData(img.width, img.height);
                    imageData.data.set(img.data);
                    ctx.putImageData(imageData, 0, 0);
                    const blob = await new Promise(r => canvas.toBlob(r));
                    zip.file(`image_${imgCount++}.png`, blob);
                }
            } catch(e) {}
          }
        }
        setProgress(Math.round((i / pdf.numPages) * 100));
      }
      if (imgCount === 0) throw new Error("No images found in PDF");
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      onResultChange({ text: `Extracted ${imgCount} images`, blob: zipBlob, filename: 'assets.zip' });
    } catch (e) {
      alert("Error: " + e.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const scanPdf = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    try {
      const arrayBuffer = await files[0].arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = "";
      const worker = await Tesseract.createWorker();
      await worker.loadLanguage('eng');
      await worker.initialize('eng');
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2 });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width; canvas.height = viewport.height;
        await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
        const { data: { text } } = await worker.recognize(canvas);
        fullText += `--- Page ${i} (OCR) ---\n${text}\n\n`;
        setProgress(Math.round((i / pdf.numPages) * 100));
      }
      await worker.terminate();
      onResultChange({ text: fullText, filename: 'ocr_result.txt' });
    } catch (e) {
      alert("Error: " + e.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const pptToPdf = async () => {
    if (files.length === 0) return;
    alert("PPT to PDF conversion requires server-side processing or a heavy WASM module not currently included. This is a placeholder for future integration.");
  };

  const translatePdf = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    try {
      const arrayBuffer = await files[0].arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        fullText += textContent.items.map(s => s.str).join(' ');
        setProgress(Math.round((i / pdf.numPages) * 100));
      }

      const response = await fetch('/api/text/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: fullText.substring(0, 5000), target_lang: 'en' })
      });
      const data = await response.json();
      onResultChange({ text: data.translated_text, filename: 'translated_pdf.txt' });
    } catch (e) {
      alert("Error: " + e.message);
    } finally {
      setIsProcessing(false);
    }
  };
  const handleFileUpload = (e) => {
    setFiles(Array.from(e.target.files));
  };

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
      const pages = pdfDoc.getPages();
      pages.forEach(page => {
        const currentRotation = page.getRotation().angle;
        page.setRotation({ angle: (currentRotation + 90) % 360 });
      });
      const rotatedBytes = await pdfDoc.save();
      onResultChange({ text: 'Rotated PDF', blob: new Blob([rotatedBytes], { type: 'application/pdf' }), filename: 'rotated.pdf' });
    } catch (e) { alert("Error: " + e.message); }
    finally { setIsProcessing(false); }
  };

  const deletePages = async () => {
    if (files.length === 0 || !pagesToRemove) return;
    setIsProcessing(true);
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
    } catch (e) { alert("Error: " + e.message); }
    finally { setIsProcessing(false); }
  };

  const rearrangePages = async () => {
    if (files.length === 0 || !pageOrder) return;
    setIsProcessing(true);
    try {
      const pdfBytes = await files[0].arrayBuffer();
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const newDoc = await PDFDocument.create();
      const indices = pageOrder.split(',').map(s => parseInt(s.trim()) - 1).filter(n => !isNaN(n));
      const copiedPages = await newDoc.copyPages(pdfDoc, indices);
      copiedPages.forEach(page => newDoc.addPage(page));
      const rearrangedBytes = await newDoc.save();
      onResultChange({ text: 'Rearranged Pages', blob: new Blob([rearrangedBytes], { type: 'application/pdf' }), filename: 'rearranged.pdf' });
    } catch (e) { alert("Error: " + e.message); }
    finally { setIsProcessing(false); }
  };

  const splitPdf = async () => {
    if (files.length === 0 || !splitRange) return;
    setIsProcessing(true);
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
    } catch (e) { alert("Error: " + e.message); }
    finally { setIsProcessing(false); }
  };

  const addPageNumbers = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
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
    } catch (e) { alert("Error: " + e.message); }
    finally { setIsProcessing(false); }
  };

  const addWatermark = async () => {
    if (files.length === 0 || !watermarkText) return;
    setIsProcessing(true);
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
    } catch (e) { alert("Error: " + e.message); }
    finally { setIsProcessing(false); }
  };

  const cropPdf = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
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
    } catch (e) { alert("Error: " + e.message); }
    finally { setIsProcessing(false); }
  };

  const signPdf = async () => {
    if (files.length === 0 || !signatureImage) return;
    setIsProcessing(true);
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
    } catch (e) { alert("Error: " + e.message); }
    finally { setIsProcessing(false); }
  };

  const lockPdf = async () => {
    if (files.length === 0 || !password) return;
    setIsProcessing(true);
    try {
      const pdfBytes = await files[0].arrayBuffer();
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const encryptedBytes = await pdfDoc.save({ userPassword: password, ownerPassword: password });
      onResultChange({ text: 'Locked PDF', blob: new Blob([encryptedBytes], { type: 'application/pdf' }), filename: 'locked.pdf' });
    } catch (e) { alert("Error: " + e.message); }
    finally { setIsProcessing(false); }
  };

  const unlockPdf = async () => {
    if (files.length === 0 || !password) return;
    setIsProcessing(true);
    try {
      const pdfBytes = await files[0].arrayBuffer();
      const pdfDoc = await PDFDocument.load(pdfBytes, { password });
      const decryptedBytes = await pdfDoc.save();
      onResultChange({ text: 'Unlocked PDF', blob: new Blob([decryptedBytes], { type: 'application/pdf' }), filename: 'unlocked.pdf' });
    } catch (e) { alert("Error: " + e.message); }
    finally { setIsProcessing(false); }
  };

  const updateMetadata = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    try {
      const pdfBytes = await files[0].arrayBuffer();
      const pdfDoc = await PDFDocument.load(pdfBytes);
      pdfDoc.setTitle(metadata.title);
      pdfDoc.setAuthor(metadata.author);
      pdfDoc.setSubject(metadata.subject);
      pdfDoc.setKeywords(metadata.keywords.split(',').map(s => s.trim()));
      const modifiedBytes = await pdfDoc.save();
      onResultChange({ text: 'Updated Metadata', blob: new Blob([modifiedBytes], { type: 'application/pdf' }), filename: 'updated_meta.pdf' });
    } catch (e) { alert("Error: " + e.message); }
    finally { setIsProcessing(false); }
  };

  const compressPdf = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    try {
      const pdfBytes = await files[0].arrayBuffer();
      const pdfDoc = await PDFDocument.load(pdfBytes);
      pdfDoc.setTitle('');
      pdfDoc.setAuthor('');
      const compressedBytes = await pdfDoc.save({
        useObjectStreams: true,
        addDefaultPage: false
      });
      onResultChange({ text: 'Compressed PDF', blob: new Blob([compressedBytes], { type: 'application/pdf' }), filename: 'compressed.pdf' });
    } catch (e) { alert("Error: " + e.message); }
    finally { setIsProcessing(false); }
  };

  const flattenPdf = async () => {
      if (files.length === 0) return;
      setIsProcessing(true);
      try {
          const pdfBytes = await files[0].arrayBuffer();
          const pdfDoc = await PDFDocument.load(pdfBytes);
          const form = pdfDoc.getForm();
          form.flatten();
          const flattenedBytes = await pdfDoc.save();
          onResultChange({ text: 'Flattened PDF', blob: new Blob([flattenedBytes], { type: 'application/pdf' }), filename: 'flattened.pdf' });
      } catch (e) { alert("Error: " + e.message); }
      finally { setIsProcessing(false); }
  };

  const grayscalePdf = async () => {
      if (files.length === 0) return;
      setIsProcessing(true);
      try {
          const arrayBuffer = await files[0].arrayBuffer();
          const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
          const newPdf = await PDFDocument.create();
          for (let i = 1; i <= pdf.numPages; i++) {
              const page = await pdf.getPage(i);
              const viewport = page.getViewport({ scale: 2 });
              const canvas = document.createElement('canvas');
              canvas.width = viewport.width; canvas.height = viewport.height;
              const context = canvas.getContext('2d');
              await page.render({ canvasContext: context, viewport }).promise;
              const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
              const data = imageData.data;
              for (let j = 0; j < data.length; j += 4) {
                  const avg = (data[j] + data[j + 1] + data[j + 2]) / 3;
                  data[j] = avg; data[j+1] = avg; data[j+2] = avg;
              }
              context.putImageData(imageData, 0, 0);
              const imgData = canvas.toDataURL('image/jpeg', 0.8);
              const embeddedImg = await newPdf.embedJpg(imgData);
              const newPage = newPdf.addPage([embeddedImg.width, embeddedImg.height]);
              newPage.drawImage(embeddedImg, { x: 0, y: 0, width: embeddedImg.width, height: embeddedImg.height });
          }
          const grayscaleBytes = await newPdf.save();
          onResultChange({ text: 'Grayscale PDF', blob: new Blob([grayscaleBytes], { type: 'application/pdf' }), filename: 'grayscale.pdf' });
      } catch (e) { alert("Error: " + e.message); }
      finally { setIsProcessing(false); }
  };

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

      <div className="mt-20">
        {isProcessing && (
            <div className="mb-10 text-center">
                <div className="progress-bar-container" style={{background: 'var(--bg-card)', height: '8px', borderRadius: '4px', overflow: 'hidden'}}>
                    <div style={{width: `${progress}%`, height: '100%', background: 'var(--primary)', transition: 'width 0.3s'}}></div>
                </div>
                <div className="small opacity-6 mt-5">{progress}% Processing...</div>
            </div>
        )}

        {activeTab === 'merge' && (
          <button className="btn-primary w-full" onClick={mergePdfs} disabled={files.length < 2 || isProcessing}>Merge {files.length} PDFs</button>
        )}
        {activeTab === 'split' && (
          <div className="grid gap-10">
            <input type="text" value={splitRange} onChange={e => setSplitRange(e.target.value)} placeholder="e.g. 1-3, 5" className="pill w-full" />
            <button className="btn-primary w-full" onClick={splitPdf} disabled={files.length === 0 || !splitRange || isProcessing}>Split PDF</button>
          </div>
        )}
        {activeTab === 'delete' && (
          <div className="grid gap-10">
            <input type="text" value={pagesToRemove} onChange={e => setPagesToRemove(e.target.value)} placeholder="e.g. 1, 3" className="pill w-full" />
            <button className="btn-primary w-full" onClick={deletePages} disabled={files.length === 0 || !pagesToRemove || isProcessing}>Remove Pages</button>
          </div>
        )}
        {activeTab === 'rearrange' && (
          <div className="grid gap-10">
            <input type="text" value={pageOrder} onChange={e => setPageOrder(e.target.value)} placeholder="e.g. 3, 1, 2" className="pill w-full" />
            <button className="btn-primary w-full" onClick={rearrangePages} disabled={files.length === 0 || !pageOrder || isProcessing}>Rearrange Pages</button>
          </div>
        )}
        {activeTab === 'rotate' && (
          <button className="btn-primary w-full" onClick={rotatePdf} disabled={files.length === 0 || isProcessing}>Rotate 90°</button>
        )}
        {activeTab === 'sign' && (
          <div className="grid gap-10">
            <input type="file" onChange={e => setSignatureImage(e.target.files[0])} accept="image/*" className="pill w-full" />
            <button className="btn-primary w-full" onClick={signPdf} disabled={files.length === 0 || !signatureImage || isProcessing}>Sign PDF</button>
          </div>
        )}
        {activeTab === 'watermark' && (
          <div className="grid gap-10">
            <input type="text" value={watermarkText} onChange={e => setWatermarkText(e.target.value)} className="pill w-full" />
            <button className="btn-primary w-full" onClick={addWatermark} disabled={files.length === 0 || !watermarkText || isProcessing}>Add Watermark</button>
          </div>
        )}
        {activeTab === 'numbers' && (
          <button className="btn-primary w-full" onClick={addPageNumbers} disabled={files.length === 0 || isProcessing}>Add Page Numbers</button>
        )}
        {activeTab === 'crop' && (
          <div className="grid gap-10">
            <div className="grid grid-2 gap-5">
                {['x', 'y', 'w', 'h'].map(k => <input key={k} type="number" value={cropBox[k]} onChange={e => setCropBox({...cropBox, [k]: parseInt(e.target.value)||0})} placeholder={k} className="pill" />)}
            </div>
            <button className="btn-primary w-full" onClick={cropPdf} disabled={files.length === 0 || isProcessing}>Apply Crop</button>
          </div>
        )}
        {activeTab === 'lock' && (
          <div className="grid gap-10">
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="pill w-full" />
            <button className="btn-primary w-full" onClick={lockPdf} disabled={files.length === 0 || !password || isProcessing}>Lock PDF</button>
          </div>
        )}
        {activeTab === 'unlock' && (
          <div className="grid gap-10">
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="pill w-full" />
            <button className="btn-primary w-full" onClick={unlockPdf} disabled={files.length === 0 || !password || isProcessing}>Unlock PDF</button>
          </div>
        )}
        {activeTab === 'metadata' && (
          <div className="grid gap-10">
            {Object.keys(metadata).map(k => <input key={k} type="text" value={metadata[k]} onChange={e => setMetadata({...metadata, [k]: e.target.value})} placeholder={k} className="pill w-full" />)}
            <button className="btn-primary w-full" onClick={updateMetadata} disabled={files.length === 0 || isProcessing}>Update Metadata</button>
          </div>
        )}
        {activeTab === 'compress' && (
          <button className="btn-primary w-full" onClick={compressPdf} disabled={files.length === 0 || isProcessing}>Compress PDF</button>
        )}
        {activeTab === 'flatten' && (
          <button className="btn-primary w-full" onClick={flattenPdf} disabled={files.length === 0 || isProcessing}>Flatten PDF</button>
        )}
        {activeTab === 'grayscale' && (
          <button className="btn-primary w-full" onClick={grayscalePdf} disabled={files.length === 0 || isProcessing}>Convert to Grayscale</button>
        )}
        {activeTab === 'img2pdf' && <ImageToPdf onResultChange={onResultChange} />}

        {activeTab === 'pdf-to-text' && (
          <button className="btn-primary w-full" onClick={pdfToText} disabled={files.length === 0 || isProcessing}>Extract Text</button>
        )}
        {activeTab === 'pdf-to-img' && (
          <button className="btn-primary w-full" onClick={pdfToImg} disabled={files.length === 0 || isProcessing}>PDF to Image (Page 1)</button>
        )}
        {activeTab === 'word-to-pdf' && (
          <button className="btn-primary w-full" onClick={wordToPdf} disabled={files.length === 0 || isProcessing}>Word to PDF</button>
        )}
        {activeTab === 'excel-to-pdf' && (
          <button className="btn-primary w-full" onClick={excelToPdf} disabled={files.length === 0 || isProcessing}>Excel to PDF</button>
        )}
        {activeTab === 'pdf-to-word' && (
          <button className="btn-primary w-full" onClick={pdfToWord} disabled={files.length === 0 || isProcessing}>PDF to Word</button>
        )}
        {activeTab === 'pdf-to-zip' && (
          <button className="btn-primary w-full" onClick={pdfToZip} disabled={files.length === 0 || isProcessing}>PDF to ZIP (Images)</button>
        )}
        {activeTab === 'pdf-extract' && (
          <button className="btn-primary w-full" onClick={extractAssets} disabled={files.length === 0 || isProcessing}>Extract Images</button>
        )}

        {activeTab === 'ppt-to-pdf' && (
          <button className="btn-primary w-full" onClick={pptToPdf} disabled={files.length === 0 || isProcessing}>PPT to PDF</button>
        )}
        {activeTab === 'pdf-translate' && (
          <button className="btn-primary w-full" onClick={translatePdf} disabled={files.length === 0 || isProcessing}>Translate PDF (First 5000 chars)</button>
        )}
        {activeTab === 'pdf-scan' && (
          <button className="btn-primary w-full" onClick={scanPdf} disabled={files.length === 0 || isProcessing}>Scan PDF (OCR)</button>
        )}
      </div>
    </div>
  );
};

export default PdfTools;
