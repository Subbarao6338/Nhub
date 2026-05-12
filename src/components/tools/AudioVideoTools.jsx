import React, { useState, useEffect, useRef } from 'react';

const AudioVideoTools = ({ toolId, onResultChange, onSubtoolChange }) => {
  const tabs = [
    { id: 'frequency', label: 'Frequency Gen' },
    { id: 'metronome', label: 'Metronome' },
    { id: 'tuner', label: 'Tuner' },
    { id: 'nature-sounds', label: 'Nature Sounds' },
    { id: 'recorder', label: 'Voice Recorder' }
  ].sort((a, b) => a.label.localeCompare(b.label));

  const [activeTab, setActiveTab] = useState('frequency');

  useEffect(() => {
    const current = tabs.find(t => t.id === activeTab);
    if (current && onSubtoolChange) onSubtoolChange(current.label);
  }, [activeTab]);

  useEffect(() => {
    if (toolId) {
      const mapping = {
        'frequency-gen': 'frequency',
        'metronome': 'metronome',
        'tuner': 'tuner',
        'nature-sounds': 'nature-sounds',
        'audio-recorder': 'recorder'
      };
      if (mapping[toolId]) setActiveTab(mapping[toolId]); else if (tabs.length > 0) setActiveTab(tabs[0].id);
    }
  }, [toolId]);

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

      {activeTab === 'frequency' && <FrequencyGenerator />}
      {activeTab === 'metronome' && <MetronomeTool />}
      {activeTab === 'tuner' && <InstrumentTuner />}
      {activeTab === 'nature-sounds' && <NatureSoundsTool />}
      {activeTab === 'recorder' && <VoiceRecorder onResultChange={onResultChange} />}
    </div>
  );
};

const FrequencyGenerator = () => {
    const [freq, setFreq] = useState(440);
    const [type, setType] = useState('sine');
    const [playing, setPlaying] = useState(false);
    const audioCtxRef = useRef(null);
    const oscRef = useRef(null);
    const gainRef = useRef(null);

    const toggle = () => {
        if (playing) {
            oscRef.current.stop();
            setPlaying(false);
        } else {
            if (!audioCtxRef.current) {
                audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
            }
            oscRef.current = audioCtxRef.current.createOscillator();
            gainRef.current = audioCtxRef.current.createGain();
            oscRef.current.type = type;
            oscRef.current.frequency.setValueAtTime(freq, audioCtxRef.current.currentTime);
            gainRef.current.gain.setValueAtTime(0.1, audioCtxRef.current.currentTime);
            oscRef.current.connect(gainRef.current);
            gainRef.current.connect(audioCtxRef.current.destination);
            oscRef.current.start();
            setPlaying(true);
        }
    };

    useEffect(() => {
        if (playing && oscRef.current) {
            oscRef.current.frequency.setTargetAtTime(freq, audioCtxRef.current.currentTime, 0.05);
        }
    }, [freq, playing]);

    useEffect(() => {
        if (playing && oscRef.current) {
            oscRef.current.type = type;
        }
    }, [type, playing]);

    useEffect(() => () => {
        if (oscRef.current) try { oscRef.current.stop(); } catch(e) {}
    }, []);

    return (
        <div className="text-center p-20 card">
            <div className="font-bold mb-10 uppercase tracking-wider opacity-6" style={{fontSize: '0.8rem'}}>Frequency</div>
            <div style={{ fontSize: '4rem', fontWeight: '800', color: 'var(--primary)', marginBottom: '20px' }}>{freq}<span style={{fontSize: '1.5rem'}}>Hz</span></div>
            <input type="range" min="20" max="2000" step="1" value={freq} onChange={(e) => setFreq(parseInt(e.target.value))} className="w-full mb-20" style={{accentColor: 'var(--primary)'}} />
            <div className="pill-group mb-20 scrollable-x">
                {['sine', 'square', 'sawtooth', 'triangle'].map(t => (
                    <button key={t} className={`pill ${type === t ? 'active' : ''}`} onClick={() => setType(t)} style={{ textTransform: 'capitalize' }}>{t}</button>
                ))}
            </div>
            <button className={`btn-primary w-full ${playing ? 'danger' : ''}`} onClick={toggle} style={{background: playing ? 'var(--danger)' : ''}}>
                <span className="material-icons mr-10">{playing ? 'stop' : 'play_arrow'}</span>
                {playing ? 'Stop Tone' : 'Start Tone'}
            </button>
        </div>
    );
};

