import React, { useState, useMemo, useEffect } from 'react';
import { evaluate } from 'mathjs';

const ELEMENTS = [
  { number: 1, symbol: 'H', name: 'Hydrogen', mass: '1.008', category: 'nonmetal', period: 1, group: 1 },
  { number: 2, symbol: 'He', name: 'Helium', mass: '4.0026', category: 'noble-gas', period: 1, group: 18 },
  { number: 3, symbol: 'Li', name: 'Lithium', mass: '6.94', category: 'alkali-metal', period: 2, group: 1 },
  { number: 4, symbol: 'Be', name: 'Beryllium', mass: '9.0122', category: 'alkaline-earth', period: 2, group: 2 },
  { number: 5, symbol: 'B', name: 'Boron', mass: '10.81', category: 'metalloid', period: 2, group: 13 },
  { number: 6, symbol: 'C', name: 'Carbon', mass: '12.011', category: 'nonmetal', period: 2, group: 14 },
  { number: 7, symbol: 'N', name: 'Nitrogen', mass: '14.007', category: 'nonmetal', period: 2, group: 15 },
  { number: 8, symbol: 'O', name: 'Oxygen', mass: '15.999', category: 'nonmetal', period: 2, group: 16 },
  { number: 9, symbol: 'F', name: 'Fluorine', mass: '18.998', category: 'nonmetal', period: 2, group: 17 },
  { number: 10, symbol: 'Ne', name: 'Neon', mass: '20.180', category: 'noble-gas', period: 2, group: 18 },
  { number: 11, symbol: 'Na', name: 'Sodium', mass: '22.990', category: 'alkali-metal', period: 3, group: 1 },
  { number: 12, symbol: 'Mg', name: 'Magnesium', mass: '24.305', category: 'alkaline-earth', period: 3, group: 2 },
  { number: 13, symbol: 'Al', name: 'Aluminum', mass: '26.982', category: 'post-transition-metal', period: 3, group: 13 },
  { number: 14, symbol: 'Si', name: 'Silicon', mass: '28.085', category: 'metalloid', period: 3, group: 14 },
  { number: 15, symbol: 'P', name: 'Phosphorus', mass: '30.974', category: 'nonmetal', period: 3, group: 15 },
  { number: 16, symbol: 'S', name: 'Sulfur', mass: '32.06', category: 'nonmetal', period: 3, group: 16 },
  { number: 17, symbol: 'Cl', name: 'Chlorine', mass: '35.45', category: 'nonmetal', period: 3, group: 17 },
  { number: 18, symbol: 'Ar', name: 'Argon', mass: '39.948', category: 'noble-gas', period: 3, group: 18 },
  { number: 19, symbol: 'K', name: 'Potassium', mass: '39.098', category: 'alkali-metal', period: 4, group: 1 },
  { number: 20, symbol: 'Ca', name: 'Calcium', mass: '40.078', category: 'alkaline-earth', period: 4, group: 2 },
  { number: 21, symbol: 'Sc', name: 'Scandium', mass: '44.956', category: 'transition-metal', period: 4, group: 3 },
  { number: 22, symbol: 'Ti', name: 'Titanium', mass: '47.867', category: 'transition-metal', period: 4, group: 4 },
  { number: 23, symbol: 'V', name: 'Vanadium', mass: '50.942', category: 'transition-metal', period: 4, group: 5 },
  { number: 24, symbol: 'Cr', name: 'Chromium', mass: '51.996', category: 'transition-metal', period: 4, group: 6 },
  { number: 25, symbol: 'Mn', name: 'Manganese', mass: '54.938', category: 'transition-metal', period: 4, group: 7 },
  { number: 26, symbol: 'Fe', name: 'Iron', mass: '55.845', category: 'transition-metal', period: 4, group: 8 },
  { number: 27, symbol: 'Co', name: 'Cobalt', mass: '58.933', category: 'transition-metal', period: 4, group: 9 },
  { number: 28, symbol: 'Ni', name: 'Nickel', mass: '58.693', category: 'transition-metal', period: 4, group: 10 },
  { number: 29, symbol: 'Cu', name: 'Copper', mass: '63.546', category: 'transition-metal', period: 4, group: 11 },
  { number: 30, symbol: 'Zn', name: 'Zinc', mass: '65.38', category: 'transition-metal', period: 4, group: 12 },
  { number: 31, symbol: 'Ga', name: 'Gallium', mass: '69.723', category: 'post-transition-metal', period: 4, group: 13 },
  { number: 32, symbol: 'Ge', name: 'Germanium', mass: '72.630', category: 'metalloid', period: 4, group: 14 },
  { number: 33, symbol: 'As', name: 'Arsenic', mass: '74.922', category: 'metalloid', period: 4, group: 15 },
  { number: 34, symbol: 'Se', name: 'Selenium', mass: '78.971', category: 'nonmetal', period: 4, group: 16 },
  { number: 35, symbol: 'Br', name: 'Bromine', mass: '79.904', category: 'nonmetal', period: 4, group: 17 },
  { number: 36, symbol: 'Kr', name: 'Krypton', mass: '83.798', category: 'noble-gas', period: 4, group: 18 },
  { number: 37, symbol: 'Rb', name: 'Rubidium', mass: '85.468', category: 'alkali-metal', period: 5, group: 1 },
  { number: 38, symbol: 'Sr', name: 'Strontium', mass: '87.62', category: 'alkaline-earth', period: 5, group: 2 },
  { number: 39, symbol: 'Y', name: 'Yttrium', mass: '88.906', category: 'transition-metal', period: 5, group: 3 },
  { number: 40, symbol: 'Zr', name: 'Zirconium', mass: '91.224', category: 'transition-metal', period: 5, group: 4 },
  { number: 41, symbol: 'Nb', name: 'Niobium', mass: '92.906', category: 'transition-metal', period: 5, group: 5 },
  { number: 42, symbol: 'Mo', name: 'Molybdenum', mass: '95.95', category: 'transition-metal', period: 5, group: 6 },
  { number: 43, symbol: 'Tc', name: 'Technetium', mass: '98', category: 'transition-metal', period: 5, group: 7 },
  { number: 44, symbol: 'Ru', name: 'Ruthenium', mass: '101.07', category: 'transition-metal', period: 5, group: 8 },
  { number: 45, symbol: 'Rh', name: 'Rhodium', mass: '102.91', category: 'transition-metal', period: 5, group: 9 },
  { number: 46, symbol: 'Pd', name: 'Palladium', mass: '106.42', category: 'transition-metal', period: 5, group: 10 },
  { number: 47, symbol: 'Ag', name: 'Silver', mass: '107.87', category: 'transition-metal', period: 5, group: 11 },
  { number: 48, symbol: 'Cd', name: 'Cadmium', mass: '112.41', category: 'transition-metal', period: 5, group: 12 },
  { number: 49, symbol: 'In', name: 'Indium', mass: '114.82', category: 'post-transition-metal', period: 5, group: 13 },
  { number: 50, symbol: 'Sn', name: 'Tin', mass: '118.71', category: 'post-transition-metal', period: 5, group: 14 },
  { number: 51, symbol: 'Sb', name: 'Antimony', mass: '121.76', category: 'metalloid', period: 5, group: 15 },
  { number: 52, symbol: 'Te', name: 'Tellurium', mass: '127.60', category: 'metalloid', period: 5, group: 16 },
  { number: 53, symbol: 'I', name: 'Iodine', mass: '126.90', category: 'nonmetal', period: 5, group: 17 },
  { number: 54, symbol: 'Xe', name: 'Xenon', mass: '131.29', category: 'noble-gas', period: 5, group: 18 },
  { number: 55, symbol: 'Cs', name: 'Cesium', mass: '132.91', category: 'alkali-metal', period: 6, group: 1 },
  { number: 56, symbol: 'Ba', name: 'Barium', mass: '137.33', category: 'alkaline-earth', period: 6, group: 2 },
  { number: 57, symbol: 'La', name: 'Lanthanum', mass: '138.91', category: 'lanthanide', period: 6, group: 3 },
  { number: 72, symbol: 'Hf', name: 'Hafnium', mass: '178.49', category: 'transition-metal', period: 6, group: 4 },
  { number: 73, symbol: 'Ta', name: 'Tantalum', mass: '180.95', category: 'transition-metal', period: 6, group: 5 },
  { number: 74, symbol: 'W', name: 'Tungsten', mass: '183.84', category: 'transition-metal', period: 6, group: 6 },
  { number: 75, symbol: 'Re', name: 'Rhenium', mass: '186.21', category: 'transition-metal', period: 6, group: 7 },
  { number: 76, symbol: 'Os', name: 'Osmium', mass: '190.23', category: 'transition-metal', period: 6, group: 8 },
  { number: 77, symbol: 'Ir', name: 'Iridium', mass: '192.22', category: 'transition-metal', period: 6, group: 9 },
  { number: 78, symbol: 'Pt', name: 'Platinum', mass: '195.08', category: 'transition-metal', period: 6, group: 10 },
  { number: 79, symbol: 'Au', name: 'Gold', mass: '196.97', category: 'transition-metal', period: 6, group: 11 },
  { number: 80, symbol: 'Hg', name: 'Mercury', mass: '200.59', category: 'transition-metal', period: 6, group: 12 },
  { number: 81, symbol: 'Tl', name: 'Thallium', mass: '204.38', category: 'post-transition-metal', period: 6, group: 13 },
  { number: 82, symbol: 'Pb', name: 'Lead', mass: '207.2', category: 'post-transition-metal', period: 6, group: 14 },
  { number: 83, symbol: 'Bi', name: 'Bismuth', mass: '208.98', category: 'post-transition-metal', period: 6, group: 15 },
  { number: 84, symbol: 'Po', name: 'Polonium', mass: '209', category: 'post-transition-metal', period: 6, group: 16 },
  { number: 85, symbol: 'At', name: 'Astatine', mass: '210', category: 'metalloid', period: 6, group: 17 },
  { number: 86, symbol: 'Rn', name: 'Radon', mass: '222', category: 'noble-gas', period: 6, group: 18 },
  { number: 87, symbol: 'Fr', name: 'Francium', mass: '223', category: 'alkali-metal', period: 7, group: 1 },
  { number: 88, symbol: 'Ra', name: 'Radium', mass: '226', category: 'alkaline-earth', period: 7, group: 2 },
  { number: 89, symbol: 'Ac', name: 'Actinium', mass: '227', category: 'actinide', period: 7, group: 3 },
  { number: 104, symbol: 'Rf', name: 'Rutherfordium', mass: '267', category: 'transition-metal', period: 7, group: 4 },
  { number: 105, symbol: 'Db', name: 'Dubnium', mass: '268', category: 'transition-metal', period: 7, group: 5 },
  { number: 106, symbol: 'Sg', name: 'Seaborgium', mass: '269', category: 'transition-metal', period: 7, group: 6 },
  { number: 107, symbol: 'Bh', name: 'Bohrium', mass: '270', category: 'transition-metal', period: 7, group: 7 },
  { number: 108, symbol: 'Hs', name: 'Hassium', mass: '269', category: 'transition-metal', period: 7, group: 8 },
  { number: 109, symbol: 'Mt', name: 'Meitnerium', mass: '278', category: 'unknown', period: 7, group: 9 },
  { number: 110, symbol: 'Ds', name: 'Darmstadtium', mass: '281', category: 'unknown', period: 7, group: 10 },
  { number: 111, symbol: 'Rg', name: 'Roentgenium', mass: '282', category: 'unknown', period: 7, group: 11 },
  { number: 112, symbol: 'Cn', name: 'Copernicium', mass: '285', category: 'transition-metal', period: 7, group: 12 },
  { number: 113, symbol: 'Nh', name: 'Nihonium', mass: '286', category: 'unknown', period: 7, group: 13 },
  { number: 114, symbol: 'Fl', name: 'Flerovium', mass: '289', category: 'post-transition-metal', period: 7, group: 14 },
  { number: 115, symbol: 'Mc', name: 'Moscovium', mass: '290', category: 'unknown', period: 7, group: 15 },
  { number: 116, symbol: 'Lv', name: 'Livermorium', mass: '293', category: 'unknown', period: 7, group: 16 },
  { number: 117, symbol: 'Ts', name: 'Tennessine', mass: '294', category: 'unknown', period: 7, group: 17 },
  { number: 118, symbol: 'Og', name: 'Oganesson', mass: '294', category: 'unknown', period: 7, group: 18 },
  // Lanthanides
  { number: 58, symbol: 'Ce', name: 'Cerium', mass: '140.12', category: 'lanthanide', period: 8, group: 4 },
  { number: 59, symbol: 'Pr', name: 'Praseodymium', mass: '140.91', category: 'lanthanide', period: 8, group: 5 },
  { number: 60, symbol: 'Nd', name: 'Neodymium', mass: '144.24', category: 'lanthanide', period: 8, group: 6 },
  { number: 61, symbol: 'Pm', name: 'Promethium', mass: '145', category: 'lanthanide', period: 8, group: 7 },
  { number: 62, symbol: 'Sm', name: 'Samarium', mass: '150.36', category: 'lanthanide', period: 8, group: 8 },
  { number: 63, symbol: 'Eu', name: 'Europium', mass: '151.96', category: 'lanthanide', period: 8, group: 9 },
  { number: 64, symbol: 'Gd', name: 'Gadolinium', mass: '157.25', category: 'lanthanide', period: 8, group: 10 },
  { number: 65, symbol: 'Tb', name: 'Terbium', mass: '158.93', category: 'lanthanide', period: 8, group: 11 },
  { number: 66, symbol: 'Dy', name: 'Dysprosium', mass: '162.50', category: 'lanthanide', period: 8, group: 12 },
  { number: 67, symbol: 'Ho', name: 'Holmium', mass: '164.93', category: 'lanthanide', period: 8, group: 13 },
  { number: 68, symbol: 'Er', name: 'Erbium', mass: '167.26', category: 'lanthanide', period: 8, group: 14 },
  { number: 69, symbol: 'Tm', name: 'Thulium', mass: '168.93', category: 'lanthanide', period: 8, group: 15 },
  { number: 70, symbol: 'Yb', name: 'Ytterbium', mass: '173.05', category: 'lanthanide', period: 8, group: 16 },
  { number: 71, symbol: 'Lu', name: 'Lutetium', mass: '174.97', category: 'lanthanide', period: 8, group: 17 },
  // Actinides
  { number: 90, symbol: 'Th', name: 'Thorium', mass: '232.04', category: 'actinide', period: 9, group: 4 },
  { number: 91, symbol: 'Pa', name: 'Protactinium', mass: '231.04', category: 'actinide', period: 9, group: 5 },
  { number: 92, symbol: 'U', name: 'Uranium', mass: '238.03', category: 'actinide', period: 9, group: 6 },
  { number: 93, symbol: 'Np', name: 'Neptunium', mass: '237', category: 'actinide', period: 9, group: 7 },
  { number: 94, symbol: 'Pu', name: 'Plutonium', mass: '244', category: 'actinide', period: 9, group: 8 },
  { number: 95, symbol: 'Am', name: 'Americium', mass: '243', category: 'actinide', period: 9, group: 9 },
  { number: 96, symbol: 'Cm', name: 'Curium', mass: '247', category: 'actinide', period: 9, group: 10 },
  { number: 97, symbol: 'Bk', name: 'Berkelium', mass: '247', category: 'actinide', period: 9, group: 11 },
  { number: 98, symbol: 'Cf', name: 'Californium', mass: '251', category: 'actinide', period: 9, group: 12 },
  { number: 99, symbol: 'Es', name: 'Einsteinium', mass: '252', category: 'actinide', period: 9, group: 13 },
  { number: 100, symbol: 'Fm', name: 'Fermium', mass: '257', category: 'actinide', period: 9, group: 14 },
  { number: 101, symbol: 'Md', name: 'Mendelevium', mass: '258', category: 'actinide', period: 9, group: 15 },
  { number: 102, symbol: 'No', name: 'Nobelium', mass: '259', category: 'actinide', period: 9, group: 16 },
  { number: 103, symbol: 'Lr', name: 'Lawrencium', mass: '262', category: 'actinide', period: 9, group: 17 },
];

