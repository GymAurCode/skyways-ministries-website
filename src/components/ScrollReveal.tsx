import type { AosAnimation } from "../lib/animations";

interface Props {
  children: React.ReactNode;
  /** AOS animation name */
  animation?: AosAnimation;
  /** Maps to former `variants` from framer — pass animation name */
  variants?: AosAnimation;
  delay?: number;
  duration?: number;
  className?: string;
  anchorPlacement?: "top-bottom" | "center-bottom" | "top-center";
}

export default function ScrollReveal({
  children,
  animation = "fade-up",
  variants,
  delay = 0,
  duration = 700,
  className = "",
  anchorPlacement = "center-bottom",
}: Props) {
  const aos = variants ?? animation;

  return (
    <div
      className={className}
      data-aos={aos}
      data-aos-delay={delay}
      data-aos-duration={duration}
      data-aos-once="true"
      data-aos-easing="ease-out-cubic"
      data-aos-anchor-placement={anchorPlacement}
    >
      {children}
    </div>
  );
}
