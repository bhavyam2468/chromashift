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

// Adjust fg lightness until it meets minRatio against bg
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

// ─── Mood Presets ─────────────────────────────────────────────────────────────

export const MOOD_PRESETS = {
  earth: {
    name: 'Earth & Clay',
    description: 'Warm, organic. Terracotta, sand, deep browns.',
    seedHueRange: [20, 40],
    baseSatRange: [25, 45],
    secondaryOffset: 170,
  },
  ocean: {
    name: 'Ocean Depth',
    description: 'Serene, trustworthy. Deep blues and teals.',
    seedHueRange: [195, 225],
    baseSatRange: [40, 65],
    secondaryOffset: 45,
  },
  sunset: {
    name: 'Sunset Warmth',
    description: 'Passionate, vibrant. Crimson, coral, amber.',
    seedHueRange: [0, 25],
    baseSatRange: [55, 80],
    secondaryOffset: 180,
  },
  forest: {
    name: 'Forest Moss',
    description: 'Balanced, natural. Deep greens and earthy tones.',
    seedHueRange: [100, 150],
    baseSatRange: [30, 55],
    secondaryOffset: 30,
  },
  violet: {
    name: 'Violet Dusk',
    description: 'Ethereal, creative. Purple and mauve with golden accent.',
    seedHueRange: [260, 290],
    baseSatRange: [45, 70],
    secondaryOffset: 60,
  },
  slate: {
    name: 'Minimal Slate',
    description: 'Clean, professional. Near-monochrome with subtle tinting.',
    seedHueRange: [200, 220],
    baseSatRange: [8, 20],
    secondaryOffset: 0,
  },
  neon: {
    name: 'Neon Electric',
    description: 'High energy, bold. Vivid saturated tones.',
    seedHueRange: [0, 360],
    baseSatRange: [85, 100],
    secondaryOffset: 180,
  },
  blush: {
    name: 'Blush & Rose',
    description: 'Soft, feminine. Warm pinks with sage green accent.',
    seedHueRange: [330, 355],
    baseSatRange: [40, 65],
    secondaryOffset: 150,
  },
};

// ─── Seed → 9-Color Palette Generation ────────────────────────────────────────

/**
 * The core algorithm. From a seed hue + mood, derive all 9 colors.
 *
 * Techniques used:
 * - Hue shifting (Refactoring UI): warmer when lighter, cooler when darker
 * - Tinted neutrals (M3): backgrounds use same hue as primary, very low saturation
 * - Saturation scaling: backgrounds get S×0.10, secondaries get S×0.75
 * - WCAG contrast verification on key pairs
 */
function derive9Colors(seedHue, baseSat, secondaryOffset) {
  const H = wrapHue(seedHue);
  const S = baseSat;
  const secH = wrapHue(H + secondaryOffset);

  const palette = {
    'primary-light': {
      h: wrapHue(H - 8),         // shift warm
      s: clamp(S * 0.65, 12, 80),
      l: rand(78, 85),
    },
    'primary-neutral': {
      h: H,
      s: clamp(S, 15, 100),
      l: rand(45, 55),
    },
    'primary-dark': {
      h: wrapHue(H + 8),         // shift cool
      s: clamp(S * 1.1, 18, 100),
      l: rand(25, 32),
    },
    'secondary-light': {
      h: wrapHue(secH - 6),
      s: clamp(S * 0.55, 10, 75),
      l: rand(76, 83),
    },
    'secondary-neutral': {
      h: secH,
      s: clamp(S * 0.75, 12, 90),
      l: rand(42, 52),
    },
    'secondary-dark': {
      h: wrapHue(secH + 6),
      s: clamp(S * 0.85, 15, 95),
      l: rand(22, 30),
    },
    'background-light': {
      h: H,
      s: clamp(S * 0.10, 3, 15),  // barely tinted
      l: rand(95, 98),
    },
    'background-neutral': {
      h: H,
      s: clamp(S * 0.08, 3, 12),
      l: rand(40, 50),
    },
    'background-dark': {
      h: wrapHue(H + 5),
      s: clamp(S * 0.15, 5, 20),
      l: rand(6, 12),
    },
  };

  // Verify key contrast pairs and adjust if needed
  const bgLightHex = hslToHex(palette['background-light'].h, palette['background-light'].s, palette['background-light'].l);
  const bgDarkHex = hslToHex(palette['background-dark'].h, palette['background-dark'].s, palette['background-dark'].l);

  // Primary-neutral must be readable on both backgrounds
  palette['primary-neutral'] = ensureContrast(palette['primary-neutral'], bgLightHex, 4.5);
  palette['primary-dark'] = ensureContrast(palette['primary-dark'], bgLightHex, 4.5);
  palette['primary-light'] = ensureContrast(palette['primary-light'], bgDarkHex, 4.5);
  palette['secondary-neutral'] = ensureContrast(palette['secondary-neutral'], bgLightHex, 3.5);

  return palette;
}

