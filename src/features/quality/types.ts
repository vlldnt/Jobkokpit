export type IssueSeverity = "info" | "warning" | "error";

export type QualityIssue = {
  kind: string;
  severity: IssueSeverity;
  entityType: string;
  entityId: string;
  label: string;
  message: string;
  href?: string;
};

export type QualityReport = {
  scannedAt: string;
  expiredMarked: number;
  counts: Record<IssueSeverity, number>;
  issues: QualityIssue[];
};