const MetronomeTool = () => {
  const [bpm, setBpm] = useState(120);
  const [playing, setPlaying] = useState(false);
  const audioCtxRef = useRef(null);
  const timerRef = useRef(null);

  const playClick = () => {
    if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtxRef.current.createOscillator();
    const envelope = audioCtxRef.current.createGain();
    osc.frequency.value = 880;
    envelope.gain.value = 1;
    envelope.gain.exponentialRampToValueAtTime(0.001, audioCtxRef.current.currentTime + 0.05);
    osc.connect(envelope);
    envelope.connect(audioCtxRef.current.destination);
    osc.start();
    osc.stop(audioCtxRef.current.currentTime + 0.05);
  };

  const toggle = () => {
    if (playing) {
      clearInterval(timerRef.current);
      setPlaying(false);
    } else {
      setPlaying(true);
      timerRef.current = setInterval(playClick, (60 / bpm) * 1000);
    }
  };

  useEffect(() => {
    if (playing) {
      clearInterval(timerRef.current);
      timerRef.current = setInterval(playClick, (60 / bpm) * 1000);
    }
  }, [bpm]);

  useEffect(() => () => clearInterval(timerRef.current), []);

  return (
    <div className="text-center p-20 card">
        <div className="font-bold mb-10 uppercase tracking-wider opacity-6" style={{fontSize: '0.8rem'}}>Tempo</div>
        <div style={{ fontSize: '4rem', fontWeight: '800', color: 'var(--primary)', marginBottom: '20px' }}>{bpm}<span style={{fontSize: '1.5rem'}}>BPM</span></div>
        <input type="range" min="40" max="240" value={bpm} onChange={(e) => setBpm(parseInt(e.target.value))} className="w-full mb-20" style={{accentColor: 'var(--primary)'}} />
        <button className="btn-primary w-full" onClick={toggle} style={{background: playing ? 'var(--danger)' : ''}}>
            <span className="material-icons mr-10">{playing ? 'pause' : 'play_arrow'}</span>
            {playing ? 'Stop' : 'Start'}
        </button>
    </div>
  );
};

const noteStrings = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

const autoCorrelate = (buf, sampleRate) => {
    let SIZE = buf.length;
    let rms = 0;
    for (let i = 0; i < SIZE; i++) {
        let val = buf[i];
        rms += val * val;
    }
    rms = Math.sqrt(rms / SIZE);
    if (rms < 0.01) return -1;
    let r1 = 0, r2 = SIZE - 1, thres = 0.2;
    for (let i = 0; i < SIZE / 2; i++) if (Math.abs(buf[i]) < thres) { r1 = i; break; }
    for (let i = 1; i < SIZE / 2; i++) if (Math.abs(buf[SIZE - i]) < thres) { r2 = SIZE - i; break; }
    buf = buf.slice(r1, r2);
    SIZE = buf.length;
    let c = new Array(SIZE).fill(0);
    for (let i = 0; i < SIZE; i++)
        for (let j = 0; j < SIZE - i; j++)
            c[i] = c[i] + buf[j] * buf[j + i];
    let d = 0; while (c[d] > c[d + 1]) d++;
    let maxval = -1, maxpos = -1;
    for (let i = d; i < SIZE; i++) {
        if (c[i] > maxval) {
            maxval = c[i];
            maxpos = i;
        }
    }
    let T0 = maxpos;
    let x1 = c[T0 - 1], x2 = c[T0], x3 = c[T0 + 1];
    let a = (x1 + x3 - 2 * x2) / 2;
    let b = (x3 - x1) / 2;
    if (a) T0 = T0 - b / (2 * a);
    return sampleRate / T0;
};

const InstrumentTuner = () => {
    const [note, setNote] = useState('-');
    const [frequency, setFrequency] = useState(0);
    const [cents, setCents] = useState(0);
    const [active, setActive] = useState(false);
    const audioCtxRef = useRef(null);
    const streamRef = useRef(null);
    const rafRef = useRef(null);
    const noteFromPitch = (frequency) => {
        const noteNum = 12 * (Math.log(frequency / 440) / Math.log(2));
        return Math.round(noteNum) + 69;
    };
    const centsOffFromPitch = (frequency, note) => {
        return Math.floor(1200 * Math.log(frequency / (440 * Math.pow(2, (note - 69) / 12))) / Math.log(2));
    };
    const start = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;
            audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
            const source = audioCtxRef.current.createMediaStreamSource(stream);
            const analyser = audioCtxRef.current.createAnalyser();
            analyser.fftSize = 2048;
            source.connect(analyser);
            setActive(true);
            const dataArray = new Float32Array(analyser.fftSize);
            const update = () => {
                analyser.getFloatTimeDomainData(dataArray);
                const ac = autoCorrelate(dataArray, audioCtxRef.current.sampleRate);
                if (ac !== -1) {
                    setFrequency(Math.round(ac));
                    const n = noteFromPitch(ac);
                    setNote(noteStrings[n % 12]);
                    setCents(centsOffFromPitch(ac, n));
                }
                rafRef.current = requestAnimationFrame(update);
            };
            update();
        } catch (err) { alert("Microphone access required for tuner."); }
    };
    const stop = () => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
        setActive(false);
    };
    useEffect(() => () => stop(), []);
    return (
        <div className="text-center card p-20">
            <div className="m-auto flex-center flex-column" style={{ width: '200px', height: '200px', borderRadius: '50%', border: '8px solid var(--bg-dark)', position: 'relative', overflow: 'hidden' }}>
                <div className="opacity-4 uppercase font-bold" style={{fontSize: '0.7rem'}}>Note</div>
                <div style={{ fontSize: '5rem', fontWeight: '900', color: 'var(--primary)', lineHeight: 1 }}>{note}</div>
                <div className="font-mono" style={{ fontSize: '1.2rem', marginTop: '5px' }}>{frequency} <span className="opacity-5" style={{fontSize: '0.8rem'}}>Hz</span></div>
                {active && (
                    <div style={{ position: 'absolute', bottom: '20px', width: '80%', height: '4px', background: 'var(--bg-dark)', borderRadius: '2px' }}>
                        <div style={{ position: 'absolute', left: '50%', top: '-5px', width: '2px', height: '14px', background: 'var(--text)', zIndex: 2 }} />
                        <div style={{ position: 'absolute', left: `${50 + (cents / 50) * 50}%`, top: '-3px', width: '10px', height: '10px', background: Math.abs(cents) < 5 ? 'var(--primary)' : 'var(--danger)', borderRadius: '50%', transform: 'translateX(-50%)', transition: 'left 0.1s ease-out' }} />
                    </div>
                )}
            </div>
            <div className="mt-10 opacity-6" style={{fontSize: '0.9rem'}}>
                {active ? (Math.abs(cents) < 5 ? 'Perfectly in tune!' : `${Math.abs(cents)} cents ${cents > 0 ? 'sharp' : 'flat'}`) : 'Ready to tune'}
            </div>
            <button className="btn-primary w-full mt-20" onClick={active ? stop : start} style={{background: active ? 'var(--danger)' : ''}}>
                <span className="material-icons mr-10">{active ? 'mic_off' : 'mic'}</span>
                {active ? 'Stop Tuner' : 'Start Tuner'}
            </button>
        </div>
    );
};

