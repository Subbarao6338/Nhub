import React, { useState, useEffect, useRef } from 'react';

const ImageTools = ({ onResultChange, toolId, onSubtoolChange }) => {
  const [activeTab, setActiveTab] = useState('format');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const imgRef = useRef(null);

  useEffect(() => {
    const labels = {
        'format': 'Convert', 'resize': 'Resize', 'blur': 'Privacy Blur',
        'metadata': 'Clean Meta', 'bw': 'B&W Filter', 'sepia': 'Sepia',
        'invert': 'Invert', 'crop': 'Image Cropper', 'filters': 'SVG Filters', 'b64': 'Base64'
    };
    if (onSubtoolChange) onSubtoolChange(labels[activeTab] || activeTab);
  }, [activeTab]);

  useEffect(() => {
    if (toolId) {
        const mapping = {
            'img-format': 'format', 'img-resize': 'resize', 'img-blur': 'blur',
            'img-meta': 'metadata', 'img-bw': 'bw', 'img-crop': 'crop',
            'img-sepia': 'sepia', 'img-invert': 'invert', 'img-filters': 'filters',
            'img-b64': 'b64'
        };
        if (mapping[toolId]) setActiveTab(mapping[toolId]);
    }
  }, [toolId]);

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onload = (ev) => setPreview(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const isDeepLinked = !!toolId;

  return (
    <div className="tool-form">
      {!isDeepLinked && (
          <div className="pill-group mb-20 scrollable-x">
            <button className={`pill ${activeTab === 'format' ? 'active' : ''}`} onClick={() => setActiveTab('format')}>Convert</button>
            <button className={`pill ${activeTab === 'resize' ? 'active' : ''}`} onClick={() => setActiveTab('resize')}>Resize</button>
            <button className={`pill ${activeTab === 'blur' ? 'active' : ''}`} onClick={() => setActiveTab('blur')}>Privacy Blur</button>
            <button className={`pill ${activeTab === 'metadata' ? 'active' : ''}`} onClick={() => setActiveTab('metadata')}>Clean Meta</button>
            <button className={`pill ${activeTab === 'bw' ? 'active' : ''}`} onClick={() => setActiveTab('bw')}>B&W Filter</button>
            <button className={`pill ${activeTab === 'sepia' ? 'active' : ''}`} onClick={() => setActiveTab('sepia')}>Sepia</button>
            <button className={`pill ${activeTab === 'invert' ? 'active' : ''}`} onClick={() => setActiveTab('invert')}>Invert</button>
            <button className={`pill ${activeTab === 'crop' ? 'active' : ''}`} onClick={() => setActiveTab('crop')}>Crop</button>
            <button className={`pill ${activeTab === 'filters' ? 'active' : ''}`} onClick={() => setActiveTab('filters')}>SVG Filters</button>
            <button className={`pill ${activeTab === 'b64' ? 'active' : ''}`} onClick={() => setActiveTab('b64')}>Base64</button>
          </div>
      )}

      <div className="card p-20 mb-20 text-center">
          <input type="file" id="img-upload" onChange={handleUpload} accept="image/*" style={{ display: 'none' }} />
          <label htmlFor="img-upload" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <span className="material-icons">upload_file</span>
              {image ? 'Change Image' : 'Select Image'}
          </label>
          {image && <div className="mt-10 smallest opacity-6">{image.name} ({(image.size/1024).toFixed(1)} KB)</div>}
      </div>

      {preview && (
          <div className="card p-10 mb-20 text-center glass-card" style={{ maxWidth: '400px', margin: '0 auto 20px' }}>
              <img ref={imgRef} src={preview} alt="Preview" style={{ maxWidth: '100%', maxHeight: '250px', borderRadius: '16px', display: 'block' }} />
          </div>
      )}

      {image && (
          <div className="tool-controls animate-slide-up">
              {activeTab === 'format' && <FormatConverter imgRef={imgRef} image={image} onResultChange={onResultChange} />}
              {activeTab === 'resize' && <ResizeImage imgRef={imgRef} image={image} onResultChange={onResultChange} />}
              {activeTab === 'blur' && <PrivacyBlur imgRef={imgRef} image={image} onResultChange={onResultChange} />}
              {activeTab === 'metadata' && <MetadataCleaner imgRef={imgRef} image={image} onResultChange={onResultChange} />}
              {activeTab === 'bw' && <BlackWhiteFilter imgRef={imgRef} image={image} onResultChange={onResultChange} />}
              {activeTab === 'sepia' && <SepiaFilter imgRef={imgRef} image={image} onResultChange={onResultChange} />}
              {activeTab === 'invert' && <InvertFilter imgRef={imgRef} image={image} onResultChange={onResultChange} />}
              {activeTab === 'crop' && <ImageCropper imgRef={imgRef} image={image} onResultChange={onResultChange} />}
              {activeTab === 'filters' && <SvgFilters imgRef={imgRef} image={image} onResultChange={onResultChange} />}
              {activeTab === 'b64' && <ImageToBase64 image={image} onResultChange={onResultChange} />}
          </div>
      )}
    </div>
  );
};

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
        <div className="card p-20 text-center">
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
        <div className="card p-20">
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
        <div className="card p-20 text-center">
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
        <div className="card p-20 text-center">
            <p className="opacity-6 smallest mb-15">This tool re-renders the image on a canvas, which removes sensitive metadata like GPS coordinates and camera info.</p>
            <button className="btn-primary w-full" onClick={clean}>Remove All Metadata</button>
        </div>
    );
};

