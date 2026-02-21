import React, { useEffect, useRef, useState, useCallback } from "react";
import * as faceapi from "face-api.js";

/**
 * Compact emotion detector — renders a small floating webcam thumbnail
 * with a pill badge showing the dominant detected emotion.
 *
 * Major accuracy overhaul:
 * - Aggressive weighted smoothing (10 frames)
 * - Sad/Subtle emotion boosts (2.5x)
 * - Neutral suppression (favor specific emotions if detected >5%)
 */
const EmotionDetector = ({ onEmotionDetected }) => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);
  const emotionHistoryRef = useRef([]);
  const [emotion, setEmotion] = useState("neutral");
  const [confidence, setConfidence] = useState(0);
  const [modelsLoaded, setModelsLoaded] = useState(false);

  // ── Configuration ──
  const HISTORY_SIZE = 10;      // frames to smooth over
  const DETECT_INTERVAL = 600;  // ms between detections — faster polling
  const INPUT_SIZE = 512;       // higher resolution for better accuracy
  const SCORE_THRESHOLD = 0.2;  // lower threshold to pick up subtle expressions

  // ── Stop camera helper ──
  const stopCamera = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    emotionHistoryRef.current = [];
  }, []);

  // Start webcam
  const startVideo = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn("EmotionDetector: Could not access camera", err);
    }
  }, []);

  // Load face-api models
  const loadModels = useCallback(async () => {
    try {
      await faceapi.nets.tinyFaceDetector.loadFromUri("/models/tiny_face_detector");
      await faceapi.nets.faceExpressionNet.loadFromUri("/models/face_expression_model");
      setModelsLoaded(true);
    } catch (err) {
      console.warn("EmotionDetector: Failed to load models", err);
    }
  }, []);

  // ── Weighted emotion smoothing with neutral suppression ──
  const getSmoothedEmotion = useCallback(() => {
    const history = emotionHistoryRef.current;
    if (history.length === 0) return { emotion: "neutral", confidence: 0 };

    const allEmotions = ["happy", "sad", "angry", "fearful", "disgusted", "surprised", "neutral"];
    const avg = {};

    for (const em of allEmotions) {
      let weightedSum = 0;
      let totalWeight = 0;
      for (let i = 0; i < history.length; i++) {
        const weight = (i + 1); // recent frames weighted higher
        weightedSum += (history[i][em] || 0) * weight;
        totalWeight += weight;
      }
      avg[em] = weightedSum / totalWeight;
    }

    // Aggressive boosts for subtle emotions
    avg.sad = avg.sad * 2.5;
    avg.fearful = avg.fearful * 2.0;
    avg.angry = avg.angry * 1.8;
    avg.disgusted = avg.disgusted * 1.6;

    // Neutral suppression: if any non-neutral emotion averages above 0.05 raw,
    // we drastically reduce neutral's weight to favor the specific emotion.
    const rawNonNeutralMax = Math.max(
      ...(allEmotions.filter(e => e !== "neutral").map(e => {
        let ws = 0, tw = 0;
        for (let i = 0; i < history.length; i++) {
          const w = i + 1;
          ws += (history[i][e] || 0) * w;
          tw += w;
        }
        return ws / tw;
      }))
    );
    if (rawNonNeutralMax > 0.05) {
      avg.neutral = avg.neutral * 0.5; // halve neutral's weight
    }

    // Cap all values at 1.0 for display
    for (const em of allEmotions) {
      avg[em] = Math.min(avg[em], 1.0);
    }

    const dominant = allEmotions.reduce((a, b) => avg[a] > avg[b] ? a : b);
    return { emotion: dominant, confidence: avg[dominant] };
  }, []);

  // Detect emotions
  useEffect(() => {
    if (!modelsLoaded) return;

    const options = new faceapi.TinyFaceDetectorOptions({
      inputSize: INPUT_SIZE,
      scoreThreshold: SCORE_THRESHOLD,
    });

    intervalRef.current = setInterval(async () => {
      if (!videoRef.current || videoRef.current.readyState < 2) return;

      try {
        const detections = await faceapi
          .detectAllFaces(videoRef.current, options)
          .withFaceExpressions();

        if (detections.length > 0) {
          const expressions = detections[0].expressions;

          emotionHistoryRef.current.push({ ...expressions });
          if (emotionHistoryRef.current.length > HISTORY_SIZE) {
            emotionHistoryRef.current.shift();
          }

          const { emotion: dominant, confidence: conf } = getSmoothedEmotion();
          setEmotion(dominant);
          setConfidence(conf);
          if (onEmotionDetected) onEmotionDetected(dominant);
        }
      } catch {
        // ignore occasional detection errors
      }
    }, DETECT_INTERVAL);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [modelsLoaded, onEmotionDetected, getSmoothedEmotion]);

  // Init on mount + cleanup listeners
  useEffect(() => {
    startVideo();
    loadModels();

    const handleBeforeUnload = () => stopCamera();
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        stopCamera();
      } else if (document.visibilityState === "visible") {
        startVideo();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      stopCamera();
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [startVideo, loadModels, stopCamera]);

  // Pill badge color
  const pillColor =
    emotion === "happy" || emotion === "surprised"
      ? "#4ade80"
      : emotion === "sad" || emotion === "angry" || emotion === "fearful" || emotion === "disgusted"
        ? "#f87171"
        : "#a3a3a3";

  return (
    <div
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "6px",
      }}
    >
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        width="120"
        height="90"
        style={{
          borderRadius: "12px",
          border: "2px solid rgba(143, 181, 163, 0.5)",
          boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
          objectFit: "cover",
          background: "#1a1a1a",
        }}
      />
      <span
        style={{
          fontSize: "11px",
          fontWeight: 600,
          fontFamily: "'Quicksand', sans-serif",
          padding: "2px 10px",
          borderRadius: "12px",
          background: pillColor,
          color: "#fff",
          textTransform: "capitalize",
          letterSpacing: "0.3px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
        }}
      >
        {emotion} {confidence > 0 ? `${Math.round(confidence * 100)}%` : ""}
      </span>
    </div>
  );
};

export default EmotionDetector;