"use client";

import { useEffect, useRef } from 'react';
import {
  getInputQualityLabel,
  getInputQualityRecommendation,
  useAudioAnalyzer,
} from '@/hooks/useAudioAnalyzer';

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
    clearRecording,
    availableMics,
    selectedDeviceId,
    setSelectedDeviceId,
    refreshDevices,
    inputLevel,
    inputQuality
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

  useEffect(() => {
    return () => {
      stopMic();
    };
  }, [stopMic]);

  const qualityLabel = getInputQualityLabel(inputQuality);
  const recommendation = getInputQualityRecommendation(inputQuality);

  const statusAnnouncement = isRecording
    ? 'Recording started.'
    : isMicActive
      ? `Microphone active. Current level ${inputLevel} percent, ${qualityLabel}.`
      : 'Microphone inactive.';

  return (
    <main style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', padding: '2rem' }}>
      <div className="reflection-wrapper" style={{ width: '100%', maxWidth: '580px' }}>
        <div className="glass-panel" style={{ textAlign: 'center' }}>

          <p className="sr-only" aria-live="polite" aria-atomic="true">{statusAnnouncement}</p>

          <h1>
            <span aria-hidden="true" style={{ display: 'inline-flex', alignItems: 'center', marginRight: '0.45rem', verticalAlign: 'middle', color: 'rgba(255,255,255,0.8)' }}>
              <svg width="26" height="26" viewBox="0 0 26 26" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 9.5 C 18 9.5, 21.5 13, 21.5 18" opacity="0.8" />
                <path d="M13 16.5 C 8 16.5, 4.5 13, 4.5 8" opacity="0.8" />
                <path d="M16.5 13 C 16.5 18, 13 21.5, 8 21.5" opacity="0.8" />
                <path d="M9.5 13 C 9.5 8, 13 4.5, 18 4.5" opacity="0.8" />
                <circle cx="13" cy="13" r="3" fill="currentColor" stroke="none" opacity="0.95" />
                <circle cx="13" cy="13" r="5" stroke="currentColor" strokeDasharray="1 3" opacity="0.6" strokeWidth="1.5" />
                <circle cx="19.5" cy="16.5" r="1.5" fill="currentColor" stroke="none" opacity="0.9" />
                <circle cx="6.5" cy="9.5" r="1.5" fill="currentColor" stroke="none" opacity="0.9" />
                <circle cx="9.5" cy="19.5" r="1.5" fill="currentColor" stroke="none" opacity="0.9" />
                <circle cx="16.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" opacity="0.9" />
                <circle cx="22" cy="7" r="1" fill="currentColor" stroke="none" opacity="0.6" />
                <circle cx="4" cy="19" r="1" fill="currentColor" stroke="none" opacity="0.6" />
                <circle cx="20" cy="21" r="0.6" fill="currentColor" stroke="none" opacity="0.5" />
                <circle cx="6" cy="5" r="0.6" fill="currentColor" stroke="none" opacity="0.5" />
              </svg>
            </span>
            L-Mic
          </h1>
          <p className="subtitle">Test your microphone quality instantly before your next meeting.</p>

          <div className="device-controls">
            <label htmlFor="mic-device" className="device-label">Microphone</label>
            <div className="device-row">
              <select
                id="mic-device"
                className="device-select"
                value={selectedDeviceId}
                onChange={(event) => setSelectedDeviceId(event.target.value)}
                disabled={isRecording || availableMics.length === 0}
                aria-label="Select microphone device"
              >
                {availableMics.length === 0 && <option value="">No microphones detected</option>}
                {availableMics.map((mic) => (
                  <option key={mic.deviceId} value={mic.deviceId}>
                    {mic.label}
                  </option>
                ))}
              </select>
              <button className="btn-outline" type="button" onClick={refreshDevices}>
                Refresh
              </button>
            </div>
            <p className="device-help">Select a mic, then click Enable Microphone to apply it.</p>
          </div>

          {error && (
            <div role="alert" aria-live="assertive" style={{ color: 'var(--danger)', marginBottom: '1rem', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px' }}>
              {error}
            </div>
          )}

          <div className={`status-badge ${isMicActive ? 'active' : ''}`} role="status" aria-live="polite" aria-atomic="true">
            {isRecording ? (
              <><span className="status-icon recording"></span> Recording...</>
            ) : isMicActive ? (
              <><span className="status-icon active"></span> Microphone Active</>
            ) : (
              <><span className="status-icon"></span> Microphone Inactive</>
            )}
          </div>

          {isMicActive && (
            <div className="level-panel">
              <div className="level-head">
                <span>Input Level</span>
                <span>{inputLevel}% • {qualityLabel}</span>
              </div>
              <div className="level-track" role="meter" aria-label="Microphone input level" aria-valuemin={0} aria-valuemax={100} aria-valuenow={inputLevel} aria-valuetext={`${inputLevel} percent`}>
                <div className={`level-fill ${inputQuality}`} style={{ width: `${Math.max(4, inputLevel)}%` }} />
              </div>
              <p className="recommendation" aria-live="polite">Tip: {recommendation}</p>
            </div>
          )}

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
              <button className="btn-outline blue" type="button" onClick={startMic}>
                🎙️ Enable Microphone
              </button>
            ) : (
              <>
                {!isRecording ? (
                  <button className="btn-outline red" type="button" onClick={startRecording}>
                    🔴 Start Recording
                  </button>
                ) : (
                  <button className="btn-outline red" type="button" style={{ borderColor: 'rgba(239,68,68,0.5)', background: 'rgba(239,68,68,0.1)' }} onClick={stopRecording}>
                    ⏹️ Stop Recording
                  </button>
                )}
                <button className="btn-outline" type="button" onClick={stopMic}>
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
                <button className="btn-outline red" type="button" onClick={clearRecording}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                  Discard
                </button>
              </div>
            </>
          )}

        </div>
      </div>

      <div style={{ position: 'fixed', bottom: '24px', left: '0', width: '100%', textAlign: 'center', fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)', zIndex: 50, letterSpacing: '0.5px' }}>
        Built by <a href="https://devleo.in" target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none', fontWeight: '500' }}>devLeo</a>
        <span style={{ margin: '0 0.65rem', color: 'rgba(255,255,255,0.35)' }}>•</span>
        <a href="https://github.com/devleo10/L-Mic" target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none', fontWeight: '500' }}>
          Star the repo
        </a>
      </div>
    </main>
  );
}
