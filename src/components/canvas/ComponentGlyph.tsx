import type { ComponentType } from "react";
import { getTechLogo } from "@/lib/techLogos";

/**
 * Renders a component's icon: the selected technology's brand logo when we
 * recognize it (Postgres, Redis, Kafka, ...), otherwise the generic category
 * icon. Keeps the brand-vs-fallback decision in one place so the canvas node,
 * inspector, and example all stay consistent.
 */
export function ComponentGlyph({
  technology,
  fallbackIcon: Icon,
  accent = "",
  className = "h-4 w-4",
}: {
  technology?: string | null;
  fallbackIcon: ComponentType<{ className?: string }>;
  accent?: string;
  className?: string;
}) {
  const logo = getTechLogo(technology);
  if (logo) {
    if (logo.kind === "img") {
      return (
        <img
          src={logo.src}
          alt={`${logo.title} logo`}
          className={`${className} object-contain`}
        />
      );
    }
    return (
      <svg
        role="img"
        aria-label={`${logo.title} logo`}
        viewBox="0 0 24 24"
        fill={logo.hex}
        className={className}
      >
        <title>{logo.title}</title>
        <path d={logo.path} />
      </svg>
    );
  }
  return <Icon className={`${className} ${accent}`} />;
}
