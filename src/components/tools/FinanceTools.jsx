import React, { useState, useEffect } from 'react';

const FinanceTools = ({ toolId, onResultChange, onSubtoolChange }) => {
  const tabs = [
    { id: 'currency', label: 'Currency' },
    { id: 'vat', label: 'VAT' },
    { id: 'inflation', label: 'Inflation' },
    { id: 'loan', label: 'Loan' },
    { id: 'compound', label: 'Compound' },
    { id: 'cagr', label: 'CAGR' },
    { id: 'dcf', label: 'DCF' },
    { id: 'tip', label: 'Tip & Split' },
    { id: 'investment', label: 'Investment' }
  ].sort((a, b) => a.label.localeCompare(b.label));

  const [activeTab, setActiveTab] = useState('currency');

  useEffect(() => {
    const current = tabs.find(t => t.id === activeTab);
    if (current && onSubtoolChange) onSubtoolChange(current.label);
  }, [activeTab]);

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
        'tip-split': 'tip',
        'investment-calc': 'investment'
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

      {activeTab === 'currency' && <CurrencyTool onResultChange={onResultChange} />}
      {activeTab === 'tip' && <TipTool onResultChange={onResultChange} />}
      {activeTab === 'compound' && <CompoundInterestTool onResultChange={onResultChange} />}
      {activeTab === 'loan' && <LoanCalculator onResultChange={onResultChange} />}
      {activeTab === 'investment' && <InvestmentCalculator onResultChange={onResultChange} />}
      {['vat', 'inflation', 'cagr', 'dcf'].includes(activeTab) && (
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

const CompoundInterestTool = ({ onResultChange }) => {
    const [p, setP] = useState(1000);
    const [r, setR] = useState(5);
    const [t, setT] = useState(10);
    const [res, setRes] = useState(null);

    const calc = () => {
        const amount = p * Math.pow((1 + (r/100)), t);
        setRes(amount.toFixed(2));
        onResultChange({ text: `Principal: ${p}, Rate: ${r}%, Time: ${t}y, Total: ${amount.toFixed(2)}`, filename: 'compound.txt' });
    };

    return (
        <div className="grid gap-15 card p-15">
            <div className="flex-between"><span>Principal</span><input type="number" className="pill w-100" value={p} onChange={e=>setP(e.target.value)} /></div>
            <div className="flex-between"><span>Rate (%)</span><input type="number" className="pill w-100" value={r} onChange={e=>setR(e.target.value)} /></div>
            <div className="flex-between"><span>Years</span><input type="number" className="pill w-100" value={t} onChange={e=>setT(e.target.value)} /></div>
            <button className="btn-primary" onClick={calc}>Calculate</button>
            {res && <div className="tool-result text-center">Total: <b>{res}</b></div>}
        </div>
    );
};

const LoanCalculator = ({ onResultChange }) => {
    const [amt, setAmt] = useState(10000);
    const [rate, setRate] = useState(5);
    const [term, setTerm] = useState(12);
    const [emi, setEmi] = useState(null);

    const calc = () => {
        const r = rate / 12 / 100;
        const e = (amt * r * Math.pow(1 + r, term)) / (Math.pow(1 + r, term) - 1);
        setEmi(e.toFixed(2));
    };

    return (
        <div className="grid gap-15 card p-15">
            <input type="number" placeholder="Loan Amount" className="pill" value={amt} onChange={e=>setAmt(e.target.value)} />
            <input type="number" placeholder="Interest Rate" className="pill" value={rate} onChange={e=>setRate(e.target.value)} />
            <input type="number" placeholder="Months" className="pill" value={term} onChange={e=>setTerm(e.target.value)} />
            <button className="btn-primary" onClick={calc}>Calculate EMI</button>
            {emi && <div className="tool-result text-center">Monthly Payment: <b>{emi}</b></div>}
        </div>
    );
};

const InvestmentCalculator = ({ onResultChange }) => {
    const [sip, setSip] = useState(5000);
    const [rate, setRate] = useState(12);
    const [years, setYears] = useState(10);
    const [res, setRes] = useState(null);

    const calc = () => {
        const i = rate / 100 / 12;
        const n = years * 12;
        const total = sip * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
        setRes(total.toFixed(0));
    };

    return (
        <div className="grid gap-15 card p-15">
            <div className="flex-between"><span>Monthly SIP</span><input type="number" className="pill w-100" value={sip} onChange={e=>setSip(e.target.value)} /></div>
            <div className="flex-between"><span>Rate (%)</span><input type="number" className="pill w-100" value={rate} onChange={e=>setRate(e.target.value)} /></div>
            <div className="flex-between"><span>Years</span><input type="number" className="pill w-100" value={years} onChange={e=>setYears(e.target.value)} /></div>
            <button className="btn-primary" onClick={calc}>Calculate Wealth</button>
            {res && <div className="tool-result text-center">Maturity Value: <b>₹{res}</b></div>}
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
