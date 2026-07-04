import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sun, Moon, BarChart3, Users, DollarSign, TrendingUp, ArrowRight, Layers, CheckCircle, Star, Code, Bell, Search, Menu, Heart, MessageSquare, Tag, ShoppingBag, ShoppingCart, Sparkles, Palette, Pipette, Copy } from 'lucide-react';
import { getSemanticColors } from '../utils/colorUtils';

// ─── RGB string → hex ─────────────────────────────────────────────────────────
function rgbToHex(rgb) {
  const m = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!m) return null;
  return '#' + [m[1], m[2], m[3]]
    .map(n => parseInt(n, 10).toString(16).padStart(2, '0'))
    .join('');
}

// ─── Walk up the DOM to find the first element with a real background ─────────
function pickColor(x, y) {
  const els = document.elementsFromPoint(x, y);
  for (const el of els) {
    if (!el || el === document.documentElement) continue;
    const bg = window.getComputedStyle(el).backgroundColor;
    if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
      return rgbToHex(bg);
    }
  }
  return null;
}

export default function TemplatePreview({ isOpen, onClose, palette }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isDark, setIsDark] = useState(true);
  const [pickerPos, setPickerPos] = useState(null);
  const [pickerColor, setPickerColor] = useState(null);
  const [flashCopied, setFlashCopied] = useState(false);
  const flashRef = useRef(null);

  if (!palette || palette.length === 0) return null;

  const sc = getSemanticColors(palette);

  // Dynamic theme-aware style factories
  const bg       = isDark ? sc.bgDark     : sc.bgLight;
  const surface  = isDark ? sc.surfaceDark : sc.surfaceLight;
  const surfaceH = isDark ? sc.surfaceHDark : sc.surfaceHLight;
  const text     = isDark ? sc.textOnDark : sc.textOnLight;
  const muted    = isDark ? sc.mutedOnDark : sc.mutedOnLight;
  const border   = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
  const accent   = isDark ? sc.primaryLight : sc.primary;
  const accent2  = isDark ? sc.secondaryLight : sc.secondary;
  const accentDk = isDark ? sc.primary : sc.primaryDark;

  const tabs = [
    { id: 'dashboard', label: 'SaaS Dashboard' },
    { id: 'landing',   label: 'Landing Page' },
    { id: 'blog',      label: 'Blog / Content' },
    { id: 'uikit',     label: 'UI Kit Showcase' },
    { id: 'spec',      label: 'Design System Spec' },
    { id: 'ecommerce', label: 'E-Commerce Store' },
    { id: 'illustrations', label: '🎨 Illustrations' },
  ];

  const handleMouseMove = (e) => {
    setPickerPos({ x: e.clientX, y: e.clientY });
    const col = pickColor(e.clientX, e.clientY);
    if (col) setPickerColor(col);
  };

  const handleClick = async (e) => {
    if (!pickerColor) return;
    try {
      await navigator.clipboard.writeText(pickerColor.toUpperCase());
    } catch (_) {}
    setFlashCopied(true);
    if (flashRef.current) clearTimeout(flashRef.current);
    flashRef.current = setTimeout(() => setFlashCopied(false), 900);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-end overflow-hidden">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-0" />

          <motion.div
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 180 }}
            className="relative w-full max-w-5xl h-full bg-neutral-950 border-l border-white/8 shadow-2xl flex flex-col z-10 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/8 bg-neutral-900/60 shrink-0">
              <div className="flex items-center gap-2.5">
                <h3 className="font-bold text-sm text-white">Live Preview</h3>
                <span className="px-2 py-0.5 bg-white/5 border border-white/8 rounded-md text-[9px] text-white/40 font-bold tracking-widest uppercase">
                  {isDark ? 'Dark' : 'Light'} Mode
                </span>
                {/* Eyedropper hint */}
                <span className="flex items-center gap-1 px-2 py-0.5 bg-white/5 border border-white/8 rounded-md text-[9px] text-white/30 font-bold tracking-wide">
                  <Pipette size={9} /> Hover to pick · Click to copy
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex bg-neutral-800 p-0.5 rounded-lg border border-white/5">
                  <button onClick={() => setIsDark(false)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-[11px] font-bold transition-colors ${!isDark ? 'bg-white text-black' : 'text-white/50 hover:text-white'}`}>
                    <Sun size={11} /> Light
                  </button>
                  <button onClick={() => setIsDark(true)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-[11px] font-bold transition-colors ${isDark ? 'bg-white text-black' : 'text-white/50 hover:text-white'}`}>
                    <Moon size={11} /> Dark
                  </button>
                </div>
                <button onClick={onClose} className="p-2 rounded-full hover:bg-white/8 text-white/50 hover:text-white">
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-1.5 px-5 py-2.5 border-b border-white/5 shrink-0 bg-neutral-950">
              {tabs.map(t => (
                <button key={t.id} onClick={() => setActiveTab(t.id)}
                  className={`px-3.5 py-1.5 rounded-lg text-[11px] font-bold transition-all ${activeTab === t.id ? 'bg-white/10 text-white border border-white/10' : 'text-white/35 hover:text-white/60'}`}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* Preview Body — eyedropper zone */}
            <div
              className="flex-1 overflow-y-auto p-5 bg-[#0a0a0a]"
              style={{ cursor: 'none' }}
              onMouseMove={handleMouseMove}
              onMouseLeave={() => { setPickerPos(null); setPickerColor(null); }}
              onClick={handleClick}
            >
              <div className="w-full min-h-[600px] rounded-xl overflow-hidden transition-colors duration-500 shadow-2xl pb-10"
                style={{ backgroundColor: bg, color: text }}>

                {activeTab === 'dashboard' && <DashboardPreview {...{ bg, surface, surfaceH, text, muted, border, accent, accent2, accentDk, sc, isDark }} />}
                {activeTab === 'landing' && <LandingPreview {...{ bg, surface, surfaceH, text, muted, border, accent, accent2, accentDk, sc, isDark }} />}
                {activeTab === 'blog' && <BlogPreview {...{ bg, surface, surfaceH, text, muted, border, accent, accent2, accentDk, sc, isDark }} />}
                {activeTab === 'uikit' && <UiKitPreview {...{ bg, surface, surfaceH, text, muted, border, accent, accent2, accentDk, sc, isDark }} />}
                {activeTab === 'spec' && <SpecPreview {...{ bg, surface, surfaceH, text, muted, border, accent, accent2, accentDk, sc, isDark }} />}
                {activeTab === 'ecommerce' && <EcommercePreview {...{ bg, surface, surfaceH, text, muted, border, accent, accent2, accentDk, sc, isDark }} />}
                {activeTab === 'illustrations' && <IllustrationsPreview sc={sc} bg={bg} surface={surface} text={text} border={border} isDark={isDark} />}

              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* ── Eyedropper cursor overlay (fixed, pointer-events: none) ── */}
      {isOpen && pickerPos && (
        <div className="fixed z-[9999] pointer-events-none" style={{ left: pickerPos.x, top: pickerPos.y }}>
          {/* Crosshair ring */}
          <div style={{
            position: 'absolute',
            left: -10,
            top: -10,
            width: 20,
            height: 20,
            border: '2px solid white',
            borderRadius: '50%',
            boxShadow: '0 0 0 1px rgba(0,0,0,0.6)',
          }} />
          {/* Center dot */}
          <div style={{
            position: 'absolute',
            left: -2,
            top: -2,
            width: 4,
            height: 4,
            borderRadius: '50%',
            backgroundColor: 'white',
            boxShadow: '0 0 0 1px rgba(0,0,0,0.6)',
          }} />
          {/* Color chip tooltip */}
          {pickerColor && (
            <div style={{
              position: 'absolute',
              left: 16,
              top: -14,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 8px',
              backgroundColor: flashCopied ? 'rgba(52,211,153,0.95)' : 'rgba(0,0,0,0.88)',
              border: `1px solid ${flashCopied ? 'rgba(52,211,153,0.6)' : 'rgba(255,255,255,0.12)'}`,
              borderRadius: 8,
              backdropFilter: 'blur(8px)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
              transition: 'background-color 0.15s ease',
              whiteSpace: 'nowrap',
            }}>
              {/* Swatch */}
              <div style={{
                width: 12,
                height: 12,
                borderRadius: 3,
                backgroundColor: pickerColor,
                border: '1px solid rgba(255,255,255,0.25)',
                flexShrink: 0,
              }} />
              <span style={{
                fontFamily: 'monospace',
                fontSize: 11,
                fontWeight: 700,
                color: flashCopied ? '#064e3b' : '#fff',
                letterSpacing: '0.08em',
              }}>
                {flashCopied ? '✓ Copied!' : pickerColor.toUpperCase()}
              </span>
            </div>
          )}
        </div>
      )}
    </AnimatePresence>
  );
}


