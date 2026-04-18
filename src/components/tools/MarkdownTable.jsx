import React, { useState, useEffect } from 'react';

const MarkdownTable = ({ onResultChange }) => {
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);
  const [data, setData] = useState([
    ['Header 1', 'Header 2', 'Header 3'],
    ['Row 1, Col 1', 'Row 1, Col 2', 'Row 1, Col 3'],
    ['Row 2, Col 1', 'Row 2, Col 2', 'Row 2, Col 3']
  ]);

  const updateCell = (r, c, val) => {
    const newData = [...data];
    newData[r][c] = val;
    setData(newData);
  };

  const addRow = () => {
    setData([...data, Array(cols).fill('')]);
    setRows(rows + 1);
  };

  const addCol = () => {
    setData(data.map(r => [...r, '']));
    setCols(cols + 1);
  };

  const generateMarkdown = () => {
    let md = '| ' + data[0].join(' | ') + ' |\n';
    md += '| ' + data[0].map(() => '---').join(' | ') + ' |\n';
    for (let i = 1; i < data.length; i++) {
      md += '| ' + data[i].join(' | ') + ' |\n';
    }
    return md;
  };

  useEffect(() => {
    onResultChange({
      text: generateMarkdown(),
      filename: 'table.md'
    });
  }, [data, onResultChange]);

  return (
    <div className="tool-form">
      <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
        <button className="pill" onClick={addRow}>+ Add Row</button>
        <button className="pill" onClick={addCol}>+ Add Column</button>
      </div>

      <div style={{ overflowX: 'auto', marginBottom: '20px' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
          <tbody>
            {data.map((r, i) => (
              <tr key={i}>
                {r.map((c, j) => (
                  <td key={j} style={{ border: '1px solid var(--border)', padding: '5px' }}>
                    <input
                      type="text"
                      value={c}
                      onChange={(e) => updateCell(i, j, e.target.value)}
                      style={{ border: 'none', background: 'transparent', width: '100%', minWidth: '80px' }}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="tool-result">
        <pre style={{ margin: 0, fontSize: '0.9rem' }}>{generateMarkdown()}</pre>
      </div>
    </div>
  );
};

export default MarkdownTable;
