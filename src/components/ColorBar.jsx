import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Unlock, Sliders, Check, ChevronDown } from 'lucide-react';
import { ROLE_DISPLAY, hslToHex } from '../utils/colorUtils';

const SPRING = { type: 'spring', stiffness: 350, damping: 18 };

function isLight(hex) {
  if (!hex) return false;
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) > 150;
}

export default function ColorBar({
  color, index, total, palette = [], transitionStyle = 'cascade', isCycling = false, onToggleLock, onUpdateHex, onUpdateRole, onCopy
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
  const isMobileLayout = typeof window !== 'undefined' ? window.innerWidth < 768 : false;

  // ─── Continuous & Entry/Exit Variant Logic ───
  const getBgVariants = (style, idx) => {
    const isEven = idx % 2 === 0;
    
    // 1. Loop animations when user is holding down Space/Shuffle
    if (isCycling) {
      switch (style) {
        case 'crossfade':
          return {
            hidden: { filter: 'hue-rotate(0deg)' },
            visible: {
              filter: ['hue-rotate(0deg)', 'hue-rotate(360deg)'],
              transition: { repeat: Infinity, ease: 'linear', duration: 3.5 }
            },
            exit: { filter: 'hue-rotate(0deg)' }
          };
        case 'cross-slide':
          if (isMobileLayout) {
            return {
              hidden: { x: 0 },
              visible: {
                x: isEven ? ['-15%', '15%'] : ['15%', '-15%'],
                transition: { repeat: Infinity, repeatType: 'reverse', duration: 0.7, ease: 'easeInOut' }
              },
              exit: { x: 0 }
            };
          } else {
            return {
              hidden: { y: 0 },
              visible: {
                y: isEven ? ['-15%', '15%'] : ['15%', '-15%'],
                transition: { repeat: Infinity, repeatType: 'reverse', duration: 0.7, ease: 'easeInOut' }
              },
              exit: { y: 0 }
            };
          }
        case 'slide':
          return {
            hidden: { y: 0 },
            visible: {
              y: ['0%', '-12%', '0%'],
              transition: { repeat: Infinity, duration: 1.1, ease: 'easeInOut', delay: idx * 0.08 }
            },
            exit: { y: 0 }
          };
        case 'cascade':
        default:
          return {
            hidden: { scale: 1, filter: 'blur(0px)' },
            visible: {
              scale: [1, 0.96, 1],
              filter: ['blur(0px)', 'blur(3px)', 'blur(0px)'],
              transition: { repeat: Infinity, duration: 1.2, ease: 'easeInOut', delay: idx * 0.08 }
            },
            exit: { scale: 1, filter: 'blur(0px)' }
          };
      }
    }

    // 2. Normal shuffle transitions (when just tapped or on release ease-out)
    switch (style) {
      case 'crossfade':
        return {
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { duration: 0.45, ease: 'easeInOut' } },
          exit: { opacity: 0, transition: { duration: 0.45, ease: 'easeInOut' } }
        };
      case 'cross-slide':
        if (isMobileLayout) {
          return {
            hidden: { x: isEven ? '100%' : '-100%', opacity: 1 },
            visible: { x: 0, opacity: 1, transition: { type: 'spring', stiffness: 280, damping: 28 } },
            exit: { x: isEven ? '-100%' : '100%', opacity: 1, transition: { duration: 0.35, ease: 'easeInOut' } }
          };
        } else {
          return {
            hidden: { y: isEven ? '100%' : '-100%', opacity: 1 },
            visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 280, damping: 28 } },
            exit: { y: isEven ? '-100%' : '100%', opacity: 1, transition: { duration: 0.35, ease: 'easeInOut' } }
          };
        }
      case 'slide':
        return {
          hidden: { y: '25%', opacity: 0 },
          visible: { y: 0, opacity: 1, transition: { ...SPRING, delay: idx * 0.04 } },
          exit: { y: '-25%', opacity: 0, transition: { duration: 0.25, ease: 'easeInOut', delay: idx * 0.02 } }
        };
      case 'cascade':
      default:
        return {
          hidden: { scale: 0.95, opacity: 0, filter: 'blur(6px)' },
          visible: { scale: 1, opacity: 1, filter: 'blur(0px)', transition: { ...SPRING, delay: idx * 0.04 } },
          exit: { scale: 0.95, opacity: 0, filter: 'blur(4px)', transition: { duration: 0.25, ease: 'easeInOut', delay: idx * 0.02 } }
        };
    }
  };

  const bgVariants = getBgVariants(transitionStyle, index);

  return (
    <motion.div
      layout
      whileHover={{ flex: 1.3 }}
      transition={{ flex: { type: 'spring', stiffness: 260, damping: 28 } }}
      className="relative flex flex-row md:flex-col justify-between items-center px-4 py-2 md:py-8 md:px-3 h-full w-full group overflow-hidden cursor-pointer"
      style={{ flex: 1, minWidth: 0 }}
      onClick={!isEditingHex && !showRoleMenu && !showSliders ? handleCopy : undefined}
    >
      {/* Dynamic Background Layer */}
      <AnimatePresence mode="popLayout">
        <motion.div
          key={isCycling ? 'cycling' : color.hex}
          variants={bgVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="absolute inset-0 z-0"
          style={{ backgroundColor: color.hex }}
        />
      </AnimatePresence>

      {/* Shimmer */}
      <motion.div
        className="absolute inset-0 pointer-events-none opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 z-10"
        style={{ background: `linear-gradient(135deg, ${light ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.06)'} 0%, transparent 50%)` }}
      />

      {/* Lock indicator stripe */}
      {color.locked && (
        <motion.div
          className="absolute top-0 left-0 bottom-0 w-1 md:w-auto md:h-1 md:right-0 z-10"
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
                        const isTaken = palette.some(c => c.role === role && c.id !== color.id);
                        return (
                          <button key={role}
                            disabled={isTaken}
                            onClick={() => { onUpdateRole(color.id, role); setShowRoleMenu(false); }}
                            className={`flex items-center justify-between w-full px-3 py-1.5 text-[10px] font-semibold transition-colors ${isTaken ? 'opacity-35 cursor-not-allowed' : ''}`}
                            style={{
                              color: textColor,
                              backgroundColor: isActive ? overlayBg : 'transparent',
                            }}
                          >
                            <span className="flex items-center gap-1.5">
                              {display.prefix} {display.suffix}
                              {isTaken && <span className="text-[7px] opacity-40 uppercase tracking-wider font-bold">(In Use)</span>}
                            </span>
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
          <div className="overflow-hidden relative h-5 flex items-center justify-center min-w-[70px]">
            <AnimatePresence mode="wait" initial={false}>
              <motion.button
                key={color.hex}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
                whileTap={{ scale: 0.94 }}
                onClick={(e) => { e.stopPropagation(); setIsEditingHex(true); setTempHex(color.hex); }}
                className="absolute font-mono font-bold text-xs md:text-base tracking-wider hover:opacity-70 transition-opacity"
                style={{ color: textColor }}>
                {color.hex.toUpperCase()}
              </motion.button>
            </AnimatePresence>
          </div>
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
