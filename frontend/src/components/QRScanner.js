import React, { useState, useRef, useEffect } from 'react';
import QrScanner from 'qr-scanner';

const QRScanner = ({ onScan, onError }) => {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);
  const qrScannerRef = useRef(null);

  useEffect(() => {
    return () => {
      // Cleanup on component unmount
      if (qrScannerRef.current) {
        qrScannerRef.current.stop();
        qrScannerRef.current.destroy();
      }
    };
  }, []);

  const handleScan = (result) => {
    if (result && result.data) {
      stopScanning();

      // Extract product ID from QR code URL
      try {
        const scannedText = result.data;
        const url = new URL(scannedText);
        const productId = url.searchParams.get('product_id');

        if (productId) {
          onScan(parseInt(productId));
        } else {
          onError('Invalid QR code: No product ID found');
        }
      } catch (error) {
        // If not a URL, assume it's a direct product ID
        const productId = parseInt(result.data);
        if (!isNaN(productId)) {
          onScan(productId);
        } else {
          onError('Invalid QR code format');
        }
      }
    }
  };

  const handleScanError = (error) => {
    console.error('QR Scanner Error:', error);
    setError('Camera access failed. Please check permissions.');
    onError('Failed to access camera. Please check permissions and try again.');
  };

  const startScanning = async () => {
    setError(null);

    try {
      // Check if browser supports camera
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported by this browser');
      }

      // First, explicitly request camera permission
      console.log('Requesting camera permission...');
      await navigator.mediaDevices.getUserMedia({ video: true });
      console.log('Camera permission granted');

      if (videoRef.current) {
        console.log('Creating QR Scanner...');
        qrScannerRef.current = new QrScanner(
          videoRef.current,
          handleScan,
          {
            highlightScanRegion: true,
            highlightCodeOutline: true,
            preferredCamera: 'environment', // Use back camera on mobile
          }
        );

        console.log('Starting QR Scanner...');
        await qrScannerRef.current.start();
        setScanning(true);
        console.log('QR Scanner started successfully');
      }
    } catch (err) {
      console.error('Failed to start camera:', err);

      if (err.name === 'NotAllowedError') {
        setError('Camera access denied. Please allow camera permissions and refresh the page.');
      } else if (err.name === 'NotFoundError') {
        setError('No camera found. Please ensure your device has a camera.');
      } else if (err.name === 'NotSupportedError') {
        setError('Camera not supported in this browser. Try Chrome, Firefox, or Safari.');
      } else {
        setError(`Failed to start camera: ${err.message}`);
      }
    }
  };

  const stopScanning = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.stop();
      qrScannerRef.current.destroy();
      qrScannerRef.current = null;
    }
    setScanning(false);
    setError(null);
  };

  return (
    <div className="qr-scanner">
      <h2>Scan Product QR Code</h2>

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
        {scanning ? (
          <div className="camera-container">
            <video
              ref={videoRef}
              style={{ width: '100%', maxWidth: '400px' }}
              playsInline
            />
            <p className="scanning-text">Point your camera at a QR code</p>
          </div>
        ) : (
          <div className="qr-placeholder">
            <div className="scan-prompt">
              <p>Click "Start Scanning" to activate camera</p>
              <p>Make sure to allow camera permissions when prompted</p>
            </div>
          </div>
        )}
      </div>

      <div className="scanner-controls">
        <button
          onClick={scanning ? stopScanning : startScanning}
          className="toggle-scan-btn"
        >
          {scanning ? 'Stop Scanning' : 'Start Scanning'}
        </button>
      </div>
    </div>
  );
};

export default QRScanner;