import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useSearchParams } from 'react-router-dom';
import QRScanner from './components/QRScanner';
import SimpleQRScanner from './components/SimpleQRScanner';
import ChatInterface from './components/ChatInterface';
import { getProduct } from './services/api';
import './App.css';

const ChatPage = () => {
  const [searchParams] = useSearchParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const productId = searchParams.get('product_id');

    if (productId) {
      fetchProduct(parseInt(productId));
    } else {
      setLoading(false);
      setError('No product ID provided');
    }
  }, [searchParams]);

  const fetchProduct = async (productId) => {
    try {
      setLoading(true);
      const productData = await getProduct(productId);
      setProduct(productData);
      setError(null);
    } catch (err) {
      setError('Product not found');
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading product information...</div>;
  }

  if (error) {
    return (
      <div className="error">
        <h2>Error</h2>
        <p>{error}</p>
        <a href="/">Scan another QR code</a>
      </div>
    );
  }

  return <ChatInterface product={product} />;
};

const HomePage = () => {
  const [scannedProductId, setScannedProductId] = useState(null);

  const handleQRScan = (productId) => {
    setScannedProductId(productId);
    // Redirect to chat page with product ID
    window.location.href = `/?product_id=${productId}`;
  };

  const handleScanError = (error) => {
    alert(error);
  };

  return (
    <div className="home-page">
      <h1>Product Support Chat</h1>

      {/* QR Scanner with Camera */}
      <SimpleQRScanner onScan={handleQRScan} onError={handleScanError} />

      <div className="manual-entry">
        <h3>Enter product ID manually:</h3>
        <form onSubmit={(e) => {
          e.preventDefault();
          const productId = e.target.productId.value;
          if (productId) {
            handleQRScan(parseInt(productId));
          }
        }}>
          <input
            name="productId"
            type="number"
            placeholder="Enter product ID (try 1 or 2)"
            className="product-id-input"
          />
          <button type="submit">Go to Chat</button>
        </form>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={
            window.location.search.includes('product_id') ?
            <ChatPage /> :
            <HomePage />
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;