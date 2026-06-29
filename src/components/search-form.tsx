import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/** GET form that navigates to `basePath?q=…` (progressive enhancement, no JS). */
export function SearchForm({
  basePath,
  placeholder,
  defaultValue,
}: {
  basePath: string;
  placeholder?: string;
  defaultValue?: string;
}) {
  return (
    <form action={basePath} className="mb-4 flex max-w-sm gap-2">
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