/**
 * Main export: generate a palette array of `size` colors from a mood preset.
 *
 * @param {number} size - How many colors (3–9)
 * @param {string} moodKey - Key into MOOD_PRESETS
 * @param {Array} currentPalette - Existing palette (for locked colors)
 * @returns {Array} Array of color objects with { id, hex, h, s, l, locked, role }
 */
export function generatePalette(size, moodKey, currentPalette = []) {
  const mood = MOOD_PRESETS[moodKey] || MOOD_PRESETS.earth;
  size = clamp(size, 3, 9);

  // Determine seed from locked colors or random from mood range
  let seedHue, baseSat;
  const lockedPrimary = currentPalette.find(c => c.locked && c.role?.startsWith('primary'));
  const anyLocked = currentPalette.find(c => c.locked);

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

  // Generate the full 9-color derived set
  const derived = derive9Colors(seedHue, baseSat, mood.secondaryOffset);

  // Priority order for filling roles
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

  const newPalette = new Array(size);
  const usedRoles = new Set();

  const assignedRoles = new Array(size).fill(null);

  // Step 1: Place locked colors at their exact indices
  for (let i = 0; i < size; i++) {
    const existing = currentPalette[i];
    if (existing && existing.locked) {
      newPalette[i] = { ...existing };
      assignedRoles[i] = existing.role;
      if (existing.role) {
        usedRoles.add(existing.role);
      }
    }
  }

  // Step 1.5: Reserve roles for slots with roleLocked
  for (let i = 0; i < size; i++) {
    if (newPalette[i]) continue;
    const existing = currentPalette[i];
    if (existing && existing.roleLocked && existing.role && !usedRoles.has(existing.role)) {
      assignedRoles[i] = existing.role;
      usedRoles.add(existing.role);
    }
  }

  // Step 2: Determine remaining roles and randomize them
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

  // Fisher-Yates shuffle the remaining roles to randomize semantic placement
  for (let i = remainingRoles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [remainingRoles[i], remainingRoles[j]] = [remainingRoles[j], remainingRoles[i]];
  }

  for (let i = 0; i < unassignedSlots.length; i++) {
    const slotIdx = unassignedSlots[i];
    assignedRoles[slotIdx] = remainingRoles[i] || 'primary-neutral';
  }

  // Step 3: Generate colors for unlocked slots
  for (let i = 0; i < size; i++) {
    if (newPalette[i]) continue; // Already filled by locked color

    const existingSlot = currentPalette[i];
    const slotId = (existingSlot && existingSlot.id) || Math.random().toString(36).substr(2, 9);
    
    const role = assignedRoles[i];
    const hsl = derived[role] || derived['primary-neutral'];
    const hex = hslToHex(hsl.h, hsl.s, hsl.l);

    newPalette[i] = {
      id: slotId,
      hex,
      h: hsl.h,
      s: hsl.s,
      l: hsl.l,
      locked: false,
      roleLocked: existingSlot ? !!existingSlot.roleLocked : false,
      role: role,
    };
  }

  return newPalette;
}

// ─── Template Preview Helpers ─────────────────────────────────────────────────

/**
 * Extracts a structured color map from a palette array for use in templates.
 * Returns an object with all 9 roles mapped to their hex values,
 * with sensible fallbacks if not all roles are present.
 */
export function getSemanticColors(palette) {
  const map = {};
  for (const c of palette) {
    if (c.role) map[c.role] = c;
  }

  // Helper: get hex or fallback
  const get = (role, fallbackRole, fallbackHex) => {
    if (map[role]) return map[role].hex;
    if (fallbackRole && map[fallbackRole]) return map[fallbackRole].hex;
    return fallbackHex;
  };

  const primary = get('primary-neutral', null, '#6366f1');
  const primaryLight = get('primary-light', 'primary-neutral', primary);
  const primaryDark = get('primary-dark', 'primary-neutral', primary);
  const secondary = get('secondary-neutral', 'primary-neutral', primary);
  const secondaryLight = get('secondary-light', 'secondary-neutral', secondary);
  const secondaryDark = get('secondary-dark', 'secondary-neutral', secondary);
  const bgLight = get('background-light', null, '#F5F5F5');
  const bgNeutral = get('background-neutral', null, '#6B7280');
  const bgDark = get('background-dark', null, '#111111');

  // Derive text colors: dark text for light bg, light text for dark bg
  const textOnLight = primaryDark;
  const textOnDark = bgLight;
  const mutedOnLight = bgNeutral;
  const mutedOnDark = hslToHex(
    (map['background-neutral']?.h || 0),
    clamp((map['background-neutral']?.s || 10) * 0.6, 3, 15),
    65
  );

  return {
    primary, primaryLight, primaryDark,
    secondary, secondaryLight, secondaryDark,
    bgLight, bgNeutral, bgDark,
    textOnLight, textOnDark,
    mutedOnLight, mutedOnDark,
  };
}
