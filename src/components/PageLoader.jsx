import React, { useState, useEffect } from 'react';

export default function PageLoader() {
  const [loading, setLoading] = useState(true);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    // Show loader for 1.2s to allow components to mount and feel premium
    const timer = setTimeout(() => {
      setFade(true); // Start fading out
      setTimeout(() => setLoading(false), 500); // Remove from DOM after fade
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  if (!loading) return null;

  return (
    <div className={`sc-page-loader ${fade ? 'fade-out' : ''}`}>
      <div className="sc-page-loader__logo-wrap">
        <img src="/smartchoice-logo.jpeg" alt="SmartChoice Logo" className="sc-page-loader__logo" />
        <div className="sc-page-loader__spinner"></div>
      </div>
      <h2 className="sc-page-loader__text">SmartChoice Electronics</h2>
    </div>
  );
}
