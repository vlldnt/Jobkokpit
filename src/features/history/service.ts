import "server-only";

import { requireUser } from "@/lib/auth/dal";
import * as repo from "./repository";

export async function listAuditLogs(params: { skip: number; take: number }) {
  const user = await requireUser();
  return repo.listAuditLogs(user.id, params);
}
