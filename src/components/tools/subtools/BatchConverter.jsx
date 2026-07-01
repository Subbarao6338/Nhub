import React, { useState } from 'react';
import JSZip from 'jszip';
import ToolResult from '../ToolResult';

const BatchConverter = () => {
    const [files, setFiles] = useState([]);
    const [width, setWidth] = useState(800);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    const resizeImage = (file, targetWidth) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const scaleFactor = targetWidth / img.width;
                    canvas.width = targetWidth;
                    canvas.height = img.height * scaleFactor;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    canvas.toBlob((blob) => resolve(blob), file.type);
                };
                img.onerror = reject;
                img.src = e.target.result;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    const processBatch = async () => {
        if (files.length === 0) return;
        setLoading(true);
        try {
            const zip = new JSZip();
            for (const file of files) {
                if (file.type.startsWith('image/')) {
                    const resizedBlob = await resizeImage(file, width);
                    zip.file(file.name, resizedBlob);
                } else {
                    zip.file(file.name, file);
                }
            }
            const content = await zip.generateAsync({ type: 'blob' });
            setResult({ text: `Processed and resized ${files.length} files into a ZIP.`, blob: content, filename: 'resized_batch.zip' });
        } catch (e) {
            setResult({ error: e.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card p-30 glass-card text-center grid gap-15">
            <h3>Batch Converter (Offline)</h3>
            <div className="grid grid-2-cols gap-10">
                <div className="file-input-wrapper">
                    <input type="file" id="batch-files" multiple accept="image/*" onChange={e => setFiles(Array.from(e.target.files))} />
                    <label htmlFor="batch-files" className="file-input-label">{files.length > 0 ? `${files.length} images` : 'Select Images'}</label>
                </div>
                <div className="form-group">
                    <input type="number" className="pill w-full" value={width} onChange={e => setWidth(parseInt(e.target.value))} placeholder="Target Width" />
                </div>
            </div>
            <button className="btn-primary w-full" onClick={processBatch} disabled={loading}>{loading ? 'Resizing...' : 'Resize & ZIP'}</button>
            <ToolResult result={result} />
        </div>
    );
};

export default BatchConverter;
