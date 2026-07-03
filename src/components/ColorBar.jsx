import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Unlock, Sliders, Check, Copy, ChevronDown } from 'lucide-react';
import { ALL_ROLES, ROLE_DISPLAY, hslToHex } from '../utils/colorUtils';

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
  const mutedColor = light ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.35)';
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
    hidden: { opacity: 0, scaleX: 0.4, filter: 'blur(8px)' },
    visible: {
      opacity: 1, scaleX: 1, filter: 'blur(0px)',
      transition: { ...SPRING, delay: index * 0.06 }
    },
    exit: {
      opacity: 0, scaleX: 0.3, filter: 'blur(6px)',
      transition: { duration: 0.22, ease: [0.4, 0, 1, 1], delay: index * 0.03 }
    }
  };

  return (
    <motion.div
      layout
      variants={barVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      whileHover={{ flex: 1.4 }}
      transition={{ flex: { type: 'spring', stiffness: 260, damping: 28 } }}
      className="relative flex flex-col justify-between items-center py-8 px-3 h-full group overflow-hidden cursor-pointer"
      style={{ backgroundColor: color.hex, flex: 1, minWidth: 0 }}
      onClick={!isEditingHex && !showRoleMenu && !showSliders ? handleCopy : undefined}
    >
      {/* Shimmer */}
      <motion.div
        className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: `linear-gradient(135deg, ${light ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.07)'} 0%, transparent 50%)` }}
      />

      {/* Lock stripe */}
      {color.locked && (
        <motion.div
          className="absolute top-0 left-0 right-0 h-1"
          style={{ backgroundColor: light ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.35)' }}
          initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={SPRING}
        />
      )}

      {/* ─── Top controls ─── */}
      <div
        className="flex flex-col items-center gap-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        onClick={e => e.stopPropagation()}
      >
        <motion.button whileTap={{ scale: 0.85 }} onClick={() => onToggleLock(color.id)}
          className="p-2.5 rounded-xl transition-colors" style={{ backgroundColor: overlayBg, color: textColor }}>
          {color.locked ? <Lock size={15} /> : <Unlock size={15} />}
        </motion.button>

        <motion.button whileTap={{ scale: 0.85 }} onClick={() => setShowSliders(v => !v)}
          className="p-2.5 rounded-xl transition-colors" style={{ backgroundColor: showSliders ? overlayBorder : overlayBg, color: textColor }}>
          <Sliders size={15} />
        </motion.button>
      </div>

      {/* ─── HSL Sliders ─── */}
      <AnimatePresence>
        {showSliders && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowSliders(false)} />
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.94 }} animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.94 }} transition={SPRING}
              className="absolute top-1/4 z-20 w-[90%] max-w-[220px] rounded-2xl p-4 shadow-2xl"
              style={{ backgroundColor: light ? 'rgba(255,255,255,0.93)' : 'rgba(12,12,20,0.93)',
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
                <div key={param} className="mb-3.5 last:mb-0">
                  <div className="flex justify-between text-[10px] font-bold mb-1.5 opacity-50">
                    <span>{label}</span><span>{val}{unit}</span>
                  </div>
                  <input type="range" min={min} max={max} value={val}
                    onChange={e => handleHslChange(param, e.target.value)}
                    className="w-full h-2.5 rounded-full cursor-pointer"
                    style={{ background: bg }}
                  />
                </div>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ─── Bottom: Role + Hex + Copy ─── */}
      <div className="flex flex-col items-center gap-2 z-10 w-full" onClick={e => e.stopPropagation()}>

        {/* Role selector */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(v => !v)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors text-center"
            style={{ backgroundColor: overlayBg, color: mutedColor }}
          >
            {roleDisplay ? (
              <span className="text-[9px] font-black tracking-[0.12em] uppercase leading-tight">
                {roleDisplay.prefix} · {roleDisplay.suffix}
              </span>
            ) : (
              <span className="text-[9px] font-bold uppercase opacity-50">Set role</span>
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
                  style={{ width: 180, backgroundColor: light ? '#fff' : '#18182b', border: `1px solid ${overlayBorder}` }}
                  onClick={e => e.stopPropagation()}
                >
                  <div className="px-3 py-2 text-[9px] font-black tracking-[0.15em] uppercase border-b"
                    style={{ color: mutedColor, borderColor: overlayBorder }}>
                    Assign Role
                  </div>

                  {/* Group by prefix */}
                  {['primary', 'secondary', 'background'].map(prefix => (
                    <div key={prefix}>
                      <div className="px-3 pt-2 pb-0.5 text-[8px] font-bold uppercase tracking-widest"
                        style={{ color: mutedColor }}>
                        {prefix}
                      </div>
                      {['light', 'neutral', 'dark'].map(suffix => {
                        const role = `${prefix}-${suffix}`;
                        const display = ROLE_DISPLAY[role];
                        const isActive = color.role === role;
                        return (
                          <button key={role}
                            onClick={() => { onUpdateRole(color.id, role); setShowRoleMenu(false); }}
                            className="flex items-center justify-between w-full px-3 py-1.5 text-[11px] font-medium transition-colors"
                            style={{
                              color: textColor,
                              backgroundColor: isActive ? overlayBg : 'transparent',
                            }}
                          >
                            <span>{display.suffix}</span>
                            {isActive && <Check size={11} className="opacity-60" />}
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

        {/* HEX */}
        {isEditingHex ? (
          <form onSubmit={handleHexSubmit} onClick={e => e.stopPropagation()}>
            <input type="text" value={tempHex}
              onChange={e => setTempHex(e.target.value)} onBlur={handleHexSubmit} autoFocus
              className="bg-transparent text-center font-mono font-bold text-base tracking-wider w-28 border-b focus:outline-none"
              style={{ color: textColor, borderBottomColor: mutedColor }} />
          </form>
        ) : (
          <motion.button whileTap={{ scale: 0.94 }}
            onClick={(e) => { e.stopPropagation(); setIsEditingHex(true); setTempHex(color.hex); }}
            className="font-mono font-bold text-base md:text-lg tracking-wider hover:opacity-70 transition-opacity"
            style={{ color: textColor }}>
            {color.hex.toUpperCase()}
          </motion.button>
        )}

        {/* Copy feedback */}
        <AnimatePresence mode="wait">
          {justCopied ? (
            <motion.span key="copied" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }} className="text-[10px] font-bold flex items-center gap-1"
              style={{ color: mutedColor }}>
              <Check size={10} /> Copied
            </motion.span>
          ) : (
            <motion.span key="hint" initial={{ opacity: 0 }} animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }} className="text-[10px] opacity-0 group-hover:opacity-60 transition-opacity"
              style={{ color: mutedColor }}>
              Click to copy
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
