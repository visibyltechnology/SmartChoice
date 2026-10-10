import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { allProducts, productData } from '../data/productData';
import {
  Smartphone, Laptop, Tv, Headphones, Refrigerator, Camera, Watch,
  ShoppingCart, Heart, Truck, ShieldCheck, CheckCircle, RefreshCcw,
  Mail, Zap, ChevronLeft, ChevronRight, Star, Tag, ArrowRight,
  Flame, Clock, Grid, List, TrendingUp, Award, Package, Cpu
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import SEO from '../components/SEO';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

export const formatCurrency = (amount) => '₦' + (amount || 0).toLocaleString('en-NG');

/* ─── SKELETON LOADER ─── */
export const ProductSkeleton = ({ size = 'sm' }) => (
  <article className={`sc-card sc-card--${size} sc-skeleton`}>
    <div className="sc-card__img-wrap sc-skeleton__img"></div>
    <div className="sc-card__body">
      <div className="sc-skeleton__text sc-skeleton__text--title"></div>
      <div className="sc-skeleton__text sc-skeleton__text--stars"></div>
      <div className="sc-skeleton__text sc-skeleton__text--price"></div>
    </div>
  </article>
);

/* ─── PRODUCT CARD ─── */
export const ProductCard = ({ product, size = 'sm' }) => {
  const { addToCart, toggleWishlist, isInWishlist } = useApp();
  const inWishlist = isInWishlist(product.id);
  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  return (
    <article className={`sc-card sc-card--${size}`} tabIndex="0">
      <Link to={`/product/${product.id}`} style={{ display: 'contents' }}>
        <div className="sc-card__img-wrap">
          {discount > 0 && <span className="sc-card__discount">-{discount}%</span>}
          {product.badge === 'new' && !discount && <span className="sc-card__badge sc-card__badge--new">NEW</span>}
          {product.badge === 'hot' && !discount && <span className="sc-card__badge sc-card__badge--hot">🔥</span>}
          <button
            className={`sc-card__wish ${inWishlist ? 'active' : ''}`}
            aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
            onClick={e => { e.preventDefault(); toggleWishlist(product); }}
          >
            <Heart size={15} fill={inWishlist ? '#D0021B' : 'none'} />
          </button>
          <img
            src={product.imgUrl || product.image || (product.images && product.images[0]) || '/placeholder.jpg'}
            alt={product.name}
            className="sc-card__img"
          />
        </div>
        <div className="sc-card__body">
          {product.brand && <div className="sc-card__brand">{product.brand}</div>}
          <h3 className="sc-card__name">{product.name}</h3>
          <div className="sc-card__stars">
            {[1,2,3,4,5].map(s => (
              <Star key={s} size={11} fill={s <= Math.round(product.rating||4) ? '#F0B800' : 'none'} stroke={s <= Math.round(product.rating||4) ? '#F0B800' : '#ccc'} />
            ))}
            <span className="sc-card__reviews">({product.reviews || 0})</span>
          </div>
          <div className="sc-card__prices">
            <span className="sc-card__price">{formatCurrency(product.price)}</span>
            {product.originalPrice && <span className="sc-card__old">{formatCurrency(product.originalPrice)}</span>}
          </div>
        </div>
      </Link>
      {/* Add to Cart — hover overlay on desktop, always-visible button on mobile */}
      <div className="sc-card__hover-cta">
        <button
          onClick={e => { e.preventDefault(); addToCart(product); }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, color: '#fff', fontWeight: 700, fontSize: 12, fontFamily: 'inherit', width: '100%', justifyContent: 'center' }}
        >
          <ShoppingCart size={14} /> ADD TO CART
        </button>
      </div>
    </article>
  );
};

/* ─── DEAL CARD (for Smart Deals section) ─── */
const DealCard = ({ product }) => {
  const { addToCart, toggleWishlist, isInWishlist } = useApp();
  const inWishlist = isInWishlist(product.id);
  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 15;

  return (
    <article className="deal-card">
      <Link to={`/product/${product.id}`} style={{ display: 'contents' }}>
        <div className="deal-card__off">{discount}% OFF</div>
        <button
          className={`sc-card__wish ${inWishlist ? 'active' : ''}`}
          aria-label="wishlist"
          style={{ top: 36, right: 8 }}
          onClick={e => { e.preventDefault(); toggleWishlist(product); }}
        >
          <Heart size={14} fill={inWishlist ? '#D0021B' : 'none'} />
        </button>
        <div className="deal-card__img-wrap">
          <img
            src={product.imgUrl || product.image || (product.images && product.images[0]) || '/placeholder.jpg'}
            alt={product.name}
            className="deal-card__img"
          />
        </div>
        <div className="deal-card__body">
          {product.brand && <div className="sc-card__brand">{product.brand}</div>}
          <h3 className="deal-card__name">{product.name}</h3>
          <div className="deal-card__prices">
            <span className="deal-card__price">{formatCurrency(product.price)}</span>
            {product.originalPrice && <span className="deal-card__old">{formatCurrency(product.originalPrice)}</span>}
          </div>
          <button
            className="deal-card__cta"
            onClick={e => { e.preventDefault(); addToCart(product); }}
          >
            <ShoppingCart size={14} /> Add to Cart
          </button>
        </div>
      </Link>
    </article>
  );
};

