import React, { useState, useRef, useEffect } from 'react';
import QrScanner from 'qr-scanner';

const SimpleQRScanner = ({ onScan, onError }) => {
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastScanned, setLastScanned] = useState(null);
  const videoRef = useRef(null);
  const qrScannerRef = useRef(null);

  // Handle QR code detection
  const handleQRDetection = (result) => {
    if (result && result.data) {
      console.log('QR Code detected:', result.data);

      // Prevent multiple scans of the same code
      if (lastScanned === result.data) {
        return;
      }

      setLastScanned(result.data);

      // Extract product ID from QR code URL or direct ID
      try {
        const scannedText = result.data;

        // Try to parse as URL first
        try {
          const url = new URL(scannedText);
          const productId = url.searchParams.get('product_id');

          if (productId) {
            console.log('Product ID from URL:', productId);
            stopScanning();
            onScan(parseInt(productId));
            return;
          }
        } catch (urlError) {
          // Not a URL, try as direct product ID
          const productId = parseInt(scannedText);
          if (!isNaN(productId)) {
            console.log('Direct Product ID:', productId);
            stopScanning();
            onScan(productId);
            return;
          }
        }

        // If neither URL nor direct ID worked
        onError('Invalid QR code format: No valid product ID found');
      } catch (error) {
        console.error('Error processing QR code:', error);
        onError('Error processing QR code');
      }
    }
  };

  // Initialize QR scanner when video element is ready
  useEffect(() => {
    if (scanning && videoRef.current && !qrScannerRef.current) {
      console.log('Initializing QrScanner instance...');

      // Create QrScanner instance
      const scanner = new QrScanner(
        videoRef.current,
        result => {
          console.log('QrScanner detected:', result);
          handleQRDetection(result);
        },
        {
          returnDetailedScanResult: true,
          highlightScanRegion: true,
          highlightCodeOutline: true,
          preferredCamera: 'environment',
        }
      );

      qrScannerRef.current = scanner;

      // Start the scanner
      scanner.start().then(() => {
        console.log('QrScanner started successfully');
        setLoading(false);
      }).catch(err => {
        console.error('Failed to start QrScanner:', err);
        setError(`Failed to start scanner: ${err.message}`);
        setLoading(false);
      });
    }

    // Cleanup
    return () => {
      if (qrScannerRef.current && !scanning) {
        console.log('Cleaning up QrScanner...');
        qrScannerRef.current.destroy();
        qrScannerRef.current = null;
      }
    };
  }, [scanning, videoRef.current]);

  const startScanning = async () => {
    setError(null);
    setLoading(true);
    console.log('Starting QR scanner...');

    try {
      // Check browser support
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported by this browser');
      }

      // Set QrScanner worker path
      QrScanner.WORKER_PATH = '/qr-scanner-worker.min.js';

      // Check if QR Scanner has camera permission
      const hasCamera = await QrScanner.hasCamera();
      console.log('Has camera:', hasCamera);

      if (!hasCamera) {
        throw new Error('No camera found on this device');
      }

      setScanning(true);
    } catch (err) {
      console.error('Error starting scanner:', err);

      if (err.name === 'NotAllowedError') {
        setError('Camera access denied. Please allow camera permissions and try again.');
      } else if (err.name === 'NotFoundError') {
        setError('No camera found. Please ensure your device has a camera.');
      } else {
        setError(`Failed to start camera: ${err.message}`);
      }
      setLoading(false);
      onError(`Camera error: ${err.message}`);
    }
  };

  const stopScanning = () => {
    console.log('Stopping scanner...');

    // Stop and destroy scanner
    if (qrScannerRef.current) {
      qrScannerRef.current.stop();
      qrScannerRef.current.destroy();
      qrScannerRef.current = null;
    }

    // Reset states
    setScanning(false);
    setLoading(false);
    setError(null);
    setLastScanned(null);
  };

  return (
    <div className="qr-scanner">
      <h2>QR Code Scanner</h2>

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
            <p>Initializing camera...</p>
          </div>
        )}

        {scanning && (
          <div className="camera-container">
            <video
              ref={videoRef}
              style={{
                width: '100%',
                maxWidth: '400px',
                height: 'auto',
                minHeight: '300px',
                border: '2px solid #007bff',
                borderRadius: '8px',
                backgroundColor: '#000',
                objectFit: 'cover'
              }}
            />
            <div style={{ marginTop: '10px' }}>
              <p className="scanning-text">📷 Point camera at QR code to scan</p>
              <p className="help-text">QR scanner is active - detecting product codes...</p>
              {lastScanned && (
                <p className="help-text" style={{ fontSize: '12px', color: '#28a745' }}>
                  Last detected: {lastScanned.substring(0, 30)}...
                </p>
              )}
              <button
                onClick={() => {
                  console.log('Manual test: Simulating QR detection');
                  handleQRDetection({ data: 'https://p2vzpcsr-3000.inc1.devtunnels.ms/?product_id=1' });
                }}
                style={{
                  marginTop: '10px',
                  padding: '5px 10px',
                  fontSize: '12px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Test QR Detection (Product 1)
              </button>
            </div>
          </div>
        )}

        {!loading && !scanning && (
          <div className="qr-placeholder">
            <div className="scan-prompt">
              <p>Click "Start QR Scanner" to activate camera</p>
              <p>Scan product QR codes to open chat interface</p>
            </div>
          </div>
        )}
      </div>

      <div className="scanner-controls">
        <button
          onClick={scanning ? stopScanning : startScanning}
          className="toggle-scan-btn"
        >
          {scanning ? 'Stop Scanner' : 'Start QR Scanner'}
        </button>
      </div>
    </div>
  );
};

export default SimpleQRScanner;