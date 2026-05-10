import React, { useState } from 'react';

const PerchanceAi = ({ onResultChange }) => {
  const [activeTab, setActiveTab] = useState('story');
  const [result, setResult] = useState('');

  const generators = {
    story: {
      templates: [
        "In a [setting], a [adj] [hero] discovers a [adj] [object] that changes everything.",
        "The [hero] of [setting] must find the [object] before the [villain] uses it to [action].",
        "Legend says the [object] is hidden in the [setting], guarded by a [adj] [hero]."
      ],
      setting: ["forbidden forest", "underwater city", "floating island", "forgotten desert", "cyberpunk metropolis"],
      hero: ["wanderer", "scholar", "rogue", "mechanic", "botanist"],
      villain: ["dark lord", "corrupt CEO", "shadow beast", "ancient spirit"],
      object: ["crystal heart", "sealed scroll", "quantum key", "ever-burning flame"],
      adj: ["mysterious", "glowing", "ancient", "fragile", "powerful"],
      action: ["destroy the world", "uncover the truth", "rule the kingdom", "mend a broken heart"]
    },
    npc: {
      names: ["Elowen", "Kaelen", "Thorne", "Lyra", "Zedd"],
      traits: ["cheerful", "suspicious", "clumsy", "wise", "rebellious"],
      jobs: ["herbalist", "blacksmith", "star-gazer", "map-maker", "courier"]
    },
    prompt: {
      styles: ["oil painting", "digital art", "sketch", "photorealistic", "low poly"],
      themes: ["nature", "tech", "magic", "urban", "cosmic"],
      modifiers: ["soft lighting", "sharp focus", "vibrant colors", "eerie atmosphere"]
    },
    name: {
      prefixes: ["Astra", "Moon", "Sun", "Leaf", "Cloud", "Storm"],
      suffixes: ["walker", "beam", "glow", "shade", "weaver", "born"]
    }
  };

  const generate = (type) => {
    const data = generators[type];
    let res = "";

    if (type === 'story') {
      const template = data.templates[Math.floor(Math.random() * data.templates.length)];
      res = template.replace(/\[(\w+)\]/g, (_, key) => {
        const list = data[key];
        return list[Math.floor(Math.random() * list.length)];
      });
    } else if (type === 'npc') {
      const name = data.names[Math.floor(Math.random() * data.names.length)];
      const trait = data.traits[Math.floor(Math.random() * data.traits.length)];
      const job = data.jobs[Math.floor(Math.random() * data.jobs.length)];
      res = `${name}, the ${trait} ${job}.`;
    } else if (type === 'prompt') {
      const style = data.styles[Math.floor(Math.random() * data.styles.length)];
      const theme = data.themes[Math.floor(Math.random() * data.themes.length)];
      const mod = data.modifiers[Math.floor(Math.random() * data.modifiers.length)];
      res = `${style} of ${theme}, ${mod}, high quality.`;
    } else if (type === 'name') {
      const pre = data.prefixes[Math.floor(Math.random() * data.prefixes.length)];
      const suf = data.suffixes[Math.floor(Math.random() * data.suffixes.length)];
      res = `${pre}${suf}`;
    }

    setResult(res);
    onResultChange({ text: res, filename: `${type}_gen.txt` });
  };

  return (
    <div className="tool-form">
      <div className="pill-group mb-20 scrollable-x">
        <button className={`pill ${activeTab === 'story' ? 'active' : ''}`} onClick={() => setActiveTab('story')}>Story</button>
        <button className={`pill ${activeTab === 'npc' ? 'active' : ''}`} onClick={() => setActiveTab('npc')}>NPC</button>
        <button className={`pill ${activeTab === 'prompt' ? 'active' : ''}`} onClick={() => setActiveTab('prompt')}>Prompt</button>
        <button className={`pill ${activeTab === 'name' ? 'active' : ''}`} onClick={() => setActiveTab('name')}>Name</button>
      </div>

      <div className="card text-center p-20" style={{ minHeight: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {result ? (
          <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>{result}</div>
        ) : (
          <div className="opacity-5">Click generate to start</div>
        )}
      </div>

      <button className="btn-primary w-full mt-20" onClick={() => generate(activeTab)}>
        Generate Random {activeTab.toUpperCase()}
      </button>

      <div style={{ fontSize: '0.75rem', opacity: 0.5, marginTop: '15px', textAlign: 'center' }}>
        Nature-powered randomized logic (Perchance style)
      </div>
    </div>
  );
};

export default PerchanceAi;
