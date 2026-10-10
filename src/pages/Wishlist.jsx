import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ProductCard } from './Home';

export default function Wishlist() {
  const { wishlist } = useApp();

  return (
    <main className="main-content" style={{ padding: '28px 20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 className="section-title" style={{ marginBottom: '24px' }}>
          <Heart size={28} color="var(--red)" /> Saved <span className="title-accent">Items</span>
          <span style={{ fontSize: '16px', color: 'var(--text-m)', fontWeight: 400 }}>({wishlist.length} items)</span>
        </h1>

        {wishlist.length === 0 ? (
          <div className="empty-state auth-card" style={{ margin: '0 auto', maxWidth: '600px' }}>
            <Heart size={80} color="var(--border)" strokeWidth={1} style={{ margin: '0 auto 10px' }} />
            <h2 style={{ fontFamily: 'var(--font2)', fontSize: '24px', fontWeight: 900, marginBottom: '8px' }}>Your wishlist is empty</h2>
            <p style={{ color: 'var(--text-m)', marginBottom: '24px' }}>Save items you love to keep track of them here.</p>
            <Link to="/shop" className="btn-primary">
              Start Shopping <ArrowRight size={18} />
            </Link>
          </div>
        ) : (
          <div className="shop-grid">
            {wishlist.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
