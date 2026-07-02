import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import ToolResult from '../ToolResult';

// Set worker source for pdfjs-dist
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const PdfHub = () => {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    const extractText = async () => {
        if (files.length === 0) return alert('Select a PDF file first.');
        setLoading(true);
        try {
            const file = files[0];
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            let fullText = '';

            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map(item => item.str).join(' ');
                fullText += `--- Page ${i} ---\n${pageText}\n\n`;
            }

            setResult({ text: fullText, filename: 'extracted_text.txt' });
        } catch (e) {
            setResult({ error: 'Text extraction failed: ' + e.message });
        } finally {
            setLoading(false);
        }
    };

    const mergePdfs = async () => {
        if (files.length < 2) return alert('Select at least 2 PDF files to merge.');
        setLoading(true);
        try {
            const mergedPdf = await PDFDocument.create();
            for (const file of files) {
                const arrayBuffer = await file.arrayBuffer();
                const pdf = await PDFDocument.load(arrayBuffer);
                const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
                copiedPages.forEach((page) => mergedPdf.addPage(page));
            }
            const pdfBytes = await mergedPdf.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            setResult({ text: 'PDFs merged successfully', blob, filename: 'merged.pdf' });
        } catch (e) {
            setResult({ error: e.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card p-30 glass-card text-center grid gap-15">
            <h3>PDF Hub (Offline Merge)</h3>
            <div className="file-input-wrapper">
                <input type="file" id="pdf-files" multiple accept=".pdf" onChange={e => setFiles(Array.from(e.target.files))} />
                <label htmlFor="pdf-files" className="file-input-label">{files.length > 0 ? `${files.length} PDFs selected` : 'Select PDFs'}</label>
            </div>
            <div className="grid grid-2-cols gap-10">
                <button className="btn-primary" onClick={mergePdfs} disabled={loading}>{loading ? 'Merging...' : 'Merge PDFs'}</button>
                <button className="pill" onClick={extractText} disabled={loading}>{loading ? 'Extracting...' : 'Extract Text'}</button>
            </div>
            <ToolResult result={result} />
        </div>
    );
};

export default PdfHub;
