"use client";

import { useState, useRef, useCallback, useEffect } from 'react';

export type InputQuality = 'silent' | 'low' | 'good' | 'loud' | 'clipping';

export const SELECTED_MIC_STORAGE_KEY = 'lmic:selected-device-id';

export const getInputQuality = (level: number): InputQuality => {
    if (level <= 2) return 'silent';
    if (level <= 15) return 'low';
    if (level <= 70) return 'good';
    if (level <= 90) return 'loud';
    return 'clipping';
};

export const getInputQualityLabel = (quality: InputQuality): string => {
    if (quality === 'clipping') return 'Too loud';
    if (quality === 'loud') return 'Loud';
    if (quality === 'good') return 'Good';
    if (quality === 'low') return 'Low';
    return 'Silent';
};

export const getInputQualityRecommendation = (quality: InputQuality): string => {
    if (quality === 'clipping') return 'Audio may distort. Lower input gain or move farther from the mic.';
    if (quality === 'loud') return 'Input is strong. Move the mic slightly away for cleaner speech.';
    if (quality === 'good') return 'Input level looks healthy for calls and meetings.';
    if (quality === 'low') return 'Input is quiet. Move closer or increase microphone gain.';
    return 'No input detected. Check mute switch, cable, or microphone permissions.';
};

type MicDevice = {
    deviceId: string;
    label: string;
};

