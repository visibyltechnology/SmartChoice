import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function LocationTracker() {
  const [hasLocation, setHasLocation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if location is already granted or saved
    const savedLocation = localStorage.getItem('user_location');
    if (savedLocation) {
      setHasLocation(true);
    }
  }, []);

  const requestLocation = () => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      setTimeout(() => setLoading(false), 3000);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        // Save to local storage or context if needed
        localStorage.setItem('user_location', JSON.stringify({ latitude, longitude }));
        
        try {
          await addDoc(collection(db, 'visitor_locations'), {
            latitude,
            longitude,
            timestamp: serverTimestamp(),
            userAgent: navigator.userAgent
          });
        } catch (err) {
          console.error("Failed to save location to db", err);
        }

        setHasLocation(true);
        setLoading(false);
      },
      (err) => {
        let errorMsg = 'Location access denied. You must allow location access to continue.';
        if (err.code === 1) { // PERMISSION_DENIED
          errorMsg = 'Location access denied. Please enable it in your browser settings and try again.';
        } else if (err.code === 2) { // POSITION_UNAVAILABLE
          errorMsg = 'Location information is unavailable. Please try again.';
        } else if (err.code === 3) { // TIMEOUT
          errorMsg = 'The request to get user location timed out. Please try again.';
        }
        
        setError(errorMsg);
        
        // Disable button for 3 seconds before they can try again
        setTimeout(() => {
          setLoading(false);
        }, 3000);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );
  };

  if (hasLocation) {
    return null;
  }

  return (
    <div className="location-tracker-overlay">
      <div className="location-tracker-modal">
        <div className="location-icon">📍</div>
        <h2>Location Required</h2>
        <p>To provide you with the best experience and accurate delivery estimates, we need your precise location. Please accept location tracking to continue browsing.</p>
        
        {error && <div className="location-error">{error}</div>}
        
        <button 
          className="location-btn" 
          onClick={requestLocation}
          disabled={loading}
        >
          {loading ? 'Locating...' : 'Accept & Continue'}
        </button>
      </div>
    </div>
  );
}