/* ─── SCROLLABLE SLIDER (2-row horizontal) ─── */
const ScrollableProductSlider = ({ products, isLoading }) => {
  const scrollRef1 = useRef(null);
  const scrollRef2 = useRef(null);
  const scroll1 = dir => {
    if (scrollRef1.current) scrollRef1.current.scrollBy({ left: dir === 'left' ? -432 : 432, behavior: 'smooth' });
  };
  const scroll2 = dir => {
    if (scrollRef2.current) scrollRef2.current.scrollBy({ left: dir === 'left' ? -432 : 432, behavior: 'smooth' });
  };

  const len = isLoading || !products?.length ? 6 : products.length;
  const mid = Math.ceil(len / 2);
  const topRow = isLoading || !products?.length ? Array.from({ length: mid }) : products.slice(0, mid);
  const bottomRow = isLoading || !products?.length ? Array.from({ length: len - mid }) : products.slice(mid);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Top Row */}
      <div className="slider-container" style={{ margin: 0 }}>
        <button className="slider-btn left" onClick={() => scroll1('left')} aria-label="Scroll left"><ChevronLeft size={20} /></button>
        <div className="scrollable-row" ref={scrollRef1}>
          {topRow.map((p, i) => (!p || isLoading) ? <ProductSkeleton key={`t-${i}`} /> : <ProductCard key={p.id} product={p} />)}
        </div>
        <button className="slider-btn right" onClick={() => scroll1('right')} aria-label="Scroll right"><ChevronRight size={20} /></button>
      </div>

      {/* Bottom Row */}
      {bottomRow.length > 0 && (
        <div className="slider-container" style={{ margin: 0 }}>
          <button className="slider-btn left" onClick={() => scroll2('left')} aria-label="Scroll left"><ChevronLeft size={20} /></button>
          <div className="scrollable-row" ref={scrollRef2}>
            {bottomRow.map((p, i) => (!p || isLoading) ? <ProductSkeleton key={`b-${i}`} /> : <ProductCard key={p.id} product={p} />)}
          </div>
          <button className="slider-btn right" onClick={() => scroll2('right')} aria-label="Scroll right"><ChevronRight size={20} /></button>
        </div>
      )}
    </div>
  );
};

