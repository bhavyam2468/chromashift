import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sun, Moon, BarChart3, Users, DollarSign, TrendingUp, ArrowRight, Layers, CheckCircle, Star, Code, Bell, Search, Menu, Heart, MessageSquare, Tag } from 'lucide-react';
import { getSemanticColors } from '../utils/colorUtils';

export default function TemplatePreview({ isOpen, onClose, palette }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isDark, setIsDark] = useState(true);

  if (!palette || palette.length === 0) return null;

  const sc = getSemanticColors(palette);

  // Dynamic theme-aware style factories
  const bg       = isDark ? sc.bgDark     : sc.bgLight;
  const surface  = isDark ? lighten(sc.bgDark, 6) : darken(sc.bgLight, 3);
  const surfaceH = isDark ? lighten(sc.bgDark, 10) : darken(sc.bgLight, 6);
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
  ];

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
            <div className="flex gap-1.5 px-5 py-2.5 border-b border-white/5 shrink-0">
              {tabs.map(t => (
                <button key={t.id} onClick={() => setActiveTab(t.id)}
                  className={`px-3.5 py-1.5 rounded-lg text-[11px] font-bold transition-all ${activeTab === t.id ? 'bg-white/10 text-white border border-white/10' : 'text-white/35 hover:text-white/60'}`}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* Preview Body */}
            <div className="flex-1 overflow-y-auto p-5" style={{ backgroundColor: '#0a0a0a' }}>
              <div className="w-full min-h-[600px] rounded-xl overflow-hidden transition-colors duration-500 shadow-2xl"
                style={{ backgroundColor: bg, color: text }}>

                {activeTab === 'dashboard' && <DashboardPreview {...{ bg, surface, surfaceH, text, muted, border, accent, accent2, accentDk, sc, isDark }} />}
                {activeTab === 'landing' && <LandingPreview {...{ bg, surface, surfaceH, text, muted, border, accent, accent2, accentDk, sc, isDark }} />}
                {activeTab === 'blog' && <BlogPreview {...{ bg, surface, surfaceH, text, muted, border, accent, accent2, accentDk, sc, isDark }} />}

              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

function DashboardPreview({ bg, surface, surfaceH, text, muted, border, accent, accent2, accentDk, sc, isDark }) {
  return (
    <div className="flex h-full min-h-[600px]">
      {/* Sidebar */}
      <div className="w-52 shrink-0 p-4 flex flex-col gap-1 border-r" style={{ backgroundColor: surface, borderColor: border }}>
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
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold" style={{ color: text }}>Analytics</h2>
            <p className="text-[11px]" style={{ color: muted }}>Real-time performance overview</p>
          </div>
          <div className="flex items-center gap-2">
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
        <div className="grid grid-cols-3 gap-3">
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
      <div className="grid grid-cols-3 gap-4 px-8 pb-12">
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
        <div className="flex gap-4">
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
