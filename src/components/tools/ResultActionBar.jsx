import React, { useState } from 'react';

const ResultActionBar = ({ result, onClear }) => {
    const [copySuccess, setCopySuccess] = useState(false);

    if (!result) return null;

    const { text, blob, filename = 'result' } = result;

    const handleCopy = () => {
        if (!text) return;
        navigator.clipboard.writeText(text).then(() => {
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        });
    };

    const handleDownload = (format) => {
        let downloadBlob = blob;
        let finalFilename = filename;

        if (!downloadBlob && text) {
            downloadBlob = new Blob([text], { type: 'text/plain' });
            if (!finalFilename.includes('.')) finalFilename += '.txt';
        }

        if (!downloadBlob) return;

        const url = URL.createObjectURL(downloadBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = finalFilename;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Epic Toolbox Result',
                    text: text?.substring(0, 100),
                    url: window.location.href
                });
            } catch (e) {}
        }
    };

    return (
        <div className="result-action-bar flex-between p-10 mt-15 animate-fadeIn" style={{background: 'var(--surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)'}}>
            <div className="flex-gap">
                <button className={`pill smallest ${copySuccess ? 'active' : ''}`} onClick={handleCopy}>
                    <span className="material-icons" style={{fontSize: '1rem'}}>{copySuccess ? 'check' : 'content_copy'}</span>
                    {copySuccess ? 'Copied' : 'Copy'}
                </button>
                <button className="pill smallest" onClick={() => handleDownload()}>
                    <span className="material-icons" style={{fontSize: '1rem'}}>download</span>
                    Download
                </button>
            </div>
            <div className="flex-gap">
                <button className="icon-btn smallest" onClick={handleShare} title="Share"><span className="material-icons" style={{fontSize: '1.2rem'}}>share</span></button>
                {onClear && <button className="icon-btn smallest" onClick={onClear} title="Clear"><span className="material-icons" style={{fontSize: '1.2rem'}}>delete_outline</span></button>}
            </div>
        </div>
    );
};

export default ResultActionBar;
