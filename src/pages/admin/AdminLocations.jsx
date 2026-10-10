import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { MapPin, Search, Loader2 } from 'lucide-react';

export default function AdminLocations() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [fetchError, setFetchError] = useState(null);

  const fetchLocations = async () => {
      setLoading(true);
      setFetchError(null);
      try {
        const q = query(collection(db, 'visitor_locations'), orderBy('timestamp', 'desc'));
        const snap = await getDocs(q);
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setLocations(data);
      } catch (e) {
        console.error("Error fetching locations", e);
        setFetchError(e.message || 'Failed to load locations. Check Firestore rules.');
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchLocations();
  }, []);

  const filtered = locations.filter(l => {
    const q = search.toLowerCase();
    return !q || (l.userAgent && l.userAgent.toLowerCase().includes(q));
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: 900, margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <MapPin size={26} color="var(--primary)" /> Visitor Locations
          </h1>
          <p style={{ color: 'var(--gray-1)', fontSize: '13px', marginTop: '4px' }}>
            {locations.length} tracked location{locations.length !== 1 ? 's' : ''} from users who accepted the prompt.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button
            onClick={fetchLocations}
            disabled={loading}
            style={{ padding: '10px 18px', background: 'rgba(255,206,30,0.1)', border: '1px solid var(--primary)', color: 'var(--primary)', borderRadius: 'var(--radius-sm)', fontWeight: 700, fontSize: '13px', cursor: 'pointer', whiteSpace: 'nowrap', opacity: loading ? 0.6 : 1 }}
          >
            🔄 Refresh
          </button>
          <div style={{ position: 'relative', width: '280px' }}>
            <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-2)' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search user agents..."
              style={{ width: '100%', padding: '10px 12px 10px 34px', background: 'var(--dark-card)', border: '1.5px solid var(--dark-border)', borderRadius: 'var(--radius-sm)', color: 'var(--white)', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
              onFocus={e => e.target.style.borderColor = 'var(--primary)'} onBlur={e => e.target.style.borderColor = 'var(--dark-border)'} />
          </div>
        </div>
      </div>

      {fetchError ? (
        <div style={{ textAlign: 'center', padding: '60px', background: 'rgba(255,61,0,0.05)', border: '1px solid rgba(255,61,0,0.2)', borderRadius: 'var(--radius-md)' }}>
          <MapPin size={48} color="var(--danger)" style={{ margin: '0 auto 16px' }} />
          <p style={{ color: 'var(--danger)', fontWeight: 700, marginBottom: '8px' }}>Failed to load locations</p>
          <p style={{ color: 'var(--gray-1)', fontSize: '13px', marginBottom: '16px' }}>{fetchError}</p>
          <p style={{ color: 'var(--gray-2)', fontSize: '12px' }}>This is likely a Firestore security rules issue. Make sure reads on <code style={{background:'rgba(255,255,255,0.05)', padding:'2px 6px', borderRadius:'4px'}}>visitor_locations</code> are allowed for admins.</p>
        </div>
      ) : loading ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <Loader2 className="spinner" size={48} color="var(--primary)" style={{ margin: '0 auto 12px' }} />
          <p style={{ color: 'var(--gray-1)' }}>Loading locations…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', background: 'var(--dark-card)', border: '1px solid var(--dark-border)', borderRadius: 'var(--radius-md)' }}>
          <MapPin size={56} color="var(--gray-2)" style={{ margin: '0 auto 16px' }} />
          <p style={{ color: 'var(--gray-1)', fontWeight: 600 }}>No locations found.</p>
        </div>
      ) : (
        <div style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--dark-border)', background: 'rgba(255,255,255,0.02)' }}>
                <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: 700, color: 'var(--gray-1)', textTransform: 'uppercase' }}>Time</th>
                <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: 700, color: 'var(--gray-1)', textTransform: 'uppercase' }}>Coordinates</th>
                <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: 700, color: 'var(--gray-1)', textTransform: 'uppercase' }}>User Agent</th>
                <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: 700, color: 'var(--gray-1)', textTransform: 'uppercase' }}>Map</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(loc => {
                const time = loc.timestamp?.toDate ? loc.timestamp.toDate().toLocaleString() : 'Just now';
                return (
                  <tr key={loc.id} style={{ borderBottom: '1px solid var(--dark-border)' }}>
                    <td style={{ padding: '16px 20px', fontSize: '14px', fontWeight: 500 }}>{time}</td>
                    <td style={{ padding: '16px 20px', fontSize: '14px' }}>
                      <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{loc.latitude?.toFixed(5)}</span>, <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{loc.longitude?.toFixed(5)}</span>
                    </td>
                    <td style={{ padding: '16px 20px', fontSize: '12px', color: 'var(--gray-1)', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {loc.userAgent || 'Unknown device'}
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <a href={`https://www.google.com/maps?q=${loc.latitude},${loc.longitude}`} target="_blank" rel="noreferrer" style={{ display: 'inline-block', background: 'rgba(255, 94, 0, 0.1)', color: 'var(--primary)', padding: '6px 12px', borderRadius: '4px', fontSize: '12px', fontWeight: 700, textDecoration: 'none' }}>
                        View on Map
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
