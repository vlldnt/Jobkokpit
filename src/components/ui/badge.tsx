import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-secondary text-secondary-foreground",
        outline: "text-foreground",
        success:
          "border-transparent bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
        warning:
          "border-transparent bg-amber-500/15 text-amber-700 dark:text-amber-400",
        info: "border-transparent bg-blue-500/15 text-blue-700 dark:text-blue-400",
        destructive:
          "border-transparent bg-destructive/15 text-destructive dark:text-red-400",
        // Types de contrat — couleurs dédiées, lisibles d'un coup d'œil.
        stage:
          "border-transparent bg-violet-500/15 text-violet-700 dark:text-violet-300",
        alternance:
          "border-transparent bg-orange-500/15 text-orange-700 dark:text-orange-300",
        // Stage OU alternance sur le même poste : couleur mixte dédiée.
        stageAlternance:
          "border-transparent bg-gradient-to-r from-violet-500/20 to-orange-500/20 text-fuchsia-700 dark:text-fuchsia-300",
        cdi: "border-transparent bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
        cdd: "border-transparent bg-sky-500/15 text-sky-700 dark:text-sky-300",
        freelance:
          "border-transparent bg-teal-500/15 text-teal-700 dark:text-teal-300",
        // Modalités de travail — vert (télétravail), orange (hybride).
        remote:
          "border-transparent bg-green-500/15 text-green-700 dark:text-green-400",
        hybrid:
          "border-transparent bg-orange-500/15 text-orange-700 dark:text-orange-300",
        // Offres hors France (Europe) — repère géographique.
        europe:
          "border-transparent bg-indigo-500/15 text-indigo-700 dark:text-indigo-300",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export type BadgeProps = React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants>;

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
