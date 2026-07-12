import type { BadgeProps } from "@/components/ui/badge";

/**
 * Badge de modalité de travail, identifiable d'un coup d'œil :
 * vert = 100 % télétravail, orange = hybride, gris = sur site.
 */
export function remoteBadge(remote: string): {
  label: string;
  variant: BadgeProps["variant"];
} {
  switch (remote) {
    case "REMOTE":
      return { label: "Télétravail", variant: "remote" };
    case "HYBRID":
      return { label: "Hybride", variant: "hybrid" };
    case "ONSITE":
      return { label: "Sur site", variant: "outline" };
    default:
      return { label: "Non précisé", variant: "outline" };
  }
}
