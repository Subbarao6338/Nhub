import React, { useState, useEffect, useRef } from 'react';

const ColorTools = ({ toolId, onSubtoolChange }) => {
  const [activeTab, setActiveTab] = useState('picker');
  const [color, setColor] = useState('#3b82f6');

  useEffect(() => {
    const labels = { 'picker': 'Color Picker', 'converter': 'Converter', 'harmonies': 'Harmonies', 'blender': 'Blender', 'contrast': 'Contrast Checker' };
    if (onSubtoolChange) onSubtoolChange(labels[activeTab]);
  }, [activeTab]);

  useEffect(() => {
    if (toolId) {
        if (toolId === 'img-color' || toolId === 'cam-color' || toolId === 'color-picker') setActiveTab('picker');
        else if (toolId === 'color-conv') setActiveTab('converter');
        else if (toolId === 'color-harm' || toolId === 'tints-shades') setActiveTab('harmonies');
        else if (toolId === 'color-blend') setActiveTab('blender');
        else if (toolId === 'color-contrast') setActiveTab('contrast');
        else setActiveTab(toolId);
    }
  }, [toolId]);

  const isDeepLinked = !!toolId;

  return (
    <div className="tool-form">
      {!isDeepLinked && (
        <div className="pill-group mb-20 scrollable-x">
          <button className={`pill ${activeTab === 'picker' ? 'active' : ''}`} onClick={() => setActiveTab('picker')}>Picker</button>
          <button className={`pill ${activeTab === 'converter' ? 'active' : ''}`} onClick={() => setActiveTab('converter')}>Converter</button>
          <button className={`pill ${activeTab === 'harmonies' ? 'active' : ''}`} onClick={() => setActiveTab('harmonies')}>Harmonies</button>
          <button className={`pill ${activeTab === 'blender' ? 'active' : ''}`} onClick={() => setActiveTab('blender')}>Blender</button>
          <button className={`pill ${activeTab === 'contrast' ? 'active' : ''}`} onClick={() => setActiveTab('contrast')}>Contrast</button>
        </div>
      )}

      <div className="card p-20 mb-20 text-center glass-card">
          <div className="flex-center flex-column gap-15">
              <input type="color" value={color} onChange={e => setColor(e.target.value)} style={{ width: '120px', height: '120px', borderRadius: 'var(--radius-xl)', border: '4px solid var(--border)', cursor: 'pointer', padding: '0', background: 'none' }} />
              <div className="font-mono font-bold" style={{ fontSize: '1.5rem', letterSpacing: '0.05em' }}>{color.toUpperCase()}</div>
          </div>
      </div>

      {activeTab === 'picker' && <ImageColorPicker setColor={setColor} />}
      {activeTab === 'converter' && <ColorConverter color={color} />}
      {activeTab === 'harmonies' && <ColorHarmonies color={color} />}
      {activeTab === 'blender' && <ColorBlender colorA={color} />}
      {activeTab === 'contrast' && <ContrastChecker color={color} />}
    </div>
  );
};

const ImageColorPicker = ({ setColor }) => {
    const canvasRef = useRef(null);
    const [hasImage, setHasImage] = useState(false);

    const handleUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = canvasRef.current;
                    const ctx = canvas.getContext('2d');
                    const maxW = 800;
                    const scale = img.width > maxW ? maxW / img.width : 1;
                    canvas.width = img.width * scale;
                    canvas.height = img.height * scale;
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    setHasImage(true);
                };
                img.src = ev.target.result;
            };
            reader.readAsDataURL(file);
        }
    };

    const pickColor = (e) => {
        const rect = canvasRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) * (canvasRef.current.width / rect.width);
        const y = (e.clientY - rect.top) * (canvasRef.current.height / rect.height);
        const ctx = canvasRef.current.getContext('2d');
        const [r, g, b] = ctx.getImageData(x, y, 1, 1).data;
        const hex = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
        setColor(hex);
    };

    return (
        <div className="grid gap-15 text-center">
            <div className="form-group">
                <input type="file" id="color-img-upload" onChange={handleUpload} accept="image/*" style={{display: 'none'}} />
                <label htmlFor="color-img-upload" className="btn-primary">
                    <span className="material-icons">colorize</span> Pick from Image
                </label>
            </div>
            {hasImage && (
                <div className="card p-10 glass-card" style={{ maxWidth: '100%', overflow: 'hidden' }}>
                    <canvas ref={canvasRef} onClick={pickColor} style={{ maxWidth: '100%', cursor: 'crosshair', borderRadius: '12px', display: 'block' }}></canvas>
                    <p className="smallest opacity-5 mt-10">Click anywhere on the image to pick a color.</p>
                </div>
            )}
        </div>
    );
};

const ColorConverter = ({ color }) => {
    const hexToRgb = (hex) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return { r, g, b };
    };

    const hexToHsl = (hex) => {
        let { r, g, b } = hexToRgb(hex);
        r /= 255; g /= 255; b /= 255;
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
        if (max === min) { h = s = 0; }
        else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
    };

    const rgb = hexToRgb(color);
    const hsl = hexToHsl(color);

    return (
        <div className="grid grid-3 gap-10">
            <div className="card p-15 text-center">
                <div className="opacity-6 smallest uppercase font-bold mb-5">HEX</div>
                <div className="font-mono">{color.toUpperCase()}</div>
            </div>
            <div className="card p-15 text-center">
                <div className="opacity-6 smallest uppercase font-bold mb-5">RGB</div>
                <div className="font-mono">{rgb.r}, {rgb.g}, {rgb.b}</div>
            </div>
            <div className="card p-15 text-center">
                <div className="opacity-6 smallest uppercase font-bold mb-5">HSL</div>
                <div className="font-mono">{hsl.h}°, {hsl.s}%, {hsl.l}%</div>
            </div>
        </div>
    );
};