export const useAudioAnalyzer = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isMicActive, setIsMicActive] = useState(false);
    const [availableMics, setAvailableMics] = useState<MicDevice[]>([]);
    const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
    const [inputLevel, setInputLevel] = useState(0);
    const [inputQuality, setInputQuality] = useState<InputQuality>('silent');

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const streamRef = useRef<MediaStream | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const animationFrameRef = useRef<number | null>(null);
    const lastLevelUpdateRef = useRef(0);

    const refreshDevices = useCallback(async () => {
        try {
            if (!navigator.mediaDevices?.enumerateDevices) {
                return;
            }

            const devices = await navigator.mediaDevices.enumerateDevices();
            const mics = devices
                .filter((device) => device.kind === 'audioinput')
                .map((device, index) => ({
                    deviceId: device.deviceId,
                    label: device.label || `Microphone ${index + 1}`,
                }));

            setAvailableMics(mics);
            setSelectedDeviceId((previousId) => {
                if (previousId && mics.some((device) => device.deviceId === previousId)) {
                    return previousId;
                }

                return mics[0]?.deviceId ?? '';
            });
        } catch (err) {
            console.error(err);
        }
    }, []);

    const stopVisualizer = useCallback(() => {
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }
    }, []);

    const setAudioUrlSafely = useCallback((nextUrl: string | null) => {
        setAudioUrl((previousUrl) => {
            if (previousUrl && previousUrl !== nextUrl) {
                URL.revokeObjectURL(previousUrl);
            }
            return nextUrl;
        });
    }, []);

    const stopRecording = useCallback(() => {
        const recorder = mediaRecorderRef.current;
        if (!recorder) {
            return;
        }

        if (recorder.state !== 'inactive') {
            try {
                recorder.stop();
            } catch (err) {
                console.error(err);
                setError("Unable to stop recording cleanly.");
            }
        }

        setIsRecording(false);
    }, []);

    const closeCurrentSession = useCallback(() => {
        stopVisualizer();

        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            stopRecording();
        }

        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }

        if (audioContextRef.current) {
            audioContextRef.current.close().catch(console.error);
            audioContextRef.current = null;
        }

        analyserRef.current = null;
        setIsMicActive(false);
        setInputLevel(0);
        setInputQuality('silent');
    }, [stopRecording, stopVisualizer]);

    const stopMic = useCallback(() => {
        closeCurrentSession();
    }, [closeCurrentSession]);

    const startMic = useCallback(async () => {
        try {
            if (!navigator.mediaDevices?.getUserMedia) {
                setError("Microphone access is not supported in this browser.");
                return;
            }

            closeCurrentSession();

            const stream = await navigator.mediaDevices.getUserMedia({
                audio: selectedDeviceId
                    ? { deviceId: { exact: selectedDeviceId } }
                    : true
            });
            streamRef.current = stream;

            const BrowserAudioContext = window.AudioContext || (window as Window & typeof globalThis & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

            if (!BrowserAudioContext) {
                setError("Audio analysis is not supported in this browser.");
                return;
            }

            const audioCtx = new BrowserAudioContext();
            const analyser = audioCtx.createAnalyser();
            const source = audioCtx.createMediaStreamSource(stream);
            source.connect(analyser);

            analyser.fftSize = 128;
            analyser.smoothingTimeConstant = 0.85;
            audioContextRef.current = audioCtx;
            analyserRef.current = analyser;
            setIsMicActive(true);
            setError(null);

            await refreshDevices();
        } catch (err) {
            setError("Microphone access denied or unavailable. Please check your browser permissions.");
            console.error(err);
        }
    }, [closeCurrentSession, refreshDevices, selectedDeviceId]);

    const startRecording = useCallback(() => {
        if (!streamRef.current || isRecording) {
            return;
        }

        if (typeof window === 'undefined' || typeof window.MediaRecorder === 'undefined') {
            setError("Recording is not supported in this browser.");
            return;
        }

        setAudioUrlSafely(null);
        audioChunksRef.current = [];

        const mimeTypeCandidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'];
        const selectedMimeType = mimeTypeCandidates.find((mimeType) => MediaRecorder.isTypeSupported?.(mimeType));

        let mediaRecorder: MediaRecorder;
        try {
            mediaRecorder = selectedMimeType
                ? new MediaRecorder(streamRef.current, { mimeType: selectedMimeType })
                : new MediaRecorder(streamRef.current);
        } catch (err) {
            console.error(err);
            setError("Unable to start recording in this browser.");
            return;
        }

        mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
                audioChunksRef.current.push(e.data);
            }
        };

        mediaRecorder.onerror = () => {
            setError("A recording error occurred. Please try again.");
            setIsRecording(false);
        };

        mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            const url = URL.createObjectURL(audioBlob);
            setAudioUrlSafely(url);
        };

        mediaRecorder.start();
        mediaRecorderRef.current = mediaRecorder;
        setIsRecording(true);
        setError(null);
    }, [isRecording, setAudioUrlSafely]);

    const drawVisualizer = useCallback((canvas: HTMLCanvasElement) => {
        if (!analyserRef.current || !isMicActive) return;

        const analyser = analyserRef.current;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        const timeDomainData = new Uint8Array(analyser.fftSize);
        const ctx = canvas.getContext('2d')!;
        const visualizerBarColor = getComputedStyle(canvas).getPropertyValue('--visualizer-bar').trim() || '#cbd5e1';

        const draw = () => {
            animationFrameRef.current = requestAnimationFrame(draw);
            analyser.getByteFrequencyData(dataArray);
            analyser.getByteTimeDomainData(timeDomainData);

            let peak = 0;
            for (let i = 0; i < timeDomainData.length; i++) {
                const normalized = Math.abs(timeDomainData[i] - 128) / 128;
                if (normalized > peak) {
                    peak = normalized;
                }
            }

            const now = performance.now();
            if (now - lastLevelUpdateRef.current > 120) {
                const nextLevel = Math.min(100, Math.round(peak * 100));
                setInputLevel(nextLevel);
                setInputQuality(getInputQuality(nextLevel));
                lastLevelUpdateRef.current = now;
            }

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const padding = 20; // 20px padding from left/right/bottom
            const availableWidth = canvas.width - (padding * 2);
            const barTotalWidth = availableWidth / bufferLength;
            const actualBarWidth = Math.max(2, barTotalWidth - 3); // 3px gap

            let x = padding;

            ctx.fillStyle = visualizerBarColor;

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

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedDeviceId = window.localStorage.getItem(SELECTED_MIC_STORAGE_KEY);
            if (savedDeviceId) {
                setSelectedDeviceId(savedDeviceId);
            }
        }

        refreshDevices();

        if (!navigator.mediaDevices) {
            return;
        }

        const handleDeviceChange = () => {
            refreshDevices();
        };

        navigator.mediaDevices.addEventListener?.('devicechange', handleDeviceChange);
        return () => {
            navigator.mediaDevices.removeEventListener?.('devicechange', handleDeviceChange);
        };
    }, [refreshDevices]);

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        if (selectedDeviceId) {
            window.localStorage.setItem(SELECTED_MIC_STORAGE_KEY, selectedDeviceId);
        } else {
            window.localStorage.removeItem(SELECTED_MIC_STORAGE_KEY);
        }
    }, [selectedDeviceId]);

    useEffect(() => {
        return () => {
            stopMic();
            setAudioUrl((previousUrl) => {
                if (previousUrl) {
                    URL.revokeObjectURL(previousUrl);
                }
                return null;
            });
        };
    }, [stopMic]);

    const clearRecording = useCallback(() => {
        setAudioUrlSafely(null);
        audioChunksRef.current = [];
    }, [setAudioUrlSafely]);

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
        setAudioUrl: setAudioUrlSafely,
        clearRecording,
        availableMics,
        selectedDeviceId,
        setSelectedDeviceId,
        refreshDevices,
        inputLevel,
        inputQuality
    };
};
