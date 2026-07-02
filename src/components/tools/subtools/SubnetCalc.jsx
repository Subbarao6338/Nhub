import React, { useState } from 'react';
import ToolResult from '../ToolResult';

const SubnetCalc = () => {
    const [ip, setIp] = useState('192.168.1.1');
    const [mask, setMask] = useState(24);
    const [result, setResult] = useState(null);

    const calculate = () => {
        try {
            const ipParts = ip.split('.').map(Number);
            if (ipParts.length !== 4 || ipParts.some(p => p < 0 || p > 255)) throw new Error('Invalid IP');

            const fullMask = 0xFFFFFFFF << (32 - mask);
            const netParts = [
                (ipParts[0] & (fullMask >>> 24)) >>> 0,
                (ipParts[1] & (fullMask >>> 16 & 0xFF)) >>> 0,
                (ipParts[2] & (fullMask >>> 8 & 0xFF)) >>> 0,
                (ipParts[3] & (fullMask & 0xFF)) >>> 0
            ];

            const network = netParts.join('.');
            const broadcastParts = netParts.map((p, i) => p | (~(fullMask >>> (24 - i * 8)) & 0xFF));
            const broadcast = broadcastParts.join('.');
            const hosts = Math.pow(2, 32 - mask) - 2;

            const firstHost = [...netParts];
            firstHost[3] += 1;
            const lastHost = [...broadcastParts];
            lastHost[3] -= 1;

            const dottedMask = [
                (fullMask >>> 24) & 0xFF,
                (fullMask >>> 16) & 0xFF,
                (fullMask >>> 8) & 0xFF,
                fullMask & 0xFF
            ].join('.');

            setResult({
                text: `Network: ${network}\n` +
                      `Broadcast: ${broadcast}\n` +
                      `Subnet Mask: ${dottedMask}\n` +
                      `Usable Range: ${hosts > 0 ? `${firstHost.join('.')} - ${lastHost.join('.')}` : 'N/A'}\n` +
                      `Usable Hosts: ${hosts > 0 ? hosts : 0}`
            });
        } catch (e) {
            setResult({ error: e.message });
        }
    };

    return (
        <div className="grid gap-15 text-center">
            <h3>Subnet Calculator</h3>
            <div className="flex-gap">
                <input className="pill flex-1" value={ip} onChange={e=>setIp(e.target.value)} placeholder="IP Address" />
                <input type="number" className="pill" style={{width: '70px'}} value={mask} onChange={e=>setMask(parseInt(e.target.value))} min="0" max="32" />
            </div>
            <button className="btn-primary w-full" onClick={calculate}>Calculate</button>
            <ToolResult result={result} />
        </div>
    );
};

export default SubnetCalc;
