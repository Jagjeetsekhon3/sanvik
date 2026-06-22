const MOBILE_CSS = `
  *, *::before, *::after { box-sizing: border-box; }
  html { -webkit-text-size-adjust: 100%; }

  /* ── Navbar ── */
  @media (max-width: 768px) {
    .fashn-nav-links { display: none !important; }
    .fashn-hamburger { display: flex !important; }
    .fashn-logo { font-size: 1.1rem !important; }
  }
  @media (min-width: 769px) {
    .fashn-hamburger { display: none !important; }
  }

  /* ── Product Grids ── */
  @media (max-width: 1024px) {
    .fashn-product-grid-4 { grid-template-columns: repeat(3, 1fr) !important; }
    .fashn-product-grid-3 { grid-template-columns: repeat(2, 1fr) !important; }
  }
  @media (max-width: 768px) {
    .fashn-product-grid-4,
    .fashn-product-grid-3 { grid-template-columns: repeat(2, 1fr) !important; gap: 12px !important; }
    .fashn-section { padding: 48px 16px !important; }
    .fashn-section-header { flex-direction: column !important; gap: 8px !important; }
  }
  @media (max-width: 480px) {
    .fashn-product-grid-4,
    .fashn-product-grid-3 { grid-template-columns: repeat(2, 1fr) !important; gap: 8px !important; }
  }

  /* ── Shop Layout ── */
  @media (max-width: 768px) {
    .fashn-shop-layout { flex-direction: column !important; }
  }

  /* ── PDP ── */
  @media (max-width: 768px) {
    .fashn-pdp {
      grid-template-columns: 1fr !important;
      gap: 24px !important;
      padding: 20px 16px !important;
    }
    .fashn-pdp-sticky { position: relative !important; top: 0 !important; }
  }

  /* ── Cart Drawer ── */
  @media (max-width: 480px) {
    .fashn-cart-drawer { width: 100vw !important; }
  }

  /* ── Checkout ── */
  @media (max-width: 768px) {
    .fashn-checkout-grid { grid-template-columns: 1fr !important; gap: 0 !important; }
    .fashn-checkout-summary { order: -1 !important; position: relative !important; top: 0 !important; margin-bottom: 24px; }
    .fashn-checkout-3col { grid-template-columns: 1fr 1fr !important; }
  }
  @media (max-width: 480px) {
    .fashn-checkout-3col { grid-template-columns: 1fr !important; }
  }

  /* ── Footer ── */
  @media (max-width: 768px) {
    .fashn-footer-grid { grid-template-columns: 1fr 1fr !important; gap: 28px !important; }
    .fashn-footer-bottom { flex-direction: column !important; gap: 6px !important; text-align: center !important; }
  }
  @media (max-width: 480px) {
    .fashn-footer-grid { grid-template-columns: 1fr !important; }
  }

  /* ── Hero Banner ── */
  @media (max-width: 768px) {
    .fashn-hero-btns { flex-direction: column !important; width: 100% !important; padding: 0 20px !important; }
    .fashn-hero-btns a, .fashn-hero-btns span {
      width: 100% !important; text-align: center !important; padding: 14px !important;
    }
  }

  /* ── Wishlist grid ── */
  @media (max-width: 768px) {
    .fashn-wishlist-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 16px !important; }
  }

  /* ── Touch targets ── */
  @media (max-width: 768px) {
    input, select, textarea { font-size: 16px !important; }
    main { padding-top: 56px !important; }
  }

  /* ── Scrollbar ── */
  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.15); border-radius: 2px; }
`

export default MOBILE_CSS