const CATEGORY_COLORS = {
  'nonmetal': '#a1ffc7',
  'noble-gas': '#c7d1ff',
  'alkali-metal': '#ffc7c7',
  'alkaline-earth': '#ffebc7',
  'metalloid': '#ebffc7',
  'post-transition-metal': '#c7ffff',
  'transition-metal': '#ffc7ff',
  'lanthanide': '#ffc7eb',
  'actinide': '#e1c7ff',
  'unknown': '#e2e2e2'
};

const PeriodicTable = () => {
  const [selected, setSelected] = useState(null);

  return (
    <div className="periodic-table-container">
      <div className="periodic-table-grid">
        {ELEMENTS.map(el => (
          <div
            key={el.number}
            className={`element-cell ${selected?.number === el.number ? 'selected' : ''}`}
            style={{
              gridColumn: el.group,
              gridRow: el.period,
              backgroundColor: CATEGORY_COLORS[el.category] || CATEGORY_COLORS.unknown
            }}
            onClick={() => setSelected(el)}
          >
            <span className="el-number">{el.number}</span>
            <span className="el-symbol">{el.symbol}</span>
            <span className="el-name">{el.name}</span>
          </div>
        ))}
      </div>

      {selected && (
        <div className="element-details card mt-20 p-20 glass-card">
          <h3>{selected.name} ({selected.symbol})</h3>
          <div className="grid gap-10" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
            <div><strong>Atomic Number:</strong> {selected.number}</div>
            <div><strong>Atomic Mass:</strong> {selected.mass}</div>
            <div><strong>Category:</strong> {selected.category.replace(/-/g, ' ')}</div>
            <div><strong>Group:</strong> {selected.group}</div>
            <div><strong>Period:</strong> {selected.period > 7 ? (selected.period === 8 ? '6 (Lanthanide)' : '7 (Actinide)') : selected.period}</div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .periodic-table-container {
          overflow-x: auto;
          padding: 10px;
        }
        .periodic-table-grid {
          display: grid;
          grid-template-columns: repeat(18, minmax(50px, 1fr));
          grid-template-rows: repeat(9, minmax(60px, 1fr));
          gap: 4px;
          min-width: 900px;
        }
        .element-cell {
          border-radius: 8px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
          padding: 4px;
          position: relative;
          color: #333;
          border: 1px solid rgba(0,0,0,0.05);
        }
        .element-cell:hover {
          transform: scale(1.1);
          z-index: 10;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        .element-cell.selected {
          border: 2px solid var(--primary);
          box-shadow: 0 0 0 2px var(--primary-glow);
        }
        .el-number { font-size: 0.7rem; position: absolute; top: 2px; left: 4px; opacity: 0.7; }
        .el-symbol { font-weight: bold; font-size: 1.2rem; }
        .el-name { font-size: 0.6rem; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; }
        .element-details h3 { margin-top: 0; color: var(--primary); }
      `}} />
    </div>
  );
};

const UnitCircle = () => {
  const angles = [0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330];
  return (
    <div className="unit-circle-container p-20 flex-center flex-column">
      <svg viewBox="0 0 400 400" width="100%" maxWidth="400px">
        <circle cx="200" cy="200" r="180" fill="none" stroke="var(--text-muted)" strokeWidth="1" opacity="0.3" />
        <line x1="20" y1="200" x2="380" y2="200" stroke="var(--text-muted)" strokeWidth="1" opacity="0.5" />
        <line x1="200" y1="20" x2="200" y2="380" stroke="var(--text-muted)" strokeWidth="1" opacity="0.5" />

        {angles.map(deg => {
          const rad = (deg * Math.PI) / 180;
          const x = 200 + 180 * Math.cos(rad);
          const y = 200 - 180 * Math.sin(rad);
          const lx = 200 + 160 * Math.cos(rad);
          const ly = 200 - 160 * Math.sin(rad);

          return (
            <g key={deg}>
              <line x1="200" y1="200" x2={x} y2={y} stroke="var(--primary)" strokeWidth="1.5" opacity="0.6" />
              <circle cx={x} cy={y} r="4" fill="var(--primary)" />
              <text
                x={200 + 200 * Math.cos(rad)}
                y={200 - 200 * Math.sin(rad)}
                fontSize="12"
                textAnchor="middle"
                alignmentBaseline="middle"
                fill="var(--text)"
              >
                {deg}°
              </text>
            </g>
          );
        })}
        <circle cx="200" cy="200" r="4" fill="var(--primary)" />
      </svg>
      <div className="mt-20 card p-15 w-100">
        <h4>Trigonometry Quick Ref</h4>
        <div className="grid gap-10" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <div>sin(30°) = 1/2</div>
          <div>cos(30°) = √3/2</div>
          <div>sin(45°) = √2/2</div>
          <div>cos(45°) = √2/2</div>
          <div>sin(60°) = √3/2</div>
          <div>cos(60°) = 1/2</div>
        </div>
      </div>
    </div>
  );
};

const ScientificCalculator = () => {
    const [expr, setExpr] = useState('');
    const [res, setRes] = useState('');
    const calc = () => {
        try { setRes(evaluate(expr).toString()); } catch(e) { setRes('Error'); }
    };
    const btns = [
        'sin(', 'cos(', 'tan(', 'log(',
        'sqrt(', 'pow(', 'pi', 'e',
        '7', '8', '9', '/',
        '4', '5', '6', '*',
        '1', '2', '3', '-',
        '0', '.', '(', ')',
        'C', '='
    ];
    return (
        <div className="card p-20">
            <input className="pill text-right mb-10 font-mono" style={{fontSize: '1.5rem'}} value={expr} onChange={e=>setExpr(e.target.value)} />
            <div className="text-right color-primary font-bold mb-20" style={{fontSize: '2rem', height: '2.5rem'}}>{res}</div>
            <div className="grid grid-4 gap-10">
                {btns.map(b => (
                    <button key={b} className={`pill ${['C','='].includes(b) ? 'active' : ''}`} onClick={()=>{
                        if(b === '=') calc();
                        else if(b === 'C') { setExpr(''); setRes(''); }
                        else setExpr(prev => prev + b);
                    }} style={{ padding: '10px' }}>{b}</button>
                ))}
            </div>
        </div>
    );
};

const EducationTools = ({ toolId, onSubtoolChange }) => {
  const tabs = [
    { id: 'periodic', label: 'Periodic Table' },
    { id: 'circle', label: 'Unit Circle' },
    { id: 'constants', label: 'Physics Constants' },
    { id: 'scicalc', label: 'Scientific Calc' }
  ];

  const [activeTab, setActiveTab] = useState('periodic');

  useEffect(() => {
    const current = tabs.find(t => t.id === activeTab);
    if (current && onSubtoolChange) onSubtoolChange(current.label);
  }, [activeTab]);

  useEffect(() => {
    if (toolId) {
      const mapping = {
        'periodic-table': 'periodic',
        'unit-circle': 'circle',
        'physics-constants': 'constants',
        'scientific-calc': 'scicalc'
      };
      if (mapping[toolId]) setActiveTab(mapping[toolId]); else if (tabs.length > 0) setActiveTab(tabs[0].id);
    }
  }, [toolId]);

  const isDeepLinked = !!toolId && tabs.some(t => t.id === toolId || toolId.includes(t.id));

  return (
    <div className="tool-form">
      {!isDeepLinked && (
          <div className="pill-group scrollable-x mb-20">
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

      {activeTab === 'periodic' && <PeriodicTable />}
      {activeTab === 'circle' && <UnitCircle />}
      {activeTab === 'constants' && <PhysicsConstants />}
      {activeTab === 'scicalc' && <ScientificCalculator />}
    </div>
  );
};

const PhysicsConstants = () => {
  const constants = [
    { name: 'Speed of Light', symbol: 'c', value: '299,792,458 m/s' },
    { name: 'Gravitational Constant', symbol: 'G', value: '6.674 × 10⁻¹¹ m³⋅kg⁻¹⋅s⁻²' },
    { name: 'Planck Constant', symbol: 'h', value: '6.626 × 10⁻³⁴ J⋅s' },
    { name: 'Boltzmann Constant', symbol: 'k', value: '1.380 × 10⁻²³ J/K' },
    { name: 'Electron Charge', symbol: 'e', value: '1.602 × 10⁻¹⁹ C' },
    { name: 'Proton Mass', symbol: 'm_p', value: '1.672 × 10⁻²⁷ kg' }
  ];

  return (
    <div className="grid gap-12">
      {constants.map(c => (
        <div key={c.symbol} className="card p-15 flex-between no-animation">
          <div>
            <div className="font-bold">{c.name}</div>
            <div className="opacity-6 font-mono" style={{ fontSize: '0.8rem' }}>Symbol: {c.symbol}</div>
          </div>
          <div className="font-mono text-right" style={{ color: 'var(--primary)' }}>{c.value}</div>
        </div>
      ))}
    </div>
  );
};

export default EducationTools;
