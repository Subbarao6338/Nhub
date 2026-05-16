# Epic Toolbox

A unified ecosystem of essential tools, designed for professional efficiency and streamlined workflows. This application consolidates multiple utility hubs into a single, high-performance interface with a modern Material Design system.

## 🛠️ Core Hubs

1.  **Document Tools**: Integrated PDF, Image, and Text utilities. Edit, convert, and translate documents with ease.
2.  **Developer Hub**: Essential tools for engineers—JSON formatters, Unit converters, Color pickers, and Security utilities.
3.  **Data Science**: Statistical analysis, data profiling, mock data generation, and financial calculators.
4.  **Network Hub**: IP info, DNS lookups, WHOIS, SSL checks, and Subnet calculators.
5.  **Web & Social Tools**: Media downloaders and web archiving utilities.
6.  **AI Hub**: Image generation, chat assistants, and local sentiment analysis.
7.  **Date & Time Tools**: World clocks, Pomodoro timers, Stopwatch, and Timestamp converters.

## 🚀 Features

*   **Professional UI**: Clean, Material-inspired cards with smooth interactive states.
*   **Performance**: Lazy-loaded hubs and optimized React components for maximum speed.
*   **PWA Support**: Fully installable with offline capabilities via service workers.
*   **Customization**: Material Expressive color palettes and theme modes (Light/Dark/System).
*   **Privacy First**: Local-first processing for sensitive tools (Hashing, Password Gen, Image Blur).

## 💻 Tech Stack

*   **Frontend**: React 18, Vite, CSS3 (Material Expressive Design).
*   **Backend**: Python (FastAPI) for heavy processing (Document translation, YT-DLP).
*   **Libraries**: jsPDF, pdf-lib, PapaParse, Tesseract.js, Material Icons.

## 💻 Installation

```bash
# Install dependencies
npm install
pip install -r requirements.txt

# Start development server
npm run dev

# Start API server
python3 -m uvicorn api.index:app --port 8000
```

Built for professionals who value speed and simplicity.
