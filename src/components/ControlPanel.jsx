import React, { useState } from 'react';
import { RefreshCw, Layout, Download, Check, Minus, Plus, X, ChevronDown, Mountain, Waves, Sunrise, Leaf, Moon, Briefcase, Zap, Heart } from 'lucide-react';
import { MOOD_PRESETS } from '../utils/colorUtils';
import { motion, AnimatePresence } from 'framer-motion';

const MOOD_ICONS = {
  earth: Mountain,
  ocean: Waves,
  sunset: Sunrise,
  forest: Leaf,
  violet: Moon,
  slate: Briefcase,
  neon: Zap,
  blush: Heart,
};

export default function ControlPanel({
  size, setSize, activeTheme, setActiveTheme, onShuffle, onOpenTemplates, palette
}) {
  const [showExportModal, setShowExportModal] = useState(false);
  const [copiedFormat, setCopiedFormat] = useState(null);
  const [showMoodMenu, setShowMoodMenu] = useState(false);

  const exportFormats = {
    css: () => {
      const vars = palette.map(c => `  --${c.role}: ${c.hex};`).join('\n');
      return `:root {\n${vars}\n}`;
    },
    json: () => JSON.stringify(palette.map(c => ({ hex: c.hex, role: c.role, h: c.h, s: c.s, l: c.l })), null, 2),
    tailwind: () => {
      const colors = palette.map(c => {
        const key = c.role.replace(/-/g, '_');
        return `        '${key}': '${c.hex}',`;
      }).join('\n');
      return `module.exports = {\n  theme: {\n    extend: {\n      colors: {\n${colors}\n      }\n    }\n  }\n}`;
    },
  };

  const handleCopy = (fmt) => {
    navigator.clipboard.writeText(exportFormats[fmt]());
    setCopiedFormat(fmt);
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  return (
    <>
      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-30 w-[95%] max-w-2xl">
        <div className="bg-black/60 backdrop-blur-2xl border border-white/8 rounded-2xl shadow-2xl flex flex-wrap items-center justify-between gap-3 px-5 py-3">

          {/* Size adjuster */}
          <div className="flex items-center gap-2.5">
            <button onClick={() => size > 3 && setSize(size - 1)} disabled={size <= 3}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-white/50 hover:text-white hover:bg-white/8 transition-colors disabled:opacity-30">
              <Minus size={14} />
            </button>
            <div className="flex flex-col items-center min-w-[28px]">
              <span className="text-sm font-black text-white tabular-nums">{size}</span>
              <span className="text-[8px] text-white/35 font-bold uppercase tracking-widest">Colors</span>
            </div>
            <button onClick={() => size < 9 && setSize(size + 1)} disabled={size >= 9}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-white/50 hover:text-white hover:bg-white/8 transition-colors disabled:opacity-30">
              <Plus size={14} />
            </button>
          </div>

          {/* Mood selector */}
          <div className="flex flex-col relative">
            <span className="text-[8px] text-white/30 font-bold uppercase tracking-widest mb-1 select-none">Mood</span>
            
            <button
              onClick={() => setShowMoodMenu(v => !v)}
              className="flex items-center gap-2 border border-white/10 hover:border-white/20 rounded-lg px-2.5 py-1 text-xs text-white font-medium bg-transparent transition-colors cursor-pointer"
            >
              {(() => {
                const SelectedIcon = MOOD_ICONS[activeTheme] || Mountain;
                return <SelectedIcon size={12} className="text-white/70" />;
              })()}
              <span>{MOOD_PRESETS[activeTheme]?.name}</span>
              <ChevronDown size={10} className="opacity-50 ml-1" />
            </button>

            <AnimatePresence>
              {showMoodMenu && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setShowMoodMenu(false)} />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 6 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 6 }}
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    className="absolute left-0 bottom-full mb-2.5 z-30 rounded-xl bg-[#09090f]/95 backdrop-blur-xl border border-white/10 shadow-2xl p-1.5 w-44 text-white flex flex-col gap-0.5"
                    onClick={e => e.stopPropagation()}
                  >
                    <div className="px-2.5 py-1 text-[8px] font-black tracking-[0.15em] uppercase text-white/30 border-b border-white/5 mb-1 select-none">
                      Select Mood
                    </div>
                    {Object.entries(MOOD_PRESETS).map(([key, m]) => {
                      const Icon = MOOD_ICONS[key] || Mountain;
                      const isSelected = activeTheme === key;
                      return (
                        <button
                          key={key}
                          onClick={() => {
                            setActiveTheme(key);
                            setShowMoodMenu(false);
                          }}
                          className="flex items-center justify-between w-full px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors hover:bg-white/5 text-left"
                          style={{
                            color: isSelected ? '#ffffff' : 'rgba(255,255,255,0.6)',
                            backgroundColor: isSelected ? 'rgba(255,255,255,0.06)' : 'transparent',
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <Icon size={12} className="opacity-70" />
                            <span>{m.name}</span>
                          </div>
                          {isSelected && <Check size={11} className="text-emerald-400" />}
                        </button>
                      );
                    })}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1.5">
            <button onClick={onShuffle}
              className="flex items-center gap-1.5 bg-white text-black hover:bg-white/90 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 group">
              <RefreshCw size={13} className="group-hover:rotate-180 transition-transform duration-500" />
              <span>Shuffle</span>
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 bg-black/8 text-black/50 rounded text-[9px] font-mono font-bold ml-1">Space</kbd>
            </button>
            <button onClick={onOpenTemplates} title="Preview Templates"
              className="p-2.5 rounded-xl hover:bg-white/8 text-white/60 hover:text-white transition-colors">
              <Layout size={17} />
            </button>
            <button onClick={() => setShowExportModal(true)} title="Export Code"
              className="p-2.5 rounded-xl hover:bg-white/8 text-white/60 hover:text-white transition-colors">
              <Download size={17} />
            </button>
          </div>
        </div>
      </div>

      {/* Export Modal */}
      <AnimatePresence>
        {showExportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowExportModal(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl max-h-[85vh] overflow-y-auto rounded-2xl bg-neutral-950/95 backdrop-blur-xl border border-white/10 shadow-2xl z-10 p-6 text-white">
              <button onClick={() => setShowExportModal(false)} className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10">
                <X size={18} />
              </button>
              <h3 className="text-xl font-bold mb-1">Export Palette</h3>
              <p className="text-xs text-white/40 mb-5">Copy your palette as code.</p>

              {[
                { key: 'css', label: 'CSS Custom Properties' },
                { key: 'tailwind', label: 'Tailwind Config' },
                { key: 'json', label: 'JSON' },
              ].map(({ key, label }) => (
                <div key={key} className="mb-4">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-white/50">{label}</span>
                    <button onClick={() => handleCopy(key)}
                      className="text-xs flex items-center gap-1.5 text-white/70 hover:text-white py-1 px-2.5 rounded-lg hover:bg-white/5">
                      {copiedFormat === key ? <><Check size={12} className="text-emerald-400" /> Copied!</> : <><Download size={12} /> Copy</>}
                    </button>
                  </div>
                  <pre className="p-3 bg-black/40 border border-white/5 rounded-xl text-[11px] font-mono overflow-x-auto text-white/80">
                    {exportFormats[key]()}
                  </pre>
                </div>
              ))}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
