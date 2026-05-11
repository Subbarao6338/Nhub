import React, { useState, useEffect } from 'react';

const FinanceTools = ({ toolId, onResultChange }) => {
  const [activeTab, setActiveTab] = useState('currency');

  useEffect(() => {
    if (toolId) {
      const mapping = {
        'currency-conv': 'currency',
        'vat-calc': 'vat',
        'inflation': 'inflation',
        'loan-calc': 'loan',
        'compound-int': 'compound',
        'cagr': 'cagr',
        'dcf': 'dcf',
        'tip-split': 'tip'
      };
      if (mapping[toolId]) setActiveTab(mapping[toolId]);
    }
  }, [toolId]);

  const tabs = [
    { id: 'currency', label: 'Currency' },
    { id: 'vat', label: 'VAT' },
    { id: 'inflation', label: 'Inflation' },
    { id: 'loan', label: 'Loan' },
    { id: 'compound', label: 'Compound' },
    { id: 'cagr', label: 'CAGR' },
    { id: 'dcf', label: 'DCF' },
    { id: 'tip', label: 'Tip & Split' }
  ].sort((a, b) => a.label.localeCompare(b.label));

  return (
    <div className="tool-form">
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

      {activeTab === 'currency' && <CurrencyTool onResultChange={onResultChange} />}
      {activeTab === 'tip' && <TipTool onResultChange={onResultChange} />}
      {['vat', 'inflation', 'loan', 'compound', 'cagr', 'dcf'].includes(activeTab) && (
          <div className="text-center p-20 card opacity-6">
              <span className="material-icons mb-10" style={{fontSize: '2rem'}}>payments</span>
              <div>This finance tool is being integrated.</div>
          </div>
      )}
    </div>
  );
};

const CurrencyTool = ({ onResultChange }) => {
    const [amt, setAmt] = useState(1);
    useEffect(() => {
        onResultChange({ text: `${amt} USD = ${(amt*0.92).toFixed(2)} EUR (Mock)`, filename: 'currency.txt' });
    }, [amt]);
    return (
        <div className="card p-20 text-center">
            <input type="number" className="pill w-full mb-15" value={amt} onChange={e=>setAmt(e.target.value)} />
            <div className="tool-result">{(amt * 0.92).toFixed(2)} EUR</div>
            <div className="opacity-5 mt-10" style={{fontSize: '0.8rem'}}>Using mock exchange rates</div>
        </div>
    );
};

const TipTool = ({ onResultChange }) => {
    const [bill, setBill] = useState(100);
    const [tip, setTip] = useState(15);
    const [ppl, setPpl] = useState(1);
    const total = bill * (1 + tip/100);
    useEffect(() => {
        onResultChange({ text: `Bill: ${bill}, Tip: ${tip}%, Total: ${total}`, filename: 'tip.txt' });
    }, [bill, tip]);
    return (
        <div className="card p-15 grid gap-10">
            <div className="flex-between"><span>Bill</span><input type="number" className="pill" style={{width: '100px'}} value={bill} onChange={e=>setBill(e.target.value)} /></div>
            <div className="flex-between"><span>Tip %</span><input type="number" className="pill" style={{width: '100px'}} value={tip} onChange={e=>setTip(e.target.value)} /></div>
            <div className="flex-between"><span>People</span><input type="number" className="pill" style={{width: '100px'}} value={ppl} onChange={e=>setPpl(e.target.value)} /></div>
            <div className="tool-result text-center mt-10">Total: <b>{total.toFixed(2)}</b><br/>Per Person: <b>{(total/ppl).toFixed(2)}</b></div>
        </div>
    );
};

export default FinanceTools;
