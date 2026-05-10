import React, { useState, useEffect } from 'react';

const PerchanceAi = ({ onResultChange }) => {
  const [activeTab, setActiveTab] = useState('story');
  const [result, setResult] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [history, setHistory] = useState([]);
  const [batchCount, setBatchCount] = useState(1);
  const [loading, setLoading] = useState(false);

  const perchanceTools = [
    { id: 'ext-story', name: 'Official Story Gen', url: 'https://perchance.org/ai-story-generator' },
    { id: 'ext-image', name: 'Official Image Pro', url: 'https://perchance.org/image-generator-professional' },
    { id: 'ext-text', name: 'Official Text Gen', url: 'https://perchance.org/ai-text-generator' },
    { id: 'ext-rewrite', name: 'Official Rewriter', url: 'https://perchance.org/ai-text-rewriter' },
    { id: 'ext-necs', name: 'NECS Story', url: 'https://perchance.org/necs-story' }
  ];

  const generators = {
    story: {
      templates: [
        "In a [setting], a [adj] [hero] discovers a [adj] [object] that changes everything.",
        "The [hero] of [setting] must find the [object] before the [villain] uses it to [action].",
        "Legend says the [object] is hidden in the [setting], guarded by a [adj] [hero].",
        "A [hero] from [setting] travels to [setting] to find the legendary [object].",
        "When a [villain] steals the [object] from [setting], a [adj] [hero] must [action].",
        "The year is [year]. In the heart of [setting], [hero] is searching for [object].",
        "Nobody expected the [villain] to arrive at [setting], but [hero] was ready with [object]."
      ],
      setting: ["forbidden forest", "underwater city", "floating island", "forgotten desert", "cyberpunk metropolis", "ancient temple", "nebula station", "steampunk workshop", "crystal cave", "shadow realm", "volcanic forge", "ruined library"],
      hero: ["wanderer", "scholar", "rogue", "mechanic", "botanist", "knight", "alchemist", "pilot", "oracle", "exile", "commander", "bard"],
      villain: ["dark lord", "corrupt CEO", "shadow beast", "ancient spirit", "rogue AI", "fallen god", "chaos weaver", "tyrant king", "void herald", "phantom queen"],
      object: ["crystal heart", "sealed scroll", "quantum key", "ever-burning flame", "starlight shard", "dragon egg", "forgotten map", "mirror of truth", "obsidian blade", "golden fleece"],
      adj: ["mysterious", "glowing", "ancient", "fragile", "powerful", "radiant", "corrupted", "ethereal", "mechanical", "sacred", "forgotten", "forbidden"],
      action: ["destroy the world", "uncover the truth", "rule the kingdom", "mend a broken heart", "restore the balance", "awaken the ancients", "save the galaxy", "unlock the gate"],
      year: ["2049", "10,000 BC", "the end of time", "the dawn of magic", "3022"]
    },
    image: {
        styles: ["fantasy", "cyberpunk", "nature", "oil painting", "digital art", "sketch", "photorealistic", "low poly", "watercolor", "surrealist", "steampunk", "anime"],
        subjects: ["forest", "mountain", "robot", "warrior", "dragon", "spaceship", "ocean", "wizard", "cityscape", "galaxy", "creature", "artifact"]
    },
    npc: {
      names: ["Elowen", "Kaelen", "Thorne", "Lyra", "Zedd", "Aria", "Bastien", "Cora", "Dante", "Elara", "Finn", "Gideon", "Hera", "Igor", "Jace"],
      traits: ["cheerful", "suspicious", "clumsy", "wise", "rebellious", "stoic", "eccentric", "loyal", "ambitious", "haunted", "brave", "cunning"],
      jobs: ["herbalist", "blacksmith", "star-gazer", "map-maker", "courier", "innkeeper", "mercenary", "scavenger", "weaver", "guard", "spy", "priest"]
    },
    prompt: {
      styles: ["oil painting", "digital art", "sketch", "photorealistic", "low poly", "watercolor", "cyberpunk", "surrealist", "minimalist", "pixel art", "3D render"],
      themes: ["nature", "tech", "magic", "urban", "cosmic", "wasteland", "dreamscape", "underwater", "medieval", "futuristic", "apocalypse"],
      modifiers: ["soft lighting", "sharp focus", "vibrant colors", "eerie atmosphere", "cinematic", "high contrast", "golden hour", "dramatic shadows", "macro lens", "hyper-detailed"]
    }
  };

  const generateSingle = (type) => {
    const data = generators[type];
    if (!data) return "";

    if (type === 'story') {
      const template = data.templates[Math.floor(Math.random() * data.templates.length)];
      return template.replace(/\[(\w+)\]/g, (_, key) => {
        const list = data[key];
        return list[Math.floor(Math.random() * list.length)];
      });
    } else if (type === 'npc') {
      const name = data.names[Math.floor(Math.random() * data.names.length)];
      const trait = data.traits[Math.floor(Math.random() * data.traits.length)];
      const job = data.jobs[Math.floor(Math.random() * data.jobs.length)];
      return `${name}, the ${trait} ${job}.`;
    } else if (type === 'prompt' || type === 'image') {
      const style = data.styles[Math.floor(Math.random() * data.styles.length)];
      const theme = (data.themes || data.subjects)[Math.floor(Math.random() * (data.themes || data.subjects).length)];
      const mod = (data.modifiers ? data.modifiers[Math.floor(Math.random() * data.modifiers.length)] : "");
      return `${style} of ${theme}${mod ? ', ' + mod : ''}, high quality.`;
    }
    return "";
  };

  const handleGenerate = async () => {
    setLoading(true);
    setImageUrl('');
    if (activeTab === 'image') {
        const prompt = generateSingle('image');
        const encoded = encodeURIComponent(prompt);
        const url = `https://pollinations.ai/p/${encoded}?width=512&height=512&seed=${Math.floor(Math.random() * 1000000)}&nologo=true`;
        setImageUrl(url);
        setResult(prompt);
        setHistory(prev => [prompt, ...prev].slice(0, 10));
        onResultChange({ text: prompt, filename: 'ai_image_prompt.txt' });
        setLoading(false);
    } else {
        const newResults = [];
        for (let i = 0; i < batchCount; i++) {
            newResults.push(generateSingle(activeTab));
        }
        const finalResult = newResults.join('\n\n');
        setResult(finalResult);
        setHistory(prev => [finalResult, ...prev].slice(0, 10));
        onResultChange({ text: finalResult, filename: `${activeTab}_gen.txt` });
        setLoading(false);
    }
  };

  const isExternal = activeTab.startsWith('ext-');
  const externalTool = perchanceTools.find(t => t.id === activeTab);

  return (
    <div className="tool-form">
      <div className="pill-group mb-20 scrollable-x">
        {Object.keys(generators).map(tab => (
            <button key={tab} className={`pill ${activeTab === tab ? 'active' : ''}`} onClick={() => { setActiveTab(tab); setImageUrl(''); setResult(''); }}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
        ))}
        <div style={{ width: '1px', height: '20px', background: 'var(--border)', margin: '0 10px' }} />
        {perchanceTools.map(tool => (
            <button key={tool.id} className={`pill ${activeTab === tool.id ? 'active' : ''}`} onClick={() => setActiveTab(tool.id)}>
                {tool.name}
            </button>
        ))}
      </div>

      {isExternal ? (
          <div className="card p-0 overflow-hidden" style={{ height: '600px', border: 'none' }}>
              <iframe
                src={externalTool.url}
                title={externalTool.name}
                style={{ width: '100%', height: '100%', border: 'none' }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
              <div className="p-10 text-center">
                  <a href={externalTool.url} target="_blank" rel="noopener noreferrer" className="btn-small">
                      <span className="material-icons">open_in_new</span> Open in New Tab
                  </a>
              </div>
          </div>
      ) : (
          <>
            <div className="flex-gap mb-20">
                {activeTab !== 'image' && (
                    <div className="flex-1">
                        <label style={{ fontSize: '0.8rem', opacity: 0.6, display: 'block', marginBottom: '5px' }}>Batch Size</label>
                        <input type="number" min="1" max="10" value={batchCount} onChange={e => setBatchCount(+e.target.value)} className="pill w-full" />
                    </div>
                )}
                <button className="btn-primary flex-1" style={{ marginTop: 'auto' }} onClick={handleGenerate} disabled={loading}>
                  {loading ? 'Generating...' : (activeTab === 'image' ? 'Generate Image' : 'Generate')}
                </button>
            </div>

            <div className="card p-20" style={{ minHeight: '120px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', whiteSpace: 'pre-wrap' }}>
              {imageUrl ? (
                  <div style={{ width: '100%', textAlign: 'center' }}>
                      <img src={imageUrl} alt="AI Generated" style={{ maxWidth: '100%', borderRadius: '16px', boxShadow: 'var(--shadow-md)', marginBottom: '15px' }} />
                      <div style={{ fontSize: '0.9rem', opacity: 0.7 }}>{result}</div>
                  </div>
              ) : result ? (
                <div style={{ fontSize: '1.1rem', fontWeight: 600, width: '100%', textAlign: 'center' }}>{result}</div>
              ) : (
                <div className="opacity-5">Choose a category and click generate</div>
              )}
            </div>

            {history.length > 0 && (
                <div className="mt-20">
                    <h4 className="mb-10 opacity-6 uppercase tracking-wider" style={{ fontSize: '0.75rem' }}>Recent History</h4>
                    <div className="grid gap-10">
                        {history.map((h, i) => (
                            <div key={i} className="tool-result" style={{ margin: 0, padding: '10px', fontSize: '0.85rem', cursor: 'pointer' }} onClick={() => { setResult(h); setImageUrl(''); }}>
                                {h.length > 60 ? h.substring(0, 60) + '...' : h}
                            </div>
                        ))}
                    </div>
                </div>
            )}
          </>
      )}

      <div style={{ fontSize: '0.75rem', opacity: 0.5, marginTop: '20px', textAlign: 'center' }}>
        Nature-powered AI generation via Pollinations.ai & official Perchance.org integrations
      </div>
    </div>
  );
};

export default PerchanceAi;
