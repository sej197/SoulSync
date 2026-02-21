import React, { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";

const EmotionDetector = () => {
  const videoRef = useRef(null);
  const [emotion, setEmotion] = useState("Loading...");

  useEffect(() => {
    startVideo();
    loadModels();
  }, []);

  const startVideo = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoRef.current.srcObject = stream;
  };

  const loadModels = async () => {
    await faceapi.nets.tinyFaceDetector.loadFromUri("/models/tiny_face_detector");
    await faceapi.nets.faceExpressionNet.loadFromUri("/models/face_expression_model");

    detectEmotion();
  };

  const detectEmotion = () => {
    setInterval(async () => {
      if (!videoRef.current) return;

      const detections = await faceapi
        .detectAllFaces(
          videoRef.current,
          new faceapi.TinyFaceDetectorOptions()
        )
        .withFaceExpressions();

      if (detections.length > 0) {
        const expressions = detections[0].expressions;

        const dominant = Object.keys(expressions).reduce((a, b) =>
          expressions[a] > expressions[b] ? a : b
        );

        setEmotion(dominant);
      }
    }, 1000);
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h2>Live Emotion Detection</h2>
      <video
        ref={videoRef}
        autoPlay
        muted
        width="400"
        height="300"
        style={{ borderRadius: "10px" }}
      />
      <h3>Detected Emotion: {emotion}</h3>
    </div>
  );
};

export default EmotionDetector;