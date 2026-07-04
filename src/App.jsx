import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, Lock, Unlock, ChevronRight, Circle, Triangle, Square } from 'lucide-react';
import ColorBar from './components/ColorBar';
import ControlPanel from './components/ControlPanel';
import TemplatePreview from './components/TemplatePreview';
import { generatePalette, MOOD_PRESETS, HARMONY_TYPES, DEFAULT_HARMONY, DEFAULT_VARIANT, hexToHsl, hslToHex } from './utils/colorUtils';

const SPRING = { type: 'spring', stiffness: 380, damping: 30 };

// Map harmony types to display icons
const HARMONY_ICONS = {
  monochromatic:      Circle,
  analogous:          Circle,
  complementary:      Circle,
  split_complementary: Circle,
  triadic:            Triangle,
  tetradic:           Square,
};

// Flat ordered list of all [harmonyType, variantKey] pairs for cycling
const ALL_MOODS = Object.entries(HARMONY_TYPES).flatMap(([typeKey, type]) =>
  Object.keys(type.variants).map(varKey => `${typeKey}__${varKey}`)
);

function isColorLight(hex) {
  if (!hex) return false;
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) > 145;
}

export default function App() {
  const [size, setSize] = useState(5);
  // activeTheme = compound key: "harmonyType__variantKey"
  const [activeTheme, setActiveTheme] = useState(`${DEFAULT_HARMONY}__${DEFAULT_VARIANT}`);
  const [isMoodLocked, setIsMoodLocked] = useState(false);
  const [showHarmonyPicker, setShowHarmonyPicker] = useState(false);
  const [pickerHarmonyType, setPickerHarmonyType] = useState(DEFAULT_HARMONY);
  const [transitionStyle, setTransitionStyle] = useState('cascade');
  const [palette, setPalette] = useState([]);
  const [isWelcomeState, setIsWelcomeState] = useState(true);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [copiedColor, setCopiedColor] = useState(null);
  const [showHelp, setShowHelp] = useState(false);
  const [shuffleKey, setShuffleKey] = useState(0);
  
  const [isFastShuffle, setIsFastShuffle] = useState(false);
  const fastShuffleTimerRef = useRef(null);
  const holdTimeoutRef = useRef(null);
  const isSpaceDownRef = useRef(false);
  const isHoldingRef = useRef(false);

  const stateRef = useRef({});
  stateRef.current = { palette, size, activeTheme, isWelcomeState, isMoodLocked };

  // Generate initial palette
  useEffect(() => {
    setPalette(generatePalette(size, activeTheme));
  }, []);

  // Regenerate when size changes
  useEffect(() => {
    if (!isWelcomeState && palette.length > 0) {
      setPalette(generatePalette(size, activeTheme, palette));
    }
  }, [size]);

  // Regenerate when mood changes
  useEffect(() => {
    if (!isWelcomeState && palette.length > 0) {
      setPalette(generatePalette(size, activeTheme, palette));
    }
  }, [activeTheme]);

  // Sync CSS variables
  useEffect(() => {
    if (palette.length === 0) return;
    const bgDark = palette.find(c => c.role === 'background-dark') || palette[palette.length - 1];
    const root = document.documentElement;
    root.style.setProperty('--bg-color', isWelcomeState ? '#09090f' : bgDark.hex);
  }, [palette, isWelcomeState]);

  const cycleMood = useCallback(() => {
    const { activeTheme } = stateRef.current;
    const currentIndex = ALL_MOODS.indexOf(activeTheme);
    const nextIndex = (currentIndex + 1) % ALL_MOODS.length;
    setActiveTheme(ALL_MOODS[nextIndex]);
  }, []);

  const triggerShuffle = useCallback(() => {
    const { palette, size, activeTheme, isWelcomeState, isMoodLocked } = stateRef.current;
    if (isWelcomeState) setIsWelcomeState(false);
    setShuffleKey(k => k + 1);

    let nextTheme = activeTheme;
    if (!isMoodLocked) {
      const currentIndex = ALL_MOODS.indexOf(activeTheme);
      const nextIndex = (currentIndex + 1) % ALL_MOODS.length;
      nextTheme = ALL_MOODS[nextIndex];
      setActiveTheme(nextTheme);
    }

    setPalette(generatePalette(size, nextTheme, palette));
  }, []);

  const startFastShuffle = useCallback(() => {
    if (holdTimeoutRef.current) clearTimeout(holdTimeoutRef.current);
    if (fastShuffleTimerRef.current) clearInterval(fastShuffleTimerRef.current);
    
    isHoldingRef.current = false;
    
    // Set a timeout to differentiate single clicks from holds
    holdTimeoutRef.current = setTimeout(() => {
      isHoldingRef.current = true;
      setIsFastShuffle(true);
      
      // Start continuous shuffling
      fastShuffleTimerRef.current = setInterval(() => {
        triggerShuffle();
      }, 350);
    }, 250); // 250ms threshold
  }, [triggerShuffle]);

  const stopFastShuffle = useCallback(() => {
    if (holdTimeoutRef.current) {
      clearTimeout(holdTimeoutRef.current);
      holdTimeoutRef.current = null;
    }
    
    if (fastShuffleTimerRef.current) {
      clearInterval(fastShuffleTimerRef.current);
      fastShuffleTimerRef.current = null;
    }
    
    if (isHoldingRef.current) {
      // Release from a hold: return to normal state and trigger a final bouncy settle
      setIsFastShuffle(false);
      triggerShuffle();
    } else {
      // Single click: trigger a normal single shuffle with the perfect bouncy animation
      triggerShuffle();
    }
    
    isHoldingRef.current = false;
  }, [triggerShuffle]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const tag = document.activeElement?.tagName;
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes(tag) || document.activeElement?.isContentEditable) return;
      if (e.code === 'Space') {
        e.preventDefault();
        if (!isSpaceDownRef.current) {
          isSpaceDownRef.current = true;
          startFastShuffle();
        }
      }
    };

    const handleKeyUp = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        isSpaceDownRef.current = false;
        stopFastShuffle();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      stopFastShuffle();
    };
  }, [startFastShuffle, stopFastShuffle]);

  const handleToggleLock = useCallback((id) => {
    setPalette(prev => prev.map(c => c.id === id ? { ...c, locked: !c.locked } : c));
  }, []);

  const handleUpdateHex = useCallback((id, newHex, newHsl = null) => {
    setPalette(prev => prev.map(c => {
      if (c.id !== id) return c;
      if (newHsl) {
        return { ...c, ...newHsl, hex: hslToHex(newHsl.h, newHsl.s, newHsl.l) };
      }
      const formatted = newHex.startsWith('#') ? newHex : '#' + newHex;
      return { ...c, hex: formatted, ...hexToHsl(formatted) };
    }));
  }, []);

  const handleUpdateRole = useCallback((id, role) => {
    setPalette(prev => {
      const targetColor = prev.find(c => c.id === id);
      if (!targetColor) return prev;
      const oldRole = targetColor.role;
      return prev.map(c => {
        if (c.id === id) {
          return { ...c, role, roleLocked: true };
        }
        if (c.role === role) {
          return { ...c, role: oldRole };
        }
        return c;
      });
    });
  }, []);

  const handleToggleRoleLock = useCallback((id) => {
    setPalette(prev => prev.map(c => c.id === id ? { ...c, roleLocked: !c.roleLocked } : c));
  }, []);

  const handleCopyColor = useCallback((hex) => {
    navigator.clipboard.writeText(hex).catch(() => {});
    setCopiedColor(hex);
    setTimeout(() => setCopiedColor(null), 1100);
  }, []);

  const ambientGradient = palette.length >= 2
    ? `radial-gradient(ellipse 80% 60% at 20% 40%, ${palette[0].hex}44 0%, transparent 60%), radial-gradient(ellipse 60% 80% at 80% 70%, ${palette[1].hex}33 0%, transparent 60%)`
    : 'radial-gradient(ellipse at center, #1a0533 0%, #09090f 100%)';

  return (
    <div className="relative w-full h-full overflow-hidden flex flex-col bg-[#09090f]">
      <motion.div className="absolute inset-0 pointer-events-none z-0"
        animate={{ background: ambientGradient }} transition={{ duration: isFastShuffle ? 0.14 : 1.8, ease: 'easeInOut' }} />

      {/* Floating Harmony Picker (Top Left) */}
      {!isWelcomeState && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, x: -20 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={SPRING}
          className="fixed top-6 left-6 z-30"
        >
          {/* Trigger pill */}
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-black/50 backdrop-blur-md border border-white/10 text-white shadow-lg select-none">
            <AnimatePresence mode="wait" initial={false}>
              <motion.button
                key={activeTheme}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: isFastShuffle ? 0.1 : 0.2 }}
                onClick={() => !isMoodLocked && setShowHarmonyPicker(v => !v)}
                className="flex flex-col items-start leading-none gap-0.5 min-w-[110px]"
              >
                <span className="text-[8px] font-black uppercase tracking-[0.15em] text-white/35">
                  {HARMONY_TYPES[activeTheme.split('__')[0]]?.name}
                </span>
                <span className="text-[11px] font-bold text-white whitespace-nowrap">
                  {MOOD_PRESETS[activeTheme]?.name}
                </span>
              </motion.button>
            </AnimatePresence>
            <div className="w-[1px] h-5 bg-white/10 mx-0.5" />
            <button
              onClick={() => setIsMoodLocked(!isMoodLocked)}
              className="p-1 rounded-md hover:bg-white/5 transition-colors"
              style={{ color: isMoodLocked ? '#34d399' : 'rgba(255,255,255,0.4)' }}
              title={isMoodLocked ? 'Unlock Harmony' : 'Lock Harmony'}
            >
              {isMoodLocked ? <Lock size={11} /> : <Unlock size={11} />}
            </button>
          </div>

          {/* Nested 2-level dropdown */}
          <AnimatePresence>
            {showHarmonyPicker && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setShowHarmonyPicker(false)} />
                <motion.div
                  initial={{ opacity: 0, scale: 0.94, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.94, y: 8 }}
                  transition={SPRING}
                  className="absolute left-0 top-full mt-2 z-30 flex gap-1.5 bg-[#0d0d18]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-2 overflow-hidden"
                  style={{ minWidth: 460 }}
                  onClick={e => e.stopPropagation()}
                >
                  {/* Left panel: Harmony types */}
                  <div className="flex flex-col gap-0.5 w-44 shrink-0 border-r border-white/5 pr-1.5">
                    <p className="text-[8px] font-black uppercase tracking-[0.15em] text-white/25 px-2 py-1">Harmony Rule</p>
                    {Object.entries(HARMONY_TYPES).map(([typeKey, type]) => {
                      const isActive = pickerHarmonyType === typeKey;
                      return (
                        <button key={typeKey}
                          onClick={() => setPickerHarmonyType(typeKey)}
                          className="flex items-center justify-between px-2.5 py-2 rounded-lg text-left transition-colors group"
                          style={{ backgroundColor: isActive ? 'rgba(255,255,255,0.07)' : 'transparent' }}
                        >
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[11px] font-bold" style={{ color: isActive ? '#fff' : 'rgba(255,255,255,0.6)' }}>{type.name}</span>
                            <span className="text-[8px] text-white/25 leading-tight">{type.description.slice(0, 35)}…</span>
                          </div>
                          <ChevronRight size={10} className="opacity-30 group-hover:opacity-60 transition-opacity" />
                        </button>
                      );
                    })}
                  </div>

                  {/* Right panel: Variants */}
                  <div className="flex flex-col gap-0.5 flex-1">
                    <p className="text-[8px] font-black uppercase tracking-[0.15em] text-white/25 px-2 py-1">Variant</p>
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.div key={pickerHarmonyType}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.15 }}
                        className="flex flex-col gap-0.5"
                      >
                        {Object.entries(HARMONY_TYPES[pickerHarmonyType]?.variants || {}).map(([varKey, variant]) => {
                          const key = `${pickerHarmonyType}__${varKey}`;
                          const isSelected = activeTheme === key;
                          return (
                            <button key={key}
                              onClick={() => {
                                setActiveTheme(key);
                                setShowHarmonyPicker(false);
                              }}
                              className="flex items-center justify-between px-2.5 py-2 rounded-lg text-left transition-colors"
                              style={{ backgroundColor: isSelected ? 'rgba(255,255,255,0.08)' : 'transparent' }}
                            >
                              <span className="text-[11px] font-semibold" style={{ color: isSelected ? '#fff' : 'rgba(255,255,255,0.65)' }}>
                                {variant.name}
                              </span>
                              {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                            </button>
                          );
                        })}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Floating Help Trigger (Top Right) */}
      {!isWelcomeState && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, x: 20 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          exit={{ opacity: 0, scale: 0.8, x: 20 }}
          transition={SPRING}
          className="fixed top-6 right-6 z-30"
        >
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="p-2.5 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 text-white/60 hover:text-white transition-colors shadow-lg"
          >
            <HelpCircle size={15} />
          </button>
          
          <AnimatePresence>
            {showHelp && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setShowHelp(false)} />
                <motion.div
                  initial={{ opacity: 0, scale: 0.92, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.92, y: 8 }}
                  transition={SPRING}
                  className="absolute right-0 mt-2 p-5 rounded-2xl bg-[#09090f]/95 backdrop-blur-xl border border-white/10 w-60 shadow-2xl z-35 text-white"
                >
                  <h4 className="font-bold text-sm mb-3 text-white">Quick Controls</h4>
                  <ul className="space-y-2.5 text-xs text-white/60">
                    {[
                      ['Space', 'Shuffle palette'],
                      ['Click hex', 'Edit color'],
                      ['Hover bar', 'Lock / tune HSL'],
                      ['Role tag', 'Assign semantic role'],
                    ].map(([k, v]) => (
                      <li key={k} className="flex justify-between items-center">
                        <span className="font-semibold text-white/80">{k}</span>
                        <span className="px-2 py-0.5 bg-white/8 border border-white/10 rounded-md text-[10px] font-mono">{v}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Main color stripes screen */}
      <AnimatePresence mode="wait">
        {isWelcomeState ? (
          <WelcomeScreen key="welcome" onStart={triggerShuffle} />
        ) : (
          <motion.div key="generator"
            className="flex-1 flex flex-col md:flex-row h-full w-full overflow-hidden relative z-10"
            initial="hidden" animate="visible" exit="exit"
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.07 } }, exit: { transition: { staggerChildren: 0.04, staggerDirection: -1 } } }}>
            {palette.map((color, index) => (
              <ColorBar key={color.id}
                color={color} index={index} total={palette.length}
                palette={palette} transitionStyle={transitionStyle}
                isFastShuffle={isFastShuffle}
                onToggleLock={handleToggleLock} onToggleRoleLock={handleToggleRoleLock}
                onUpdateHex={handleUpdateHex}
                onUpdateRole={handleUpdateRole} onCopy={handleCopyColor} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {/* Floating Control Panel */}
        {!isWelcomeState && (
          <motion.div key="controls" initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }} transition={{ ...SPRING, delay: 0.4 }} className="relative z-30">
            <ControlPanel
              size={size}
              setSize={setSize}
              activeTheme={activeTheme}
              setActiveTheme={setActiveTheme}
              onShuffleStart={startFastShuffle}
              onShuffleEnd={stopFastShuffle}
              isFastShuffle={isFastShuffle}
              onOpenTemplates={() => setIsTemplatesOpen(true)}
              palette={palette}
              transitionStyle={transitionStyle}
              setTransitionStyle={setTransitionStyle}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <TemplatePreview isOpen={isTemplatesOpen} onClose={() => setIsTemplatesOpen(false)} palette={palette} />

      <AnimatePresence>
        {copiedColor && (
          <motion.div
            key={`copy-${copiedColor}`}
            initial={{ opacity: 0, y: 16, scale: 0.88 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 420, damping: 28 }}
            className="fixed bottom-20 left-1/2 z-[60] pointer-events-none flex items-center gap-2.5 px-4 py-2.5 rounded-2xl shadow-2xl"
            style={{
              x: '-50%',
              backgroundColor: 'rgba(15,15,20,0.9)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            {/* Color swatch chip */}
            <div className="w-4 h-4 rounded-md shrink-0 shadow-inner" style={{ backgroundColor: copiedColor }} />
            <span className="text-[11px] font-bold text-white/80 tracking-wide">Copied</span>
            <span className="font-mono text-[11px] font-bold text-white/40 tracking-widest">
              {copiedColor.toUpperCase()}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Welcome Screen ───────────────────────────────────────────────────────────

function WelcomeScreen({ onStart }) {
  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
    exit: { opacity: 0, scale: 0.97, filter: 'blur(12px)', transition: { duration: 0.45, ease: [0.4, 0, 1, 1] } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 28 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 320, damping: 28 } },
  };

  return (
    <motion.div key="welcome"
      className="absolute inset-0 flex flex-col items-center justify-center z-10 cursor-pointer select-none"
      onClick={onStart} variants={containerVariants} initial="hidden" animate="visible" exit="exit">

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div className="absolute rounded-full"
          style={{ width: 600, height: 600, top: '-10%', left: '-15%',
            background: 'radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 70%)' }}
          animate={{ scale: [1, 1.15, 1], x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }} />
        <motion.div className="absolute rounded-full"
          style={{ width: 500, height: 500, bottom: '-5%', right: '-10%',
            background: 'radial-gradient(circle, rgba(236,72,153,0.14) 0%, transparent 70%)' }}
          animate={{ scale: [1, 1.2, 1], x: [0, -25, 0], y: [0, 15, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut', delay: 2 }} />
      </div>

      <motion.div variants={itemVariants} className="flex items-center gap-2 mb-8">
        <div className="p-1.5 rounded-lg bg-white/8 border border-white/10">
          <Palette size={14} className="text-violet-400" />
        </div>
        <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-white/40">ChromaShift</span>
      </motion.div>

      <motion.h1 variants={itemVariants}
        className="text-6xl md:text-8xl font-black tracking-tighter text-white text-center mb-4 leading-none">
        Color,{' '}
        <span className="bg-gradient-to-r from-violet-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">perfected.</span>
      </motion.h1>

      <motion.p variants={itemVariants} className="text-sm text-white/35 max-w-xs text-center leading-relaxed mb-12">
        Seed-based palettes with color theory. Press space, lock colors, preview in real UIs.
      </motion.p>

      <motion.div variants={itemVariants} className="relative">
        <motion.div className="absolute inset-0 rounded-2xl bg-white/10"
          animate={{ scale: [1, 1.18, 1], opacity: [0.4, 0, 0.4] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeOut' }} />
        <div className="relative px-8 py-3.5 rounded-2xl bg-white/8 border border-white/15 backdrop-blur-sm">
          <span className="text-xs font-bold tracking-[0.25em] uppercase text-white/70">
            Press <kbd className="font-mono font-black text-white">Space</kbd> to begin
          </span>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="flex items-center gap-3 mt-10">
        {['Seed-Based Harmony', 'WCAG Verified', 'Code Export'].map(f => (
          <span key={f} className="text-[10px] text-white/25 font-medium tracking-wider">{f}</span>
        ))}
      </motion.div>
    </motion.div>
  );
}
