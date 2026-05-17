import React, { useState } from 'react';
import { copyToClipboard, downloadFile } from '../../utils/helpers';

const ToolResult = ({ result, title = 'Result', showPreview = true }) => {
    const [copySuccess, setCopySuccess] = useState(false);

    if (!result) return null;

    const text = typeof result === 'string' ? result : (result.text || '');
    const filename = result.filename || 'result';
    const blob = result.blob;
    const url = result.url;

    const handleCopy = () => {
        copyToClipboard(text, () => {
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        });
    };

    const handleDownload = (format) => {
        if (blob && format === 'pdf' && filename.endsWith('.pdf')) {
            downloadFile(blob, filename, 'pdf');
        } else {
            downloadFile(text, filename, format);
        }
    };

    return (
        <div className="tool-result-container animate-fadeIn mt-20">
            <div className="flex-between mb-10">
                <div className="opacity-6 smallest uppercase font-bold">{title}</div>
                <div className="flex-gap">
                    <button
                        className={`icon-btn ${copySuccess ? 'copy-success' : ''}`}
                        onClick={handleCopy}
                        title="Copy Result"
                        style={{ width: '32px', height: '32px' }}
                    >
                        <span className="material-icons" style={{ fontSize: '1.1rem' }}>{copySuccess ? 'check' : 'content_copy'}</span>
                    </button>
                    <div className="dropdown-container">
                        <button
                            className="icon-btn"
                            title="Download Result"
                            style={{ width: '32px', height: '32px' }}
                        >
                            <span className="material-icons" style={{ fontSize: '1.1rem' }}>download</span>
                        </button>
                        <div className="dropdown-menu">
                            <button onClick={() => handleDownload('txt')}>.TXT</button>
                            <button onClick={() => handleDownload('md')}>.MD</button>
                            <button onClick={() => handleDownload('pdf')}>.PDF</button>
                        </div>
                    </div>
                </div>
            </div>

            {showPreview && url ? (
                <div className="card p-15 text-center glass-card overflow-hidden">
                    <img src={url} alt="Result Preview" style={{ width: '100%', borderRadius: '12px', boxShadow: 'var(--shadow-md)' }} />
                </div>
            ) : (
                <pre className="tool-result" style={{ margin: 0 }}>{text}</pre>
            )}
        </div>
    );
};

export default ToolResult;
