import Link from "next/link";

import { AppSidebar } from "@/components/app-sidebar";
import { LogoutButton } from "@/components/logout-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { requireUser } from "@/lib/auth/dal";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  return (
    <div className="grid min-h-svh md:grid-cols-[16rem_1fr]">
      <aside className="bg-card/40 hidden flex-col border-r md:flex">
        <div className="flex h-14 items-center px-5">
          <Link href="/dashboard" className="font-semibold tracking-tight">
            Job AI CRM
          </Link>
        </div>
        <div className="min-h-0 flex-1">
          <AppSidebar />
        </div>
      </aside>

      <div className="flex min-h-svh flex-col">
        <header className="flex h-14 items-center gap-2 border-b px-4 md:px-8">
          <Link href="/dashboard" className="font-semibold md:hidden">
            Job AI CRM
          </Link>
          <div className="flex-1" />
          <span className="text-muted-foreground hidden text-sm sm:inline">
            {user.email}
          </span>
          <ThemeToggle />
          <LogoutButton />
        </header>

        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
