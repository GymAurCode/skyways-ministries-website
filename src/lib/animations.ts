/**
 * AOS animation names for ScrollReveal and data-aos attributes.
 * Use only AOS + CSS transitions on the public site (no Framer Motion).
 */
export type AosAnimation =
  | "fade-up"
  | "fade-down"
  | "fade-left"
  | "fade-right"
  | "fade-in"
  | "zoom-in";

/** @deprecated Use string literal on ScrollReveal `animation` prop */
export const fadeInUp: AosAnimation = "fade-up";
export const fadeInLeft: AosAnimation = "fade-left";
export const fadeInRight: AosAnimation = "fade-right";
export const fadeInDown: AosAnimation = "fade-down";
