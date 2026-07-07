import type { BadgeProps } from "@/components/ui/badge";

/**
 * Badge de modalité de travail. Le full télétravail est mis en avant
 * ("Distanciel full") avec une couleur dédiée ; les autres modalités restent
 * discrètes.
 */
export function remoteBadge(remote: string): {
  label: string;
  variant: BadgeProps["variant"];
} {
  switch (remote) {
    case "REMOTE":
      return { label: "Distanciel full", variant: "remote" };
    case "HYBRID":
      return { label: "Hybride", variant: "warning" };
    case "ONSITE":
      return { label: "Sur site", variant: "outline" };
    default:
      return { label: "Non précisé", variant: "outline" };
  }
}
