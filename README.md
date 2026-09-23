# CubeCV — Rubik's Cube Scanner & Solver

> Scan your Rubik's Cube with a webcam, detect colors via OpenCV.js, and get an optimal solution in ≤20 moves using Kociemba's Two-Phase Algorithm — all running client-side in your browser.

![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?logo=tailwindcss&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)

---

## ✨ Features

- **📷 Webcam Scanning** — Point your camera at each cube face; a 3×3 grid overlay guides alignment.
- **🎨 Color Detection** — OpenCV.js converts frames to HSV and classifies each of the 9 cells into one of 6 standard colors.
- **🧩 Kociemba Solver** — The Two-Phase Algorithm runs in a Web Worker, returning a near-optimal solution (≤20 moves) without blocking the UI.
- **🗺️ Live Cube Net** — A 2D unfolded cube visualization updates in real time as faces are scanned.
- **📝 Tech Blog** — An in-app article on God's Number, Cayley Graphs, and the mathematics behind the solver.
- **🌙 Dark Glassmorphism UI** — Modern dark theme with backdrop-blur cards, gradient accents, and micro-animations.
- **📱 Fully Responsive** — Works on desktop and mobile (prefers rear camera on mobile devices).

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | [React 19](https://react.dev) (Vite 6) |
| Styling | [Tailwind CSS 4](https://tailwindcss.com) + [@tailwindcss/typography](https://github.com/tailwindlabs/tailwindcss-typography) |
| Routing | [React Router v7](https://reactrouter.com) |
| Webcam | [react-webcam](https://github.com/mozmorris/react-webcam) |
| Computer Vision | [OpenCV.js](https://docs.opencv.org/4.x/d5/d10/tutorial_js_root.html) (CDN, client-side) |
| Solver | [cubejs](https://github.com/nicbarker/cubejs) (Kociemba's Two-Phase Algorithm) |

---

## 📁 Project Structure

```
src/
├── components/
│   ├── Navbar.jsx           # Fixed glassmorphism navigation bar
│   ├── CubeScanner.jsx      # Webcam feed with 3×3 grid overlay
│   ├── CubeNet.jsx          # 2D unfolded cube net visualization
│   └── SolutionView.jsx     # Animated move-sequence cards
├── pages/
│   ├── SolverPage.jsx       # Scanning & solving orchestrator
│   └── BlogsPage.jsx        # Blog article with Tailwind prose
├── hooks/
│   └── useOpenCv.js         # Custom hook: OpenCV.js CDN readiness
├── utils/
│   ├── cvProcessor.js       # Pure OpenCV HSV color detection logic
│   └── cubeSolver.js        # Promise-based Web Worker wrapper
├── workers/
│   └── solverWorker.js      # Web Worker: cubejs init + solve
├── App.jsx                  # React Router configuration
├── main.jsx                 # Entry point
└── index.css                # Tailwind v4 config + design tokens
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) ≥ 18
- A webcam (built-in or external)
- HTTPS or localhost (required for camera access)

### Install & Run

```bash
git clone https://github.com/your-username/cube-cv.git
cd cube-cv
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
npm run preview
```

---

## 📖 How to Use

1. **Open the Cube Solver** page (`/`).
2. Wait for the **OpenCV** and **Solver** status badges to turn green.
3. Hold your cube so one face fills the 3×3 grid overlay.
4. Click **Capture Face** — the app detects the 9 colors.
5. Select the next face using the **U / R / F / D / L / B** buttons and repeat.
6. Once all 6 faces are captured, click **Solve Cube**.
7. Follow the move sequence displayed as color-coded cards.

---

## 🧠 How It Works

### Color Detection

Frames are captured from the webcam and processed through OpenCV.js:

1. Draw the video frame onto an offscreen canvas
2. Convert RGBA → RGB → HSV color space
3. Sample a small region at the center of each grid cell
4. Classify by HSV thresholds into one of 6 colors (White, Yellow, Red, Orange, Green, Blue)

### Solving

The 54-character facelet string (URFDLB order) is passed to a Web Worker running `cubejs`:

1. **Phase 1**: Reduce the cube state to the G₁ subgroup (~12 moves)
2. **Phase 2**: Solve from G₁ to the identity state
3. Combined solution is typically ≤ 20 moves (God's Number guarantee)

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
