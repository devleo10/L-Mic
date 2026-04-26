# 🌌 L-Mic

A beautiful, lightweight, and blazingly fast web application to test your microphone quality before jumping into your next online meeting. Built with a premium deep space aesthetic, L-Mic provides real-time audio visualization and one-click recording and playback capabilities.

**Live demo:** [https://lmic.tech](https://lmic.tech)

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
</p>

## ✨ Features

- **Real-time Audio Visualizer**: A smooth canvas-driven visualizer powered by the Web Audio API. It renders microphone energy in real time so you can see how active your input is while you talk.
- **Microphone Device Picker**: Choose from available microphone devices, refresh the device list, and keep the selected mic saved between sessions.
- **Live Input Meter**: See whether your input is silent, low, healthy, loud, or clipping, with clear on-screen recommendations to improve quality.
- **One-Click Recording**: Start and stop recording with the native `MediaRecorder` API, with browser compatibility checks and safer lifecycle handling.
- **Playback & Download**: Review your recording in the browser and download it as a `.webm` file when you want to keep a copy.
- **Accessibility First**: Status updates, error messages, and input quality are announced clearly for assistive technologies.
- **Premium Aesthetics**: A glassmorphism UI layered over a deep space backdrop with polished motion, reflections, and high contrast controls.

## 🌐 Deployment

- **Production site:** [https://lmic.tech](https://lmic.tech)
- **Source repository:** [https://github.com/devleo10/L-Mic](https://github.com/devleo10/L-Mic)

## 🚀 Quick Start

Ensure you have Node.js installed, then:

1. **Clone the repository** (if applicable) or navigate to the project directory:
   ```bash
   cd L-Mic
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Open in Browser**: Navigate to [http://localhost:3000](http://localhost:3000) to see L-Mic running.

If you just want to try the app, open the live site at [https://lmic.tech](https://lmic.tech).

## 🛠️ Behind the Code

The audio visualization is handled by a custom React Hook (`useAudioAnalyzer`) which:
1. Connects the user's `MediaStream` to an `AudioContext`.
2. Passes it through an `AnalyserNode` tailored with a refined `fftSize` and soft `smoothingTimeConstant` for visual stability.
3. Extracts both frequency and time-domain data so the app can render the visualizer and calculate live input levels.
4. Paints rounded bars onto a ref-bound `<canvas>` using `requestAnimationFrame`.
5. Persists microphone selection and gives feedback when input is too quiet or clipping.

## 🧑‍💻 Author
**Built by [DevLeo](https://devleo.in)**