/* ─── LIVE COUNTDOWN ─── */
const useCountdown = (targetHours = 8) => {
  const getTarget = () => {
    const t = new Date();
    t.setHours(t.getHours() + targetHours, 0, 0, 0);
    return t;
  };
  const [target] = useState(getTarget);
  const [time, setTime] = useState({ h: '00', m: '00', s: '00' });
  useEffect(() => {
    const tick = () => {
      const diff = Math.max(0, target - Date.now());
      const h = String(Math.floor(diff / 3600000)).padStart(2, '0');
      const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
      const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');
      setTime({ h, m, s });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);
  return time;
};

const CountdownDisplay = () => {
  const countdown = useCountdown(8);
  return (
    <div className="sc-deals__countdown">
      <div className="sc-deals__unit"><span className="sc-deals__num sc-deals__num--anim">{countdown.h}</span><span className="sc-deals__unit-label">H</span></div>
      <span className="sc-deals__colon">:</span>
      <div className="sc-deals__unit"><span className="sc-deals__num sc-deals__num--anim">{countdown.m}</span><span className="sc-deals__unit-label">M</span></div>
      <span className="sc-deals__colon">:</span>
      <div className="sc-deals__unit"><span className="sc-deals__num sc-deals__num--anim">{countdown.s}</span><span className="sc-deals__unit-label">S</span></div>
    </div>
  );
};

/* ═══════════════════════════════════════
   HOME PAGE
   ═══════════════════════════════════════ */
export default function Home() {
  const { showToast } = useApp();

  const [data, setData] = useState({ flashSale: [], bestSellers: [], newArrivals: [], featured: [], all: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [heroSlides, setHeroSlides] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [heroAnimated, setHeroAnimated] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docSnap = await getDoc(doc(db, 'settings', 'site_settings'));
        if (docSnap.exists() && docSnap.data().heroSlides) {
          setHeroSlides(docSnap.data().heroSlides);
        }
      } catch (err) { console.error(err); }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      try {
        const { getProducts } = await import('../utils/productService');
        const db = await getProducts();
        if (db && db.length > 0) {
          setData({
            flashSale: db.slice(0, 10),
            bestSellers: db.slice(0, 8),
            newArrivals: db.slice(0, 12),
            featured: db.slice(0, 12),
            all: db
          });
        }
      } catch (err) { console.error(err); }
      setIsLoading(false);
    };
    loadProducts();
  }, []);

  useEffect(() => {
    if (!heroSlides.length) return;
    const t = setInterval(() => setCurrentSlide(p => (p + 1) % heroSlides.length), 7000);
    return () => clearInterval(t);
  }, [heroSlides.length]);

  useEffect(() => {
    setTimeout(() => setHeroAnimated(true), 100);
  }, []);

  /* ── category images ── */
  const CATS = [
    { img: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=150&q=80', name: 'Smartphones', color: '#0C2D6B' },
    { img: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=150&q=80', name: 'Laptops', color: '#D0021B' },
    { img: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=150&q=80', name: 'Televisions', color: '#0A7A32' },
    { img: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=150&q=80', name: 'Appliances', color: '#7B2FBE' },
    { img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=150&q=80', name: 'Inverters', color: '#F0B800' },
    { img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=150&q=80', name: 'Audio', color: '#E65100' },
    { img: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=150&q=80', name: 'Cameras', color: '#00796B' },
    { img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=150&q=80', name: 'Wearables', color: '#C2185B' },
  ];

  const PROMO_SECTIONS = [
    { title: 'Smartphones', accent: 'Best Deals', icon: <Smartphone size={16}/> },
    { title: 'Home Appliances', accent: 'Smart Savings', icon: <Refrigerator size={16}/> },
    { title: 'Laptops & Computers', accent: 'Top Picks', icon: <Laptop size={16}/> },
    { title: 'Televisions', accent: 'Cinema Experience', icon: <Tv size={16}/> },
    { title: 'Inverters & Solar', accent: 'Power Solutions', icon: <Zap size={16}/> },
    { title: 'Audio & Headphones', accent: 'Crystal Sound', icon: <Headphones size={16}/> },
    { title: 'Cameras', accent: 'Capture More', icon: <Camera size={16}/> },
    { title: 'Wearables', accent: 'Smart Living', icon: <Watch size={16}/> },
    { title: 'Mobile Accessories', accent: 'Essential Gear', icon: <Smartphone size={16}/> },
    { title: 'Best Sellers', accent: 'Customer Favourites', icon: <Award size={16}/> },
    { title: 'New Arrivals', accent: 'Just Landed', icon: <Package size={16}/> },
    { title: 'Clearance', accent: 'Massive Discounts', icon: <Tag size={16}/> },
  ];

  return (
    <main id="main">
      <SEO
        title="Smart Choice Electronics — Best Prices in Port Harcourt"
        description="Buy the latest smartphones, laptops, TVs, home appliances, inverters and more at Smart Choice Electronics Group. Trusted distributor in Port Harcourt with 100% genuine products and fast delivery."
        url="/"
      />

      {/* ════════════════════════════════════════
          HERO — split layout, animated entrance
          ════════════════════════════════════════ */}
      <section className="sc-hero" aria-label="Hero section">
        {/* Left panel */}
        <div className={`sc-hero__left ${heroAnimated ? 'sc-hero__left--in' : ''}`}>
          {/* SmartChoice vertical colour stripes */}
          <div className="sc-hero__stripes" aria-hidden="true">
            <span style={{ background: '#D0021B' }} />
            <span style={{ background: '#0A7A32' }} />
            <span style={{ background: '#F0B800' }} />
            <span style={{ background: '#2257C5' }} />
          </div>

          <div className="sc-hero__label">
            <Flame size={14} />  Port Harcourt's #1 Electronics Store
          </div>

          {/* Slide-driven headline or static */}
          {heroSlides.length > 0 ? (
            <div className="sc-hero__slides-text">
              {heroSlides.map((slide, i) => (
                <div key={i} className={`sc-hero__slide-text ${i === currentSlide ? 'active' : ''}`}>
                  <h1 className="sc-hero__h1">{slide.title}</h1>
                  <p className="sc-hero__sub">{slide.subtitle}</p>
                </div>
              ))}
            </div>
          ) : (
            <>
              <h1 className="sc-hero__h1">
                Nigeria's Best<br />
                <span className="sc-hero__h1-red">Electronics</span><br />
                At Your Fingertips
              </h1>
              <p className="sc-hero__sub">
                Phones · Laptops · TVs · Inverters · Home Appliances<br />
                100% Genuine. Best Prices. Fast Delivery.
              </p>
            </>
          )}

          <div className="sc-hero__actions">
            <Link to="/shop" className="sc-hero__btn-primary">
              Shop Now <ArrowRight size={16} />
            </Link>
            <Link to="/shop" className="sc-hero__btn-ghost">
              View Deals
            </Link>
          </div>

          {/* Stats bar */}
          <div className="sc-hero__stats">
            <div className="sc-hero__stat">
              <span className="sc-hero__stat-num">10K+</span>
              <span className="sc-hero__stat-label">Products</span>
            </div>
            <div className="sc-hero__stat-sep" />
            <div className="sc-hero__stat">
              <span className="sc-hero__stat-num">50+</span>
              <span className="sc-hero__stat-label">Brands</span>
            </div>
            <div className="sc-hero__stat-sep" />
            <div className="sc-hero__stat">
              <span className="sc-hero__stat-num">5K+</span>
              <span className="sc-hero__stat-label">Customers</span>
            </div>
          </div>
        </div>

        {/* Right panel — slide carousel image */}
        <div className="sc-hero__right">
          {heroSlides.length > 0 ? (
            <>
              <div className="sc-hero__carousel">
                {heroSlides.map((slide, i) => (
                  <div
                    key={i}
                    className={`sc-hero__slide ${i === currentSlide ? 'active' : ''}`}
                    style={{ backgroundImage: `url(${slide.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                  />
                ))}
                {/* Dot navigation */}
                <div className="sc-hero__dots">
                  {heroSlides.map((_, i) => (
                    <button
                      key={i}
                      className={`sc-hero__dot ${i === currentSlide ? 'active' : ''}`}
                      onClick={() => setCurrentSlide(i)}
                      aria-label={`Slide ${i + 1}`}
                    />
                  ))}
                </div>
                {/* Arrow buttons */}
                {heroSlides.length > 1 && (
                  <>
                    <button className="sc-hero__arrow sc-hero__arrow--l" onClick={() => setCurrentSlide(p => p === 0 ? heroSlides.length - 1 : p - 1)}>
                      <ChevronLeft size={22} />
                    </button>
                    <button className="sc-hero__arrow sc-hero__arrow--r" onClick={() => setCurrentSlide(p => (p + 1) % heroSlides.length)}>
                      <ChevronRight size={22} />
                    </button>
                  </>
                )}
              </div>
            </>
          ) : (
            /* Fallback decorative panel when no slides */
            <div className="sc-hero__deco">
              <div className="sc-hero__deco-circle" />
              <div className="sc-hero__deco-ring" />
              <div className="sc-hero__deco-images">
                <img src="https://images.unsplash.com/photo-1598327105666-5b89351cb31b?auto=format&fit=crop&w=300&q=80" alt="Phone" className="sc-hero__deco-img sc-hero__deco-img--1" />
                <img src="https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=300&q=80" alt="TV" className="sc-hero__deco-img sc-hero__deco-img--2" />
                <img src="https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=300&q=80" alt="Laptop" className="sc-hero__deco-img sc-hero__deco-img--3" />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ════════════════════════════════════════
          TRUST STRIP — horizontal below hero
          ════════════════════════════════════════ */}
      <div className="sc-trust-strip">
        <div className="sc-trust-strip__inner">
          {[
            { icon: <Truck size={20} />, title: 'Fast Delivery', sub: 'Citywide Port Harcourt' },
            { icon: <ShieldCheck size={20} />, title: 'Genuine Products', sub: '100% authentic brands' },
            { icon: <CheckCircle size={20} />, title: 'Secure Payment', sub: 'Moniepoint & transfers' },
            { icon: <RefreshCcw size={20} />, title: 'No Returns', sub: 'All sales are final' },
          ].map((t, i) => (
            <div key={i} className="sc-trust-strip__item">
              <span className="sc-trust-strip__icon">{t.icon}</span>
              <div>
                <div className="sc-trust-strip__title">{t.title}</div>
                <div className="sc-trust-strip__sub">{t.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="sc-page">

        {/* ════════════════════════════════════════
            CATEGORY PILLS — Premium Image Bubbles
            ════════════════════════════════════════ */}
        <section className="sc-cats" aria-label="Categories">
          <div className="sc-cats__grid">
            {CATS.map((c, i) => (
              <Link to="/shop" key={c.name} className="sc-cat-bubble" style={{ '--cat-clr': c.color, animationDelay: `${i * 0.05}s` }}>
                <div className="sc-cat-bubble__img-wrap">
                  <img src={c.img} alt={c.name} className="sc-cat-bubble__img" />
                </div>
                <span className="sc-cat-bubble__name">{c.name}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* ════════════════════════════════════════
            FEATURED PRODUCTS — right under hero
            ════════════════════════════════════════ */}
        {(isLoading || data.featured.length > 0) && (
          <section className="sc-section" aria-label="Featured products">
            <div className="sc-section__head">
              <div className="sc-section__title-wrap">
                <TrendingUp size={18} className="sc-section__icon" />
                <h2 className="sc-section__title">Featured <span>Products</span></h2>
              </div>
              <Link to="/shop" className="sc-section__more">View All <ArrowRight size={14} /></Link>
            </div>
            <ScrollableProductSlider products={data.featured} isLoading={isLoading} />
          </section>
        )}

        {/* ════════════════════════════════════════
            SMART DEALS — completely redesigned
            ════════════════════════════════════════ */}
        {(isLoading || data.flashSale.length > 0) && (
          <section className="sc-deals" aria-label="Smart Deals">
            {/* Header */}
            <div className="sc-deals__head">
              <div className="sc-deals__head-left">
                <div className="sc-deals__fire-wrap">
                  <Flame size={20} className="sc-deals__fire" />
                </div>
                <div>
                  <div className="sc-deals__eyebrow">Limited Time</div>
                  <h2 className="sc-deals__title">SMART DEALS</h2>
                </div>
              </div>

              {/* Live countdown */}
              <div className="sc-deals__timer">
                <Clock size={14} className="sc-deals__clock" />
                <span className="sc-deals__timer-label">Ends in</span>
                <CountdownDisplay />
              </div>

              <Link to="/shop" className="sc-deals__all">
                All Deals <ArrowRight size={14} />
              </Link>
            </div>

            {/* Deal cards — horizontal scroll */}
            <div className="sc-deals__track-wrap">
              <div className="sc-deals__track" id="deals-track">
                {isLoading
                  ? Array.from({ length: 6 }).map((_, i) => (
                      <article key={i} className="deal-card sc-skeleton" style={{ background: 'rgba(255,255,255,0.05)' }}>
                        <div style={{ aspectRatio: '1', background: 'rgba(255,255,255,0.08)', animation: 'pulse 1.5s infinite' }} />
                        <div className="deal-card__body">
                          <div style={{ height: 12, width: '80%', background: 'rgba(255,255,255,0.1)', borderRadius: 4, animation: 'pulse 1.5s infinite' }} />
                          <div style={{ height: 10, width: '55%', background: 'rgba(255,255,255,0.07)', borderRadius: 4, marginTop: 6, animation: 'pulse 1.5s infinite' }} />
                          <div style={{ height: 18, width: '65%', background: 'rgba(255,255,255,0.12)', borderRadius: 4, marginTop: 8, animation: 'pulse 1.5s infinite' }} />
                        </div>
                      </article>
                    ))
                  : data.flashSale.map(p => <DealCard key={p.id} product={p} />)}
              </div>
            </div>
          </section>
        )}

        {/* ════════════════════════════════════════
            PROMO BANNERS — 3 col
            ════════════════════════════════════════ */}
        <section className="sc-banners" aria-label="Promotions">
          <Link to="/shop" className="sc-banner sc-banner--blue">
            <div className="sc-banner__body">
              <div className="sc-banner__eyebrow">Top Brands</div>
              <div className="sc-banner__title">Samsung <span>&amp; Apple</span></div>
              <div className="sc-banner__sub">Latest models — up to ₦80,000 off</div>
              <span className="sc-banner__cta">Shop Phones →</span>
            </div>
            <Smartphone size={80} strokeWidth={0.8} className="sc-banner__bg-icon" />
          </Link>
          <Link to="/shop" className="sc-banner sc-banner--red">
            <div className="sc-banner__body">
              <div className="sc-banner__eyebrow">Best Sellers</div>
              <div className="sc-banner__title">Home <span>Appliances</span></div>
              <div className="sc-banner__sub">Fridges, ACs &amp; Washing Machines</div>
              <span className="sc-banner__cta">Shop Now →</span>
            </div>
            <Refrigerator size={80} strokeWidth={0.8} className="sc-banner__bg-icon" />
          </Link>
          <Link to="/shop" className="sc-banner sc-banner--green">
            <div className="sc-banner__body">
              <div className="sc-banner__eyebrow">Smart Energy</div>
              <div className="sc-banner__title">Inverters <span>&amp; Solar</span></div>
              <div className="sc-banner__sub">Power solutions for home &amp; office</div>
              <span className="sc-banner__cta">Shop Now →</span>
            </div>
            <Zap size={80} strokeWidth={0.8} className="sc-banner__bg-icon" />
          </Link>
        </section>

        {/* ════════════════════════════════════════
            NEW ARRIVALS
            ════════════════════════════════════════ */}
        {(isLoading || data.newArrivals.length > 0) && (
          <section className="sc-section" aria-label="New Arrivals">
            <div className="sc-section__head">
              <div className="sc-section__title-wrap">
                <Package size={18} className="sc-section__icon" style={{ color: '#0A7A32' }} />
                <h2 className="sc-section__title">New <span>Arrivals</span></h2>
              </div>
              <Link to="/shop" className="sc-section__more">View All <ArrowRight size={14} /></Link>
            </div>
            <ScrollableProductSlider products={data.newArrivals} isLoading={isLoading} />
          </section>
        )}

        {/* ════════════════════════════════════════
            DYNAMIC CATEGORY SECTIONS
            ════════════════════════════════════════ */}
        {(isLoading || data.all.length > 0) && PROMO_SECTIONS.map((sec, idx) => {
          const offset = isLoading ? 0 : (idx % data.all.length);
          const products = isLoading ? [] : [...data.all.slice(offset), ...data.all.slice(0, offset)];
          return (
            <section key={sec.title} className="sc-section" aria-label={sec.title}>
              <div className="sc-section__head">
                <div className="sc-section__title-wrap">
                  <span className="sc-section__icon" style={{ color: 'var(--red)' }}>{sec.icon}</span>
                  <h2 className="sc-section__title">{sec.title} <span>{sec.accent}</span></h2>
                </div>
                <Link to="/shop" className="sc-section__more">View All <ArrowRight size={14} /></Link>
              </div>
              <ScrollableProductSlider products={products} isLoading={isLoading} />
            </section>
          );
        })}

        {/* ════════════════════════════════════════
            NEWSLETTER
            ════════════════════════════════════════ */}
        <section className="sc-newsletter" aria-label="Newsletter">
          <div className="sc-newsletter__left">
            <Mail size={36} className="sc-newsletter__icon" />
            <div>
              <h2 className="sc-newsletter__title">Get <span>Smart Deals</span> in Your Inbox</h2>
              <p className="sc-newsletter__sub">Subscribe for new arrivals, exclusive discounts &amp; special offers from Smart Choice Electronics.</p>
            </div>
          </div>
          <form
            className="sc-newsletter__form"
            onSubmit={e => { e.preventDefault(); showToast('Subscribed! 🎉'); }}
          >
            <input type="email" className="sc-newsletter__input" placeholder="Enter your email address..." required />
            <button type="submit" className="sc-newsletter__btn">Subscribe</button>
          </form>
        </section>

      </div>
    </main>
  );
}

export const getProductIcon = (category) => {
  if (!category) return <Smartphone size={48} strokeWidth={1} />;
  const c = category.toLowerCase();
  if (c.includes('phone') || c.includes('tablet')) return <Smartphone size={48} strokeWidth={1} />;
  if (c.includes('laptop') || c.includes('computer')) return <Laptop size={48} strokeWidth={1} />;
  if (c.includes('tv') || c.includes('television')) return <Tv size={48} strokeWidth={1} />;
  if (c.includes('headphone') || c.includes('audio')) return <Headphones size={48} strokeWidth={1} />;
  if (c.includes('fridge') || c.includes('home')) return <Refrigerator size={48} strokeWidth={1} />;
  if (c.includes('camera')) return <Camera size={48} strokeWidth={1} />;
  if (c.includes('watch')) return <Watch size={48} strokeWidth={1} />;
  return <Smartphone size={48} strokeWidth={1} />;
};
