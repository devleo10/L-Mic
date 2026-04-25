"use client";

import { useState, useRef, useCallback } from 'react';

export const useAudioAnalyzer = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isMicActive, setIsMicActive] = useState(false);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const streamRef = useRef<MediaStream | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const animationFrameRef = useRef<number | null>(null);

    const startMic = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const analyser = audioCtx.createAnalyser();
            const source = audioCtx.createMediaStreamSource(stream);
            source.connect(analyser);

            analyser.fftSize = 128; // gives 64 bins for thicker, cooler bars
            analyser.smoothingTimeConstant = 0.85; // buttery smooth animation
            audioContextRef.current = audioCtx;
            analyserRef.current = analyser;
            setIsMicActive(true);
            setError(null);
        } catch (err) {
            setError("Microphone access denied or unavailable. Please check your browser permissions.");
            console.error(err);
        }
    };

    const stopMic = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (audioContextRef.current) {
            audioContextRef.current.close().catch(console.error);
            audioContextRef.current = null;
        }
        setIsMicActive(false);
        if (isRecording) {
            stopRecording();
        }
    };

    const startRecording = () => {
        if (!streamRef.current) return;

        setAudioUrl(null);
        audioChunksRef.current = [];
        const mediaRecorder = new MediaRecorder(streamRef.current);

        mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
                audioChunksRef.current.push(e.data);
            }
        };

        mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            const url = URL.createObjectURL(audioBlob);
            setAudioUrl(url);
        };

        mediaRecorder.start();
        mediaRecorderRef.current = mediaRecorder;
        setIsRecording(true);
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const drawVisualizer = useCallback((canvas: HTMLCanvasElement) => {
        if (!analyserRef.current || !isMicActive) return;

        const analyser = analyserRef.current;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        const ctx = canvas.getContext('2d')!;

        const draw = () => {
            animationFrameRef.current = requestAnimationFrame(draw);
            analyser.getByteFrequencyData(dataArray);

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const padding = 20; // 20px padding from left/right/bottom
            const availableWidth = canvas.width - (padding * 2);
            const barTotalWidth = availableWidth / bufferLength;
            const actualBarWidth = Math.max(2, barTotalWidth - 3); // 3px gap

            let x = padding;

            // Beautiful glowing cyan color matching the theme perfectly
            ctx.fillStyle = '#00f2fe';

            for (let i = 0; i < bufferLength; i++) {
                const value = dataArray[i];
                const maxBarHeight = canvas.height - (padding * 2);
                // Min height equals the width, ensuring it forms a tiny circle when quiet
                const barHeight = Math.max(actualBarWidth, (value / 255) * maxBarHeight);

                ctx.beginPath();
                if (ctx.roundRect) {
                    ctx.roundRect(x, canvas.height - padding - barHeight, actualBarWidth, barHeight, actualBarWidth / 2);
                    ctx.fill();
                } else {
                    ctx.fillRect(x, canvas.height - padding - barHeight, actualBarWidth, barHeight);
                }

                x += barTotalWidth;
            }
        };

        draw();
    }, [isMicActive]);

    const stopVisualizer = useCallback(() => {
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }
    }, []);

    return {
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
    };
};