const VoiceRecorder = ({ onResultChange }) => {
    const [recording, setRecording] = useState(false);
    const [audioUrl, setAudioUrl] = useState(null);
    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);

    const start = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            mediaRecorderRef.current.ondataavailable = (e) => chunksRef.current.push(e.data);
        mediaRecorderRef.current.onstop = () => {
            const blob = new Blob(chunksRef.current, { type: 'audio/ogg; codecs=opus' });
            const url = URL.createObjectURL(blob);
            setAudioUrl(url);
            onResultChange({ text: 'Voice Recording', blob, filename: 'recording.ogg' });
            chunksRef.current = [];
        };
            mediaRecorderRef.current.start();
            setRecording(true);
        } catch (err) {
            alert("Microphone access denied or not available.");
        }
    };

    const stop = () => {
        mediaRecorderRef.current.stop();
        setRecording(false);
    };

    return (
        <div className="card p-20 text-center">
            <div className="mb-20">
                <span className="material-icons" style={{ fontSize: '4rem', color: recording ? 'var(--danger)' : 'var(--primary)' }}>
                    {recording ? 'mic' : 'mic_none'}
                </span>
            </div>
            {audioUrl && <audio src={audioUrl} controls className="w-full mb-20" />}
            <button className={`btn-primary w-full ${recording ? 'danger' : ''}`} onClick={recording ? stop : start}>
                {recording ? 'Stop Recording' : 'Start Recording'}
            </button>
        </div>
    );
};

const NatureSoundsTool = () => {
    const sounds = [
        { id: 'rain', name: 'Rainfall', icon: 'umbrella', color: '#60a5fa' },
        { id: 'forest', name: 'Forest', icon: 'park', color: '#4ade80' },
        { id: 'waves', name: 'Ocean Waves', icon: 'tsunami', color: '#2dd4bf' },
        { id: 'birds', name: 'Birdsong', icon: 'flutter_dash', color: '#fbbf24' },
        { id: 'wind', name: 'Gentle Wind', icon: 'air', color: '#94a3b8' },
        { id: 'fire', name: 'Crackling Fire', icon: 'local_fire_department', color: '#f87171' }
    ];
    const [playing, setPlaying] = useState(null);
    const audioRef = useRef(new Audio());
    const toggleSound = (id) => {
        if (playing === id) {
            audioRef.current.pause();
            setPlaying(null);
        } else {
            setPlaying(id);
            audioRef.current.src = `https://assets.mixkit.co/sfx/preview/mixkit-${id}-ambience-preview.mp3`; // Fallback placeholder
            audioRef.current.loop = true;
            audioRef.current.play().catch(e => {
                alert("Audio preview not available for this sample.");
                setPlaying(null);
            });
        }
    };
    useEffect(() => () => audioRef.current.pause(), []);
    return (
        <div className="grid grid-2 gap-10">
            {sounds.map(s => (
                <div key={s.id} className={`card p-15 text-center cursor-pointer transition-all ${playing === s.id ? 'active shadow-lg scale-105' : 'opacity-8'}`} onClick={() => toggleSound(s.id)} style={{ border: playing === s.id ? `2px solid ${s.color}` : '1px solid var(--border)' }}>
                    <span className="material-icons" style={{ fontSize: '2.5rem', color: s.color }}>{s.icon}</span>
                    <div className="font-semibold mt-10">{s.name}</div>
                    {playing === s.id && <div className="mt-5"><span className="material-icons rotating" style={{ fontSize: '1rem', color: s.color }}>refresh</span></div>}
                </div>
            ))}
        </div>
    );
};

export default AudioVideoTools;
