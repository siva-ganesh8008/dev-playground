# 📸 PuzzleCam — Gesture-Controlled Photo Booth

> Capture a photo using hand gestures, transform it into a 3×3 puzzle with a vintage black-and-white photo booth effect, and solve it entirely through pinch gestures—all directly in your browser.

---

## ✨ Features

- 📷 Capture photos using hand gestures
- 🖐️ Real-time hand tracking powered by MediaPipe
- 🧩 Interactive 3×3 puzzle
- 🎞️ Black-and-white photo booth effect
- ✋ Gesture-only interaction (no mouse or keyboard required)
- 🖼️ Save completed puzzles to a photo strip
- 📥 Download the final photo strip after completing three puzzles
- 🌐 Runs entirely in the browser
- ⚡ No backend required
- 📦 No installation or external dependencies

---

## 📖 Overview

PuzzleCam is a browser-based interactive photo booth controlled entirely by hand gestures. Users create a capture frame with both hands, take a picture, solve a gesture-controlled puzzle generated from the captured image, and save completed puzzles into a downloadable photo strip.

Everything runs client-side in the browser using the Canvas API and MediaPipe Hand Landmarker.

---

## 🖥️ System Requirements

- **Browser:** Chrome or Microsoft Edge (recommended), Firefox
- **Hardware:** Webcam
- **Internet Connection:** Required the first time to download the MediaPipe model (~10 MB)
- **Local Server:** Required (cannot be opened directly as a local file)

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/mishu006/Puzzle.git
cd Puzzle
```

### 2. Start a local server

The application uses ES Modules and webcam access, so it must be served over HTTP.

Install the **Live Server** extension for VS Code and click **Go Live**.

### 3. Open the application

```
http://localhost:5500
```

Allow camera access when prompted by your browser.

---

## 📁 Project Structure

```
Puzzle/
├── index.html        # Application entry point
├── app.js            # Main application logic
├── css/
│   └── styles.css    # Styling and layout
└── .gitignore
```

---

## ✋ Gesture Controls

| Gesture | Action |
|----------|--------|
| Both hands pinching | Freeze the capture area and start the countdown |
| One hand pinching over a puzzle piece | Drag the selected piece |
| Closed fist (hold) | Save the completed puzzle / Reset the board |

---

## 🔄 Application Workflow

1. Show both hands to the camera and create a frame using a pinch gesture.
2. Hold the gesture while the countdown completes.
3. The application automatically captures the photo.
4. The captured image is converted into a 3×3 puzzle with a monochrome photo booth effect.
5. Rearrange the puzzle pieces using pinch gestures.
6. Once the puzzle is solved, hold a closed fist to save it with a fragmentation animation.
7. After collecting three completed puzzles, download the final photo strip.

---

## 🛠️ Technology Stack

- **MediaPipe Tasks Vision** `v0.10.14` — Real-time hand landmark detection
- **Canvas 2D API** — Rendering, puzzle generation, and photo effects
- **JavaScript (ES Modules)** — Application logic
- **CSS Custom Properties** — Layout and theming

All external dependencies are loaded via CDN. No additional installation is required.

---

## 🧩 Troubleshooting

### Camera does not start

Make sure no other application (Zoom, Teams, Discord, etc.) is currently using your webcam.

### MediaPipe model fails to load

Check your internet connection. The MediaPipe model (~10 MB) is downloaded from `storage.googleapis.com`, while the runtime is loaded from `cdn.jsdelivr.net`. If either domain is blocked by your network, the application cannot start.

### Black screen

Ensure the application is running from a local HTTP server instead of opening the HTML file directly from your file explorer.

### Pinch gesture is not detected

Use adequate lighting and keep both hands clearly visible to the camera. Bring your thumb and index finger closer together until the yellow indicator activates.

---

## 🌍 Browser Compatibility

| Browser | Support |
|----------|---------|
| Chrome | ✅ Recommended |
| Microsoft Edge | ✅ Recommended |
| Firefox | ✅ Supported |
| Safari | ⚠️ Limited (may require additional permissions) |
| Mobile Browsers | ⚠️ Limited (desktop recommended) |

---
