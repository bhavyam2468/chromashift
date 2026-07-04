// ─── Hex ↔ HSL Conversions ────────────────────────────────────────────────────

export function hexToHsl(hex) {
  hex = hex.replace(/^#/, '');
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export function hslToHex(h, s, l) {
  h = ((h % 360) + 360) % 360;
  s = clamp(s, 0, 100) / 100;
  l = clamp(l, 0, 100) / 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;
  if (h < 60)       { r = c; g = x; }
  else if (h < 120) { r = x; g = c; }
  else if (h < 180) { g = c; b = x; }
  else if (h < 240) { g = x; b = c; }
  else if (h < 300) { r = x; b = c; }
  else              { r = c; b = x; }
  const toHex = v => Math.round((v + m) * 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

function hexToRgb(hex) {
  hex = hex.replace(/^#/, '');
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
  return [parseInt(hex.substring(0, 2), 16), parseInt(hex.substring(2, 4), 16), parseInt(hex.substring(4, 6), 16)];
}

// ─── WCAG Contrast Utilities ──────────────────────────────────────────────────

function sRGBtoLinear(c) {
  c = c / 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function relativeLuminance(r, g, b) {
  return 0.2126 * sRGBtoLinear(r) + 0.7152 * sRGBtoLinear(g) + 0.0722 * sRGBtoLinear(b);
}

export function contrastRatio(hex1, hex2) {
  const [r1, g1, b1] = hexToRgb(hex1);
  const [r2, g2, b2] = hexToRgb(hex2);
  const L1 = relativeLuminance(r1, g1, b1);
  const L2 = relativeLuminance(r2, g2, b2);
  const lighter = Math.max(L1, L2);
  const darker = Math.min(L1, L2);
  return (lighter + 0.05) / (darker + 0.05);
}

function ensureContrast(fgHsl, bgHex, minRatio = 4.5) {
  let { h, s, l } = fgHsl;
  let hex = hslToHex(h, s, l);
  let ratio = contrastRatio(hex, bgHex);
  const bgLight = hexToHsl(bgHex).l > 50;
  let attempts = 0;
  while (ratio < minRatio && attempts < 40) {
    l = bgLight ? l - 2 : l + 2;
    l = clamp(l, 5, 97);
    hex = hslToHex(h, s, l);
    ratio = contrastRatio(hex, bgHex);
    attempts++;
  }
  return { h, s, l };
}

// ─── Utility ──────────────────────────────────────────────────────────────────

function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function wrapHue(h) { return ((h % 360) + 360) % 360; }

// ─── The 9 Semantic Roles ─────────────────────────────────────────────────────

export const ALL_ROLES = [
  'primary-light', 'primary-neutral', 'primary-dark',
  'secondary-light', 'secondary-neutral', 'secondary-dark',
  'background-light', 'background-neutral', 'background-dark',
];

export const ROLE_DISPLAY = {
  'primary-light':      { prefix: 'Primary',    suffix: 'Light' },
  'primary-neutral':    { prefix: 'Primary',    suffix: 'Neutral' },
  'primary-dark':       { prefix: 'Primary',    suffix: 'Dark' },
  'secondary-light':    { prefix: 'Secondary',  suffix: 'Light' },
  'secondary-neutral':  { prefix: 'Secondary',  suffix: 'Neutral' },
  'secondary-dark':     { prefix: 'Secondary',  suffix: 'Dark' },
  'background-light':   { prefix: 'Background', suffix: 'Light' },
  'background-neutral': { prefix: 'Background', suffix: 'Neutral' },
  'background-dark':    { prefix: 'Background', suffix: 'Dark' },
};

// ─── Harmony Types ────────────────────────────────────────────────────────────
//
// Mathematical basis for each type:
//
// MONOCHROMATIC  → secondaryOffset = 0
//   All hues identical. Only L and S vary. Maximum cohesion, minimum contrast.
//   For N swatches, spread L evenly: L_i = 15 + i * (75 / (N-1))
//
// ANALOGOUS → secondaryOffset ∈ [20°, 45°]
//   Secondary sits within 1/6 of the wheel from primary. The eye perceives
//   hues <45° apart as "related". Works because opponent-channel signals
//   partially overlap, creating a seamless temperature gradient.
//
// COMPLEMENTARY → secondaryOffset = 180°
//   Opposite on the wheel. Maximum perceptual contrast (opponent-channel
//   signals are maximally differentiated). Split complement = ±150° instead
//   of exact 180° to soften tension.
//
// SPLIT-COMPLEMENTARY → secondaryOffset = 150° or 210°
//   One base + two colors on either side of the complement. Less tension
//   than pure complementary, but still high contrast. The 30° deviation
//   reduces the harshness of direct opposition.
//
// TRIADIC → offsets = [120°, 240°]
//   Three hues equally spaced at 120°. Each pair has ~max distance,
//   so all three pop. The eye sees "vibrant balance". Needs careful
//   saturation control to prevent chaos.
//
// TETRADIC (Square) → offsets = [90°, 180°, 270°]
//   Four hues at 90° intervals. Pairs are all complementary, giving
//   maximum variety. Requires one dominant hue + others as accents.
//
// ─────────────────────────────────────────────────────────────────────────────

export const HARMONY_TYPES = {
  monochromatic: {
    name: 'Monochromatic',
    icon: 'circle',
    description: 'Single hue, varied lightness & saturation. Maximum cohesion.',
    variants: {
      deep_focus:    { name: 'Deep Focus', seedHueRange: [200, 240], baseSatRange: [35, 55], offsets: [0, 0] },
      warm_tones:    { name: 'Warm Ember', seedHueRange: [15, 40], baseSatRange: [40, 60], offsets: [0, 0] },
      sage_calm:     { name: 'Sage Calm', seedHueRange: [95, 145], baseSatRange: [25, 45], offsets: [0, 0] },
      amethyst:      { name: 'Amethyst', seedHueRange: [260, 290], baseSatRange: [40, 65], offsets: [0, 0] },
      slate_minimal: { name: 'Slate Minimal', seedHueRange: [200, 220], baseSatRange: [8, 18], offsets: [0, 0] },
      rose_blush:    { name: 'Rose Blush', seedHueRange: [330, 355], baseSatRange: [35, 55], offsets: [0, 0] },
    },
  },

  analogous: {
    name: 'Analogous',
    icon: 'arc',
    description: 'Adjacent hues (20–45° apart). Harmonious, natural gradients.',
    variants: {
      ocean:    { name: 'Ocean Depth', seedHueRange: [190, 220], baseSatRange: [45, 65], offsets: [28, 0] },
      forest:   { name: 'Forest Moss', seedHueRange: [100, 145], baseSatRange: [30, 55], offsets: [30, 0] },
      earth:    { name: 'Earth & Clay', seedHueRange: [20, 40], baseSatRange: [25, 45], offsets: [22, 0] },
      aurora:   { name: 'Aurora Borealis', seedHueRange: [145, 195], baseSatRange: [50, 75], offsets: [35, 0] },
      sundown:  { name: 'Sundown', seedHueRange: [0, 30], baseSatRange: [55, 80], offsets: [28, 0] },
      lavender: { name: 'Lavender Field', seedHueRange: [255, 285], baseSatRange: [40, 62], offsets: [25, 0] },
    },
  },

  complementary: {
    name: 'Complementary',
    icon: 'yin-yang',
    description: 'Opposite hues (180° apart). Maximum contrast, bold tension.',
    variants: {
      ocean_coral:  { name: 'Ocean & Coral', seedHueRange: [195, 215], baseSatRange: [55, 75], offsets: [180, 0] },
      violet_gold:  { name: 'Violet & Gold', seedHueRange: [265, 285], baseSatRange: [55, 75], offsets: [180, 0] },
      forest_magenta: { name: 'Forest & Magenta', seedHueRange: [110, 145], baseSatRange: [45, 65], offsets: [180, 0] },
      sunset_teal:  { name: 'Sunset & Teal', seedHueRange: [10, 30], baseSatRange: [60, 80], offsets: [180, 0] },
      rose_sage:    { name: 'Rose & Sage', seedHueRange: [338, 355], baseSatRange: [45, 65], offsets: [180, 0] },
      neon_electric: { name: 'Neon Electric', seedHueRange: [0, 360], baseSatRange: [85, 100], offsets: [180, 0] },
    },
  },

  split_complementary: {
    name: 'Split-Complementary',
    icon: 'split',
    description: '±150° from primary. Tension of complementary, softened.',
    variants: {
      tropical:  { name: 'Tropical Burst', seedHueRange: [170, 200], baseSatRange: [60, 80], offsets: [150, 0] },
      dusk:      { name: 'Violet Dusk', seedHueRange: [260, 285], baseSatRange: [50, 70], offsets: [150, 0] },
      wildflower: { name: 'Wildflower', seedHueRange: [330, 355], baseSatRange: [45, 65], offsets: [150, 0] },
      citrus:    { name: 'Citrus Pop', seedHueRange: [35, 55], baseSatRange: [70, 90], offsets: [150, 0] },
      arctic:    { name: 'Arctic Frost', seedHueRange: [195, 220], baseSatRange: [30, 50], offsets: [150, 0] },
      desert:    { name: 'Desert Storm', seedHueRange: [25, 45], baseSatRange: [35, 55], offsets: [150, 0] },
    },
  },

  triadic: {
    name: 'Triadic',
    icon: 'triangle',
    description: '3 hues at 120° apart. Vibrant, balanced, festive energy.',
    variants: {
      primary_vivid: { name: 'Primary Vivid', seedHueRange: [0, 20], baseSatRange: [65, 85], offsets: [120, 240] },
      tropic:        { name: 'Tropic Punch', seedHueRange: [160, 185], baseSatRange: [60, 80], offsets: [120, 240] },
      festival:      { name: 'Festival', seedHueRange: [260, 290], baseSatRange: [65, 85], offsets: [120, 240] },
      muted_triad:   { name: 'Muted Triad', seedHueRange: [40, 60], baseSatRange: [25, 45], offsets: [120, 240] },
      jewel:         { name: 'Jewel Tones', seedHueRange: [200, 230], baseSatRange: [55, 75], offsets: [120, 240] },
    },
  },

  tetradic: {
    name: 'Tetradic (Square)',
    icon: 'square',
    description: '4 hues at 90° intervals. Rich variety, needs one dominant.',
    variants: {
      rich_vivid: { name: 'Rich & Vivid', seedHueRange: [10, 30], baseSatRange: [60, 80], offsets: [90, 180, 270] },
      soft_pastel: { name: 'Soft Pastel', seedHueRange: [0, 360], baseSatRange: [25, 40], offsets: [90, 180, 270] },
      jewel_square: { name: 'Jewel Square', seedHueRange: [200, 230], baseSatRange: [50, 70], offsets: [90, 180, 270] },
      earthy_quad: { name: 'Earthy Quad', seedHueRange: [30, 60], baseSatRange: [30, 50], offsets: [90, 180, 270] },
    },
  },
};

// ─── Build old MOOD_PRESETS for backward compat ────────────────────────────────

export const MOOD_PRESETS = {};
for (const [typeKey, type] of Object.entries(HARMONY_TYPES)) {
  for (const [varKey, variant] of Object.entries(type.variants)) {
    const key = `${typeKey}__${varKey}`;
    MOOD_PRESETS[key] = {
      name: variant.name,
      description: type.description,
      seedHueRange: variant.seedHueRange,
      baseSatRange: variant.baseSatRange,
      secondaryOffset: variant.offsets[0] ?? 0,
      extraOffsets: variant.offsets.slice(1),
      harmonyType: typeKey,
    };
  }
}

// Default mood key (used on first load)
export const DEFAULT_HARMONY = 'analogous';
export const DEFAULT_VARIANT = 'ocean';

// ─── Seed → 9-Color Palette Generation ────────────────────────────────────────

/**
 * The core algorithm. From a seed hue + harmony config, derive all 9 colors.
 *
 * Swatch-count distribution:
 *   3  swatches → bg-dark, primary-neutral, primary-light
 *   5  swatches → + secondary-neutral, bg-light
 *   7  swatches → + primary-dark, secondary-light
 *   9  swatches → all 9 roles
 *
 * For each harmony type, hue sources differ:
 *   Monochromatic: primary H = secondary H = background H (only L/S vary)
 *   Analogous: secondary H = H + 20-45°
 *   Complementary: secondary H = H + 180°
 *   Split-comp: secondary H = H + 150° (or 210°)
 *   Triadic: secondary H = H + 120°, background hues shifted ±30°
 *   Tetradic: uses H, H+90°, H+180°, H+270° in rotation
 */
function derive9Colors(seedHue, baseSat, offsets, harmonyType) {
  const H = wrapHue(seedHue);
  const S = baseSat;

  // Compute secondary/tertiary hues based on harmony type
  let secH, bgH;

  if (harmonyType === 'monochromatic') {
    secH = H;
    bgH  = H;
  } else if (harmonyType === 'triadic') {
    secH = wrapHue(H + (offsets[0] ?? 120));
    bgH  = wrapHue(H + (offsets[1] ?? 240));
  } else if (harmonyType === 'tetradic') {
    secH = wrapHue(H + (offsets[0] ?? 90));
    bgH  = wrapHue(H + (offsets[1] ?? 180)); // use H+180 for backgrounds
  } else {
    secH = wrapHue(H + (offsets[0] ?? 0));
    bgH  = H;
  }

  // Saturation scaling by harmony type
  const monoScale = harmonyType === 'monochromatic' ? 1.2 : 1.0;
  const secSScale = harmonyType === 'triadic' ? 0.85 : harmonyType === 'tetradic' ? 0.80 : 0.75;
  // Backgrounds are now richly tinted — NOT washed-out greys.
  // bgSScale 0.40 means a 70% sat primary produces ~28% sat backgrounds,
  // which at dark lightnesses (8–14%) looks like a deep navy / plum / forest.
  const bgSScale  = 0.40;

  const palette = {
    'primary-light': {
      h: wrapHue(H - 8),
      s: clamp(S * 0.65 * monoScale, 12, 80),
      l: rand(78, 85),
    },
    'primary-neutral': {
      h: H,
      s: clamp(S * monoScale, 15, 100),
      l: rand(45, 55),
    },
    'primary-dark': {
      h: wrapHue(H + 8),
      s: clamp(S * 1.1 * monoScale, 18, 100),
      l: rand(25, 32),
    },
    'secondary-light': {
      h: wrapHue(secH - 6),
      s: clamp(S * secSScale * 0.75, 10, 75),
      l: rand(76, 83),
    },
    'secondary-neutral': {
      h: secH,
      s: clamp(S * secSScale, 12, 90),
      l: rand(42, 52),
    },
    'secondary-dark': {
      h: wrapHue(secH + 6),
      s: clamp(S * secSScale * 1.1, 15, 95),
      l: rand(22, 30),
    },
    'background-light': {
      h: bgH,
      s: clamp(S * bgSScale, 12, 40),   // was 3–15 → now 12–40
      l: rand(93, 97),
    },
    'background-neutral': {
      h: bgH,
      s: clamp(S * 0.35, 12, 45),       // was 3–12 → now 12–45
      l: rand(38, 50),
    },
    'background-dark': {
      h: wrapHue(bgH + 5),
      s: clamp(S * 0.55, 20, 65),       // was 5–20 → now 20–65! Deep tinted darks.
      l: rand(7, 13),
    },
  };

  // Monochromatic: explicitly space lightness across the full range
  if (harmonyType === 'monochromatic') {
    palette['primary-light'].l    = rand(80, 88);
    palette['primary-neutral'].l  = rand(52, 60);
    palette['primary-dark'].l     = rand(28, 36);
    palette['secondary-light'].l  = rand(74, 82);
    palette['secondary-neutral'].l = rand(44, 52);
    palette['secondary-dark'].l   = rand(20, 28);
  }

  // Verify key contrast pairs
  const bgLightHex = hslToHex(palette['background-light'].h, palette['background-light'].s, palette['background-light'].l);
  const bgDarkHex  = hslToHex(palette['background-dark'].h,  palette['background-dark'].s,  palette['background-dark'].l);

  palette['primary-neutral']   = ensureContrast(palette['primary-neutral'],   bgLightHex, 4.5);
  palette['primary-dark']      = ensureContrast(palette['primary-dark'],      bgLightHex, 4.5);
  palette['primary-light']     = ensureContrast(palette['primary-light'],     bgDarkHex,  4.5);
  palette['secondary-neutral'] = ensureContrast(palette['secondary-neutral'], bgLightHex, 3.5);

  return palette;
}

/**
 * Main export: generate a palette array of `size` colors from a harmony/variant key.
 */
export function generatePalette(size, moodKey, currentPalette = []) {
  // Support both legacy keys ("earth") and new keys ("analogous__ocean")
  const mood = MOOD_PRESETS[moodKey] || MOOD_PRESETS['analogous__ocean'];
  size = clamp(size, 3, 9);

  // Determine seed from locked colors or random from mood range
  let seedHue, baseSat;
  const lockedPrimary = currentPalette.find(c => c.locked && c.role?.startsWith('primary'));
  const anyLocked     = currentPalette.find(c => c.locked);

  if (lockedPrimary) {
    seedHue = lockedPrimary.h;
    baseSat = lockedPrimary.s;
  } else if (anyLocked) {
    seedHue = anyLocked.h;
    baseSat = anyLocked.s;
  } else {
    const [hMin, hMax] = mood.seedHueRange;
    seedHue = hMin === 0 && hMax === 360 ? rand(0, 360) : rand(hMin, hMax);
    baseSat = rand(mood.baseSatRange[0], mood.baseSatRange[1]);
  }

  const offsets    = [mood.secondaryOffset, ...(mood.extraOffsets || [])];
  const harmonyType = mood.harmonyType || 'analogous';

  const derived = derive9Colors(seedHue, baseSat, offsets, harmonyType);

  // Priority order for filling roles (ordered by visual importance)
  const priorityOrder = [
    'primary-neutral',
    'background-light',
    'background-dark',
    'primary-light',
    'primary-dark',
    'secondary-neutral',
    'secondary-light',
    'secondary-dark',
    'background-neutral',
  ];

  const newPalette    = new Array(size);
  const usedRoles     = new Set();
  const assignedRoles = new Array(size).fill(null);

  // Step 1: Preserve locked colors
  for (let i = 0; i < size; i++) {
    const existing = currentPalette[i];
    if (existing && existing.locked) {
      newPalette[i]     = { ...existing };
      assignedRoles[i]  = existing.role;
      if (existing.role) usedRoles.add(existing.role);
    }
  }

  // Step 1.5: Reserve roles for roleLocked slots
  for (let i = 0; i < size; i++) {
    if (newPalette[i]) continue;
    const existing = currentPalette[i];
    if (existing && existing.roleLocked && existing.role && !usedRoles.has(existing.role)) {
      assignedRoles[i] = existing.role;
      usedRoles.add(existing.role);
    }
  }

  // Step 2: Assign remaining roles randomly from priority list
  const unassignedSlots = [];
  for (let i = 0; i < size; i++) {
    if (!assignedRoles[i]) unassignedSlots.push(i);
  }

  const remainingRoles = [];
  for (const role of priorityOrder) {
    if (remainingRoles.length >= unassignedSlots.length) break;
    if (!usedRoles.has(role)) {
      remainingRoles.push(role);
      usedRoles.add(role);
    }
  }

  // Fisher-Yates shuffle
  for (let i = remainingRoles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [remainingRoles[i], remainingRoles[j]] = [remainingRoles[j], remainingRoles[i]];
  }

  for (let i = 0; i < unassignedSlots.length; i++) {
    assignedRoles[unassignedSlots[i]] = remainingRoles[i] || 'primary-neutral';
  }

  // Step 3: Generate colors for unlocked slots
  for (let i = 0; i < size; i++) {
    if (newPalette[i]) continue;
    const existingSlot = currentPalette[i];
    const slotId       = (existingSlot && existingSlot.id) || Math.random().toString(36).substr(2, 9);
    const role         = assignedRoles[i];
    const hsl          = derived[role] || derived['primary-neutral'];
    const hex          = hslToHex(hsl.h, hsl.s, hsl.l);

    newPalette[i] = {
      id:         slotId,
      hex,
      h:          hsl.h,
      s:          hsl.s,
      l:          hsl.l,
      locked:     false,
      roleLocked: existingSlot ? !!existingSlot.roleLocked : false,
      role,
    };
  }

  return newPalette;
}

// ─── Template Preview Helpers ─────────────────────────────────────────────────

/**
 * Extracts a structured color map from a palette array for use in templates.
 * When a role isn't present in the palette, all fallbacks are derived from
 * the hues that *are* present — never from hardcoded neutral grays.
 */
export function getSemanticColors(palette) {
  const map = {};
  for (const c of palette) {
    if (c.role) map[c.role] = c;
  }

  // Helper: return hex for a role, or compute a derived fallback from a
  // reference color in HSL space (so fallbacks always belong to the hue family).
  const getOrDerive = (role, fallbackRole, deriveFn) => {
    if (map[role]) return map[role].hex;
    if (fallbackRole && map[fallbackRole]) {
      const ref = map[fallbackRole];
      return deriveFn ? deriveFn(ref.h, ref.s, ref.l) : ref.hex;
    }
    return null;
  };

  // Primary family — seed everything off primary-neutral
  const primaryRef = map['primary-neutral'] || map['primary-light'] || map['primary-dark'] || palette[0];
  const pH = primaryRef?.h ?? 240;
  const pS = primaryRef?.s ?? 60;

  const primary      = primaryRef?.hex ?? hslToHex(pH, pS, 50);
  const primaryLight = getOrDerive('primary-light',   'primary-neutral', (h, s) => hslToHex(wrapHue(h - 8), clamp(s * 0.65, 12, 80), 80)) ?? hslToHex(wrapHue(pH - 8), clamp(pS * 0.65, 12, 80), 80);
  const primaryDark  = getOrDerive('primary-dark',    'primary-neutral', (h, s) => hslToHex(wrapHue(h + 8), clamp(s * 1.1, 18, 100), 28)) ?? hslToHex(wrapHue(pH + 8), clamp(pS * 1.1, 18, 100), 28);

  // Secondary family — fall back to primary hue if secondary not present
  const secRef = map['secondary-neutral'] || map['secondary-light'] || map['secondary-dark'];
  const sH = secRef?.h ?? pH;
  const sS = secRef?.s ?? pS;

  const secondary      = secRef?.hex ?? hslToHex(sH, sS, 48);
  const secondaryLight = getOrDerive('secondary-light', 'secondary-neutral', (h, s) => hslToHex(wrapHue(h - 6), clamp(s * 0.75, 10, 75), 79)) ?? hslToHex(wrapHue(sH - 6), clamp(sS * 0.75, 10, 75), 79);
  const secondaryDark  = getOrDerive('secondary-dark',  'secondary-neutral', (h, s) => hslToHex(wrapHue(h + 6), clamp(s * 1.1, 15, 95), 26))  ?? hslToHex(wrapHue(sH + 6), clamp(sS * 1.1, 15, 95), 26);

  // Background family — always tinted by the primary hue, never gray
  const bgRef = map['background-dark'] || map['background-light'] || map['background-neutral'];
  const bgH   = bgRef?.h ?? pH; // inherit primary hue for tinted bg

  // Saturation multipliers kept in sync with derive9Colors (bgSScale = 0.40/0.35/0.55)
  const bgLight   = getOrDerive('background-light',   'background-dark',    () => hslToHex(bgH, clamp(pS * 0.40, 12, 40), 95)) ?? hslToHex(bgH, clamp(pS * 0.40, 12, 40), 95);
  const bgNeutral = getOrDerive('background-neutral',  'background-dark',   () => hslToHex(bgH, clamp(pS * 0.35, 12, 45), 44)) ?? hslToHex(bgH, clamp(pS * 0.35, 12, 45), 44);
  const bgDark    = getOrDerive('background-dark',     'background-neutral', () => hslToHex(wrapHue(bgH + 5), clamp(pS * 0.55, 20, 65), 10)) ?? hslToHex(wrapHue(bgH + 5), clamp(pS * 0.55, 20, 65), 10);

  // Calculate rich, saturated card surfaces by pulling the HSL of the computed backgrounds
  const darkHsl = hexToHsl(bgDark);
  const surfaceDark = hslToHex(darkHsl.h, darkHsl.s, clamp(darkHsl.l + 4, 0, 100));
  const surfaceHDark = hslToHex(darkHsl.h, darkHsl.s, clamp(darkHsl.l + 7, 0, 100));

  const lightHsl = hexToHsl(bgLight);
  const surfaceLight = hslToHex(lightHsl.h, lightHsl.s, clamp(lightHsl.l - 2, 0, 100));
  const surfaceHLight = hslToHex(lightHsl.h, lightHsl.s, clamp(lightHsl.l - 4, 0, 100));

  // Text & muted — derived from hues present, not hardcoded
  const textOnLight  = primaryDark;
  const textOnDark   = bgLight;
  const mutedOnLight = hslToHex(bgH, clamp(pS * 0.25, 15, 30), 52);
  const mutedOnDark  = hslToHex(bgH, clamp(pS * 0.20, 15, 25), 65);

  return {
    primary, primaryLight, primaryDark,
    secondary, secondaryLight, secondaryDark,
    bgLight, bgNeutral, bgDark,
    surfaceDark, surfaceHDark,
    surfaceLight, surfaceHLight,
    textOnLight, textOnDark,
    mutedOnLight, mutedOnDark,
  };
}

