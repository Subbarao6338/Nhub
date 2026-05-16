# Epic Toolbox

![Epic Toolbox Screenshot](toolbox_hubs.png)

Epic Toolbox is a modern, full-stack personal dashboard designed to organize your digital life. Built with a focus on professional efficiency and streamlined workflows, it features a clean Material Design interface and a massive suite of utility tools.

## ✨ About the Project

In an era of cluttered interfaces and fragmented tools, **Epic Toolbox** provides a unified, high-performance environment for your daily digital tasks. Whether you're a developer needing a quick Regex test, a student looking for a scientific calculator, or a professional organizing bookmarks, Epic Toolbox is built for you.

The design system is built for **maximum productivity**. We use Material Expressive components, smooth transitions, and a professional color palette to ensure a consistent and focused user experience.

---

## 🚀 Key Features

### 🛠 The Toolbox Hub
A massive collection of consolidated tools organized into category Hubs:
- **AI Hub**: Multi-turn Chat Assistant, Image Generation, and Text utilities.
- **Data Tools**: High-performance viewers for CSV, JSON, Excel, and Parquet. Includes quality analysis and anonymization.
- **Developer Utilities**: JSON/SQL Formatters, Diff Viewer, UUID Generator, Regex Tester, and Code Converters.
- **Media & Graphics**: PDF Editor, Image Compressor, QR/Barcode Scanner, and Color Palette Hub.
- **Networking**: Real-time Ping, DNS Lookup, SSL Certificate Checker, and IP Info.
- **Date & Time Tools**: World clocks, Pomodoro timers, Stopwatch, and Timestamp converters.

### 🔖 Bookmark Management
- **Multi-Profile Support**: Keep your links organized with professional and personal profiles.
- **Dynamic Categories**: Group links with custom icons and real-time filtering.
- **Smart Search**: Navigate thousands of links and tools instantly using category prefixes (e.g., `cat:dev`).

### 🎨 Personalization & UX
- **Professional Themes**: Material Expressive color palettes with light and dark mode support.
- **Visual Effects**: Configurable Glassmorphism, animations, and reduced motion settings.
- **Offline First**: Full PWA support with Service Worker caching and offline access.
- **Cross-Platform**: Optimized for desktop precision and mobile responsiveness.

---

## 🛠 Technical Architecture

### Frontend (The SPA)
- **Framework**: React 18 with Vite for lightning-fast builds.
- **Styling**: Pure CSS following a strict token-based system for themes and animations.
- **Optimization**: Tool hubs are **lazy-loaded** to ensure fast initial load times.
- **Security**: Strict Sanitization with `DOMPurify` for all user-generated content.

### Backend (The API)
- **Framework**: FastAPI (Python 3.9+) providing a robust RESTful interface.
- **Database**: SQLite for local persistence with full CRUD support.

### Core Libraries
- **Mathematics**: `mathjs` for advanced calculations.
- **Documents**: `pdf-lib`, `jspdf`, `pdfjs-dist`, and `marked`.
- **Data**: `papaparse` (CSV), `xlsx` (Excel), and `hyparquet`.
- **UI**: `canvas-confetti` and `html2canvas`.

---

## 📖 Getting Started

### Prerequisites
- **Node.js** (v18+)
- **Python** (3.9+)

### Installation
1. **Clone the repo**:
   ```bash
   git clone https://github.com/your-repo/epic-toolbox.git
   cd epic-toolbox
   ```
2. **Setup Backend**:
   ```bash
   pip install -r requirements.txt
   ```
3. **Setup Frontend**:
   ```bash
   npm install
   ```

### Running Locally
- **Backend**: `uvicorn api.index:app --port 8000`
- **Frontend**: `npm run dev`

---

## 📜 License
MIT © 2024 Epic Toolbox Team