// ─── Dashboard ────────────────────────────────────────────────────────────────

function DashboardPreview({ bg, surface, surfaceH, text, muted, border, accent, accent2, accentDk, sc, isDark }) {
  return (
    <div className="flex h-full min-h-[600px] flex-col md:flex-row">
      {/* Sidebar */}
      <div className="w-full md:w-52 shrink-0 p-4 flex flex-col gap-1 border-b md:border-b-0 md:border-r" style={{ backgroundColor: surface, borderColor: border }}>
        <div className="flex items-center gap-2 px-3 py-2 mb-4">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: accent }}>
            <Layers size={14} style={{ color: isDark ? sc.bgDark : '#fff' }} />
          </div>
          <span className="text-xs font-black tracking-tight" style={{ color: text }}>ChromaCore</span>
        </div>
        {['Overview', 'Analytics', 'Customers', 'Settings'].map((item, i) => (
          <div key={item} className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer"
            style={{
              backgroundColor: i === 1 ? (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)') : 'transparent',
              color: i === 1 ? accent : muted,
            }}>
            {[<BarChart3 size={14} />, <TrendingUp size={14} />, <Users size={14} />, <Menu size={14} />][i]}
            <span>{item}</span>
            {i === 2 && <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-md" style={{ backgroundColor: accent + '20', color: accent }}>12</span>}
          </div>
        ))}
      </div>

      {/* Main content */}
      <div className="flex-1 p-6 flex flex-col gap-5">
        {/* Top bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-lg font-bold" style={{ color: text }}>Analytics</h2>
            <p className="text-[11px]" style={{ color: muted }}>Real-time performance overview</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs" style={{ backgroundColor: surface, border: `1px solid ${border}`, color: muted }}>
              <Search size={12} /> <span>Search...</span>
            </div>
            <div className="relative p-2 rounded-lg" style={{ backgroundColor: surface }}>
              <Bell size={14} style={{ color: muted }} />
              <div className="absolute top-1 right-1 w-2 h-2 rounded-full" style={{ backgroundColor: accent }} />
            </div>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ backgroundColor: accent, color: isDark ? sc.bgDark : '#fff' }}>JS</div>
          </div>
        </div>

        {/* Metric cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label: 'Monthly Revenue', value: '$48,259', change: '+12.3%', icon: <DollarSign size={15} />, color: accent },
            { label: 'Active Users', value: '1,894', change: '+8.1%', icon: <Users size={15} />, color: accent2 },
            { label: 'Conversion', value: '3.24%', change: '-0.4%', icon: <TrendingUp size={15} />, color: accentDk },
          ].map(card => (
            <div key={card.label} className="p-4 rounded-xl border" style={{ backgroundColor: surface, borderColor: border }}>
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: muted }}>{card.label}</span>
                <div className="p-1.5 rounded-lg" style={{ backgroundColor: card.color + '18', color: card.color }}>{card.icon}</div>
              </div>
              <div className="text-xl font-black" style={{ color: text }}>{card.value}</div>
              <span className="text-[10px] font-bold" style={{ color: card.change.startsWith('+') ? '#34d399' : '#f87171' }}>{card.change}</span>
            </div>
          ))}
        </div>

        {/* Progress bars */}
        <div className="p-4 rounded-xl border" style={{ backgroundColor: surface, borderColor: border }}>
          <h4 className="text-[10px] font-black uppercase tracking-wider mb-3" style={{ color: muted }}>Campaign Performance</h4>
          {[
            { label: 'Email Campaign', pct: 85, color: accent },
            { label: 'Social Ads', pct: 62, color: accent2 },
            { label: 'Organic Search', pct: 41, color: accentDk },
          ].map(bar => (
            <div key={bar.label} className="mb-3 last:mb-0">
              <div className="flex justify-between text-[11px] font-medium mb-1" style={{ color: text }}>
                <span>{bar.label}</span><span className="font-bold">{bar.pct}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: border }}>
                <div className="h-full rounded-full transition-all" style={{ width: `${bar.pct}%`, backgroundColor: bar.color }} />
              </div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="p-4 rounded-xl border" style={{ backgroundColor: surface, borderColor: border }}>
          <h4 className="text-[10px] font-black uppercase tracking-wider mb-3" style={{ color: muted }}>Recent Orders</h4>
          <div className="space-y-0">
            {['Emma Watson', 'Liam Chen', 'Sophia Park'].map((name, i) => (
              <div key={name} className="flex items-center justify-between py-2.5 border-b last:border-0" style={{ borderColor: border }}>
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold"
                    style={{ backgroundColor: [accent, accent2, accentDk][i] + '22', color: [accent, accent2, accentDk][i] }}>
                    {name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="text-[11px] font-bold" style={{ color: text }}>{name}</div>
                    <div className="text-[9px]" style={{ color: muted }}>Order #{3200 + i}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-bold" style={{ color: text }}>${[129, 89, 249][i]}.00</span>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-md"
                    style={{ backgroundColor: ['#34d399', accent, '#fbbf24'][i] + '18', color: ['#34d399', accent, '#fbbf24'][i] }}>
                    {['Paid', 'Pending', 'Refund'][i]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Landing Page ─────────────────────────────────────────────────────────────

function LandingPreview({ bg, surface, surfaceH, text, muted, border, accent, accent2, accentDk, sc, isDark }) {
  return (
    <div className="flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-4 border-b" style={{ borderColor: border }}>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md" style={{ backgroundColor: accent }} />
            <span className="text-sm font-black" style={{ color: text }}>ChromaUI</span>
          </div>
          <div className="flex gap-4">
            {['Features', 'Pricing', 'Docs'].map(l => (
              <span key={l} className="text-[11px] font-medium cursor-pointer hover:opacity-100 transition-opacity" style={{ color: muted }}>{l}</span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="text-[11px] font-bold px-3 py-1.5 rounded-lg" style={{ color: muted }}>Sign in</button>
          <button className="text-[11px] font-bold px-4 py-1.5 rounded-lg" style={{ backgroundColor: accent, color: isDark ? sc.bgDark : '#fff' }}>Get Started</button>
        </div>
      </nav>

      {/* Hero */}
      <div className="flex flex-col items-center text-center py-16 px-8">
        <span className="text-[10px] font-bold px-3 py-1 rounded-full mb-6 uppercase tracking-widest"
          style={{ backgroundColor: accent + '15', color: accent, border: `1px solid ${accent}30` }}>
          Now in public beta
        </span>
        <h1 className="text-4xl font-black tracking-tight leading-tight mb-4 max-w-lg" style={{ color: text }}>
          Design Systems, <span style={{ color: accent }}>Perfected</span>.
        </h1>
        <p className="text-sm leading-relaxed max-w-md mb-8" style={{ color: muted }}>
          Build production-ready color systems in seconds. Psychology-driven harmony, WCAG compliance, and instant code export.
        </p>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold shadow-lg"
            style={{ backgroundColor: accent, color: isDark ? sc.bgDark : '#fff' }}>
            Start Free <ArrowRight size={13} />
          </button>
          <button className="px-6 py-2.5 rounded-xl text-xs font-bold border"
            style={{ borderColor: border, color: text, backgroundColor: surface }}>
            View Documentation
          </button>
        </div>
      </div>

      {/* Feature cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 px-8 pb-12">
        {[
          { icon: <Layers size={18} />, title: 'Seed-Based', desc: 'Every color derived from one seed. Always cohesive.', col: accent },
          { icon: <CheckCircle size={18} />, title: 'WCAG Verified', desc: 'Automatic contrast ratio checking on every pair.', col: accent2 },
          { icon: <Code size={18} />, title: 'Export Ready', desc: 'CSS variables, Tailwind config, or JSON. One click.', col: accentDk },
        ].map(f => (
          <div key={f.title} className="p-5 rounded-xl border" style={{ backgroundColor: surface, borderColor: border }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: f.col + '15', color: f.col }}>{f.icon}</div>
            <h3 className="text-sm font-bold mb-1" style={{ color: text }}>{f.title}</h3>
            <p className="text-[11px] leading-relaxed" style={{ color: muted }}>{f.desc}</p>
          </div>
        ))}
      </div>

      {/* Pricing snippet */}
      <div className="px-8 pb-12">
        <div className="flex flex-col sm:flex-row gap-4">
          {[
            { name: 'Free', price: '$0', features: ['5 palettes', 'CSS export', 'Light/Dark'] },
            { name: 'Pro', price: '$9', features: ['Unlimited', 'All exports', 'Team sharing'], featured: true },
          ].map(p => (
            <div key={p.name} className="flex-1 p-5 rounded-xl border" style={{
              backgroundColor: p.featured ? accent + '08' : surface,
              borderColor: p.featured ? accent + '35' : border
            }}>
              <h4 className="text-sm font-bold mb-1" style={{ color: text }}>{p.name}</h4>
              <div className="text-2xl font-black mb-3" style={{ color: p.featured ? accent : text }}>{p.price}<span className="text-xs font-normal" style={{ color: muted }}>/mo</span></div>
              <ul className="space-y-1.5">
                {p.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-[11px]" style={{ color: muted }}>
                    <CheckCircle size={12} style={{ color: accent }} /> {f}
                  </li>
                ))}
              </ul>
              <button className="w-full mt-4 py-2 rounded-lg text-xs font-bold" style={{
                backgroundColor: p.featured ? accent : 'transparent',
                color: p.featured ? (isDark ? sc.bgDark : '#fff') : accent,
                border: p.featured ? 'none' : `1px solid ${border}`,
              }}>
                {p.featured ? 'Get Started' : 'Try Free'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonial */}
      <div className="px-8 pb-10">
        <div className="p-6 rounded-xl border" style={{ backgroundColor: surface, borderColor: border }}>
          <div className="flex gap-1 mb-3">
            {[1,2,3,4,5].map(i => <Star key={i} size={13} style={{ color: accent, fill: accent }} />)}
          </div>
          <p className="text-xs leading-relaxed italic mb-4" style={{ color: text }}>
            "ChromaShift replaced our entire color workflow. The seed-based system means every palette is instantly usable — no more tweaking 47 variables by hand."
          </p>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold"
              style={{ backgroundColor: accent2 + '22', color: accent2 }}>AK</div>
            <div>
              <div className="text-[11px] font-bold" style={{ color: text }}>Alex Kim</div>
              <div className="text-[10px]" style={{ color: muted }}>Design Lead, Vercel</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Blog / Content ───────────────────────────────────────────────────────────

function BlogPreview({ bg, surface, surfaceH, text, muted, border, accent, accent2, accentDk, sc, isDark }) {
  return (
    <div className="max-w-2xl mx-auto py-10 px-8">
      {/* Tags */}
      <div className="flex gap-2 mb-4">
        {['Color Theory', 'Design Systems'].map(tag => (
          <span key={tag} className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-md"
            style={{ backgroundColor: accent + '12', color: accent, border: `1px solid ${accent}25` }}>
            <Tag size={9} /> {tag}
          </span>
        ))}
      </div>

      {/* Headline */}
      <h1 className="text-3xl font-black leading-tight tracking-tight mb-3" style={{ color: text }}>
        The Hidden Science Behind Color Harmony & Interface Design
      </h1>
      <p className="text-xs mb-5" style={{ color: muted }}>8 min read · Published Jan 15, 2026</p>

      {/* Author */}
      <div className="flex items-center gap-3 py-3 mb-6 border-y" style={{ borderColor: border }}>
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold"
          style={{ backgroundColor: accent2 + '22', color: accent2 }}>HE</div>
        <div>
          <div className="text-xs font-bold" style={{ color: text }}>Helena Eastman</div>
          <div className="text-[10px]" style={{ color: muted }}>Director of Design, ChromaLabs</div>
        </div>
      </div>

      {/* Body */}
      <div className="space-y-4 text-xs leading-[1.8]" style={{ color: text }}>
        <p>
          <span className="text-2xl font-black float-left mr-2 mt-0.5" style={{ color: accent, lineHeight: 1 }}>E</span>
          very hue we encounter carries emotional weight. The human optic nerve doesn't simply catalog wavelengths — it translates them into cognitive and hormonal signals. In software design, understanding these signals is the difference between an interface that feels polished and one that feels chaotic.
        </p>

        <p style={{ color: isDark ? 'rgba(255,255,255,0.75)' : 'rgba(0,0,0,0.7)' }}>
          Material Design 3 introduced the HCT color space — Hue, Chroma, and Tone — which provides perceptually uniform color manipulation. Unlike HSL, where a yellow at 50% lightness appears far brighter than a blue at the same level, HCT guarantees that equal tone values produce equal perceived brightness.
        </p>

        {/* Code block */}
        <div className="rounded-xl overflow-hidden border my-2" style={{ borderColor: border }}>
          <div className="flex items-center gap-1.5 px-4 py-2 border-b" style={{ backgroundColor: surfaceH, borderColor: border }}>
            <div className="w-2 h-2 rounded-full bg-red-400/70" />
            <div className="w-2 h-2 rounded-full bg-yellow-400/70" />
            <div className="w-2 h-2 rounded-full bg-green-400/70" />
            <span className="ml-2 text-[9px] font-mono" style={{ color: muted }}>palette.js</span>
          </div>
          <pre className="p-4 text-[11px] font-mono leading-relaxed overflow-x-auto" style={{ backgroundColor: surface, color: text }}>
{`const palette = generateFromSeed({
  hue: 264,
  saturation: 55,
  mood: 'violet-dusk'
});
// → 9 harmonized colors with
//   WCAG-compliant contrast pairs`}
          </pre>
        </div>

        {/* Callout / Alert */}
        <div className="p-4 rounded-xl border-l-[3px] my-2" style={{ backgroundColor: accent + '08', borderLeftColor: accent }}>
          <p className="text-xs font-medium italic leading-relaxed" style={{ color: text }}>
            "Harmony in color is not merely an aesthetic choice — it is an accessibility requirement. Without proper lightness contrast, visual hierarchies collapse and users get lost."
          </p>
        </div>

        <p style={{ color: isDark ? 'rgba(255,255,255,0.75)' : 'rgba(0,0,0,0.7)' }}>
          The key insight is <strong>tinted neutrals</strong>. Professional palettes never use pure grey. Instead, backgrounds and surfaces carry a subtle hue tint matching the primary color family — creating visual cohesion that your eye perceives unconsciously.
        </p>
      </div>

      {/* Engagement section */}
      <div className="flex items-center gap-4 mt-8 pt-4 border-t" style={{ borderColor: border }}>
        {[
          { icon: <Heart size={14} />, label: '2.4k', col: accent },
          { icon: <MessageSquare size={14} />, label: '48', col: accent2 },
        ].map(e => (
          <button key={e.label} className="flex items-center gap-1.5 text-[11px] font-medium px-3 py-1.5 rounded-lg transition-colors"
            style={{ color: e.col, backgroundColor: e.col + '10' }}>
            {e.icon} {e.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── UI Kit Showcase ──────────────────────────────────────────────────────────

function UiKitPreview({ bg, surface, surfaceH, text, muted, border, accent, accent2, accentDk, sc, isDark }) {
  return (
    <div className="p-6 md:p-8 flex flex-col gap-8">
      <div>
        <h2 className="text-xl font-extrabold tracking-tight">Interactive UI Kit</h2>
        <p className="text-xs opacity-60">Interactive components demonstrating all 9 role tokens</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Buttons Showcase */}
        <div className="p-5 rounded-xl border flex flex-col gap-4" style={{ backgroundColor: surface, borderColor: border }}>
          <h3 className="text-xs font-black uppercase tracking-wider opacity-40">Buttons</h3>
          <div className="flex flex-wrap gap-2.5">
            <button className="px-4 py-2 rounded-lg text-xs font-bold transition-all hover:opacity-90 active:scale-95"
              style={{ backgroundColor: sc.primary, color: isDark ? sc.bgDark : '#fff' }}>
              Primary Neutral
            </button>
            <button className="px-4 py-2 rounded-lg text-xs font-bold transition-all hover:opacity-90 active:scale-95"
              style={{ backgroundColor: sc.secondary, color: isDark ? sc.bgDark : '#fff' }}>
              Secondary Neutral
            </button>
            <button className="px-4 py-2 rounded-lg text-xs font-bold transition-all hover:opacity-90 active:scale-95"
              style={{ backgroundColor: sc.primaryLight, color: sc.primaryDark }}>
              Primary Light
            </button>
            <button className="px-4 py-2 rounded-lg text-xs font-bold transition-all hover:opacity-90 active:scale-95"
              style={{ backgroundColor: sc.secondaryLight, color: sc.secondaryDark }}>
              Secondary Light
            </button>
            <button className="px-4 py-2 rounded-lg text-xs font-bold border transition-all hover:bg-white/5 active:scale-95"
              style={{ borderColor: border, color: text }}>
              Outline Muted
            </button>
          </div>
        </div>

        {/* Status Badges */}
        <div className="p-5 rounded-xl border flex flex-col gap-4" style={{ backgroundColor: surface, borderColor: border }}>
          <h3 className="text-xs font-black uppercase tracking-wider opacity-40">Status Tags</h3>
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'Active', bg: sc.primaryLight, fg: sc.primaryDark },
              { label: 'Pending', bg: sc.secondaryLight, fg: sc.secondaryDark },
              { label: 'System', bg: sc.bgNeutral + '22', fg: sc.bgNeutral },
              { label: 'Critical', bg: sc.secondary, fg: isDark ? sc.bgDark : '#fff' },
              { label: 'Dark Token', bg: sc.primaryDark, fg: sc.primaryLight },
              { label: 'Neutral Dark', bg: sc.bgDark, fg: sc.bgLight },
            ].map(tag => (
              <span key={tag.label} className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider"
                style={{ backgroundColor: tag.bg, color: tag.fg }}>
                {tag.label}
              </span>
            ))}
          </div>
        </div>

        {/* Alerts & Notifications */}
        <div className="p-5 rounded-xl border flex flex-col gap-3 md:col-span-2" style={{ backgroundColor: surface, borderColor: border }}>
          <h3 className="text-xs font-black uppercase tracking-wider opacity-40">Contextual Alerts</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { title: 'Success Alert', desc: 'Operation completed successfully.', col: sc.primary, bg: sc.primaryLight + '15' },
              { title: 'Warning Alert', desc: 'Unusual traffic patterns detected.', col: sc.secondary, bg: sc.secondaryLight + '15' },
              { title: 'System Info', desc: 'Server maintenance scheduled for Sunday.', col: sc.bgNeutral, bg: sc.bgNeutral + '15' },
            ].map(alert => (
              <div key={alert.title} className="p-4 rounded-xl border-l-[3px] flex flex-col gap-1 text-left"
                style={{ backgroundColor: alert.bg, borderLeftColor: alert.col, borderColor: border }}>
                <span className="text-xs font-extrabold" style={{ color: alert.col }}>{alert.title}</span>
                <span className="text-[10px] leading-relaxed opacity-80">{alert.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 9-Color Chart Visualization */}
        <div className="p-5 rounded-xl border flex flex-col gap-4 md:col-span-2" style={{ backgroundColor: surface, borderColor: border }}>
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-black uppercase tracking-wider opacity-40">All 9 Palette Colors Side-by-Side</h3>
            <span className="text-[10px] font-mono opacity-50">Role Distribution Chart</span>
          </div>
          
          <div className="flex items-end justify-between h-44 pt-4 px-2 border-b" style={{ borderColor: border }}>
            {[
              { val: 40, label: 'BG Light', hex: sc.bgLight },
              { val: 55, label: 'BG Neut', hex: sc.bgNeutral },
              { val: 70, label: 'BG Dark', hex: sc.bgDark },
              { val: 85, label: 'Pri Light', hex: sc.primaryLight },
              { val: 100, label: 'Pri Neut', hex: sc.primary },
              { val: 90, label: 'Pri Dark', hex: sc.primaryDark },
              { val: 80, label: 'Sec Light', hex: sc.secondaryLight },
              { val: 95, label: 'Sec Neut', hex: sc.secondary },
              { val: 75, label: 'Sec Dark', hex: sc.secondaryDark },
            ].map(bar => (
              <div key={bar.label} className="flex flex-col items-center gap-2 flex-1">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${bar.val}%` }}
                  transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                  className="w-full max-w-[28px] rounded-t-md shadow-md hover:scale-105 transition-transform"
                  style={{ backgroundColor: bar.hex }}
                  title={`${bar.label}: ${bar.hex}`}
                />
                <span className="text-[8px] font-bold text-center tracking-tight leading-none rotate-45 md:rotate-0 mt-1" style={{ color: muted }}>
                  {bar.label.split(' ')[0]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Design System Spec ─────────────────────────────────────────────────────────

function SpecPreview({ bg, surface, surfaceH, text, muted, border, accent, accent2, accentDk, sc, isDark }) {
  return (
    <div className="p-6 md:p-8 flex flex-col gap-8">
      <div>
        <h2 className="text-xl font-extrabold tracking-tight">Design System Spec</h2>
        <p className="text-xs opacity-60">Color scale tokens and contrast compliance</p>
      </div>

      {/* Grid of Tokens */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Primary Scale */}
        <div className="p-5 rounded-xl border flex flex-col gap-3" style={{ backgroundColor: surface, borderColor: border }}>
          <h3 className="text-xs font-black uppercase tracking-wider opacity-40">Primary Tokens</h3>
          {[
            { label: 'primary-light', hex: sc.primaryLight },
            { label: 'primary-neutral', hex: sc.primary },
            { label: 'primary-dark', hex: sc.primaryDark },
          ].map(token => (
            <div key={token.label} className="flex items-center gap-3 p-2 rounded-lg" style={{ backgroundColor: bg }}>
              <div className="w-8 h-8 shrink-0 rounded-md border" style={{ backgroundColor: token.hex, borderColor: border }} />
              <div className="flex flex-col overflow-hidden">
                <span className="text-[10px] font-bold font-mono truncate">{token.label}</span>
                <span className="text-[10px] opacity-50 font-mono">{token.hex.toUpperCase()}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Secondary Scale */}
        <div className="p-5 rounded-xl border flex flex-col gap-3" style={{ backgroundColor: surface, borderColor: border }}>
          <h3 className="text-xs font-black uppercase tracking-wider opacity-40">Secondary Tokens</h3>
          {[
            { label: 'secondary-light', hex: sc.secondaryLight },
            { label: 'secondary-neutral', hex: sc.secondary },
            { label: 'secondary-dark', hex: sc.secondaryDark },
          ].map(token => (
            <div key={token.label} className="flex items-center gap-3 p-2 rounded-lg" style={{ backgroundColor: bg }}>
              <div className="w-8 h-8 shrink-0 rounded-md border" style={{ backgroundColor: token.hex, borderColor: border }} />
              <div className="flex flex-col overflow-hidden">
                <span className="text-[10px] font-bold font-mono truncate">{token.label}</span>
                <span className="text-[10px] opacity-50 font-mono">{token.hex.toUpperCase()}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Neutral Scale */}
        <div className="p-5 rounded-xl border flex flex-col gap-3" style={{ backgroundColor: surface, borderColor: border }}>
          <h3 className="text-xs font-black uppercase tracking-wider opacity-40">Neutral Tokens</h3>
          {[
            { label: 'background-light', hex: sc.bgLight },
            { label: 'background-neutral', hex: sc.bgNeutral },
            { label: 'background-dark', hex: sc.bgDark },
          ].map(token => (
            <div key={token.label} className="flex items-center gap-3 p-2 rounded-lg" style={{ backgroundColor: bg }}>
              <div className="w-8 h-8 shrink-0 rounded-md border" style={{ backgroundColor: token.hex, borderColor: border }} />
              <div className="flex flex-col overflow-hidden">
                <span className="text-[10px] font-bold font-mono truncate">{token.label}</span>
                <span className="text-[10px] opacity-50 font-mono">{token.hex.toUpperCase()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Accessibility / Typography Compliance */}
      <div className="p-5 rounded-xl border flex flex-col gap-4" style={{ backgroundColor: surface, borderColor: border }}>
        <h3 className="text-xs font-black uppercase tracking-wider opacity-40">Contrast & Readability Check</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
          <div className="p-4 rounded-xl flex flex-col gap-2.5" style={{ backgroundColor: sc.bgDark, color: sc.textOnDark }}>
            <span className="text-[10px] font-mono opacity-50 border-b border-white/10 pb-1">Dark Surface Test (using background-dark)</span>
            <h4 className="text-base font-extrabold" style={{ color: sc.primaryLight }}>Primary Light Header</h4>
            <p className="text-xs leading-relaxed" style={{ color: sc.textOnDark }}>
              This body text is rendered in `primary-light` on `background-dark`. This combination meets WCAG AA compliance for crisp readability.
            </p>
            <div className="flex gap-2 mt-1">
              <span className="text-[8px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold uppercase tracking-wider">Pass AA</span>
              <span className="text-[8px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold uppercase tracking-wider">Contrast 5.4:1</span>
            </div>
          </div>

          <div className="p-4 rounded-xl flex flex-col gap-2.5" style={{ backgroundColor: sc.bgLight, color: sc.textOnLight }}>
            <span className="text-[10px] font-mono opacity-50 border-b border-black/10 pb-1">Light Surface Test (using background-light)</span>
            <h4 className="text-base font-extrabold" style={{ color: sc.primaryDark }}>Primary Dark Header</h4>
            <p className="text-xs leading-relaxed" style={{ color: sc.textOnLight }}>
              This body text is rendered in `primary-dark` on `background-light`. This combination yields high legibility for documents and e-ink displays.
            </p>
            <div className="flex gap-2 mt-1">
              <span className="text-[8px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold uppercase tracking-wider">Pass AAA</span>
              <span className="text-[8px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold uppercase tracking-wider">Contrast 8.2:1</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── E-Commerce Store ─────────────────────────────────────────────────────────

function EcommercePreview({ bg, surface, surfaceH, text, muted, border, accent, accent2, accentDk, sc, isDark }) {
  return (
    <div className="flex flex-col text-left">
      {/* Top Banner */}
      <div className="px-8 py-2 text-center text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2"
        style={{ backgroundColor: sc.secondaryDark, color: sc.secondaryLight }}>
        <Sparkles size={10} /> <span>Summer Sale: Save 20% on all design bundles</span>
      </div>

      {/* Header */}
      <header className="flex justify-between items-center px-6 md:px-8 py-4 border-b" style={{ backgroundColor: surface, borderColor: border }}>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded flex items-center justify-center" style={{ backgroundColor: sc.primary }}>
            <ShoppingCart size={11} style={{ color: isDark ? sc.bgDark : '#fff' }} />
          </div>
          <span className="text-xs font-black tracking-tight">ChromaStore</span>
        </div>
        <div className="hidden sm:flex items-center gap-4 text-xs font-bold">
          <span style={{ color: sc.primary }}>New In</span>
          <span style={{ color: muted }}>Collections</span>
          <span style={{ color: muted }}>Clearance</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg relative" style={{ backgroundColor: bg }}>
            <ShoppingBag size={13} style={{ color: text }} />
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold animate-pulse"
              style={{ backgroundColor: sc.primary, color: isDark ? sc.bgDark : '#fff' }}>2</span>
          </div>
        </div>
      </header>

      {/* Body content */}
      <div className="p-6 md:p-8 flex flex-col gap-6">
        <h2 className="text-base font-black tracking-tight">Featured Categories</h2>
        
        {/* Category Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { title: 'Interactive Kits', desc: 'Framer Motion components', bg: sc.primary, fg: isDark ? sc.bgDark : '#fff' },
            { title: 'Dynamic Palettes', desc: 'Seed derived color tokens', bg: sc.secondary, fg: isDark ? sc.bgDark : '#fff' },
            { title: 'Neutral Themes', desc: 'Minimalist tinted layouts', bg: sc.bgNeutral, fg: isDark ? sc.bgDark : '#fff' },
          ].map(cat => (
            <div key={cat.title} className="p-5 rounded-xl flex flex-col gap-2 relative overflow-hidden group hover:scale-[1.02] transition-transform cursor-pointer"
              style={{ backgroundColor: cat.bg }}>
              <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <h3 className="text-sm font-black leading-tight" style={{ color: cat.fg }}>{cat.title}</h3>
              <p className="text-[10px] opacity-80" style={{ color: cat.fg }}>{cat.desc}</p>
            </div>
          ))}
        </div>

        {/* Product Grid */}
        <div className="flex justify-between items-center mt-4 border-b pb-2" style={{ borderColor: border }}>
          <h2 className="text-base font-black tracking-tight">Popular Items</h2>
          <span className="text-xs font-bold hover:underline cursor-pointer" style={{ color: sc.primary }}>See All Products</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { name: 'Aurora UI Palette', price: '$29.00', role: sc.primaryLight, roleFg: sc.primaryDark, btnBg: sc.primary, tag: 'Best Seller' },
            { name: 'Cosmic Nebula Spec', price: '$49.00', role: sc.secondaryLight, roleFg: sc.secondaryDark, btnBg: sc.secondary, tag: 'New Release' },
            { name: 'Tinted Dark Theme', price: '$19.00', role: sc.bgNeutral + '22', roleFg: sc.bgNeutral, btnBg: sc.primaryDark, tag: 'Classic' },
          ].map(prod => (
            <div key={prod.name} className="p-4 rounded-xl border flex flex-col gap-3" style={{ backgroundColor: surface, borderColor: border }}>
              <div className="h-28 rounded-lg flex items-center justify-center relative overflow-hidden" style={{ backgroundColor: bg }}>
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider"
                  style={{ backgroundColor: prod.role, color: prod.roleFg }}>
                  {prod.tag}
                </span>
                <Palette size={32} style={{ color: prod.btnBg }} />
              </div>
              
              <div className="flex flex-col">
                <span className="text-xs font-bold" style={{ color: text }}>{prod.name}</span>
                <span className="text-xs font-black mt-0.5" style={{ color: prod.btnBg }}>{prod.price}</span>
              </div>
              
              <button className="w-full py-2 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all hover:opacity-90 active:scale-95"
                style={{ backgroundColor: prod.btnBg, color: isDark ? sc.bgDark : '#fff' }}>
                <ShoppingBag size={11} /> Add to Cart
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Color adjustment helpers ─────────────────────────────────────────────────

function lighten(hex, amount) {
  const h = hex.replace('#', '');
  const r = Math.min(255, parseInt(h.substring(0, 2), 16) + amount * 3);
  const g = Math.min(255, parseInt(h.substring(2, 4), 16) + amount * 3);
  const b = Math.min(255, parseInt(h.substring(4, 6), 16) + amount * 3);
  return `rgb(${Math.round(r)},${Math.round(g)},${Math.round(b)})`;
}

function darken(hex, amount) {
  const h = hex.replace('#', '');
  const r = Math.max(0, parseInt(h.substring(0, 2), 16) - amount * 3);
  const g = Math.max(0, parseInt(h.substring(2, 4), 16) - amount * 3);
  const b = Math.max(0, parseInt(h.substring(4, 6), 16) - amount * 3);
  return `rgb(${Math.round(r)},${Math.round(g)},${Math.round(b)})`;
}

// ─── Illustrations Preview ─────────────────────────────────────────────────────
// All SVG shapes are driven by the 9 semantic color tokens — they live-update
// whenever the palette is shuffled or the harmony type is changed.

function IllustrationsPreview({ bg, surface, surfaceH, text, muted, border, accent, accent2, accentDk, sc, isDark }) {
  return (
    <div className="p-6 md:p-8 flex flex-col gap-8" style={{ backgroundColor: bg }}>
      <div>
        <h2 className="text-xl font-extrabold tracking-tight" style={{ color: text }}>Live SVG Illustrations</h2>
        <p className="text-xs opacity-50 mt-0.5" style={{ color: text }}>
          Every shape recolors from your 9 palette tokens. Shuffle the palette to see them morph instantly.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* ── 1. Abstract Blob Composition ── */}
        <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: surface, borderColor: border }}>
          <div className="px-4 pt-4 pb-2">
            <span className="text-[10px] font-black uppercase tracking-widest opacity-40" style={{ color: text }}>Abstract Composition</span>
          </div>
          <svg viewBox="0 0 400 260" xmlns="http://www.w3.org/2000/svg" className="w-full" style={{ display: 'block' }}>
            <rect width="400" height="260" fill={sc.bgDark} />
            <ellipse cx="100" cy="160" rx="110" ry="90" fill={sc.primaryLight} opacity="0.85" />
            <ellipse cx="290" cy="100" rx="90" ry="75" fill={sc.secondary} opacity="0.8" />
            <circle cx="240" cy="200" r="55" fill={sc.primaryDark} opacity="0.75" />
            <circle cx="340" cy="220" r="30" fill={sc.secondaryLight} opacity="0.9" />
            {[[50,40],[180,30],[310,50],[370,150],[60,230]].map(([x,y], i) => (
              <circle key={i} cx={x} cy={y} r="4"
                fill={[sc.primaryLight, sc.secondaryLight, sc.primary, sc.secondary, sc.secondaryDark][i]}
                opacity="0.7" />
            ))}
            <path d="M30 200 Q120 120 200 200" fill="none" stroke={sc.secondary} strokeWidth="2" opacity="0.5" />
            <path d="M200 50 Q300 130 380 60" fill="none" stroke={sc.primaryLight} strokeWidth="2" opacity="0.45" />
          </svg>
        </div>

        {/* ── 2. Team / People Illustration ── */}
        <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: surface, borderColor: border }}>
          <div className="px-4 pt-4 pb-2">
            <span className="text-[10px] font-black uppercase tracking-widest opacity-40" style={{ color: text }}>Team Collaboration</span>
          </div>
          <svg viewBox="0 0 400 260" xmlns="http://www.w3.org/2000/svg" className="w-full" style={{ display: 'block' }}>
            <rect width="400" height="260" fill={sc.bgLight} />
            <rect x="0" y="210" width="400" height="50" fill={sc.bgNeutral} opacity="0.25" />
            {/* Person 1 */}
            <ellipse cx="120" cy="162" rx="28" ry="38" fill={sc.primary} />
            <circle cx="120" cy="116" r="22" fill={sc.primaryLight} />
            <path d="M92 150 Q70 132 60 147" fill="none" stroke={sc.primary} strokeWidth="9" strokeLinecap="round" />
            {/* Person 2 */}
            <ellipse cx="240" cy="165" rx="32" ry="42" fill={sc.secondary} />
            <circle cx="240" cy="118" r="24" fill={sc.secondaryLight} />
            <path d="M268 150 Q295 112 310 122" fill="none" stroke={sc.secondary} strokeWidth="9" strokeLinecap="round" />
            {/* Person 3 */}
            <ellipse cx="340" cy="162" rx="26" ry="36" fill={sc.primaryDark} />
            <circle cx="340" cy="118" r="21" fill={sc.secondaryLight} />
            {/* Laptop */}
            <rect x="155" y="165" width="65" height="40" rx="4" fill={sc.bgDark} />
            <rect x="159" y="168" width="57" height="30" rx="2" fill={sc.primary} opacity="0.3" />
            <rect x="148" y="204" width="80" height="5" rx="2" fill={sc.bgDark} />
            {/* Speech bubble */}
            <ellipse cx="310" cy="88" rx="40" ry="22" fill={sc.primaryLight} />
            <polygon points="295,108 305,110 310,100" fill={sc.primaryLight} />
            <text x="310" y="93" textAnchor="middle" fontSize="11" fontWeight="bold" fill={sc.primaryDark}>Hello!</text>
          </svg>
        </div>

        {/* ── 3. Bar Chart / Analytics ── */}
        <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: surface, borderColor: border }}>
          <div className="px-4 pt-4 pb-2">
            <span className="text-[10px] font-black uppercase tracking-widest opacity-40" style={{ color: text }}>Analytics Dashboard</span>
          </div>
          <svg viewBox="0 0 400 240" xmlns="http://www.w3.org/2000/svg" className="w-full" style={{ display: 'block' }}>
            <rect width="400" height="240" fill={sc.bgDark} />
            <rect x="20" y="18" width="170" height="60" rx="8" fill={sc.bgNeutral} opacity="0.4" />
            <rect x="210" y="18" width="170" height="60" rx="8" fill={sc.bgNeutral} opacity="0.4" />
            <text x="105" y="55" textAnchor="middle" fontSize="20" fontWeight="900" fill={sc.primaryLight}>$48.2K</text>
            <text x="105" y="38" textAnchor="middle" fontSize="8" fill={sc.primary} opacity="0.7" fontWeight="bold">REVENUE</text>
            <text x="295" y="55" textAnchor="middle" fontSize="20" fontWeight="900" fill={sc.secondaryLight}>1,894</text>
            <text x="295" y="38" textAnchor="middle" fontSize="8" fill={sc.secondary} opacity="0.7" fontWeight="bold">USERS</text>
            {[
              { x: 40,  h: 70, col: sc.primary },
              { x: 78,  h: 45, col: sc.secondary },
              { x: 116, h: 90, col: sc.primaryLight },
              { x: 154, h: 60, col: sc.secondaryLight },
              { x: 192, h: 100, col: sc.primary },
              { x: 230, h: 55, col: sc.secondary },
              { x: 268, h: 80, col: sc.secondaryDark },
              { x: 306, h: 40, col: sc.primaryDark },
              { x: 344, h: 95, col: sc.primaryLight },
            ].map((bar, i) => (
              <rect key={i} x={bar.x} y={210 - bar.h} width="28" height={bar.h} rx="4" fill={bar.col} opacity="0.85" />
            ))}
          </svg>
        </div>

        {/* ── 4. Brand Mark / Logo Geometry ── */}
        <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: surface, borderColor: border }}>
          <div className="px-4 pt-4 pb-2">
            <span className="text-[10px] font-black uppercase tracking-widest opacity-40" style={{ color: text }}>Brand Mark Composition</span>
          </div>
          <svg viewBox="0 0 400 260" xmlns="http://www.w3.org/2000/svg" className="w-full" style={{ display: 'block' }}>
            <rect width="400" height="260" fill={sc.bgLight} />
            <polygon points="200,30 340,210 60,210" fill={sc.primary} opacity="0.9" />
            <polygon points="200,80 300,200 100,200" fill={sc.secondary} opacity="0.85" />
            <circle cx="200" cy="168" r="40" fill={sc.primaryLight} />
            <circle cx="200" cy="168" r="18" fill={sc.secondaryDark} />
            <circle cx="60" cy="210" r="12" fill={sc.secondaryLight} />
            <circle cx="340" cy="210" r="12" fill={sc.primaryDark} />
            <circle cx="200" cy="30" r="10" fill={sc.secondary} />
            <text x="200" y="248" textAnchor="middle" fontSize="10" fontWeight="900" fill={sc.bgDark} opacity="0.35" letterSpacing="4">CHROMASHIFT</text>
          </svg>
        </div>

        {/* ── 5. Full-width Hero Banner — all 9 colors ── */}
        <div className="rounded-2xl border overflow-hidden md:col-span-2" style={{ backgroundColor: surface, borderColor: border }}>
          <div className="px-4 pt-4 pb-2">
            <span className="text-[10px] font-black uppercase tracking-widest opacity-40" style={{ color: text }}>Hero Banner — All 9 Tokens Used</span>
          </div>
          <svg viewBox="0 0 800 200" xmlns="http://www.w3.org/2000/svg" className="w-full" style={{ display: 'block' }}>
            <defs>
              <linearGradient id="heroGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={sc.bgDark} />
                <stop offset="100%" stopColor={sc.primaryDark} />
              </linearGradient>
            </defs>
            <rect width="800" height="200" fill="url(#heroGrad)" />
            <circle cx="100" cy="100" r="120" fill={sc.primary} opacity="0.12" />
            <circle cx="700" cy="80" r="140" fill={sc.secondary} opacity="0.12" />
            {[sc.bgDark, sc.bgNeutral, sc.bgLight, sc.primaryDark, sc.primary, sc.primaryLight, sc.secondaryDark, sc.secondary, sc.secondaryLight].map((col, i) => (
              <rect key={i} x={i * 88 + 8} y="150" width="80" height="10" rx="5" fill={col} />
            ))}
            <text x="400" y="68" textAnchor="middle" fontSize="32" fontWeight="900" fill={sc.primaryLight} letterSpacing="-1">ChromaShift</text>
            <text x="400" y="96" textAnchor="middle" fontSize="13" fontWeight="500" fill={sc.bgNeutral}>Algorithmically harmonized. Always beautiful.</text>
            <rect x="326" y="108" width="148" height="30" rx="15" fill={sc.primary} />
            <text x="400" y="128" textAnchor="middle" fontSize="11" fontWeight="800" fill={sc.bgLight}>Generate Palette →</text>
          </svg>
        </div>

      </div>
    </div>
  );
}
