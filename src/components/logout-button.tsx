import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { logout } from "@/features/auth/actions";

export function LogoutButton() {
  return (
    <form action={logout}>
      <Button
        type="submit"
        variant="ghost"
        size="icon"
        aria-label="Se déconnecter"
      >
        <LogOut />
      </Button>
    </form>
  );
}
