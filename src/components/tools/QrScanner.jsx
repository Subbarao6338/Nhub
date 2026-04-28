import React, { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

const QrScanner = ({ onResultChange }) => {
  const [scanResult, setScanResult] = useState(null);
  const [isScanning, setIsScanning] = useState(true);
  const scannerRef = useRef(null);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner('reader', {
      fps: 10,
      qrbox: { width: 250, height: 250 },
    });

    scanner.render(onScanSuccess, onScanError);
    scannerRef.current = scanner;

    function onScanSuccess(decodedText, decodedResult) {
      setScanResult(decodedText);
      setIsScanning(false);
      scanner.clear();
      if (onResultChange) {
        onResultChange({ text: decodedText, filename: 'qr_scan.txt' });
      }
    }

    function onScanError(err) {
      // Quietly ignore errors (like "no QR code detected")
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(err => console.error("Scanner clear failed:", err));
      }
    };
  }, []);

  const resetScanner = async () => {
    if (scannerRef.current) {
        try {
            await scannerRef.current.clear();
        } catch (e) {
            console.error("Failed to clear scanner before reset", e);
        }
    }
    setScanResult(null);
    setIsScanning(true);
    const scanner = new Html5QrcodeScanner('reader', {
      fps: 10,
      qrbox: { width: 250, height: 250 },
    });
    scanner.render((text) => {
        setScanResult(text);
        setIsScanning(false);
        scanner.clear();
        if (onResultChange) onResultChange({ text, filename: 'qr_scan.txt' });
    }, () => {});
    scannerRef.current = scanner;
  };

  return (
    <div className="tool-form text-center">
      <div id="reader" style={{ width: '100%', maxWidth: '400px', margin: '0 auto', borderRadius: '16px', overflow: 'hidden' }}></div>

      {scanResult && (
        <div className="mt-20 card p-20">
          <h3 className="mb-10 font-semibold opacity-7">Scan Result</h3>
          <div className="tool-result p-15 font-mono break-all" style={{ background: 'rgba(var(--primary-rgb), 0.05)' }}>
            {scanResult}
          </div>
          <div className="flex-gap mt-20">
              <button className="pill active flex-1" onClick={() => navigator.clipboard.writeText(scanResult)}>Copy</button>
              <button className="btn-primary flex-1" onClick={resetScanner}>Scan Again</button>
          </div>
        </div>
      )}

      <div className="mt-20 p-10 opacity-6" style={{ fontSize: '0.85rem' }}>
          Your browser may ask for camera permission. Scanning is performed entirely offline on your device.
      </div>
    </div>
  );
};

export default QrScanner;
