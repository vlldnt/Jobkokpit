import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/** GET form that navigates to `basePath?q=…` (progressive enhancement, no JS). */
export function SearchForm({
  basePath,
  placeholder,
  defaultValue,
  hiddenParams,
}: {
  basePath: string;
  placeholder?: string;
  defaultValue?: string;
  /** Paramètres d'URL à préserver lors de la recherche (ex. filtre rapide). */
  hiddenParams?: Record<string, string>;
}) {
  return (
    <form action={basePath} className="mb-4 flex max-w-sm gap-2">
      {Object.entries(hiddenParams ?? {}).map(
        ([key, value]) =>
          value && <input key={key} type="hidden" name={key} value={value} />,
      )}
      <Input
        name="q"
        type="search"
        placeholder={placeholder ?? "Rechercher…"}
        defaultValue={defaultValue}
      />
      <Button type="submit" variant="outline" aria-label="Rechercher">
        <Search />
      </Button>
    </form>
  );
}
