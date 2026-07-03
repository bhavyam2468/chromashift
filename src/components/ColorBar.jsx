import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Unlock, Sliders, Check, ChevronDown } from 'lucide-react';
import { ROLE_DISPLAY, hslToHex } from '../utils/colorUtils';

const SPRING = { type: 'spring', stiffness: 380, damping: 30 };

function isLight(hex) {
  if (!hex) return false;
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) > 150;
}

export default function ColorBar({
  color, index, total, onToggleLock, onUpdateHex, onUpdateRole, onCopy
}) {
  const [showSliders, setShowSliders] = useState(false);
  const [isEditingHex, setIsEditingHex] = useState(false);
  const [tempHex, setTempHex] = useState(color.hex);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [justCopied, setJustCopied] = useState(false);

  const light = isLight(color.hex);
  const textColor = light ? 'rgba(0,0,0,0.85)' : 'rgba(255,255,255,0.92)';
  const mutedColor = light ? 'rgba(0,0,0,0.45)' : 'rgba(255,255,255,0.4)';
  const overlayBg = light ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)';
  const overlayBorder = light ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)';

  const handleCopy = () => {
    onCopy(color.hex);
    setJustCopied(true);
    setTimeout(() => setJustCopied(false), 1200);
  };

  const handleHexSubmit = (e) => {
    e?.preventDefault();
    let val = tempHex.trim();
    if (!val.startsWith('#')) val = '#' + val;
    if (/^#[0-9A-Fa-f]{6}$/.test(val) || /^#[0-9A-Fa-f]{3}$/.test(val)) {
      onUpdateHex(color.id, val);
    } else {
      setTempHex(color.hex);
    }
    setIsEditingHex(false);
  };

  const handleHslChange = (param, value) => {
    onUpdateHex(color.id, null, { h: color.h, s: color.s, l: color.l, [param]: Number(value) });
  };

  const roleDisplay = ROLE_DISPLAY[color.role];

  const barVariants = {
    hidden: { opacity: 0, scale: 0.95, filter: 'blur(8px)' },
    visible: {
      opacity: 1, scale: 1, filter: 'blur(0px)',
      transition: { ...SPRING, delay: index * 0.05 }
    },
    exit: {
      opacity: 0, scale: 0.95, filter: 'blur(6px)',
      transition: { duration: 0.2, ease: [0.4, 0, 1, 1], delay: index * 0.02 }
    }
  };

  return (
    <motion.div
      layout
      variants={barVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      whileHover={{ flex: 1.3 }}
      transition={{ flex: { type: 'spring', stiffness: 260, damping: 28 } }}
      className="relative flex flex-row md:flex-col justify-between items-center px-4 py-2 md:py-8 md:px-3 h-full w-full group overflow-hidden cursor-pointer"
      style={{ backgroundColor: color.hex, flex: 1, minWidth: 0 }}
      onClick={!isEditingHex && !showRoleMenu && !showSliders ? handleCopy : undefined}
    >
      {/* Shimmer */}
      <motion.div
        className="absolute inset-0 pointer-events-none opacity-0 md:group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: `linear-gradient(135deg, ${light ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.06)'} 0%, transparent 50%)` }}
      />

      {/* Lock indicator stripe */}
      {color.locked && (
        <motion.div
          className="absolute top-0 left-0 bottom-0 w-1 md:w-auto md:h-1 md:right-0"
          style={{ backgroundColor: light ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.35)' }}
          initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={SPRING}
        />
      )}

      {/* ─── Controls (Lock/Sliders) ─── */}
      <div
        className="flex flex-row md:flex-col items-center gap-1.5 z-10 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200"
        onClick={e => e.stopPropagation()}
      >
        <motion.button whileTap={{ scale: 0.85 }} onClick={() => onToggleLock(color.id)}
          className="p-2 md:p-2.5 rounded-xl transition-colors" style={{ backgroundColor: overlayBg, color: textColor }}>
          {color.locked ? <Lock size={14} /> : <Unlock size={14} />}
        </motion.button>

        <motion.button whileTap={{ scale: 0.85 }} onClick={() => setShowSliders(v => !v)}
          className="p-2 md:p-2.5 rounded-xl transition-colors" style={{ backgroundColor: showSliders ? overlayBorder : overlayBg, color: textColor }}>
          <Sliders size={14} />
        </motion.button>
      </div>

      {/* ─── HSL Sliders ─── */}
      <AnimatePresence>
        {showSliders && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowSliders(false)} />
            <motion.div
              initial={{ x: "-50%", opacity: 0, y: 10, scale: 0.95 }}
              animate={{ x: "-50%", opacity: 1, y: 0, scale: 1 }}
              exit={{ x: "-50%", opacity: 0, y: 10, scale: 0.95 }}
              transition={SPRING}
              className="absolute left-1/2 top-12 md:top-1/4 z-20 w-[95%] max-w-[220px] rounded-2xl p-4 shadow-2xl"
              style={{ backgroundColor: light ? 'rgba(255,255,255,0.94)' : 'rgba(12,12,20,0.94)',
                backdropFilter: 'blur(16px)', border: `1px solid ${overlayBorder}`, color: textColor }}
              onClick={e => e.stopPropagation()}
            >
              {[
                { label: 'Hue', param: 'h', min: 0, max: 360, val: color.h, unit: '°',
                  bg: 'linear-gradient(to right,#ff0000,#ffff00,#00ff00,#00ffff,#0000ff,#ff00ff,#ff0000)' },
                { label: 'Saturation', param: 's', min: 0, max: 100, val: color.s, unit: '%',
                  bg: `linear-gradient(to right,${hslToHex(color.h,0,50)},${hslToHex(color.h,100,50)})` },
                { label: 'Lightness', param: 'l', min: 0, max: 100, val: color.l, unit: '%',
                  bg: `linear-gradient(to right,#000,${hslToHex(color.h,color.s,50)},#fff)` },
              ].map(({ label, param, min, max, val, unit, bg }) => (
                <div key={param} className="mb-3 last:mb-0">
                  <div className="flex justify-between text-[10px] font-bold mb-1 opacity-50">
                    <span>{label}</span><span>{val}{unit}</span>
                  </div>
                  <input type="range" min={min} max={max} value={val}
                    onChange={e => handleHslChange(param, e.target.value)}
                    className="w-full h-2 rounded-full cursor-pointer"
                    style={{ background: bg }}
                  />
                </div>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ─── Bottom Info (Role / HEX / Copy) ─── */}
      <div className="flex flex-row md:flex-col items-center gap-3 z-10 shrink-0" onClick={e => e.stopPropagation()}>

        {/* Role tag dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(v => !v)}
            className="flex items-center gap-1 px-2 py-0.5 md:px-2.5 md:py-1 rounded-lg transition-colors text-center"
            style={{ backgroundColor: overlayBg, color: mutedColor }}
          >
            {roleDisplay ? (
              <span className="text-[8px] md:text-[9px] font-black tracking-[0.1em] uppercase leading-tight">
                {roleDisplay.prefix.slice(0, 4)}·{roleDisplay.suffix}
              </span>
            ) : (
              <span className="text-[8px] font-bold uppercase opacity-50">Role</span>
            )}
            <ChevronDown size={10} className="opacity-60" />
          </button>

          <AnimatePresence>
            {showRoleMenu && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setShowRoleMenu(false)} />
                <motion.div
                  initial={{ opacity: 0, scale: 0.92, y: 6 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.92, y: 6 }} transition={SPRING}
                  className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 z-30 rounded-2xl shadow-2xl overflow-hidden"
                  style={{ width: 170, backgroundColor: light ? '#fff' : '#18182b', border: `1px solid ${overlayBorder}` }}
                  onClick={e => e.stopPropagation()}
                >
                  <div className="px-3 py-2 text-[9px] font-black tracking-[0.15em] uppercase border-b"
                    style={{ color: mutedColor, borderColor: overlayBorder }}>
                    Assign Role
                  </div>

                  {['primary', 'secondary', 'background'].map(prefix => (
                    <div key={prefix}>
                      {['light', 'neutral', 'dark'].map(suffix => {
                        const role = `${prefix}-${suffix}`;
                        const display = ROLE_DISPLAY[role];
                        const isActive = color.role === role;
                        return (
                          <button key={role}
                            onClick={() => { onUpdateRole(color.id, role); setShowRoleMenu(false); }}
                            className="flex items-center justify-between w-full px-3 py-1.5 text-[10px] font-semibold transition-colors"
                            style={{
                              color: textColor,
                              backgroundColor: isActive ? overlayBg : 'transparent',
                            }}
                          >
                            <span>{display.prefix} {display.suffix}</span>
                            {isActive && <Check size={10} className="opacity-60" />}
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* HEX text */}
        {isEditingHex ? (
          <form onSubmit={handleHexSubmit} onClick={e => e.stopPropagation()}>
            <input type="text" value={tempHex}
              onChange={e => setTempHex(e.target.value)} onBlur={handleHexSubmit} autoFocus
              className="bg-transparent text-center font-mono font-bold text-xs md:text-sm tracking-wider w-20 border-b focus:outline-none"
              style={{ color: textColor, borderBottomColor: mutedColor }} />
          </form>
        ) : (
          <motion.button whileTap={{ scale: 0.94 }}
            onClick={(e) => { e.stopPropagation(); setIsEditingHex(true); setTempHex(color.hex); }}
            className="font-mono font-bold text-xs md:text-base tracking-wider hover:opacity-70 transition-opacity"
            style={{ color: textColor }}>
            {color.hex.toUpperCase()}
          </motion.button>
        )}

        {/* Copy confirmation feedback (Desktop-only hint) */}
        <div className="hidden md:block min-h-[14px]">
          <AnimatePresence mode="wait">
            {justCopied ? (
              <motion.span key="copied" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }} className="text-[9px] font-bold flex items-center gap-1"
                style={{ color: mutedColor }}>
                Copied
              </motion.span>
            ) : (
              <motion.span key="hint" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }} className="text-[9px] opacity-0 group-hover:opacity-50 transition-opacity"
                style={{ color: mutedColor }}>
                Copy
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
