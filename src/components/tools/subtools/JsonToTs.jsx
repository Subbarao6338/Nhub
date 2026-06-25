import React, { useState } from 'react';
import ToolResult from '../ToolResult';

const JsonToTs = () => {
    const [input, setInput] = useState('');
    const [interfaceName, setInterfaceName] = useState('RootObject');
    const [result, setResult] = useState(null);

    const convert = () => {
        if (!input.trim()) return;
        try {
            const obj = JSON.parse(input);
            const interfaces = new Map();

            const getTypeName = (val, key) => {
                const type = typeof val;
                if (val === null) return 'any';
                if (type === 'string') return 'string';
                if (type === 'number') return 'number';
                if (type === 'boolean') return 'boolean';
                if (Array.isArray(val)) {
                    if (val.length === 0) return 'any[]';
                    const subType = getTypeName(val[0], key);
                    return `${subType}[]`;
                }
                if (type === 'object') {
                    const subName = key.charAt(0).toUpperCase() + key.slice(1);
                    generateInterface(val, subName);
                    return subName;
                }
                return 'any';
            };

            const generateInterface = (o, name) => {
                if (interfaces.has(name)) return;
                let str = `interface ${name} {\n`;
                Object.entries(o).forEach(([k, v]) => {
                    const type = getTypeName(v, k);
                    str += `  ${k}: ${type};\n`;
                });
                str += '}\n';
                interfaces.set(name, str);
            };

            generateInterface(obj, interfaceName);

            let finalTs = '';
            Array.from(interfaces.values()).reverse().forEach(inter => {
                finalTs += inter + '\n';
            });

            setResult({ text: finalTs.trim(), filename: 'types.ts' });
        } catch (e) {
            setResult({ error: 'Invalid JSON: ' + e.message });
        }
    };

    return (
        <div className="grid gap-15">
            <div className="form-group">
                <label className="smallest opacity-6 uppercase ml-10">Interface Name</label>
                <input className="pill w-full mb-10" value={interfaceName} onChange={e=>setInterfaceName(e.target.value)} placeholder="RootObject" />
            </div>
            <textarea className="pill w-full font-mono text-sm" rows="10" style={{borderRadius: '16px', padding: '15px'}} placeholder="Paste JSON here..." value={input} onChange={e=>setInput(e.target.value)} />
            <button className="btn-primary w-full" onClick={convert}>
                <span className="material-icons mr-10">code</span>
                Generate TypeScript Interfaces
            </button>
            <ToolResult result={result} />
        </div>
    );
};

export default JsonToTs;
