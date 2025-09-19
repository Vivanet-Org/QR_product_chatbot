import React, { useState, useRef, useEffect } from 'react';

const SimpleQRScanner = ({ onScan, onError }) => {
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Effect to set video stream when both video element and stream are ready
  useEffect(() => {
    if (streamRef.current && videoRef.current && scanning) {
      console.log('useEffect: Setting video stream');
      videoRef.current.srcObject = streamRef.current;

      // Setup video event handlers
      videoRef.current.onloadedmetadata = () => {
        console.log('Video metadata loaded');
        console.log('Video dimensions:', videoRef.current.videoWidth, 'x', videoRef.current.videoHeight);
        setVideoReady(true);
      };

      videoRef.current.oncanplay = () => {
        console.log('Video can play');
      };

      // Try to play the video
      videoRef.current.play().catch(e => {
        console.log('Autoplay prevented, but video should still show:', e);
      });
    }
  }, [scanning, streamRef.current]);

  useEffect(() => {
    return () => {
      // Cleanup on component unmount
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startScanning = async () => {
    setError(null);
    setLoading(true);
    setVideoReady(false);
    console.log('=== Camera Test Started ===');

    try {
      // Check if browser supports camera
      console.log('Checking browser support...');
      console.log('navigator.mediaDevices:', !!navigator.mediaDevices);
      console.log('getUserMedia:', !!navigator.mediaDevices?.getUserMedia);

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported by this browser');
      }

      console.log('Browser supports camera API');
      console.log('Current URL protocol:', window.location.protocol);
      console.log('Is secure context:', window.isSecureContext);

      // First try to get available devices
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        console.log('Available video devices:', videoDevices.length);
        console.log('Video devices:', videoDevices);
      } catch (deviceErr) {
        console.warn('Could not enumerate devices:', deviceErr);
      }

      console.log('Requesting camera permission...');

      // Request camera permission and get stream
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment' // Prefer back camera
        }
      });

      console.log('Camera permission granted, stream received');
      console.log('Stream tracks:', stream.getTracks());
      streamRef.current = stream;

      // Immediately update states
      setLoading(false);
      setScanning(true);

      console.log('States updated - loading=false, scanning=true');
      console.log('Stream stored, video will be set up via useEffect');
    } catch (err) {
      console.error('Failed to start camera:', err);
      console.error('Error name:', err.name);
      console.error('Error message:', err.message);

      if (err.name === 'NotAllowedError') {
        setError('Camera access denied. Please allow camera permissions and try again.');
      } else if (err.name === 'NotFoundError') {
        setError('No camera found. Please ensure your device has a camera.');
      } else if (err.name === 'NotSupportedError') {
        setError('Camera not supported in this browser. Try Chrome, Firefox, or Safari.');
      } else if (err.name === 'NotReadableError') {
        setError('Camera is already in use by another application.');
      } else if (err.name === 'OverconstrainedError') {
        setError('Camera constraints could not be satisfied.');
      } else {
        setError(`Failed to start camera: ${err.message}`);
      }
      setLoading(false);
      onError(`Camera error: ${err.message}`);
    }
  };

  const stopScanning = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setScanning(false);
    setLoading(false);
    setVideoReady(false);
    setError(null);
  };

  return (
    <div className="qr-scanner">
      <h2>Camera Test Scanner</h2>

      {error && (
        <div className="error-message">
          <p>{error}</p>
          <p>Please ensure:</p>
          <ul>
            <li>Camera permissions are granted</li>
            <li>You're using HTTPS (required for camera access)</li>
            <li>Your browser supports camera access</li>
          </ul>
        </div>
      )}

      <div className="qr-scanner-container">
        {loading && (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Requesting camera access...</p>
          </div>
        )}

        {!loading && (scanning || streamRef.current) && (
          <div className="camera-container">
            <video
              ref={videoRef}
              width="400"
              height="300"
              style={{
                width: '100%',
                maxWidth: '400px',
                height: 'auto',
                minHeight: '200px',
                border: '2px solid #007bff',
                borderRadius: '8px',
                backgroundColor: '#000',
                objectFit: 'cover'
              }}
              playsInline
              autoPlay
              muted
            />
            <div style={{ marginTop: '10px' }}>
              <p className="scanning-text">✅ Camera is working! QR detection would happen here</p>
              <p className="help-text">For now, use manual entry below to test the chat</p>
              <p className="help-text" style={{ fontSize: '10px', color: '#999' }}>
                Debug: Scanning={scanning ? 'true' : 'false'}, Loading={loading ? 'true' : 'false'}, Stream={streamRef.current ? 'active' : 'none'}
              </p>
            </div>
          </div>
        )}

        {!loading && !scanning && !streamRef.current && (
          <div className="qr-placeholder">
            <div className="scan-prompt">
              <p>Click "Start Camera Test" to test camera access</p>
              <p>This will help us debug camera permissions</p>
            </div>
          </div>
        )}
      </div>

      <div className="scanner-controls">
        <button
          onClick={scanning ? stopScanning : startScanning}
          className="toggle-scan-btn"
        >
          {scanning ? 'Stop Camera' : 'Start Camera Test'}
        </button>
      </div>
    </div>
  );
};

export default SimpleQRScanner;