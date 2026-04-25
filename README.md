# 🌌 L-Mic

A beautiful, lightweight, and blazingly fast web application to test your microphone quality before jumping into your next online meeting. Built with a premium deep space aesthetic, L-Mic provides real-time audio visualization and one-click recording and playback capabilities.

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
</p>

## ✨ Features

- **Real-time Audio Visualizer**: A buttery-smooth, neon-cyan audio visualizer utilizing the Web Audio API and HTML5 Canvas to map frequency bins in real-time.
- **One-Click Recording**: Instantly record audio using the native `MediaRecorder` API. 
- **Playback & Download**: Play your recording back right on the page to hear exactly how you'll sound to others, or download it as a `.webm` file.
- **Microphone Management**: Safely request microphone permissions and handle system cleanup without any memory leaks.
- **Premium Aesthetics**: Stunning glassmorphism UI overlaying a high-definition space background with dynamic text glow and micro-animations.

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

## 🛠️ Behind the Code

The audio visualization is handled by a custom React Hook (`useAudioAnalyzer`) which:
1. Connects the user's `MediaStream` to an `AudioContext`.
2. Passes it through an `AnalyserNode` tailored with a refined `fftSize` and soft `smoothingTimeConstant` for visual stability.
3. Extracts the buffer lengths and paints beautifully rounded pill bars natively onto a ref-bound `<canvas>` using `requestAnimationFrame`.

## 🧑‍💻 Author
**Built by [DevLeo](https://devleo.in)**
