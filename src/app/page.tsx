"use client";

import { useEffect, useRef } from 'react';
import { useAudioAnalyzer } from '@/hooks/useAudioAnalyzer';

export default function Home() {
  const {
    isRecording,
    isMicActive,
    audioUrl,
    error,
    startMic,
    stopMic,
    startRecording,
    stopRecording,
    drawVisualizer,
    stopVisualizer,
    setAudioUrl
  } = useAudioAnalyzer();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (isMicActive && canvasRef.current) {
      drawVisualizer(canvasRef.current);
    } else {
      stopVisualizer();
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }

    return () => {
      stopVisualizer();
    };
  }, [isMicActive, drawVisualizer, stopVisualizer]);

  return (
    <main style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', padding: '2rem' }}>
      <div className="reflection-wrapper" style={{ width: '100%', maxWidth: '580px' }}>
        <div className="glass-panel" style={{ textAlign: 'center' }}>

          <h1>L-Mic</h1>
          <p className="subtitle">Test your microphone quality instantly before your next meeting.</p>

          {error && (
            <div style={{ color: 'var(--danger)', marginBottom: '1rem', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px' }}>
              {error}
            </div>
          )}

          <div className={`status-badge ${isMicActive ? 'active' : ''}`}>
            {isRecording ? (
              <><span className="status-icon recording"></span> Recording...</>
            ) : isMicActive ? (
              <><span className="status-icon active"></span> Microphone Active</>
            ) : (
              <><span className="status-icon"></span> Microphone Inactive</>
            )}
          </div>

          <div className="visualizer-container">
            <canvas
              ref={canvasRef}
              className="visualizer"
              width={600}
              height={140}
            />
          </div>

          <div className="controls-row">
            {!isMicActive ? (
              <button className="btn-outline blue" onClick={startMic}>
                🎙️ Enable Microphone
              </button>
            ) : (
              <>
                {!isRecording ? (
                  <button className="btn-outline red" onClick={startRecording}>
                    🔴 Start Recording
                  </button>
                ) : (
                  <button className="btn-outline red" style={{ borderColor: 'rgba(239,68,68,0.5)', background: 'rgba(239,68,68,0.1)' }} onClick={stopRecording}>
                    ⏹️ Stop Recording
                  </button>
                )}
                <button className="btn-outline" onClick={stopMic}>
                  ❌ Disable Mic
                </button>
              </>
            )}
          </div>

          {audioUrl && !isRecording && (
            <>
              <div className="divider"></div>
              <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', marginBottom: '1rem' }}>
                Your Recording
              </p>

              <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '9999px', padding: '4px' }}>
                {/* Embedded HTML5 audio player styled slightly via global CSS */}
                <audio controls src={audioUrl}>
                  Your browser does not support the audio element.
                </audio>
              </div>

              <div className="controls-row footer">
                <a href={audioUrl} download="mic-check-recording.webm" className="btn-outline blue" style={{ textDecoration: 'none' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                  Download
                </a>
                <button className="btn-outline red" onClick={() => setAudioUrl(null)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                  Discard
                </button>
              </div>
            </>
          )}

        </div>
      </div>

      <div style={{ position: 'fixed', bottom: '24px', left: '0', width: '100%', textAlign: 'center', fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)', zIndex: 50, letterSpacing: '0.5px' }}>
        Built by <a href="https://devleo.in" target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none', fontWeight: '500' }}>DevLeo</a>
      </div>
    </main>
  );
}