const BlackWhiteFilter = ({ imgRef, image, onResultChange }) => {
    const apply = () => {
        const canvas = document.createElement('canvas');
        const img = imgRef.current;
        if (!img) return;
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        ctx.filter = 'grayscale(100%)';
        ctx.drawImage(img, 0, 0);
        canvas.toBlob(blob => {
            onResultChange({ text: 'Applied B&W Filter', blob, filename: 'bw.png' });
        });
    };
    return <button className="btn-primary w-full" onClick={apply}>Apply B&W Filter</button>;
};

const SepiaFilter = ({ imgRef, image, onResultChange }) => {
    const apply = () => {
        const canvas = document.createElement('canvas');
        const img = imgRef.current;
        if (!img) return;
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        ctx.filter = 'sepia(100%)';
        ctx.drawImage(img, 0, 0);
        canvas.toBlob(blob => {
            onResultChange({ text: 'Applied Sepia Filter', blob, filename: 'sepia.png' });
        });
    };
    return <button className="btn-primary w-full" onClick={apply}>Apply Sepia Filter</button>;
};

const ImageCropper = ({ imgRef, onResultChange }) => {
    const [crop, setCrop] = useState({ x: 10, y: 10, w: 80, h: 80 });
    const apply = () => {
        const canvas = document.createElement('canvas');
        const img = imgRef.current;
        if (!img) return;
        const x = (crop.x / 100) * img.naturalWidth;
        const y = (crop.y / 100) * img.naturalHeight;
        const w = (crop.w / 100) * img.naturalWidth;
        const h = (crop.h / 100) * img.naturalHeight;
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, x, y, w, h, 0, 0, w, h);
        canvas.toBlob(blob => {
            onResultChange({ text: 'Cropped Image', blob, filename: 'cropped.png' });
        });
    };
    return (
        <div className="card p-20 grid gap-10">
            <div className="grid grid-2-cols gap-10">
                {['x','y','w','h'].map(k => (
                    <div key={k} className="form-group">
                        <label>{k.toUpperCase()} (%)</label>
                        <input type="number" className="pill" value={crop[k]} onChange={e=>setCrop({...crop, [k]: Math.min(100, Math.max(0, parseInt(e.target.value)||0))})} />
                    </div>
                ))}
            </div>
            <button className="btn-primary w-full" onClick={apply}>Apply Crop</button>
        </div>
    );
};

const ImageToBase64 = ({ image, onResultChange }) => {
    const convert = () => {
        const reader = new FileReader();
        reader.onload = (e) => onResultChange({ text: e.target.result, filename: 'image_b64.txt' });
        reader.readAsDataURL(image);
    };
    return (
        <div className="card p-20 text-center">
            <p className="opacity-6 smallest mb-15">Convert image into a Base64 string for CSS or HTML embedding.</p>
            <button className="btn-primary w-full" onClick={convert}>Generate Base64</button>
        </div>
    );
};

const SvgFilters = ({ imgRef, onResultChange }) => {
    const [filter, setFilter] = useState('none');
    const apply = () => {
        const canvas = document.createElement('canvas');
        const img = imgRef.current;
        if (!img) return;
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (filter === 'posterize') ctx.filter = 'contrast(200%) brightness(150%) saturate(200%)';
        else if (filter === 'vintage') ctx.filter = 'sepia(50%) hue-rotate(-30deg) saturate(120%)';
        else if (filter === 'cold') ctx.filter = 'hue-rotate(180deg) saturate(80%)';
        else if (filter === 'dramatic') ctx.filter = 'contrast(150%) brightness(80%) saturate(120%)';
        ctx.drawImage(img, 0, 0);
        canvas.toBlob(blob => {
            onResultChange({ text: `Applied ${filter} filter`, blob, filename: `${filter}.png` });
        });
    };
    return (
        <div className="card p-20 grid gap-15">
            <div className="form-group">
                <label>Select Filter</label>
                <select className="pill" value={filter} onChange={e=>setFilter(e.target.value)}>
                    <option value="none">Normal</option>
                    <option value="posterize">Posterize</option>
                    <option value="vintage">Vintage</option>
                    <option value="cold">Cold</option>
                    <option value="dramatic">Dramatic</option>
                </select>
            </div>
            <button className="btn-primary w-full" onClick={apply}>Apply Filter</button>
        </div>
    );
};

const InvertFilter = ({ imgRef, image, onResultChange }) => {
    const apply = () => {
        const canvas = document.createElement('canvas');
        const img = imgRef.current;
        if (!img) return;
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        ctx.filter = 'invert(100%)';
        ctx.drawImage(img, 0, 0);
        canvas.toBlob(blob => {
            onResultChange({ text: 'Applied Invert Filter', blob, filename: 'invert.png' });
        });
    };
    return <button className="btn-primary w-full" onClick={apply} style={{ width: '100%' }}>Apply Invert Filter</button>;
};

export default ImageTools;
