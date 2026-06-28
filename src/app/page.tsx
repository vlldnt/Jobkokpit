import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/dal";

// Proxy normally redirects "/" already; this is a server-side fallback.
export default async function RootPage() {
  const user = await getCurrentUser();
  redirect(user ? "/dashboard" : "/login");
}