const ColorHarmonies = ({ color }) => {
    const getComp = (hex) => {
        const r = (255 - parseInt(hex.slice(1, 3), 16)).toString(16).padStart(2, '0');
        const g = (255 - parseInt(hex.slice(3, 5), 16)).toString(16).padStart(2, '0');
        const b = (255 - parseInt(hex.slice(5, 7), 16)).toString(16).padStart(2, '0');
        return `#${r}${g}${b}`;
    };
    const comp = getComp(color);

    return (
        <div className="grid grid-2 gap-15">
            <div className="card p-20 text-center">
                <div className="mb-10" style={{ height: '80px', background: color, borderRadius: 'var(--radius-lg)' }} />
                <div className="font-bold">Base Color</div>
                <div className="opacity-6 font-mono">{color.toUpperCase()}</div>
            </div>
            <div className="card p-20 text-center">
                <div className="mb-10" style={{ height: '80px', background: comp, borderRadius: 'var(--radius-lg)' }} />
                <div className="font-bold">Complementary</div>
                <div className="opacity-6 font-mono">{comp.toUpperCase()}</div>
            </div>
        </div>
    );
};

const ContrastChecker = ({ color }) => {
    const [bg, setBg] = useState('#ffffff');
    const getContrast = (hex1, hex2) => {
        const lum = (h) => {
            const r = parseInt(h.slice(1,3),16)/255, g = parseInt(h.slice(3,5),16)/255, b = parseInt(h.slice(5,7),16)/255;
            const a = [r,g,b].map(v => v <= 0.03928 ? v/12.92 : Math.pow((v+0.055)/1.055, 2.4));
            return a[0]*0.2126 + a[1]*0.7152 + a[2]*0.0722;
        };
        const l1 = lum(hex1), l2 = lum(hex2);
        return (Math.max(l1,l2)+0.05) / (Math.min(l1,l2)+0.05);
    };
    const ratio = getContrast(color, bg);
    const passesAA = ratio >= 4.5;
    const passesAAA = ratio >= 7;

    return (
        <div className="card p-20 text-center">
            <div className="form-group mb-20">
                <label>Background Color</label>
                <input type="color" value={bg} onChange={e=>setBg(e.target.value)} className="pill" style={{ height: '50px', padding: '5px' }} />
            </div>
            <div className="mb-20" style={{ background: bg, color: color, padding: '30px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>Sample Text</div>
                <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>Nature design contrast test.</div>
            </div>
            <div className="grid grid-3 gap-10">
                <div className="card p-10">
                    <div className="opacity-6 smallest">Ratio</div>
                    <div className="font-bold">{ratio.toFixed(2)}:1</div>
                </div>
                <div className="card p-10" style={{ background: passesAA ? 'var(--nature-moss)' : 'var(--danger)', color: 'white' }}>
                    <div className="smallest">WCAG AA</div>
                    <div className="font-bold">{passesAA ? 'PASS' : 'FAIL'}</div>
                </div>
                <div className="card p-10" style={{ background: passesAAA ? 'var(--nature-moss)' : 'var(--danger)', color: 'white' }}>
                    <div className="smallest">WCAG AAA</div>
                    <div className="font-bold">{passesAAA ? 'PASS' : 'FAIL'}</div>
                </div>
            </div>
        </div>
    );
};

const ColorBlender = ({ colorA }) => {
    const [colorB, setColorB] = useState('#ffffff');
    const [steps, setSteps] = useState(5);

    const blend = (c1, c2, weight) => {
        const r1 = parseInt(c1.slice(1, 3), 16);
        const g1 = parseInt(c1.slice(3, 5), 16);
        const b1 = parseInt(c1.slice(5, 7), 16);
        const r2 = parseInt(c2.slice(1, 3), 16);
        const g2 = parseInt(c2.slice(3, 5), 16);
        const b2 = parseInt(c2.slice(5, 7), 16);
        const r = Math.round(r1 * (1 - weight) + r2 * weight).toString(16).padStart(2, '0');
        const g = Math.round(g1 * (1 - weight) + g2 * weight).toString(16).padStart(2, '0');
        const b = Math.round(b1 * (1 - weight) + b2 * weight).toString(16).padStart(2, '0');
        return `#${r}${g}${b}`;
    };

    const palette = [];
    for (let i = 0; i <= steps; i++) {
        palette.push(blend(colorA, colorB, i / steps));
    }

    return (
        <div className="card p-20 text-center">
            <div className="form-group mb-20">
                <label>Blend with Color</label>
                <input type="color" value={colorB} onChange={e => setColorB(e.target.value)} className="pill" style={{ height: '50px', padding: '5px' }} />
            </div>
            <div className="flex-center gap-5 flex-wrap mb-10">
                {palette.map((c, i) => (
                    <div key={i} className="flex-column gap-5">
                        <div style={{ width: '50px', height: '50px', background: c, borderRadius: '8px', border: '1px solid var(--border)' }} />
                        <div className="smallest font-mono" style={{ fontSize: '0.6rem' }}>{Math.round((i/steps)*100)}%</div>
                    </div>
                ))}
            </div>
            <div className="opacity-6 smallest">Smooth transition from Base to Target color.</div>
        </div>
    );
};

export default ColorTools;
