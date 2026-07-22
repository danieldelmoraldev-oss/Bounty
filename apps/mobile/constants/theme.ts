/**
 * Sistema de diseño "Nightlife Tactical" — evolución del theme de referencia
 * en stitch_bounty_social_party_quest/DESIGN.md: mismo lenguaje (OLED dark,
 * acentos neón, tipografía técnica) con más contraste tonal y una paleta de
 * acento afinada para legibilidad real en pantalla, no solo en mockup.
 */

export const colors = {
  background: "#0A0A0B",
  surface: "#151517",
  surfaceElevated: "#1D1D20",
  surfaceHighest: "#28282C",
  border: "rgba(255,255,255,0.08)",

  textPrimary: "#F4F3F2",
  textDim: "#9A9CA6",
  textFaint: "#5C5E66",

  accent: "#B7F700", // Acid green — bounties activos, CTA "Empezar la Noche"
  accentDim: "#7FA800",
  accentOn: "#122400", // texto sobre fondo accent

  secondary: "#C86BFF", // Púrpura eléctrico — buffs, rango social
  tertiary: "#3FE0E8", // Cian neón — intel, contratos, squad

  gold: "#FFD65C", // Líder de la liga
  danger: "#FF4D4D", // Estigma / última posición
} as const;

export const fonts = {
  display: "Anybody_800ExtraBold",
  displayBold: "Anybody_700Bold",
  mono: "SpaceMono_400Regular",
  monoBold: "SpaceMono_700Bold",
} as const;

export const radii = {
  sm: 4,
  md: 8,
  lg: 14,
  full: 999,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;
