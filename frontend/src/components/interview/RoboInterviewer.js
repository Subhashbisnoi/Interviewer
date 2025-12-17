import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import './RoboInterviewer.css';

const RoboInterviewer = forwardRef(({ questionText, onRequestNextQuestion, isInterviewActive = true }, ref) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);

  const [cameraAllowed, setCameraAllowed] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [connectionQuality, setConnectionQuality] = useState('good');

  useEffect(() => {
    let mounted = true;
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        });
        if (!mounted) return;
        setCameraAllowed(true);
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        console.warn('Camera permission denied or error', err);
        setCameraAllowed(false);
      }
    }
    startCamera();
    return () => {
      mounted = false;
      const s = videoRef.current?.srcObject;
      if (s?.getTracks) s.getTracks().forEach(t => t.stop());
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  // Simulate connection quality changes
  useEffect(() => {
    const interval = setInterval(() => {
      const qualities = ['good', 'fair', 'good', 'good'];
      setConnectionQuality(qualities[Math.floor(Math.random() * qualities.length)]);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Animate the AI interviewer when speaking
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let phase = 0; // Local phase variable

    const drawInterviewer = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Background gradient
      const bgGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      bgGradient.addColorStop(0, '#1e3a8a');
      bgGradient.addColorStop(1, '#0f172a');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Draw avatar circle with glow effect
      const glowGradient = ctx.createRadialGradient(centerX, centerY, 60, centerX, centerY, 100);
      glowGradient.addColorStop(0, isSpeaking ? 'rgba(59, 130, 246, 0.5)' : 'rgba(59, 130, 246, 0.2)');
      glowGradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
      ctx.fillStyle = glowGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 100, 0, Math.PI * 2);
      ctx.fill();

      // Main avatar circle
      const avatarGradient = ctx.createRadialGradient(centerX, centerY - 20, 0, centerX, centerY, 80);
      avatarGradient.addColorStop(0, '#3b82f6');
      avatarGradient.addColorStop(1, '#1e40af');
      ctx.fillStyle = avatarGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 80, 0, Math.PI * 2);
      ctx.fill();

      // AI icon - head
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(centerX, centerY - 10, 25, 0, Math.PI * 2);
      ctx.fill();

      // Eyes
      ctx.fillStyle = '#1e40af';
      ctx.beginPath();
      ctx.arc(centerX - 10, centerY - 15, 4, 0, Math.PI * 2);
      ctx.arc(centerX + 10, centerY - 15, 4, 0, Math.PI * 2);
      ctx.fill();

      // Mouth - animated when speaking
      ctx.strokeStyle = '#1e40af';
      ctx.lineWidth = 2;
      ctx.beginPath();
      if (isSpeaking) {
        const mouthOpenness = Math.sin(phase) * 3 + 4; // Use local phase
        ctx.ellipse(centerX, centerY - 5, 8, mouthOpenness, 0, 0, Math.PI);
      } else {
        ctx.arc(centerX, centerY - 5, 8, 0, Math.PI);
      }
      ctx.stroke();

      // Body
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(centerX - 20, centerY + 20, 40, 30);

      // Sound waves when speaking
      if (isSpeaking) {
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.6)';
        ctx.lineWidth = 2;

        for (let i = 1; i <= 3; i++) {
          const radius = 100 + (i * 20);
          const opacity = (Math.sin(phase + i) + 1) / 2;
          ctx.globalAlpha = opacity * 0.6;

          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, Math.PI * 0.2, Math.PI * 0.8);
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, Math.PI * 1.2, Math.PI * 1.8);
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
      }

      // Text label
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 18px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('AI Interviewer', centerX, canvas.height - 30);

      if (isSpeaking) {
        ctx.font = '14px Arial';
        ctx.fillStyle = '#3b82f6';
        ctx.fillText('Speaking...', centerX, canvas.height - 10);
      }
    };

    const animate = () => {
      drawInterviewer();
      if (isSpeaking) {
        phase += 0.20; // Slow increment for smooth mouth movement
      }
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isSpeaking]); // Only depend on isSpeaking, not wavePhase

  async function playQuestion(text) {
    if (!text) return;

    // Cancel any ongoing speech
    speechSynthesis.cancel();

    // Use browser's built-in speech synthesis
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
    };

    speechSynthesis.speak(utterance);
  }

  // Expose playQuestion method to parent via ref
  useImperativeHandle(ref, () => ({
    playQuestion: (text) => playQuestion(text || questionText)
  }));

  // Automatically play question when it changes
  useEffect(() => {
    if (questionText) {
      // Small delay to ensure everything is loaded
      const timer = setTimeout(() => {
        playQuestion(questionText);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [questionText]);

  return (
    <div className="robo-interviewer-container">
      <div className="video-grid">
        {/* AI Interviewer */}
        <div className={`participant-box interviewer ${connectionQuality}`}>
          <canvas
            ref={canvasRef}
            width={400}
            height={300}
            className="participant-video ai-interviewer-canvas"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              backgroundColor: '#0f172a'
            }}
          />
          <div className="participant-info">
            <span className="name">AI Interviewer</span>
            <div className="connection-quality">
              <div className={`quality-indicator ${connectionQuality}`} />
            </div>
          </div>
        </div>

        {/* User video */}
        <div className="participant-box user">
          {cameraAllowed === null && (
            <div className="camera-placeholder">
              <div className="loading">Requesting camera access...</div>
            </div>
          )}
          {cameraAllowed === false && (
            <div className="camera-placeholder">
              <div className="error">
                Camera access needed for interview experience
                <button onClick={() => window.location.reload()} className="retry-button">
                  Retry
                </button>
              </div>
            </div>
          )}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`participant-video ${!videoEnabled ? 'hidden' : ''}`}
          />
          {!videoEnabled && (
            <div className="video-off-placeholder">
              <div className="initial">Y</div>
            </div>
          )}
          <div className="participant-info">
            <span className="name">You</span>
          </div>
        </div>
      </div>
    </div>
  );
});

export default RoboInterviewer;