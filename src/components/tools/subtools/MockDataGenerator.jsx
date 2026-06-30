import React, { useState } from 'react';
import ToolResult from '../ToolResult';

const TEMPLATES = {
    users: {
        name: 'Users',
        fields: ['id', 'name', 'email', 'role', 'status'],
        generate: (i) => {
            const firstNames = ['James', 'Mary', 'Robert', 'Patricia', 'John', 'Jennifer', 'Michael', 'Linda'];
            const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis'];
            const roles = ['Admin', 'Editor', 'Viewer', 'Contributor'];
            const statuses = ['Active', 'Pending', 'Inactive'];
            const fn = firstNames[Math.floor(Math.random() * firstNames.length)];
            const ln = lastNames[Math.floor(Math.random() * lastNames.length)];
            return {
                id: i + 1,
                name: `${fn} ${ln}`,
                email: `${fn.toLowerCase()}.${ln.toLowerCase()}${i + 1}@example.com`,
                role: roles[Math.floor(Math.random() * roles.length)],
                status: statuses[Math.floor(Math.random() * statuses.length)]
            };
        }
    },
    products: {
        name: 'Products',
        fields: ['id', 'name', 'category', 'price', 'stock'],
        generate: (i) => {
            const products = ['Laptop', 'Smartphone', 'Tablet', 'Monitor', 'Keyboard', 'Mouse', 'Headphones', 'Webcam'];
            const categories = ['Electronics', 'Computing', 'Accessories'];
            return {
                id: i + 1,
                name: products[Math.floor(Math.random() * products.length)] + ' ' + (100 + i),
                category: categories[Math.floor(Math.random() * categories.length)],
                price: parseFloat((Math.random() * 1000 + 10).toFixed(2)),
                stock: Math.floor(Math.random() * 100)
            };
        }
    },
    tasks: {
        name: 'Tasks',
        fields: ['id', 'title', 'priority', 'status', 'dueDate'],
        generate: (i) => {
            const actions = ['Fix', 'Implement', 'Review', 'Test', 'Deploy'];
            const features = ['Auth', 'Dashboard', 'API', 'UI', 'Database'];
            const priorities = ['Low', 'Medium', 'High', 'Critical'];
            const statuses = ['Todo', 'In Progress', 'Done'];
            return {
                id: i + 1,
                title: `${actions[Math.floor(Math.random() * actions.length)]} ${features[Math.floor(Math.random() * features.length)]} Component`,
                priority: priorities[Math.floor(Math.random() * priorities.length)],
                status: statuses[Math.floor(Math.random() * statuses.length)],
                dueDate: new Date(Date.now() + Math.random() * 1000000000).toISOString().split('T')[0]
            };
        }
    }
};

const MockDataGenerator = () => {
    const [rows, setRows] = useState(10);
    const [template, setTemplate] = useState('users');
    const [res, setRes] = useState(null);

    const gen = () => {
        const count = parseInt(rows) || 10;
        const selectedTemplate = TEMPLATES[template];
        const d = Array.from({ length: count }, (_, i) => selectedTemplate.generate(i));
        setRes({
            text: JSON.stringify(d, null, 2),
            filename: `mock_${template}_${count}.json`
        });
    };

    return (
        <div className="card p-30 glass-card grid gap-15">
            <h3 className="text-center">Mock Data Generation</h3>

            <div className="form-group">
                <label className="smallest opacity-6 uppercase ml-10">Data Template</label>
                <div className="pill-group">
                    {Object.entries(TEMPLATES).map(([key, t]) => (
                        <button
                            key={key}
                            className={`pill ${template === key ? 'active' : ''}`}
                            onClick={() => setTemplate(key)}
                        >
                            {t.name}
                        </button>
                    ))}
                </div>
            </div>

            <div className="form-group">
                <label className="smallest opacity-6 uppercase ml-10">Number of Rows</label>
                <input
                    type="number"
                    className="pill w-full"
                    value={rows}
                    onChange={e => setRows(e.target.value)}
                    min="1"
                    max="1000"
                />
            </div>

            <button className="btn-primary w-full" onClick={gen}>
                <span className="material-icons mr-10">reorder</span>
                Generate {TEMPLATES[template].name} Data
            </button>

            <ToolResult result={res} />
        </div>
    );
};

export default MockDataGenerator;
