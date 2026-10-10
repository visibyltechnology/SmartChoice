import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, Tag, Truck, ShieldCheck } from 'lucide-react';
import { formatCurrency } from './Home';
import { useApp } from '../context/AppContext';

export default function Cart() {
  const { cart: items, updateCartQty: updateQty, removeFromCart: removeItem } = useApp();
  const [coupon, setCoupon] = useState('');

  const subtotal = items.reduce((sum, item) => sum + item.price * parseInt(item.qty || 1, 10), 0);
  const shipping = subtotal > 50000 ? 0 : 5000;
  const total = subtotal + shipping;

  return (
    <main style={{ padding: '20px 16px', boxSizing: 'border-box', width: '100%', maxWidth: '100vw', overflowX: 'hidden' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', width: '100%' }}>

        {/* Page Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <ShoppingCart size={22} color="var(--red)" />
          <h1 style={{ fontFamily: 'var(--font2)', fontSize: '22px', fontWeight: 900, color: 'var(--text-h)', margin: 0 }}>
            Shopping Cart
          </h1>
          <span style={{ fontSize: '13px', color: 'var(--text-m)', fontWeight: 400 }}>({items.length} items)</span>
        </div>

        {items.length === 0 ? (
          /* Empty State */
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)',
            padding: '48px 24px', textAlign: 'center', maxWidth: '480px', margin: '0 auto'
          }}>
            <ShoppingCart size={64} color="var(--border)" strokeWidth={1} style={{ margin: '0 auto 16px' }} />
            <h2 style={{ fontFamily: 'var(--font2)', fontSize: '20px', fontWeight: 900, marginBottom: '8px', color: 'var(--text-h)' }}>
              Your cart is empty
            </h2>
            <p style={{ color: 'var(--text-m)', marginBottom: '24px', fontSize: '14px' }}>
              Add some products to get started!
            </p>
            <Link to="/shop" style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: 'linear-gradient(135deg, var(--blue), var(--red))',
              color: '#fff', padding: '12px 24px', borderRadius: 'var(--r-md)',
              fontWeight: 800, fontSize: '14px', textDecoration: 'none'
            }}>
              Start Shopping <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          /* Cart layout — stacks on mobile */
          <div className="cart-page-layout">

            {/* LEFT: Cart Items */}
            <div className="cart-items-col">
              {items.map(item => (
                <div key={item.id} className="cart-item-card">
                  {/* Image */}
                  <Link to={`/product/${item.id}`} className="cart-item-img">
                    <img
                      src={item.imgUrl || item.image || (item.images && item.images[0]) || '/placeholder.jpg'}
                      alt={item.name}
                      onError={e => { e.target.style.display = 'none'; }}
                    />
                  </Link>

                  {/* Info */}
                  <div className="cart-item-body">
                    <div className="cart-item-top">
                      <div>
                        <div style={{ fontSize: '10px', color: 'var(--text-m)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px', marginBottom: '2px' }}>
                          {item.brand}
                        </div>
                        <Link to={`/product/${item.id}`} className="cart-item-name">{item.name}</Link>
                      </div>
                      <div className="cart-item-price">{formatCurrency(item.price * parseInt(item.qty || 1, 10))}</div>
                    </div>

                    <div className="cart-item-actions">
                      <div className="qty-control">
                        <button className="qty-btn" onClick={() => updateQty(item.id, -1)}><Minus size={13} /></button>
                        <span className="qty-val">{item.qty}</span>
                        <button className="qty-btn" onClick={() => updateQty(item.id, 1)}><Plus size={13} /></button>
                      </div>
                      <span style={{ fontSize: '11px', color: 'var(--text-m)' }}>{formatCurrency(item.price)} each</span>
                      <button onClick={() => removeItem(item.id)} style={{
                        display: 'flex', alignItems: 'center', gap: '4px',
                        background: 'transparent', border: 'none', color: 'var(--red)',
                        fontSize: '12px', fontWeight: 700, cursor: 'pointer', marginLeft: 'auto', padding: '4px'
                      }}>
                        <Trash2 size={13} /> Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* RIGHT: Order Summary */}
            <div className="cart-summary-col">
              <div className="cart-summary-box">
                <h3 style={{ fontFamily: 'var(--font2)', fontSize: '17px', fontWeight: 900, marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--border)', color: 'var(--text-h)' }}>
                  Order Summary
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0', marginBottom: '16px' }}>
                  <div className="summary-row">
                    <span>Subtotal ({items.length} items)</span>
                    <span style={{ color: 'var(--text-h)', fontWeight: 700 }}>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="summary-row">
                    <span>Delivery</span>
                    <span style={{ color: shipping === 0 ? 'var(--green)' : 'var(--text-h)', fontWeight: 700 }}>
                      {shipping === 0 ? 'FREE' : formatCurrency(shipping)}
                    </span>
                  </div>
                </div>

                {shipping > 0 && (
                  <div style={{
                    background: 'rgba(10,122,50,0.08)', border: '1px solid rgba(10,122,50,0.2)',
                    borderRadius: 'var(--r-sm)', padding: '10px 12px', marginBottom: '14px',
                    fontSize: '12px', color: 'var(--green)', display: 'flex', gap: '8px', alignItems: 'center'
                  }}>
                    <Truck size={13} style={{ flexShrink: 0 }} />
                    Add {formatCurrency(50000 - subtotal)} more for FREE delivery!
                  </div>
                )}

                {/* Coupon */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                  <div style={{
                    flex: 1, display: 'flex', alignItems: 'center', gap: '8px',
                    background: 'var(--surface2)', border: '1px solid var(--border)',
                    borderRadius: 'var(--r-sm)', padding: '0 12px', minWidth: 0
                  }}>
                    <Tag size={13} color="var(--text-m)" style={{ flexShrink: 0 }} />
                    <input
                      type="text"
                      placeholder="Coupon code"
                      value={coupon}
                      onChange={e => setCoupon(e.target.value)}
                      style={{ background: 'none', color: 'var(--text-h)', fontSize: '13px', border: 'none', flex: 1, padding: '10px 0', minWidth: 0, outline: 'none', width: '100%' }}
                    />
                  </div>
                  <button style={{
                    padding: '0 14px', background: 'var(--surface2)', border: '1.5px solid var(--border)',
                    borderRadius: 'var(--r-sm)', fontWeight: 700, fontSize: '13px', color: 'var(--text-h)',
                    cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0
                  }}>Apply</button>
                </div>

                {/* Total */}
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '14px 0', borderTop: '1px solid var(--border)', marginBottom: '16px'
                }}>
                  <span style={{ fontFamily: 'var(--font2)', fontSize: '16px', fontWeight: 900, color: 'var(--text-h)' }}>Total</span>
                  <span style={{ fontFamily: 'var(--font2)', fontSize: '20px', fontWeight: 900, color: 'var(--red)' }}>{formatCurrency(total)}</span>
                </div>

                <Link to="/checkout" style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  background: 'linear-gradient(135deg, var(--blue), var(--red))',
                  color: '#fff', padding: '15px', borderRadius: 'var(--r-md)',
                  fontWeight: 800, fontSize: '14px', textDecoration: 'none',
                  marginBottom: '14px', boxShadow: '0 4px 16px rgba(208,2,27,0.3)'
                }}>
                  Proceed to Checkout <ArrowRight size={16} />
                </Link>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: 'var(--text-m)' }}>
                    <ShieldCheck size={11} color="var(--green)" /> Secure Checkout
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: 'var(--text-m)' }}>
                    <Truck size={11} color="var(--blue-md)" /> Fast Delivery
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
