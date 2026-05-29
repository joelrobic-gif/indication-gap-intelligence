// ═══ JS DESIGN TOKENS ═══
// Mirrors CSS custom properties for use in SVG and canvas contexts
// where CSS variables don't reach.

export const ENTITY_COLORS = [
  "#1a7fc1", // entity-1  blue
  "#d55e00", // entity-2  vermillion
  "#009e73", // entity-3  green
  "#cc79a7", // entity-4  rose
  "#56b4e9", // entity-5  sky
];

export const VIABILITY_COLORS = {
  excellent: "#34d399",
  strong:    "#fbbf24",
  moderate:  "#60a5fa",
  low:       "#ef4444",
};

export const SURFACE = {
  base:    "#08080d",
  raised:  "#0e0e18",
  border:  "#1e1e2e",
  subtle:  "#151520",
};

export const TEXT = {
  primary:   "#e8e8f0",
  secondary: "#9090b0",
  tertiary:  "rgba(85, 85, 112, 0.54)",
};

export const BRAND = {
  gold:    "#d4a853",
  goldDim: "rgba(212, 168, 83, 0.18)",
};

// Sequential scale for heatmap (single-hue, color-blind safe)
export const SEQ_SCALE = ["#0e1829","#0f2a45","#0e4272","#0e6099","#1280c4","#38a8f0"];

export function seqColor(value, max = 100) {
  const idx = Math.min(Math.floor((value / max) * (SEQ_SCALE.length - 1)), SEQ_SCALE.length - 1);
  return SEQ_SCALE[idx];
}

export function viabilityColor(tier) {
  return VIABILITY_COLORS[tier] || TEXT.tertiary;
}

export function getDimensionColor(key) {
  const map = {
    evidence:    "#1a7fc1",
    breadth:     "#009e73",
    regulatory:  "#d55e00",
    commercial:  "#cc79a7",
    ptrs:        "#56b4e9",
    unmet:       "#e69f00",
    competitive: "#c9d62a",
  };
  return map[key] || TEXT.secondary;
}
