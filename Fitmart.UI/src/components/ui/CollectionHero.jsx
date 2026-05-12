import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const FONT = "'Roboto','Helvetica',Arial,sans-serif";

export default function CollectionHero({ config, productCount, parentSlug }) {
  const [expanded, setExpanded] = useState(false);
  const crumbs = buildCrumbs(config, parentSlug);
  const needsToggle = config.description && config.description.length > 160;
  const descText = needsToggle && !expanded
    ? config.description.slice(0, 160).trimEnd() + '…'
    : config.description;

  return (
    <div style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e5e5e5', padding: '24px 0 20px' }}>
      {/* Breadcrumb */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '14px' }}>
        {crumbs.map((c, i) => (
          <React.Fragment key={c.label}>
            {i > 0 && <span style={{ color: '#b0b0b0', fontSize: '12px', fontFamily: FONT }}>›</span>}
            {c.href ? (
              <Link to={c.href} style={{ fontFamily: FONT, fontSize: '12px', color: '#6e6e6e', textDecoration: 'none' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#1b1b1b')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#6e6e6e')}>{c.label}</Link>
            ) : (
              <span style={{ fontFamily: FONT, fontSize: '12px', color: '#1b1b1b', fontWeight: 500 }}>{c.label}</span>
            )}
          </React.Fragment>
        ))}
      </nav>

      {/* H1 + count */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '14px', marginBottom: '10px' }}>
        <h1 style={{ fontFamily: FONT, fontSize: '28px', fontWeight: 700, color: '#1b1b1b', textTransform: 'uppercase', letterSpacing: '1.5px', margin: 0, lineHeight: 1 }}>
          {config.name}
        </h1>
        {productCount > 0 && (
          <span aria-live="polite" style={{ fontFamily: FONT, fontSize: '13px', color: '#6e6e6e' }}>
            {productCount} sản phẩm
          </span>
        )}
      </div>

      {/* Description */}
      {config.description && (
        <p style={{ fontFamily: FONT, fontSize: '13px', color: '#6e6e6e', lineHeight: '1.65', margin: '0 0 4px', maxWidth: '600px' }}>
          {descText}
          {needsToggle && (
            <button onClick={() => setExpanded(v => !v)} style={{ background: 'none', border: 'none', padding: '0 0 0 4px', cursor: 'pointer', fontFamily: FONT, fontSize: '13px', color: '#1b1b1b', fontWeight: 500, textDecoration: 'underline', textUnderlineOffset: '3px' }}>
              {expanded ? 'Thu gọn' : 'Xem thêm'}
            </button>
          )}
        </p>
      )}

      {/* Related tag pills */}
      {config.relatedTags && config.relatedTags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '14px' }}>
          {config.relatedTags.map((tag) => (
            <Link key={tag.slug} to={tag.slug} style={{ fontFamily: FONT, fontSize: '12px', color: '#1b1b1b', border: '1px solid #d4d4d4', padding: '4px 12px', textDecoration: 'none', borderRadius: '2px', display: 'inline-block', whiteSpace: 'nowrap', transition: 'border-color 125ms, background 125ms' }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#1b1b1b'; e.currentTarget.style.background = '#f7f7f7'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#d4d4d4'; e.currentTarget.style.background = 'transparent'; }}>
              {tag.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function buildCrumbs(config, parentSlug) {
  const crumbs = [{ label: 'Trang chủ', href: '/' }];
  if (parentSlug && parentSlug !== config.slug) {
    const label = parentSlug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    crumbs.push({ label, href: '/collections/' + parentSlug });
  }
  crumbs.push({ label: config.name, href: null });
  return crumbs;
}
