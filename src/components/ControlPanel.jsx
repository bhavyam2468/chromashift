import React, { useState, useEffect } from 'react';
import { RefreshCw, Layout, Download, Check, Minus, Plus, X, Sliders } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ControlPanel({
  size, setSize, activeTheme, setActiveTheme, onShuffle, onOpenTemplates, palette
}) {
  const [showExportModal, setShowExportModal] = useState(false);
  const [copiedFormat, setCopiedFormat] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  
  // Responsive check
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  // ─── 1. Mobile Layout Render ───
  if (isMobile) {
    return (
      <>
        {/* Floating Action Button (FAB) for Mobile */}
        <button
          onClick={() => setShowMobileMenu(true)}
          className="fixed bottom-4 right-4 z-35 w-12 h-12 rounded-full bg-white text-black shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
        >
          <Sliders size={18} />
        </button>

        {/* Mobile Bottom Sheet Drawer */}
        <AnimatePresence>
          {showMobileMenu && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowMobileMenu(false)}
                className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              />

              {/* Bottom Sheet */}
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                className="fixed bottom-0 left-0 right-0 z-50 bg-[#09090f]/95 backdrop-blur-2xl border-t border-white/10 rounded-t-3xl p-6 shadow-2xl flex flex-col gap-6 text-white"
              >
                {/* Header */}
                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                  <div className="flex flex-col">
                    <h3 className="text-sm font-bold">ChromaShift Controls</h3>
                    <p className="text-[10px] text-white/40">Adjust size or export palette</p>
                  </div>
                  <button onClick={() => setShowMobileMenu(false)} className="p-1.5 rounded-full bg-white/5 hover:bg-white/10">
                    <X size={16} />
                  </button>
                </div>

                {/* Size */}
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-white/40">Palette Size</span>
                  <div className="flex items-center gap-4">
                    <button onClick={() => size > 3 && setSize(size - 1)} disabled={size <= 3}
                      className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/70 disabled:opacity-30">
                      <Minus size={14} />
                    </button>
                    <span className="text-base font-black tabular-nums">{size}</span>
                    <button onClick={() => size < 9 && setSize(size + 1)} disabled={size >= 9}
                      className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/70 disabled:opacity-30">
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                {/* Grid of primary actions */}
                <div className="grid grid-cols-3 gap-2.5 pt-2">
                  <button onClick={() => { onShuffle(); setShowMobileMenu(false); }}
                    className="flex flex-col items-center justify-center gap-1.5 bg-white text-black py-3 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95">
                    <RefreshCw size={14} />
                    <span>Shuffle</span>
                  </button>
                  <button onClick={() => { onOpenTemplates(); setShowMobileMenu(false); }}
                    className="flex flex-col items-center justify-center gap-1.5 bg-white/5 hover:bg-white/10 text-white py-3 rounded-xl text-xs font-bold transition-all border border-white/5">
                    <Layout size={14} />
                    <span>Preview</span>
                  </button>
                  <button onClick={() => { setShowExportModal(true); setShowMobileMenu(false); }}
                    className="flex flex-col items-center justify-center gap-1.5 bg-white/5 hover:bg-white/10 text-white py-3 rounded-xl text-xs font-bold transition-all border border-white/5">
                    <Download size={14} />
                    <span>Export</span>
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Share Export Modal on mobile */}
        <AnimatePresence>
          {showExportModal && <ExportModal {...{ showExportModal, setShowExportModal, handleCopy, copiedFormat, exportFormats }} />}
        </AnimatePresence>
      </>
    );
  }

  // ─── 2. Desktop Layout Render (Sinks down, comes up on hover) ───
  return (
    <>
      <motion.div
        className="fixed bottom-0 left-1/2 z-30 w-[95%] max-w-lg pb-4 pt-10"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        animate={{ x: "-50%", y: isHovered ? 0 : 54 }}
        transition={{ type: 'spring', stiffness: 300, damping: 26 }}
      >
        {/* Hover activation trigger handle */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-14 h-1.5 rounded-full bg-white/15 hover:bg-white/30 transition-colors cursor-pointer select-none" />

        <div className="bg-black/60 backdrop-blur-2xl border border-white/8 rounded-2xl shadow-2xl flex items-center justify-between gap-5 px-6 py-3 select-none">
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

          {/* Vertical divider */}
          <div className="w-[1px] h-6 bg-white/10" />

          {/* Actions */}
          <div className="flex items-center gap-2">
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
      </motion.div>

      {/* Export Modal */}
      <AnimatePresence>
        {showExportModal && <ExportModal {...{ showExportModal, setShowExportModal, handleCopy, copiedFormat, exportFormats }} />}
      </AnimatePresence>
    </>
  );
}

// ─── Sub-Component for Export Code ───
function ExportModal({ setShowExportModal, handleCopy, copiedFormat, exportFormats }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={() => setShowExportModal(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-xl max-h-[85vh] overflow-y-auto rounded-2xl bg-neutral-950/95 backdrop-blur-xl border border-white/10 shadow-2xl z-55 p-6 text-white font-sans">
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
  );
}
