"use server";

import { toDeleteError } from "@/lib/action-result";
import { runQualityScan } from "./service";
import type { QualityReport } from "./types";

export type QualityScanResult =
  { ok: true; report: QualityReport } | { ok: false; error: string };

export async function runQualityScanAction(): Promise<QualityScanResult> {
  try {
    const report = await runQualityScan();
    return { ok: true, report };
  } catch (error) {
    return {
      ok: false,
      error: toDeleteError(error).error ?? "Contrôle impossible.",
    };
  }
}
