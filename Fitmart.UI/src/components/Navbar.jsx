import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Badge, Drawer, Collapse } from 'antd';
import {
  ShoppingCartOutlined,
  UserOutlined,
  SearchOutlined,
  HeartOutlined,
  MenuOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import navMenuData from '../config/navMenuData';

const { Panel } = Collapse;

// ─── Announcement Bar ───────────────────────────────────────────────────────
const AnnouncementBar = () => (
  <div
    style={{
      backgroundColor: '#1b1b1b',
      color: '#ffffff',
      textAlign: 'center',
      padding: '9px 16px',
      fontSize: '12px',
      fontWeight: 500,
      fontFamily: "'Roboto', 'Helvetica', Arial, sans-serif",
      letterSpacing: '0.5px',
    }}
    role="banner"
    aria-label="Thông báo khuyến mãi"
  >
    MIỄN PHÍ VẬN CHUYỂN VỚI ĐƠN HÀNG TỪ 500.000Đ
  </div>
);

// ─── Chevron Right (inline SVG — no extra import needed) ────────────────────
const ChevronRight = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 14 14"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    style={{ flexShrink: 0 }}
  >
    <path
      d="M5 3L9 7L5 11"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// ─── Mega Menu — Gymshark sidebar style ──────────────────────────────────────
// Zone 1 (260px) — left panel: group list with chevrons
// Zone 2 (280px) — right panel: sub-links of the active group
// Zone 3 (flex 1) — lifestyle image, full height, flush right
const MegaMenu = ({ category, isOpen, onMenuEnter, onMenuLeave, onLinkClick }) => {
  const groups = category?.groups ?? [];

  // Track which left-panel group is active. Reset to first group whenever menu opens.
  const [activeGroupId, setActiveGroupId] = useState(groups[0]?.id ?? null);

  useEffect(() => {
    if (isOpen && groups.length > 0) {
      setActiveGroupId(groups[0].id);
    }
  }, [isOpen, category?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const activeGroup = groups.find((g) => g.id === activeGroupId) ?? groups[0];

  // ── Left-panel item style (computed per item) ──────────────────────────────
  const leftItemStyle = (isActive) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    padding: '9px 20px 9px 24px',
    cursor: 'pointer',
    fontFamily: "'Roboto', 'Helvetica', Arial, sans-serif",
    fontSize: '14px',
    fontWeight: isActive ? 600 : 400,
    color: '#1b1b1b',
    backgroundColor: isActive ? '#f7f7f7' : 'transparent',
    borderLeft: isActive ? '2px solid #1b1b1b' : '2px solid transparent',
    transition: 'background-color 125ms ease-in-out, border-color 125ms ease-in-out, font-weight 0ms',
    boxSizing: 'border-box',
    userSelect: 'none',
    // reset button defaults
    border: 'none',
    borderLeft: isActive ? '2px solid #1b1b1b' : '2px solid transparent',
    background: isActive ? '#f7f7f7' : 'transparent',
    textAlign: 'left',
    listStyle: 'none',
  });

  return (
    <div
      role="region"
      aria-label={`Menu ${category?.label ?? ''}`}
      aria-hidden={!isOpen}
      onMouseEnter={onMenuEnter}
      onMouseLeave={onMenuLeave}
      style={{
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        zIndex: 200,
        backgroundColor: '#ffffff',
        borderTop: '1px solid #e5e5e5',
        borderBottom: '1px solid #e5e5e5',
        opacity: isOpen ? 1 : 0,
        transform: isOpen ? 'translateY(0)' : 'translateY(-8px)',
        pointerEvents: isOpen ? 'all' : 'none',
        transition: 'opacity 200ms ease-in-out, transform 200ms ease-in-out',
        display: 'flex',
        alignItems: 'stretch',
        minHeight: '260px',
      }}
    >
      {/* ── Zone 1: Left panel — group list ── */}
      <div
        role="list"
        aria-label="Danh mục"
        style={{
          width: '220px',
          flexShrink: 0,
          borderRight: '1px solid #e5e5e5',
          display: 'flex',
          flexDirection: 'column',
          padding: '16px 0',
          overflowY: 'auto',
        }}
      >
        {groups.map((group) => {
          const isActive = group.id === activeGroupId;
          return (
            <button
              key={group.id}
              role="listitem"
              aria-current={isActive ? 'true' : undefined}
              onMouseEnter={() => setActiveGroupId(group.id)}
              onClick={() => setActiveGroupId(group.id)}
              style={leftItemStyle(isActive)}
            >
              <span>{group.label}</span>
              <ChevronRight />
            </button>
          );
        })}
      </div>

      {/* ── Zone 2: Right panel — sub-links of active group ── */}
      <div
        style={{
          width: '240px',
          flexShrink: 0,
          padding: '28px 24px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Group heading */}
        <p
          style={{
            fontSize: '11px',
            fontWeight: 700,
            color: '#6e6e6e',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            marginTop: 0,
            marginBottom: '16px',
            fontFamily: "'Roboto', 'Helvetica', Arial, sans-serif",
          }}
        >
          {activeGroup?.label}
        </p>

        {/* Sub-links */}
        <ul
          style={{
            listStyle: 'none',
            margin: 0,
            padding: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            flex: 1,
          }}
        >
          {(activeGroup?.links ?? []).map((link) => (
            <li key={link.href}>
              <Link
                to={link.href}
                onClick={onLinkClick}
                style={{
                  fontSize: '14px',
                  color: '#6e6e6e',
                  textDecoration: 'none',
                  lineHeight: '1.5',
                  fontFamily: "'Roboto', 'Helvetica', Arial, sans-serif",
                  transition: 'color 125ms ease-in-out',
                  display: 'inline-block',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#1b1b1b';
                  e.currentTarget.style.textDecoration = 'underline';
                  e.currentTarget.style.textUnderlineOffset = '3px';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#6e6e6e';
                  e.currentTarget.style.textDecoration = 'none';
                }}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* CTA — bottom of right panel */}
        {category?.ctaLabel && (
          <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #e5e5e5' }}>
            <Link
              to={category.ctaHref}
              onClick={onLinkClick}
              style={{
                fontSize: '12px',
                fontWeight: 500,
                color: '#1b1b1b',
                textDecoration: 'underline',
                textUnderlineOffset: '3px',
                fontFamily: "'Roboto', 'Helvetica', Arial, sans-serif",
                transition: 'color 125ms ease-in-out',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#6e6e6e')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#1b1b1b')}
            >
              {category.ctaLabel}
            </Link>
          </div>
        )}
      </div>

      {/* ── Zone 3: Lifestyle image, flush right, full height ── */}
      <div style={{ flex: 1, overflow: 'hidden', minWidth: 0 }}>
        <img
          src={category?.featuredImage}
          alt={category?.featuredImageAlt}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center top',
            display: 'block',
          }}
          loading="lazy"
        />
      </div>
    </div>
  );
};

// ─── MenuGroup — used only by the mobile Drawer accordion ────────────────────
// (Desktop mega menu no longer uses this component)
const MenuGroup = ({ group, onLinkClick }) => (
  <div>
    <p
      style={{
        fontSize: '11px',
        fontWeight: 700,
        color: '#6e6e6e',
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        marginBottom: '10px',
        marginTop: 0,
        fontFamily: "'Roboto', 'Helvetica', Arial, sans-serif",
      }}
    >
      {group.label}
    </p>
    <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {group.links.map((link) => (
        <li key={link.href}>
          <Link
            to={link.href}
            onClick={onLinkClick}
            style={{
              fontSize: '14px',
              color: '#1b1b1b',
              textDecoration: 'none',
              lineHeight: '1.5',
              fontFamily: "'Roboto', 'Helvetica', Arial, sans-serif",
              transition: 'color 125ms ease-in-out',
              display: 'inline-block',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.textDecoration = 'underline';
              e.currentTarget.style.textUnderlineOffset = '3px';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.textDecoration = 'none';
            }}
          >
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  </div>
);

// ─── Main Navbar ──────────────────────────────────────────────────────────────
const Navbar = () => {
  const [activeMenu, setActiveMenu] = useState(null); // id of open mega menu
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const closeTimerRef = useRef(null);
  const navItemRefs = useRef({});
  const location = useLocation();

  // ── Close menu on route change ──────────────────────────────────────────
  useEffect(() => {
    setActiveMenu(null);
    setMobileDrawerOpen(false);
  }, [location.pathname]);

  // ── Scroll listener ─────────────────────────────────────────────────────
  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
        setActiveMenu(null); // close mega menu on scroll
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // ── Responsive listener ─────────────────────────────────────────────────
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // ── Escape key ──────────────────────────────────────────────────────────
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape' && activeMenu) {
        const ref = navItemRefs.current[activeMenu];
        setActiveMenu(null);
        ref?.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [activeMenu]);

  // ── Delayed close helpers ────────────────────────────────────────────────
  const scheduleClose = useCallback(() => {
    clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(() => setActiveMenu(null), 150);
  }, []);

  const cancelClose = useCallback(() => {
    clearTimeout(closeTimerRef.current);
  }, []);

  // ── NavItem handlers ─────────────────────────────────────────────────────
  const handleNavItemEnter = (id) => {
    cancelClose();
    setActiveMenu(id);
  };

  const handleNavItemLeave = () => {
    scheduleClose();
  };

  const handleNavItemKeyDown = (e, id) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setActiveMenu((prev) => (prev === id ? null : id));
    }
  };

  const handleMenuEnter = () => cancelClose();
  const handleMenuLeave = () => scheduleClose();

  const handleLinkClick = () => {
    clearTimeout(closeTimerRef.current);
    setActiveMenu(null);
  };

  return (
    <>
      <AnnouncementBar />

      {/* Sticky wrapper — includes header + mega menu so both are "sticky" as a unit */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backgroundColor: isScrolled ? '#ffffff' : '#ffffff',
          boxShadow: isScrolled ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
          transition: 'box-shadow 200ms ease-in-out',
        }}
      >
        {/* ── Header bar ── */}
        <header
          role="banner"
          style={{
            width: '100%',
            height: '76px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: isMobile ? '0 20px' : '0 60px',
            boxSizing: 'border-box',
            backgroundColor: '#ffffff',
          }}
        >
          {/* NAV LEFT */}
          <nav
            role="navigation"
            aria-label="Menu chính"
            style={{ display: 'flex', gap: '28px', flex: 1 }}
          >
            {isMobile ? (
              <button
                id="hamburger-btn"
                aria-label="Mở menu điều hướng"
                aria-expanded={mobileDrawerOpen}
                aria-controls="mobile-drawer"
                onClick={() => setMobileDrawerOpen(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  color: '#1b1b1b',
                }}
              >
                <MenuOutlined style={{ fontSize: '22px' }} />
              </button>
            ) : (
              navMenuData.map((item) => {
                const isActive = activeMenu === item.id;
                return (
                  <button
                    key={item.id}
                    id={`nav-item-${item.id}`}
                    ref={(el) => (navItemRefs.current[item.id] = el)}
                    aria-haspopup="true"
                    aria-expanded={isActive}
                    aria-controls={`mega-menu-${item.id}`}
                    onMouseEnter={() => handleNavItemEnter(item.id)}
                    onMouseLeave={handleNavItemLeave}
                    onKeyDown={(e) => handleNavItemKeyDown(e, item.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '0',
                      fontFamily: "'Roboto', 'Helvetica', Arial, sans-serif",
                      fontSize: '14px',
                      fontWeight: 500,
                      color: '#1b1b1b',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      lineHeight: '76px',
                      textDecoration: 'none',
                      borderBottom: isActive ? '2px solid #1b1b1b' : '2px solid transparent',
                      paddingBottom: isActive ? '0' : '0',
                      outline: 'none',
                      // Focus-visible ring (WCAG 2.2)
                      boxShadow: 'none',
                      transition: 'border-color 125ms ease-in-out',
                    }}
                    onFocus={() => setActiveMenu(item.id)}
                    onBlur={handleNavItemLeave}
                    className={`nav-item-btn${isActive ? ' nav-item-btn--active' : ''}`}
                  >
                    {item.label}
                  </button>
                );
              })
            )}
          </nav>

          {/* NAV CENTER — Logo */}
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
            <Link
              to="/"
              id="nav-logo"
              aria-label="FITMART – Trang chủ"
              style={{
                fontSize: '24px',
                fontWeight: 900,
                color: '#1b1b1b',
                textDecoration: 'none',
                letterSpacing: '3px',
                fontFamily: "'Roboto', 'Helvetica', Arial, sans-serif",
              }}
            >
              FITMART
            </Link>
          </div>

          {/* NAV RIGHT — Icons */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '20px',
              flex: 1,
            }}
          >
            <button
              id="nav-search-btn"
              aria-label="Tìm kiếm sản phẩm"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', color: '#1b1b1b' }}
            >
              <SearchOutlined className="nav-icon" style={{ fontSize: '22px' }} />
            </button>

            <Link
              to="/profile"
              id="nav-account-link"
              aria-label="Tài khoản của tôi"
              style={{ display: 'flex', alignItems: 'center', color: '#1b1b1b' }}
            >
              <UserOutlined className="nav-icon" style={{ fontSize: '22px' }} />
            </Link>

            <Link
              to="/wishlist"
              id="nav-wishlist-link"
              aria-label="Danh sách yêu thích"
              style={{ display: 'flex', alignItems: 'center', color: '#1b1b1b' }}
            >
              <HeartOutlined className="nav-icon" style={{ fontSize: '22px' }} />
            </Link>

            <Link
              to="/cart"
              id="nav-cart-link"
              aria-label="Giỏ hàng (2 sản phẩm)"
              style={{ display: 'flex', alignItems: 'center', color: '#1b1b1b' }}
            >
              <Badge
                count={2}
                size="small"
                style={{ backgroundColor: '#1b1b1b', color: '#ffffff', fontWeight: 700 }}
                offset={[-2, 4]}
              >
                <ShoppingCartOutlined className="nav-icon" style={{ fontSize: '22px' }} />
              </Badge>
            </Link>
          </div>
        </header>

        {/* ── Mega Menu Panels (desktop only) ── */}
        {!isMobile && navMenuData.map((item) => (
          <MegaMenu
            key={item.id}
            category={item}
            isOpen={activeMenu === item.id}
            onMenuEnter={handleMenuEnter}
            onMenuLeave={handleMenuLeave}
            onLinkClick={handleLinkClick}
          />
        ))}
      </div>

      {/* ── Mobile Drawer ── */}
      <Drawer
        id="mobile-drawer"
        title={
          <Link
            to="/"
            onClick={() => setMobileDrawerOpen(false)}
            style={{ fontSize: '20px', fontWeight: 900, color: '#1b1b1b', textDecoration: 'none', letterSpacing: '2px' }}
          >
            FITMART
          </Link>
        }
        placement="left"
        open={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        width={320}
        closeIcon={<CloseOutlined style={{ fontSize: '18px', color: '#1b1b1b' }} />}
        styles={{
          header: { borderBottom: '1px solid #e5e4e7', padding: '20px 24px' },
          body: { padding: '0' },
        }}
        aria-label="Menu điều hướng di động"
      >
        <Collapse
          accordion
          ghost
          expandIconPosition="end"
          style={{ borderRadius: 0 }}
        >
          {navMenuData.map((category) => (
            <Panel
              key={category.id}
              header={
                <span
                  style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#1b1b1b',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    fontFamily: "'Roboto', 'Helvetica', Arial, sans-serif",
                  }}
                >
                  {category.label}
                </span>
              }
              style={{ borderBottom: '1px solid #e5e4e7' }}
            >
              <div style={{ padding: '0 0 12px 0' }}>
                {category.groups.map((group) => (
                  <div key={group.id} style={{ marginBottom: '20px' }}>
                    <p
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        color: '#6e6e6e',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        marginBottom: '10px',
                        padding: '0 24px',
                        fontFamily: "'Roboto', 'Helvetica', Arial, sans-serif",
                      }}
                    >
                      {group.label}
                    </p>
                    <ul style={{ listStyle: 'none', margin: 0, padding: '0 24px' }}>
                      {group.links.map((link) => (
                        <li key={link.href} style={{ marginBottom: '12px' }}>
                          <Link
                            to={link.href}
                            onClick={() => setMobileDrawerOpen(false)}
                            style={{
                              fontSize: '14px',
                              color: '#1b1b1b',
                              textDecoration: 'none',
                              fontFamily: "'Roboto', 'Helvetica', Arial, sans-serif",
                            }}
                          >
                            {link.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
                <div style={{ padding: '0 24px', borderTop: '1px solid #f0f0f0', paddingTop: '16px' }}>
                  <Link
                    to={category.ctaHref}
                    onClick={() => setMobileDrawerOpen(false)}
                    style={{
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#1b1b1b',
                      textDecoration: 'underline',
                      textUnderlineOffset: '3px',
                      fontFamily: "'Roboto', 'Helvetica', Arial, sans-serif",
                    }}
                  >
                    {category.ctaLabel}
                  </Link>
                </div>
              </div>
            </Panel>
          ))}
        </Collapse>
      </Drawer>

      {/* ── Focus-visible styles injected globally for nav buttons ── */}
      <style>{`
        .nav-item-btn:focus-visible {
          outline: 2px solid #1b1b1b;
          outline-offset: 4px;
          border-radius: 2px;
        }
        .nav-item-btn--active {
          border-bottom-color: #1b1b1b !important;
        }
        .nav-icon {
          color: #1b1b1b !important;
          transition: color 125ms ease-in-out;
        }
        .nav-icon:hover {
          color: #6e6e6e !important;
        }
      `}</style>
    </>
  );
};

export default Navbar;